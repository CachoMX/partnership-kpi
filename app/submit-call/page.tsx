"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, ArrowLeft } from "lucide-react"
import { AddCallForm } from "@/components/add-call-form"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface Closer {
  id: string
  name: string
}

interface Setter {
  id: string
  name: string
}

export default function SubmitCallPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [closers, setClosers] = useState<Closer[]>([])
  const [setters, setSetters] = useState<Setter[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      const [closersRes, settersRes] = await Promise.all([
        fetch('/api/closers'),
        fetch('/api/setters')
      ])

      const closersData = await closersRes.json()
      const settersData = await settersRes.json()

      setClosers(closersData.data || [])
      setSetters(settersData.data || [])
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  const handleCallSuccess = () => {
    toast.success('Call submitted successfully!')
    setTimeout(() => {
      if (user?.role === 'closer') {
        router.push('/dashboard/closer')
      } else if (user?.role === 'setter') {
        router.push('/dashboard/setter')
      } else {
        router.push('/dashboard')
      }
    }, 1000)
  }

  const handleCancel = () => {
    if (user?.role === 'closer') {
      router.push('/dashboard/closer')
    } else if (user?.role === 'setter') {
      router.push('/dashboard/setter')
    } else {
      router.push('/dashboard')
    }
  }

  if (authLoading || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-accent)' }}></div>
          <div style={{ color: 'var(--color-text-primary)' }}>Loading...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-4) var(--space-6)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h1">Submit Call</h1>
              <p className="text-small" style={{ color: 'var(--color-text-muted)' }}>
                Log your call details
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCancel} className="btn btn-secondary">
                <ArrowLeft className="w-5 h-5" />
                Cancel
              </Button>
              <Button onClick={handleSignOut} className="btn btn-secondary">
                <LogOut className="w-5 h-5" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'var(--space-6)'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <AddCallForm
            closers={closers}
            setters={setters}
            onSuccess={handleCallSuccess}
          />
        </div>
      </div>
    </main>
  )
}
