"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, RefreshCw, TrendingUp, Users, DollarSign, Target, Award, Zap, LogOut, UserCog, Receipt } from "lucide-react"
import { DateRangeFilter } from "@/components/date-range-filter"
import Link from "next/link"
import { AddCallForm } from "@/components/add-call-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RevenueTrendChart } from "@/components/revenue-trend-chart"
import { AdminUserManagement } from "@/components/admin-user-management"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface Closer {
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

interface Setter {
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

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [closers, setClosers] = useState<Closer[]>([])
  const [setters, setSetters] = useState<Setter[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddCallDialogOpen, setIsAddCallDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'closers' | 'setters'>('closers')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchData = async (fromDate?: string, toDate?: string) => {
    // Use passed parameters or fall back to state
    const from = fromDate ?? dateFrom
    const to = toDate ?? dateTo

    setLoading(true)
    try {
      // Build query params for date filtering
      const params = new URLSearchParams()
      if (from) params.append('dateFrom', from)
      if (to) params.append('dateTo', to)
      const queryString = params.toString() ? `?${params.toString()}` : ''

      // Use stats endpoints when filtering by date, otherwise use regular endpoints
      const closersEndpoint = (from || to) ? `/api/closers/stats${queryString}` : '/api/closers'
      const settersEndpoint = (from || to) ? `/api/setters/stats${queryString}` : '/api/setters'

      const [closersRes, settersRes] = await Promise.all([
        fetch(closersEndpoint),
        fetch(settersEndpoint)
      ])

      if (!closersRes.ok || !settersRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const closersData = await closersRes.json()
      const settersData = await settersRes.json()

      setClosers(closersData.data || [])
      setSetters(settersData.data || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (!authLoading && user && user.role !== 'admin') {
      // Redirect non-admin users to their respective dashboards
      if (user.role === 'closer') {
        router.push('/dashboard/closer')
      } else if (user.role === 'setter') {
        router.push('/dashboard/setter')
      }
    } else if (!authLoading && user && user.role === 'admin') {
      // Fetch data only for admin users
      fetchData()
    }
  }, [user, authLoading, router])

  // Calculate aggregate stats for closers
  const closerStats = {
    total_calls: closers.reduce((sum, c) => sum + c.total_calls, 0),
    live_calls: closers.reduce((sum, c) => sum + c.live_calls, 0),
    closed_deals: closers.reduce((sum, c) => sum + c.closed_deals, 0),
    offers_made: closers.reduce((sum, c) => sum + c.offers_made, 0),
    no_shows: closers.reduce((sum, c) => sum + c.no_shows, 0),
    total_revenue: closers.reduce((sum, c) => sum + c.total_revenue, 0),
    total_cash_collected: closers.reduce((sum, c) => sum + c.total_cash_collected, 0),
    total_commission: closers.reduce((sum, c) => sum + c.total_commission, 0),
  }

  // Calculate aggregate stats for setters
  const setterStats = {
    total_calls_booked: setters.reduce((sum, s) => sum + s.total_calls_booked, 0),
    total_shows: setters.reduce((sum, s) => sum + s.total_shows, 0),
    total_closes: setters.reduce((sum, s) => sum + s.total_closes, 0),
    total_revenue_generated: setters.reduce((sum, s) => sum + s.total_revenue_generated, 0),
    show_rate: setters.length > 0 ? setters.reduce((sum, s) => sum + s.show_rate, 0) / setters.length : 0,
    close_rate: setters.length > 0 ? setters.reduce((sum, s) => sum + s.close_rate, 0) / setters.length : 0,
  }

  // Use the appropriate stats based on view mode
  const stats = viewMode === 'closers' ? closerStats : {
    total_calls: setterStats.total_calls_booked,
    live_calls: setterStats.total_shows,
    closed_deals: setterStats.total_closes,
    offers_made: 0,
    no_shows: setterStats.total_calls_booked - setterStats.total_shows,
    total_revenue: setterStats.total_revenue_generated,
    total_cash_collected: setterStats.total_revenue_generated,
    total_commission: 0,
  }

  const closeRate = viewMode === 'closers'
    ? (stats.live_calls > 0 ? ((stats.closed_deals / stats.live_calls) * 100).toFixed(1) : '0.0')
    : setterStats.close_rate.toFixed(1)
  const showRate = viewMode === 'closers'
    ? (stats.total_calls > 0 ? (100 - (stats.no_shows / stats.total_calls) * 100).toFixed(1) : '0.0')
    : setterStats.show_rate.toFixed(1)
  const aov = stats.closed_deals > 0 ? (stats.total_revenue / stats.closed_deals) : 0
  const cashPerCall = stats.live_calls > 0 ? (stats.total_cash_collected / stats.live_calls) : 0

  // Mock trend data (in production, fetch from API with dates)
  const trendData = [
    { date: 'Week 1', revenue: stats.total_revenue * 0.15, cash: stats.total_cash_collected * 0.15 },
    { date: 'Week 2', revenue: stats.total_revenue * 0.22, cash: stats.total_cash_collected * 0.22 },
    { date: 'Week 3', revenue: stats.total_revenue * 0.28, cash: stats.total_cash_collected * 0.28 },
    { date: 'Week 4', revenue: stats.total_revenue * 0.35, cash: stats.total_cash_collected * 0.35 },
    { date: 'Current', revenue: stats.total_revenue, cash: stats.total_cash_collected },
  ]

  const handleCallAdded = () => {
    setIsAddCallDialogOpen(false)
    fetchData()
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  // Sort closers and setters for leaderboards
  const topClosers = [...closers].sort((a, b) => b.total_cash_collected - a.total_cash_collected).slice(0, 7)
  const topSetters = [...setters].sort((a, b) => b.total_revenue_generated - a.total_revenue_generated).slice(0, 5)

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-accent)' }}></div>
          <div style={{ color: 'var(--color-text-primary)' }} className="text-lg">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

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
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: 'var(--space-4) var(--space-6)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="badge-live">
                <span>LIVE</span>
              </div>
              <div>
                <h1 className="text-h1" style={{ marginBottom: 'var(--space-1)' }}>
                  {viewMode === 'closers' ? 'Closers' : 'Setters'} Performance
                </h1>
                <p className="text-small" style={{ color: 'var(--color-text-muted)' }}>Real-time analytics & leaderboards</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard/sales">
                <Button className="btn btn-secondary">
                  <Receipt className="w-5 h-5" />
                  Sales
                </Button>
              </Link>
              <Link href="/dashboard/users">
                <Button className="btn btn-secondary">
                  <UserCog className="w-5 h-5" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/dashboard/eod-reports">
                <Button className="btn btn-secondary">
                  📊 EOD Reports
                </Button>
              </Link>
              <Link href="/submit-eod">
                <Button className="btn btn-secondary">
                  📋 EOD Form
                </Button>
              </Link>
              <Button
                onClick={fetchData}
                variant="outline"
                size="lg"
                className="btn btn-secondary"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh
              </Button>
              <AdminUserManagement onUserAdded={fetchData} />
              <Dialog open={isAddCallDialogOpen} onOpenChange={setIsAddCallDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="btn btn-primary">
                    <Plus className="w-5 h-5" />
                    Add Call
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" style={{
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)'
                }}>
                  <DialogHeader>
                    <DialogTitle style={{ color: 'var(--color-text-primary)' }}>Add New Call</DialogTitle>
                  </DialogHeader>
                  <AddCallForm
                    closers={closers}
                    setters={setters}
                    onSuccess={handleCallAdded}
                  />
                </DialogContent>
              </Dialog>
              <ThemeToggle />
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="lg"
                className="btn btn-secondary"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: 'var(--space-6)' }}>
        {/* Filters Section */}
        <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
          {/* View Mode Toggle */}
          <div style={{
            display: 'flex',
            gap: 'var(--space-2)',
            backgroundColor: 'var(--color-bg-card)',
            padding: 'var(--space-3)',
            borderRadius: '8px',
            border: '1px solid var(--color-border)'
          }}>
            <Button
              onClick={() => setViewMode('closers')}
              className={viewMode === 'closers' ? 'btn btn-primary' : 'btn btn-secondary'}
              size="sm"
            >
              Closers
            </Button>
            <Button
              onClick={() => setViewMode('setters')}
              className={viewMode === 'setters' ? 'btn btn-primary' : 'btn btn-secondary'}
              size="sm"
            >
              Setters
            </Button>
          </div>

          {/* Date Range Picker */}
          <DateRangeFilter
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateChange={(from, to) => {
              setDateFrom(from)
              setDateTo(to)
            }}
            onApply={(from, to) => fetchData(from, to)}
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
              <div className="text-small text-muted">
                {viewMode === 'closers' ? 'Booked Calls' : 'Calls Booked'}
              </div>
            </div>
            <div className="stat-value">{stats.total_calls.toLocaleString()}</div>
          </div>

          <div className="card-report">
            <div className="flex items-center gap-3 mb-3">
              <div className="avatar-ring" style={{ width: '40px', height: '40px' }}>
                <div className="avatar-ring-inner">
                  <Zap className="w-5 h-5" />
                </div>
              </div>
              <div className="text-small text-muted">
                {viewMode === 'closers' ? 'Live Calls' : 'Shows'}
              </div>
            </div>
            <div className="stat-value">{stats.live_calls.toLocaleString()}</div>
          </div>

          <div className="card-report">
            <div className="flex items-center gap-3 mb-3">
              <div className="avatar-ring" style={{ width: '40px', height: '40px' }}>
                <div className="avatar-ring-inner">
                  <Target className="w-5 h-5" />
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
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="text-small text-muted">AOV</div>
            </div>
            <div className="stat-value">${aov.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
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
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <div className="text-small text-muted">Revenue</div>
            </div>
            <div className="stat-value">${(stats.total_revenue / 1000000).toFixed(2)}M</div>
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
            <div className="text-small text-muted mb-2">Cash/Call</div>
            <div className="stat-value" style={{ fontSize: 'var(--text-2xl)' }}>${cashPerCall.toFixed(0)}</div>
          </div>

          <div className="card-report">
            <div className="text-small text-muted mb-2">Commission</div>
            <div className="stat-value" style={{ fontSize: 'var(--text-2xl)' }}>${(stats.total_commission / 1000).toFixed(1)}K</div>
          </div>

          <div className="card-report">
            <div className="text-small text-muted mb-2">Cash Collected</div>
            <div className="stat-value" style={{ fontSize: 'var(--text-2xl)' }}>${(stats.total_cash_collected / 1000000).toFixed(2)}M</div>
          </div>
        </div>

        {/* Chart Section */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <RevenueTrendChart data={trendData} />
        </div>

        {/* Leaderboards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
          {/* Closers Leaderboard */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h2">🏆 Closers Leaderboard</h2>
              <Link href="/dashboard/view-closer">
                <Button size="sm" className="btn btn-secondary">
                  View Individual
                </Button>
              </Link>
            </div>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Closer</th>
                    <th style={{ textAlign: 'right' }}>Closed</th>
                    <th style={{ textAlign: 'right' }}>AOV</th>
                    <th style={{ textAlign: 'right' }}>Revenue</th>
                    <th style={{ textAlign: 'right' }}>Cash</th>
                  </tr>
                </thead>
                <tbody>
                  {topClosers.map((closer, index) => {
                    const closerAov = closer.closed_deals > 0 ? closer.total_revenue / closer.closed_deals : 0
                    return (
                      <tr key={closer.id}>
                        <td>
                          {index === 0 && <span style={{ color: 'var(--color-warning)' }}>🥇</span>}
                          {index === 1 && <span style={{ color: 'var(--color-text-muted)' }}>🥈</span>}
                          {index === 2 && <span style={{ color: 'var(--color-accent-secondary)' }}>🥉</span>}
                          {index > 2 && `${index + 1}.`}
                        </td>
                        <td style={{ fontWeight: 'var(--font-semibold)' }}>{closer.name}</td>
                        <td style={{ textAlign: 'right' }}>{closer.closed_deals}</td>
                        <td style={{ textAlign: 'right' }}>${closerAov.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                        <td style={{ textAlign: 'right' }}>${(closer.total_revenue / 1000).toFixed(0)}k</td>
                        <td style={{ textAlign: 'right', fontWeight: 'var(--font-bold)', color: 'var(--color-accent)' }}>
                          ${(closer.total_cash_collected / 1000).toFixed(0)}k
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Setters Leaderboard */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h2">⚡ Setters Leaderboard</h2>
              <Link href="/dashboard/view-setter">
                <Button size="sm" className="btn btn-secondary">
                  View Individual
                </Button>
              </Link>
            </div>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Setter</th>
                    <th style={{ textAlign: 'right' }}>Booked</th>
                    <th style={{ textAlign: 'right' }}>Show %</th>
                    <th style={{ textAlign: 'right' }}>Closes</th>
                    <th style={{ textAlign: 'right' }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topSetters.map((setter, index) => (
                    <tr key={setter.id}>
                      <td>
                        {index === 0 && <span style={{ color: 'var(--color-warning)' }}>🥇</span>}
                        {index === 1 && <span style={{ color: 'var(--color-text-muted)' }}>🥈</span>}
                        {index === 2 && <span style={{ color: 'var(--color-accent-secondary)' }}>🥉</span>}
                        {index > 2 && `${index + 1}.`}
                      </td>
                      <td style={{ fontWeight: 'var(--font-semibold)' }}>{setter.name}</td>
                      <td style={{ textAlign: 'right' }}>{setter.total_calls_booked}</td>
                      <td style={{ textAlign: 'right' }}>{setter.show_rate.toFixed(1)}%</td>
                      <td style={{ textAlign: 'right' }}>{setter.total_closes}</td>
                      <td style={{ textAlign: 'right', fontWeight: 'var(--font-bold)', color: 'var(--color-accent)' }}>
                        ${(setter.total_revenue_generated / 1000).toFixed(0)}k
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
