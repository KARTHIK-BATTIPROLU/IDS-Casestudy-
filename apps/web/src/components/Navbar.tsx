"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Music, BarChart3, UploadCloud, Compass, BookOpen, Clock, Github } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: Music },
    { href: "/research", label: "Research Dashboard", icon: BarChart3 },
    { href: "/genre", label: "Genre Explorer", icon: Compass },
    { href: "/upload", label: "Analyze Your Data", icon: UploadCloud },
    { href: "/advisor", label: "Release Advisor", icon: Clock },
    { href: "/methodology", label: "Methodology", icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-spotify-border bg-spotify-black/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-spotify-green text-black font-bold shadow-lg shadow-spotify-green/20">
            <Music className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white block leading-tight">
              Spotify <span className="text-spotify-green">Advisor</span>
            </span>
            <span className="text-xs text-spotify-subtext block font-mono">
              R Data Science Engine
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-spotify-card text-spotify-green border border-spotify-green/30"
                    : "text-spotify-subtext hover:text-white hover:bg-spotify-card/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-2 bg-spotify-card px-2.5 py-1 rounded-full border border-spotify-border text-xs text-spotify-subtext font-mono">
            <span className="h-2 w-2 rounded-full bg-spotify-green animate-pulse"></span>
            <span>R Engine: 4.6.1</span>
          </div>
          <a
            href="https://github.com/KARTHIK-BATTIPROLU/IDS-Casestudy-.git"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-spotify-subtext hover:text-white transition-colors"
            title="GitHub Repository"
          >
            <Github className="h-5 w-5" />
          </a>
        </div>
      </div>
    </header>
  );
}
