"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LogOut, ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

export default function SubmitEODPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    calls_made: 0,
    appointments_set: 0,
    shows_expected: 0,
    follow_ups_scheduled: 0,
    notes: '',
    wins: '',
    challenges: '',
    tomorrow_goals: ''
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/eod', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_id: user?.id,
          user_name: user?.name,
          user_role: user?.role,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit EOD form')
      }

      toast.success('EOD form submitted successfully!')

      // Redirect back to dashboard
      setTimeout(() => {
        if (user?.role === 'closer') {
          router.push('/dashboard/closer')
        } else if (user?.role === 'setter') {
          router.push('/dashboard/setter')
        } else {
          router.push('/dashboard')
        }
      }, 1000)
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit EOD form')
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

  const handleCancel = () => {
    if (user?.role === 'closer') {
      router.push('/dashboard/closer')
    } else if (user?.role === 'setter') {
      router.push('/dashboard/setter')
    } else {
      router.push('/dashboard')
    }
  }

  if (authLoading) {
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
              <h1 className="text-h1">End of Day Report</h1>
              <p className="text-small" style={{ color: 'var(--color-text-muted)' }}>
                Submit your daily performance summary
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
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card">
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <h2 className="text-h2" style={{ marginBottom: 'var(--space-2)' }}>Daily Report</h2>
              <p className="text-small" style={{ color: 'var(--color-text-muted)' }}>
                Fill out your end of day metrics and reflections
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              {/* Metrics Section */}
              <div style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-bg-secondary)',
                borderRadius: '8px',
                border: '1px solid var(--color-border)'
              }}>
                <h3 className="text-h3" style={{ marginBottom: 'var(--space-4)' }}>📊 Daily Metrics</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="calls_made">
                      {user.role === 'setter' ? 'Calls Made' : 'Calls Taken'}
                    </Label>
                    <Input
                      id="calls_made"
                      type="number"
                      min="0"
                      value={formData.calls_made}
                      onChange={(e) => setFormData({ ...formData, calls_made: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appointments_set">
                      {user.role === 'setter' ? 'Appointments Set' : 'Deals Closed'}
                    </Label>
                    <Input
                      id="appointments_set"
                      type="number"
                      min="0"
                      value={formData.appointments_set}
                      onChange={(e) => setFormData({ ...formData, appointments_set: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shows_expected">
                      {user.role === 'setter' ? 'Shows Expected Tomorrow' : 'Offers Made'}
                    </Label>
                    <Input
                      id="shows_expected"
                      type="number"
                      min="0"
                      value={formData.shows_expected}
                      onChange={(e) => setFormData({ ...formData, shows_expected: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="follow_ups_scheduled">Follow-ups Scheduled</Label>
                    <Input
                      id="follow_ups_scheduled"
                      type="number"
                      min="0"
                      value={formData.follow_ups_scheduled}
                      onChange={(e) => setFormData({ ...formData, follow_ups_scheduled: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              {/* Reflections Section */}
              <div style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-bg-secondary)',
                borderRadius: '8px',
                border: '1px solid var(--color-border)'
              }}>
                <h3 className="text-h3" style={{ marginBottom: 'var(--space-4)' }}>💭 Daily Reflections</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="wins">🎉 Today's Wins</Label>
                    <Textarea
                      id="wins"
                      value={formData.wins}
                      onChange={(e) => setFormData({ ...formData, wins: e.target.value })}
                      placeholder="What went well today?"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="challenges">⚠️ Challenges Faced</Label>
                    <Textarea
                      id="challenges"
                      value={formData.challenges}
                      onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                      placeholder="What obstacles did you encounter?"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tomorrow_goals">🎯 Tomorrow's Goals</Label>
                    <Textarea
                      id="tomorrow_goals"
                      value={formData.tomorrow_goals}
                      onChange={(e) => setFormData({ ...formData, tomorrow_goals: e.target.value })}
                      placeholder="What do you want to achieve tomorrow?"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">📝 Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any other important information..."
                  rows={3}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full btn btn-primary" size="lg">
                {loading ? 'Submitting...' : 'Submit EOD Report'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
