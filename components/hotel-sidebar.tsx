'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ShoppingCart,
  FileText,
  LogOut,
  Settings,
  Home,
  User
} from 'lucide-react'
import { signOut } from '@/lib/auth-client'

export function HotelSidebar() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', href: '/hotel', icon: Home },
    { name: 'Place Order', href: '/hotel/ordering', icon: FileText },
    { name: 'My Orders', href: '/hotel/orders', icon: ShoppingCart },
    { name: 'Settings', href: '/hotel/settings', icon: Settings },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  return (
    <div className="w-64 bg-card/50 backdrop-blur-md border-r border-border/50 h-screen sticky top-0 flex flex-col pt-6 pb-4 shadow-xl">
      <div className="px-6 mb-8 flex items-center gap-3">
        <span className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary/20 flex-shrink-0">
          <Image src="/logo.jpg" alt="Oyru" fill className="object-cover" sizes="40px" priority />
        </span>
        <span className="font-bold text-xl text-foreground">Hotel Portal</span>
      </div>

      <nav className="flex-1 px-4 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/hotel' && pathname.startsWith(item.href + '/'))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${isActive
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 mt-auto pt-4 border-t border-border/50">
        <button
          onClick={async () => {
            await signOut();
            window.location.href = '/auth-hotel-m4p2';
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors font-medium"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
