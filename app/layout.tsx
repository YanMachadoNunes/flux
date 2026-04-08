import "./globals.css";
import { Inter } from "next/font/google";
import { Shell } from "./components/Shell";
import { ThemeProvider } from "./context/ThemeContext";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Flux | Gestão de Clínica",
  description: "Sistema de Gestão de Clínica",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          <ThemeProvider>
            <Shell>{children}</Shell>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
