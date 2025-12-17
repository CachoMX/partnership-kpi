"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LogOut, TrendingUp, Users, DollarSign, Target, Award, Calendar, RefreshCw } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface CloserStats {
  id: string
  name: string
  email: string | null
  total_calls: number
  live_calls: number
  no_shows: number
  closed_deals: number
  offers_made: number
  total_revenue: number
  total_cash_collected: number
  total_commission: number
  commission_rate: number
}

interface DailyStats {
  date: string
  calls: number
  live_calls: number
  closed_deals: number
  revenue: number
  cash_collected: number
  commission: number
}

interface BestDay {
  date: string
  revenue: number
  closed_deals: number
}

export default function CloserDashboard() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<CloserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [bestDay, setBestDay] = useState<BestDay | null>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (!authLoading && user && user.role !== 'closer') {
      if (user.role === 'admin') {
        router.push('/dashboard')
      } else if (user.role === 'setter') {
        router.push('/dashboard/setter')
      }
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user?.closerId) {
      fetchCloserStats()
      fetchDailyStats()
    }
  }, [user])

  const fetchCloserStats = async () => {
    if (!user?.closerId) return

    setLoading(true)
    try {
      let url = '/api/closers'

      // If date filter is active, use stats endpoint
      if (dateFrom || dateTo) {
        const params = new URLSearchParams()
        if (dateFrom) params.append('dateFrom', dateFrom)
        if (dateTo) params.append('dateTo', dateTo)
        url = `/api/closers/stats?${params.toString()}`
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch stats')

      const data = await response.json()
      const myStats = data.data.find((c: CloserStats) => c.id === user.closerId)

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

  const fetchDailyStats = async () => {
    if (!user?.closerId) return

    try {
      let url = `/api/closers/daily-stats?closerId=${user.closerId}`

      // Add date filters if active
      if (dateFrom || dateTo) {
        if (dateFrom) url += `&dateFrom=${dateFrom}`
        if (dateTo) url += `&dateTo=${dateTo}`
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch daily stats')

      const data = await response.json()
      setDailyStats(data.dailyStats || [])
      setBestDay(data.bestDay || null)
    } catch (error: any) {
      console.error('Failed to load daily stats:', error)
    }
  }

  const applyDateFilter = () => {
    fetchCloserStats()
    fetchDailyStats()
  }

  const clearDateFilter = () => {
    setDateFrom('')
    setDateTo('')
    // Refetch will happen via useEffect watching these state changes
    setTimeout(() => {
      fetchCloserStats()
      fetchDailyStats()
    }, 0)
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

  if (!user || user.role !== 'closer' || !stats) {
    return null
  }

  const closeRate = stats.live_calls > 0 ? ((stats.closed_deals / stats.live_calls) * 100).toFixed(1) : '0.0'
  const showRate = stats.total_calls > 0 ? (100 - (stats.no_shows / stats.total_calls) * 100).toFixed(1) : '0.0'
  const aov = stats.closed_deals > 0 ? (stats.total_revenue / stats.closed_deals) : 0

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
              <div className="badge-live">
                <span>CLOSER</span>
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
        <div style={{
          display: 'flex',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
          padding: 'var(--space-4)',
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className="text-small" style={{ color: 'var(--color-text-muted)', minWidth: '40px' }}>From:</span>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{ width: '160px' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className="text-small" style={{ color: 'var(--color-text-muted)', minWidth: '30px' }}>To:</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{ width: '160px' }}
            />
          </div>
          <Button onClick={applyDateFilter} className="btn btn-primary">
            Apply
          </Button>
          <Button onClick={clearDateFilter} className="btn btn-secondary">
            Clear
          </Button>
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
              <div className="text-small text-muted">Total Calls</div>
            </div>
            <div className="stat-value">{stats.total_calls.toLocaleString()}</div>
          </div>

          <div className="card-report">
            <div className="flex items-center gap-3 mb-3">
              <div className="avatar-ring" style={{ width: '40px', height: '40px' }}>
                <div className="avatar-ring-inner">
                  <Target className="w-5 h-5" />
                </div>
              </div>
              <div className="text-small text-muted">Live Calls</div>
            </div>
            <div className="stat-value">{stats.live_calls.toLocaleString()}</div>
          </div>

          <div className="card-report">
            <div className="flex items-center gap-3 mb-3">
              <div className="avatar-ring" style={{ width: '40px', height: '40px' }}>
                <div className="avatar-ring-inner">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <div className="text-small text-muted">Closed Deals</div>
            </div>
            <div className="stat-value">{stats.closed_deals.toLocaleString()}</div>
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
            <div className="stat-value">{closeRate}%</div>
            <div className="progress-bar mt-2">
              <div className="progress-bar-fill" style={{ width: `${closeRate}%` }}></div>
            </div>
          </div>

          <div className="card-report">
            <div className="flex items-center gap-3 mb-3">
              <div className="avatar-ring" style={{ width: '40px', height: '40px' }}>
                <div className="avatar-ring-inner">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="text-small text-muted">Total Revenue</div>
            </div>
            <div className="stat-value">${(stats.total_revenue / 1000).toFixed(1)}K</div>
          </div>

          <div className="card-report">
            <div className="flex items-center gap-3 mb-3">
              <div className="avatar-ring" style={{ width: '40px', height: '40px' }}>
                <div className="avatar-ring-inner">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <div className="text-small text-muted">Commission</div>
            </div>
            <div className="stat-value">${(stats.total_commission / 1000).toFixed(2)}K</div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="card-grid" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card-report">
            <div className="text-small text-muted mb-2">Offers Made</div>
            <div className="stat-value" style={{ fontSize: 'var(--text-2xl)' }}>{stats.offers_made.toLocaleString()}</div>
          </div>

          <div className="card-report">
            <div className="text-small text-muted mb-2">No Shows</div>
            <div className="stat-value" style={{ fontSize: 'var(--text-2xl)', color: 'var(--color-danger)' }}>{stats.no_shows.toLocaleString()}</div>
          </div>

          <div className="card-report">
            <div className="text-small text-muted mb-2">Show Rate</div>
            <div className="stat-value" style={{ fontSize: 'var(--text-2xl)' }}>{showRate}%</div>
          </div>

          <div className="card-report">
            <div className="text-small text-muted mb-2">AOV</div>
            <div className="stat-value" style={{ fontSize: 'var(--text-2xl)' }}>${aov.toFixed(0)}</div>
          </div>

          <div className="card-report">
            <div className="text-small text-muted mb-2">Cash Collected</div>
            <div className="stat-value" style={{ fontSize: 'var(--text-2xl)' }}>${(stats.total_cash_collected / 1000).toFixed(1)}K</div>
          </div>

          <div className="card-report">
            <div className="text-small text-muted mb-2">Commission Rate</div>
            <div className="stat-value" style={{ fontSize: 'var(--text-2xl)' }}>{stats.commission_rate}%</div>
          </div>
        </div>

        {/* Best Day Card */}
        {bestDay && bestDay.revenue > 0 && (
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
                  <span style={{ color: 'var(--color-accent)' }}>${bestDay.revenue.toLocaleString()} Revenue</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>• {bestDay.closed_deals} Deals Closed</span>
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
                  <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
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
                  formatter={(value: any) => ['$' + value.toLocaleString()]}
                />
                <Legend
                  wrapperStyle={{ color: 'var(--color-text-primary)' }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-accent)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--color-accent)', strokeWidth: 2 }}
                  activeDot={{ r: 8 }}
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="cash_collected"
                  stroke="var(--color-info)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--color-info)', strokeWidth: 2 }}
                  activeDot={{ r: 8 }}
                  name="Cash Collected"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Info Card */}
        <div className="card" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <h2 className="text-h2 mb-4">📞 Ready to log a new call?</h2>
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
