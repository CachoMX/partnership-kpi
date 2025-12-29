"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, TrendingUp, Users, DollarSign, Target, Award, Calendar } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth-context"
import { DateRangeFilter } from "@/components/date-range-filter"
import { toast } from "sonner"
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface SetterStats {
  id: string
  name: string
  email: string | null
  total_calls_booked: number
  total_shows: number
  total_closes: number
  show_rate: number
  close_rate: number
  total_revenue_generated: number
}

interface DailyStats {
  date: string
  calls_booked: number
  shows: number
  closes: number
  revenue_generated: number
}

interface BestDay {
  date: string
  revenue_generated: number
  closes: number
}

export default function SetterDashboard() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<SetterStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [bestDay, setBestDay] = useState<BestDay | null>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (!authLoading && user && user.role !== 'setter') {
      if (user.role === 'admin') {
        router.push('/dashboard')
      } else if (user.role === 'closer') {
        router.push('/dashboard/closer')
      }
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user?.setterId) {
      fetchSetterStats()
      fetchDailyStats()
    }
  }, [user])

  const fetchSetterStats = async (fromDate?: string, toDate?: string) => {
    if (!user?.setterId) return

    const from = fromDate ?? dateFrom
    const to = toDate ?? dateTo

    setLoading(true)
    try {
      let url = '/api/setters'

      // If date filter is active, use stats endpoint
      if (from || to) {
        const params = new URLSearchParams()
        if (from) params.append('dateFrom', from)
        if (to) params.append('dateTo', to)
        url = `/api/setters/stats?${params.toString()}`
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch stats')

      const data = await response.json()
      const myStats = data.data.find((s: SetterStats) => s.id === user.setterId)

      if (myStats) {
        setStats(myStats)
      } else {
        toast.error('Could not find your stats')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  const fetchDailyStats = async (fromDate?: string, toDate?: string) => {
    if (!user?.setterId) return

    const from = fromDate ?? dateFrom
    const to = toDate ?? dateTo

    try {
      let url = `/api/setters/daily-stats?setterId=${user.setterId}`

      // Add date filters if active
      if (from || to) {
        if (from) url += `&dateFrom=${from}`
        if (to) url += `&dateTo=${to}`
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch daily stats')

      const data = await response.json()
      setDailyStats(data.dailyStats || [])
      setBestDay(data.bestDay || null)
    } catch {
      // Silent fail - daily stats are optional
    }
  }

  const applyDateFilter = (from: string, to: string) => {
    fetchSetterStats(from, to)
    fetchDailyStats(from, to)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-accent)' }}></div>
          <div style={{ color: 'var(--color-text-primary)' }}>Loading your stats...</div>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'setter' || !stats) {
    return null
  }

  const noShowRate = stats.total_calls_booked > 0 ? (100 - stats.show_rate).toFixed(1) : '0.0'
  const noShows = stats.total_calls_booked - stats.total_shows

  return (
    <main style={{ backgroundColor: 'var(--color-bg-primary)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'var(--space-4) var(--space-6)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '6px 16px',
                borderRadius: '9999px',
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                letterSpacing: '1px'
              }}>
                SETTER
              </div>
              <div>
                <h1 className="text-h1" style={{ marginBottom: 'var(--space-1)' }}>My Performance</h1>
                <p className="text-small" style={{ color: 'var(--color-text-muted)' }}>Welcome back, {stats.name}!</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/submit-call">
                <Button className="btn btn-primary">
                  + Add Call
                </Button>
              </Link>
              <Link href="/submit-eod">
                <Button className="btn btn-secondary">
                  📋 EOD Form
                </Button>
              </Link>
              <ThemeToggle />
              <Button onClick={handleSignOut} className="btn btn-secondary">
                <LogOut className="w-5 h-5" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'var(--space-6)' }}>
        {/* Date Range Filter */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <DateRangeFilter
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateChange={(from, to) => {
              setDateFrom(from)
              setDateTo(to)
            }}
            onApply={(from, to) => applyDateFilter(from, to)}
          />
        </div>

        {/* KPI Cards Grid */}
        <div className="card-grid" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card-report">
            <div className="flex items-center gap-3 mb-3">
              <div className="avatar-ring" style={{ width: '40px', height: '40px' }}>
                <div className="avatar-ring-inner">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-small text-muted">Calls Booked</div>
            </div>
            <div className="stat-value">{stats.total_calls_booked.toLocaleString()}</div>
          </div>

          <div className="card-report">
            <div className="flex items-center gap-3 mb-3">
              <div className="avatar-ring" style={{ width: '40px', height: '40px' }}>
                <div className="avatar-ring-inner">
                  <Target className="w-5 h-5" />
                </div>
              </div>
              <div className="text-small text-muted">Total Shows</div>
            </div>
            <div className="stat-value">{stats.total_shows.toLocaleString()}</div>
          </div>

          <div className="card-report">
            <div className="flex items-center gap-3 mb-3">
              <div className="avatar-ring" style={{ width: '40px', height: '40px' }}>
                <div className="avatar-ring-inner">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <div className="text-small text-muted">Total Closes</div>
            </div>
            <div className="stat-value">{stats.total_closes.toLocaleString()}</div>
          </div>

          <div className="card-report">
            <div className="flex items-center gap-3 mb-3">
              <div className="avatar-ring" style={{ width: '40px', height: '40px' }}>
                <div className="avatar-ring-inner">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="text-small text-muted">Show Rate</div>
            </div>
            <div className="stat-value">{stats.show_rate.toFixed(1)}%</div>
            <div className="progress-bar mt-2">
              <div className="progress-bar-fill" style={{ width: `${stats.show_rate}%` }}></div>
            </div>
          </div>

          <div className="card-report">
            <div className="flex items-center gap-3 mb-3">
              <div className="avatar-ring" style={{ width: '40px', height: '40px' }}>
                <div className="avatar-ring-inner">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="text-small text-muted">Close Rate</div>
            </div>
            <div className="stat-value">{stats.close_rate.toFixed(1)}%</div>
            <div className="progress-bar mt-2">
              <div className="progress-bar-fill" style={{ width: `${stats.close_rate}%` }}></div>
            </div>
          </div>

          <div className="card-report">
            <div className="flex items-center gap-3 mb-3">
              <div className="avatar-ring" style={{ width: '40px', height: '40px' }}>
                <div className="avatar-ring-inner">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="text-small text-muted">Revenue Generated</div>
            </div>
            <div className="stat-value">${(stats.total_revenue_generated / 1000).toFixed(1)}K</div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="card-grid" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card-report">
            <div className="text-small text-muted mb-2">No Shows</div>
            <div className="stat-value" style={{ fontSize: 'var(--text-2xl)', color: 'var(--color-danger)' }}>{noShows.toLocaleString()}</div>
          </div>

          <div className="card-report">
            <div className="text-small text-muted mb-2">No Show Rate</div>
            <div className="stat-value" style={{ fontSize: 'var(--text-2xl)', color: 'var(--color-danger)' }}>{noShowRate}%</div>
          </div>

          <div className="card-report">
            <div className="text-small text-muted mb-2">Avg Revenue/Close</div>
            <div className="stat-value" style={{ fontSize: 'var(--text-2xl)' }}>
              ${stats.total_closes > 0 ? (stats.total_revenue_generated / stats.total_closes).toFixed(0) : '0'}
            </div>
          </div>

          <div className="card-report">
            <div className="text-small text-muted mb-2">Booking Performance</div>
            <div className="stat-value" style={{ fontSize: 'var(--text-2xl)' }}>
              {stats.total_calls_booked > 0 ? ((stats.total_closes / stats.total_calls_booked) * 100).toFixed(1) : '0.0'}%
            </div>
          </div>
        </div>

        {/* Best Day Card */}
        {bestDay && bestDay.revenue_generated > 0 && (
          <div className="card" style={{ marginBottom: 'var(--space-6)', background: 'linear-gradient(135deg, var(--color-bg-card) 0%, var(--color-accent-subtle) 100%)' }}>
            <div className="flex items-center gap-4">
              <div className="avatar-ring" style={{ width: '60px', height: '60px' }}>
                <div className="avatar-ring-inner">
                  <Calendar className="w-8 h-8" style={{ color: 'var(--color-accent)' }} />
                </div>
              </div>
              <div>
                <div className="text-small text-muted">Your Best Day</div>
                <h2 className="text-h2" style={{ marginBottom: 'var(--space-1)' }}>
                  {new Date(bestDay.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </h2>
                <div className="flex gap-4">
                  <span style={{ color: 'var(--color-accent)' }}>${bestDay.revenue_generated.toLocaleString()} Revenue Generated</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>• {bestDay.closes} Closes</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance History Chart */}
        {dailyStats.length > 0 && (
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <h2 className="text-h2 mb-6">Performance History</h2>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={dailyStats}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorShows" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-info)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-info)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="date"
                  stroke="var(--color-text-muted)"
                  tick={{ fill: 'var(--color-text-muted)' }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis
                  stroke="var(--color-text-muted)"
                  tick={{ fill: 'var(--color-text-muted)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    color: 'var(--color-text-primary)'
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  formatter={(value: any, name: string) => {
                    if (name === 'revenue_generated') {
                      return ['$' + value.toLocaleString(), 'Revenue Generated']
                    }
                    return [value.toLocaleString(), name === 'shows' ? 'Shows' : name === 'closes' ? 'Closes' : 'Calls Booked']
                  }}
                />
                <Legend
                  wrapperStyle={{ color: 'var(--color-text-primary)' }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue_generated"
                  stroke="var(--color-accent)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--color-accent)', strokeWidth: 2 }}
                  activeDot={{ r: 8 }}
                  name="Revenue Generated"
                />
                <Line
                  type="monotone"
                  dataKey="shows"
                  stroke="var(--color-info)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--color-info)', strokeWidth: 2 }}
                  activeDot={{ r: 8 }}
                  name="Shows"
                />
                <Line
                  type="monotone"
                  dataKey="closes"
                  stroke="var(--color-warning)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-warning)', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  name="Closes"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Info Card */}
        <div className="card" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <h2 className="text-h2 mb-4">📅 Ready to log a new call?</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
            Click the "Add Call" button to record your latest call and watch your stats update in real-time!
          </p>
          <Link href="/submit-call">
            <Button className="btn btn-primary" size="lg">
              + Add New Call
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
