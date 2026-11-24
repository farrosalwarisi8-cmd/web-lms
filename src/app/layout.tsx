import type { Metadata } from "next";
import "./globals.css";
import { DemoProvider } from "@/context/demo-context";
import { ToastViewport } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "demolms — Demo Frontend LMS",
  description:
    "demolms adalah demo frontend Learning Management System untuk Pesantren Ansharussunnah. Semua data adalah simulasi lokal.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <DemoProvider>
          {children}
          <ToastViewport />
        </DemoProvider>
      </body>
    </html>
  );
}
