import { ReactNode } from 'react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Admin layout - role check is handled at individual routes
  // using server components and getSession checks
  return <>{children}</>
}
