"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Shield } from "lucide-react"
import { ConnectButton } from "@/components/connect-button"

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">ME</span>
          </div>
          <span className="text-xl font-bold text-foreground">Moca Edge</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/browse" className="text-muted-foreground hover:text-foreground transition-colors">
            Browse Projects
          </Link>
          <Link href="/create-project" className="text-muted-foreground hover:text-foreground transition-colors">
            Post Project
          </Link>
          <Link href="/assessments" className="text-muted-foreground hover:text-foreground transition-colors">
            Assessments
          </Link>
          <Link href="/verify" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
            <Shield className="w-4 h-4" />
            Verify
          </Link>
          <Link href="/issue-credential" className="text-muted-foreground hover:text-foreground transition-colors">
            Issue Credentials
          </Link>
          <Link href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </Link>
          <ConnectButton />
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-sm">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link
              href="/browse"
              className="text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Browse Projects
            </Link>
            <Link
              href="/create-project"
              className="text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Post Project
            </Link>
            <Link
              href="/assessments"
              className="text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Assessments
            </Link>
            <Link
              href="/verify"
              className="text-muted-foreground hover:text-foreground transition-colors py-2 flex items-center gap-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Shield className="w-4 h-4" />
              Verify
            </Link>
            <Link
              href="/issue-credential"
              className="text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Issue Credentials
            </Link>
            <Link
              href="/#features"
              className="text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <div className="pt-2">
              <ConnectButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
