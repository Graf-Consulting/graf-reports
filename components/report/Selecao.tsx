'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type Estado = { valores: Record<string, string>; definir: (campo: string, valor: string) => void };

const Contexto = createContext<Estado | null>(null);

/**
 * Seleção compartilhada da página (ADR-007): um bloco publica o valor de um campo (ex.: id_porto)
 * e os outros blocos e componentes próprios leem pelo mesmo nome de campo.
 */
export function SelecaoProvider({ children }: { children: ReactNode }) {
  const [valores, setValores] = useState<Record<string, string>>({});
  const definir = useCallback((campo: string, valor: string) => setValores((v) => ({ ...v, [campo]: valor })), []);
  const estado = useMemo(() => ({ valores, definir }), [valores, definir]);
  return <Contexto.Provider value={estado}>{children}</Contexto.Provider>;
}

/** Valor selecionado de um campo e a função que o troca. Vazio quando nada foi escolhido. */
export function useSelecao(campo: string): [string, (valor: string) => void] {
  const estado = useContext(Contexto);
  const definir = useCallback((valor: string) => estado?.definir(campo, valor), [estado, campo]);
  return [estado?.valores[campo] ?? '', definir];
}

/** Rola a página até o bloco que lê a seleção de um campo (marcado com data-selecao). */
export function irParaSelecao(campo: string) {
  document.querySelector(`[data-selecao="${campo}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
