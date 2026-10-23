import { KeyMessage } from '@/components/report';
import { comUnidade, inteiro } from '@/lib/report/format';
import type { PropsProprio } from '@/lib/report/renderizador';

type Props = PropsProprio & { campo?: string };

/** Mensagem-chave com o valor em destaque e uma conclusão (o KeyMessage do kit só aceita leitura). */
export function MensagemChaveConclusao({ tabelas, textos, campo = '' }: Props) {
  const { campos, linhas } = Object.values(tabelas)[0];
  const [conclusao] = Object.values(textos.conclusoes);
  // O KeyMessage do kit não tem opção de centralizar; o wrapper alinha o texto à altura do número sem mexer no kit.
  return (
    <div className="[&_.grid]:items-center">
      <KeyMessage value={comUnidade(inteiro(Number(linhas[0][campo])), campos[campo]?.unidade)}>{conclusao.destacado}</KeyMessage>
    </div>
  );
}
