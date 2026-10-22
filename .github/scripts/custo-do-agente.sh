#!/usr/bin/env bash
# Registra o custo de uma execução do agente (claude-code-action) no resumo do job e,
# quando PR_COMENTARIO está definido, numa tabela acumulada num comentário do PR.
#
# O custo vem do campo total_cost_usd da mensagem final do agente. Com o token da
# assinatura (CLAUDE_CODE_OAUTH_TOKEN), é o custo equivalente pela tabela de preços
# da API, não uma cobrança: serve para comparar estudos e acompanhar a tendência.
#
# Variáveis: ARQUIVO (saída execution_file da action), ROTULO (o que a execução fez),
# RESULTADO (opcional), PR_COMENTARIO (número do PR, opcional), GH_TOKEN, GITHUB_REPOSITORY,
# GITHUB_SERVER_URL, GITHUB_RUN_ID.
set -euo pipefail

ARQUIVO="${ARQUIVO:-$RUNNER_TEMP/claude-execution-output.json}"
EXECUCAO="$GITHUB_SERVER_URL/$GITHUB_REPOSITORY/actions/runs/$GITHUB_RUN_ID"

if [ ! -s "$ARQUIVO" ]; then
  echo "Sem o arquivo de execução do agente ($ARQUIVO); custo não registrado."
  echo "Custo do agente: não registrado (o agente não chegou a rodar)." >> "$GITHUB_STEP_SUMMARY"
  exit 0
fi

R=$(jq -c '[.[] | select(.type == "result")] | last // {}' "$ARQUIVO")
CUSTO=$(jq -r '.total_cost_usd // 0' <<< "$R")
TURNOS=$(jq -r '.num_turns // 0' <<< "$R")
MINUTOS=$(jq -r '((.duration_ms // 0) / 60000 * 10 | round) / 10' <<< "$R")
ENTRADA=$(jq -r '(.usage.input_tokens // 0) + (.usage.cache_creation_input_tokens // 0) + (.usage.cache_read_input_tokens // 0)' <<< "$R")
SAIDA=$(jq -r '.usage.output_tokens // 0' <<< "$R")
ERRO=$(jq -r 'if .is_error then "com erro" else "" end' <<< "$R")

# Números em pt-BR: vírgula decimal e ponto de milhar.
br() { sed -e 's/\./,/'; }
milhar() { echo "$1" | sed ':a;s/\B[0-9]\{3\}\>/.&/;ta'; }
CUSTO_BR=$(printf '%.2f' "$CUSTO" | br)
MIN_BR=$(echo "$MINUTOS" | br)
QUANDO=$(TZ=America/Sao_Paulo date '+%d/%m/%Y %H:%M')
RESULTADO="${RESULTADO:-concluída}${ERRO:+ ($ERRO)}"

{
  echo "### Custo do agente"
  echo
  echo "| Execução | Resultado | Custo estimado (US\$) | Turnos | Duração | Tokens de entrada | Tokens de saída |"
  echo "|---|---|---|---|---|---|---|"
  echo "| $ROTULO | $RESULTADO | $CUSTO_BR | $TURNOS | $MIN_BR min | $(milhar "$ENTRADA") | $(milhar "$SAIDA") |"
  echo
  echo "Custo equivalente pela tabela de preços da API; com o token da assinatura, não é cobrança."
} >> "$GITHUB_STEP_SUMMARY"

[ -z "${PR_COMENTARIO:-}" ] && exit 0

# Comentário único por PR, com uma linha por execução e o total recalculado.
MARCA='<!-- custo-da-geracao -->'
LINHA="| $QUANDO | $ROTULO | $RESULTADO | $CUSTO_BR | $TURNOS | $MIN_BR min | [ver]($EXECUCAO) |"
ID=$(gh api "repos/$GITHUB_REPOSITORY/issues/$PR_COMENTARIO/comments" --paginate \
  --jq ".[] | select(.body | startswith(\"$MARCA\")) | .id" | head -n 1 || true)

if [ -n "$ID" ]; then
  LINHAS=$(gh api "repos/$GITHUB_REPOSITORY/issues/comments/$ID" --jq .body | grep -E '^\| [0-9]{2}/' || true)
else
  LINHAS=''
fi
LINHAS=$(printf '%s\n%s' "$LINHAS" "$LINHA" | sed '/^$/d')
TOTAL=$(echo "$LINHAS" | awk -F'|' '{ gsub(/ /, "", $5); sub(",", ".", $5); t += $5 } END { printf "%.2f", t }' | br)

CORPO=$(cat <<EOF
$MARCA
### Custo das execuções do agente neste PR

| Quando | Execução | Resultado | Custo estimado (US\$) | Turnos | Duração | Detalhes |
|---|---|---|---|---|---|---|
$LINHAS

**Total estimado:** US\$ $TOTAL. Custo equivalente pela tabela de preços da API; com o token da assinatura, não é cobrança.
EOF
)

if [ -n "$ID" ]; then
  gh api -X PATCH "repos/$GITHUB_REPOSITORY/issues/comments/$ID" -f body="$CORPO" > /dev/null
else
  gh pr comment "$PR_COMENTARIO" --body "$CORPO" > /dev/null
fi
echo "Custo registrado no PR #$PR_COMENTARIO: US\$ $CUSTO_BR (total US\$ $TOTAL)."
