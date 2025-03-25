import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/providers";
import { InitializeServices } from "@/components/server/initialize-services";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CGL Connect",
  description: "Monitoramento de dispositivos IoT nas salas da UFMT",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <InitializeServices />
        <Providers themeProps={{ enableSystem: true, defaultTheme: "system" }}>
          {children}
        </Providers>
        <Toaster richColors position="bottom-center" />
      </body>
    </html>
  );
}
