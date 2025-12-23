"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { LogIn, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Redirect when user is logged in
  useEffect(() => {
    if (!authLoading && user && user.role) {
      // Redirect based on role
      if (user.role === 'admin') {
        router.push('/dashboard')
      } else if (user.role === 'closer') {
        router.push('/dashboard/closer')
      } else if (user.role === 'setter') {
        router.push('/dashboard/setter')
      }
      // If no role, stay on login page (don't redirect to avoid loop)
    }
  }, [user, authLoading, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signIn(email, password)
      toast.success('Welcome back!')
      // Don't redirect here - let the useEffect handle it after user data is loaded
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-6)',
      position: 'relative'
    }}>
      {/* Theme Toggle in top-right corner */}
      <div style={{ position: 'absolute', top: 'var(--space-4)', right: 'var(--space-4)' }}>
        <ThemeToggle />
      </div>

      <Card style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)'
      }}>
        <CardHeader style={{ textAlign: 'center', borderBottom: '1px solid var(--color-border)' }}>
          <div className="badge-live" style={{ margin: '0 auto var(--space-4)' }}>
            <span>CLOSERS KPI</span>
          </div>
          <CardTitle className="text-h1" style={{ color: 'var(--color-text-primary)' }}>Sign In</CardTitle>
          <CardDescription className="text-small" style={{ color: 'var(--color-text-muted)' }}>
            Enter your credentials to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent style={{ paddingTop: 'var(--space-6)' }}>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="form-group">
              <Label htmlFor="email" className="form-label">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <Label htmlFor="password" className="form-label">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="form-input"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 'var(--space-4)' }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </Button>
          </form>

        </CardContent>
      </Card>
    </div>
  )
}
