import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from './store/wallet';
import { ThemeInitializer } from './components/ThemeInitializer'; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "2zilmoon",
  description: "Zilliqa Staking Migration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeInitializer /> 
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
