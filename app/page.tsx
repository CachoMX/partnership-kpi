"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Simply redirect to login on homepage
    router.push('/login')
  }, [router])

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
