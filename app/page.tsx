"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect based on role
        if (user.role === 'admin') {
          router.push('/dashboard')
        } else if (user.role === 'closer') {
          router.push('/dashboard/closer')
        } else if (user.role === 'setter') {
          router.push('/dashboard/setter')
        } else {
          router.push('/dashboard')
        }
      } else {
        router.push('/login')
      }
    }
  }, [user, loading, router])

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div className="flex flex-col items-center gap-4">
        <div className="badge-live">
          <span>CLOSERS KPI</span>
        </div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-accent)' }}></div>
        <div style={{ color: 'var(--color-text-primary)' }}>Loading...</div>
      </div>
    </div>
  )
}
