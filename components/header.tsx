'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/lib/contexts/cart-context'
import { ShoppingCart, Menu } from 'lucide-react'
import { useState } from 'react'
import { useSession, signOut } from '@/lib/auth-client'
import { useRouter, usePathname } from 'next/navigation'

export function Header() {
  const { getItemCount } = useCart()
  const itemCount = getItemCount()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  if (pathname.startsWith('/admin') || pathname.startsWith('/driver') || pathname.startsWith('/hotel')) {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/40 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl group transition-transform duration-300 hover:scale-[1.02]">
            <span className="relative w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-primary/20 flex-shrink-0">
              <Image src="/logo.jpg" alt="Oyru" fill className="object-cover" sizes="36px" priority />
            </span>
            <span className="hidden sm:inline bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Oyru</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 bg-muted/30 px-4 py-1.5 rounded-full border border-border/50">
            <Link href="/" className="px-4 py-1.5 text-sm font-semibold rounded-full hover:bg-background hover:shadow-sm hover:text-primary transition-all duration-300">
              Home
            </Link>
            <Link href="/orders" className="px-4 py-1.5 text-sm font-semibold rounded-full hover:bg-background hover:shadow-sm hover:text-primary transition-all duration-300">
              Orders
            </Link>
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-5">
            <Link href="/cart" className="relative p-2 rounded-full hover:bg-primary/10 text-foreground hover:text-primary transition-all duration-300 group">
              <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              {itemCount > 0 && (
                <span className="absolute 0 top-0 right-0 w-4 h-4 rounded-full bg-destructive text-white text-[10px] flex items-center justify-center font-bold shadow-lg shadow-destructive/40 animate-in zoom-in">
                  {itemCount}
                </span>
              )}
            </Link>

            {session ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/profile" className="px-4 py-2 text-sm font-semibold rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-300">
                  My Profile
                </Link>
                <button onClick={handleSignOut} className="px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10 rounded-full transition-all duration-300">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link href="/sign-in" className="px-4 py-2 text-sm font-semibold rounded-full hover:bg-muted transition-all duration-300">
                  Sign In
                </Link>
                <Link href="/sign-up" className="px-5 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-full hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="sm:hidden p-2 rounded-full hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-border/50 py-4 space-y-2 animate-in slide-in-from-top-2 fade-in duration-200">
            <Link
              href="/"
              className="block px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/orders"
              className="block px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Orders
            </Link>
            {session ? (
              <>
                <Link
                  href="/profile"
                  className="block px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 px-4 pt-2">
                <Link
                  href="/sign-in"
                  className="block text-center py-2.5 rounded-xl text-sm font-semibold bg-muted hover:bg-muted/80 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="block text-center py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground shadow-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
