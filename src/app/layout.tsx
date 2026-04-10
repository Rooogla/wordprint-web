import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Wordprint – Vokabelanalyse für deutsche Texte",
  description: "Analysiere deutsche Texte und entdecke deinen einzigartigen Wortschatz-Fingerabdruck.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={cn(dmSans.variable, playfair.variable)}>
      <body className="antialiased min-h-screen">
        <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-sm bg-primary flex items-center justify-center text-primary-foreground font-heading font-bold text-lg">
                W
              </div>
              <span className="font-heading text-xl font-semibold tracking-tight">Wordprint</span>
            </a>
            <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <a href="/" className="hover:text-foreground transition-colors">Dashboard</a>
              <a href="/projects/new" className="hover:text-foreground transition-colors">Neues Projekt</a>
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
