import "./globals.css";
import type { Metadata } from "next";
import { SupabaseProvider } from "@/components/SupabaseProvider";

export const metadata: Metadata = {
  title: "Smart Bookmark App",
  description: "Realtime bookmarks with Supabase and Google login"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-slate-950 text-slate-50">
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  );
}

