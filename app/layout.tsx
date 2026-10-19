import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import { CSS_VARS } from '@/lib/report/tokens';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '600'] });

export const metadata: Metadata = {
  title: 'GRAF Reports',
  description: 'Relatórios analíticos da GRAF Infra Consulting',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" style={CSS_VARS as React.CSSProperties}>
      <body className={montserrat.className}>
        <Header />
        {/* Cada página desenha o próprio <main> e o rodapé, que traz a fonte e a data do estudo. */}
        {children}
      </body>
    </html>
  );
}