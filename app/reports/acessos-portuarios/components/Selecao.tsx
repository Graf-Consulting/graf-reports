'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

type Selecao = { idPorto: string; selecionar: (id: string) => void };

const Contexto = createContext<Selecao>({ idPorto: '', selecionar: () => {} });

/** Instalação portuária escolhida, compartilhada entre o comparativo, o mapa, os indicadores e o cadastro. */
export function Provedor({ children }: { children: ReactNode }) {
  const [idPorto, selecionar] = useState('');
  return <Contexto.Provider value={{ idPorto, selecionar }}>{children}</Contexto.Provider>;
}

export const useSelecao = () => useContext(Contexto);
