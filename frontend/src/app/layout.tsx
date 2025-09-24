"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Menu, MessageSquare, Sparkles, X } from "lucide-react";

import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <html lang="fr">
      <head>
        <title>AI RAG PDF</title>
        <meta name="description" content="Chat RAG sur vos PDFs (Qdrant + Mistral)" />
      </head>
      <body className="bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="min-h-screen">
          {/* Enhanced Navbar */}
          <header className="sticky top-0 z-50 backdrop-blur-md bg-black/60 border-b border-white/10 shadow-lg">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <Link
                  href="/"
                  className="flex items-center gap-2 font-bold text-xl text-white hover:text-blue-300 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                    <Sparkles size={18} className="text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                    PDF READER
                  </span>
                </Link>

                <nav className="hidden md:flex items-center space-x-1">
                  <Link
                    href="/"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive("/")
                        ? "bg-blue-600/20 text-blue-300 border border-blue-500/30"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <MessageSquare size={18} />
                    <span className="font-medium">Chat</span>
                  </Link>
                  <Link
                    href="/library"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive("/library")
                        ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <FileText size={18} />
                    <span className="font-medium">Bibliothèque</span>
                  </Link>
                </nav>

                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>

              {mobileMenuOpen && (
                <div className="md:hidden py-4 border-t border-white/10 animate-in slide-in-from-top-2 duration-200 mobile-nav">
                  <nav className="space-y-2">
                    <Link
                      href="/"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive("/")
                          ? "bg-blue-600/20 text-blue-300 border border-blue-500/30"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <MessageSquare size={18} />
                      <span className="font-medium">Chat</span>
                    </Link>
                    <Link
                      href="/library"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive("/library")
                          ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <FileText size={18} />
                      <span className="font-medium">Bibliothèque</span>
                    </Link>
                  </nav>
                </div>
              )}
            </div>
          </header>

          <main className="mx-auto max-w-7xl px-4 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
