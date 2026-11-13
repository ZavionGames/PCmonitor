import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PCMonitor",
  description: "Kişisel bilgisayar izleme paneli",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark">
      <body className="bg-gray-950 text-gray-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
