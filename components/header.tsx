'use client'

import Link from 'next/link'
import { useCart } from '@/lib/contexts/cart-context'
import { ShoppingCart, User, Menu } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const { getItemCount } = useCart()
  const itemCount = getItemCount()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">
              Oy
            </div>
            <span className="hidden sm:inline">Oyru</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/orders" className="text-sm font-medium hover:text-primary transition-colors">
              Orders
            </Link>
            <Link href="/profile" className="text-sm font-medium hover:text-primary transition-colors">
              Profile
            </Link>
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative hover:text-primary transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-semibold">
                  {itemCount}
                </span>
              )}
            </Link>

            <Link href="/profile" className="hover:text-primary transition-colors hidden sm:block">
              <User className="w-6 h-6" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-3">
            <Link
              href="/"
              className="block text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/orders"
              className="block text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Orders
            </Link>
            <Link
              href="/profile"
              className="block text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Profile
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
