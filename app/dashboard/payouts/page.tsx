"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw, DollarSign } from "lucide-react"
import { DateRangeFilter } from "@/components/date-range-filter"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface Call {
  id: string
  closer_id: string | null
  closer_name: string
  cash_collected: number
  cash_collected_2: number
  commission_override: number | null
  commission_rate_override: number | null
  sales_platform: string | null
  payment_method: string | null
  booking_date: string | null
}

interface Closer {
  id: string
  name: string
  commission_rate: number
}

interface PayoutData {
  closer_id: string
  closer_name: string
  default_rate: number
  total_sales: number
  total_cash_collected: number
  total_commission: number
  sales_count: number
  platform_breakdown: Record<string, number>
  payment_breakdown: Record<string, number>
}

export default function PayoutsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [calls, setCalls] = useState<Call[]>([])
  const [closers, setClosers] = useState<Closer[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchData = async (fromDate?: string, toDate?: string) => {
    const from = fromDate ?? dateFrom
    const to = toDate ?? dateTo

    setLoading(true)
    try {
      // Build query params for closed deals only
      const params = new URLSearchParams()
      if (from) params.append('dateFrom', from)
      if (to) params.append('dateTo', to)
      params.append('result', 'Closed')
      const queryString = `?${params.toString()}`

      const [salesRes, closersRes] = await Promise.all([
        fetch(`/api/sales${queryString}`),
        fetch('/api/closers')
      ])

      if (!salesRes.ok) throw new Error('Failed to fetch sales')

      const salesData = await salesRes.json()
      const closersData = await closersRes.json()

      setCalls(salesData.data || [])
      setClosers(closersData.data || [])
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
      router.push('/dashboard')
    } else if (!authLoading && user && user.role === 'admin') {
      fetchData()
    }
  }, [user, authLoading, router])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
  }

  // Create a map of closer commission rates
  const closerCommissionRates = closers.reduce((acc, c) => {
    acc[c.id] = c.commission_rate || 0
    return acc
  }, {} as Record<string, number>)

  // Calculate commission for a call
  const getCommission = (call: Call) => {
    // If there's a manual commission override, use that
    if (call.commission_override !== null && call.commission_override !== undefined) {
      return call.commission_override
    }

    if (!call.closer_id) return 0

    // Use override rate if present, otherwise use closer's default rate
    const rate = call.commission_rate_override !== null && call.commission_rate_override !== undefined
      ? call.commission_rate_override
      : (closerCommissionRates[call.closer_id] || 0)

    const cash = (call.cash_collected || 0) + (call.cash_collected_2 || 0)
    return cash * (rate / 100)
  }

  // Calculate payout data per closer
  const payoutData: PayoutData[] = Object.values(
    calls.reduce((acc, call) => {
      if (!call.closer_id) return acc

      const closerId = call.closer_id
      if (!acc[closerId]) {
        const closer = closers.find(c => c.id === closerId)
        acc[closerId] = {
          closer_id: closerId,
          closer_name: call.closer_name,
          default_rate: closer?.commission_rate || 0,
          total_sales: 0,
          total_cash_collected: 0,
          total_commission: 0,
          sales_count: 0,
          platform_breakdown: {},
          payment_breakdown: {}
        }
      }

      const cash = (call.cash_collected || 0) + (call.cash_collected_2 || 0)
      const commission = getCommission(call)

      acc[closerId].sales_count++
      acc[closerId].total_cash_collected += cash
      acc[closerId].total_commission += commission

      // Track platform breakdown
      if (call.sales_platform) {
        acc[closerId].platform_breakdown[call.sales_platform] =
          (acc[closerId].platform_breakdown[call.sales_platform] || 0) + commission
      }

      // Track payment method breakdown
      if (call.payment_method) {
        acc[closerId].payment_breakdown[call.payment_method] =
          (acc[closerId].payment_breakdown[call.payment_method] || 0) + commission
      }

      return acc
    }, {} as Record<string, PayoutData>)
  ).sort((a, b) => b.total_commission - a.total_commission)

  const totalCommissions = payoutData.reduce((sum, p) => sum + p.total_commission, 0)

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-accent)' }}></div>
          <div style={{ color: 'var(--color-text-primary)' }} className="text-lg">Loading payouts...</div>
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
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'var(--space-4) var(--space-6)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button className="btn btn-secondary" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <div className="badge-live">
                <DollarSign className="w-4 h-4" />
                <span>PAYOUTS</span>
              </div>
              <div>
                <h1 className="text-h1" style={{ marginBottom: 'var(--space-1)' }}>
                  Commission Payouts
                </h1>
                <p className="text-small" style={{ color: 'var(--color-text-muted)' }}>
                  Total commissions owed by closer
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => fetchData()}
                variant="outline"
                size="lg"
                className="btn btn-secondary"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'var(--space-6)' }}>
        {/* Date Filter */}
        <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', alignItems: 'center' }}>
          <DateRangeFilter
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateChange={(from, to) => {
              setDateFrom(from)
              setDateTo(to)
            }}
            onApply={(from, to) => fetchData(from, to)}
          />

          {/* Total Payout */}
          <div style={{ marginLeft: 'auto' }}>
            <div className="card-report" style={{ padding: 'var(--space-4) var(--space-6)' }}>
              <div className="text-small text-muted">Total Payouts</div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-warning)' }}>
                {formatCurrency(totalCommissions)}
              </div>
            </div>
          </div>
        </div>

        {/* Payouts Leaderboard */}
        <div className="card">
          <div style={{ padding: 'var(--space-6)' }}>
            <h2 className="text-h2" style={{ marginBottom: 'var(--space-4)' }}>Commission Breakdown</h2>

            {payoutData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>
                No closed sales found for the selected date range
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {payoutData.map((payout, index) => (
                  <div
                    key={payout.closer_id}
                    className="card"
                    style={{
                      padding: 'var(--space-4)',
                      backgroundColor: 'var(--color-bg-secondary)',
                      border: '2px solid var(--color-border)',
                      position: 'relative'
                    }}
                  >
                    {/* Rank Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '-12px',
                      left: 'var(--space-4)',
                      backgroundColor: index === 0 ? 'var(--color-warning)' : 'var(--color-bg-card)',
                      color: index === 0 ? '#000' : 'var(--color-text-primary)',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-bold)',
                      border: '2px solid var(--color-border)'
                    }}>
                      #{index + 1}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 'var(--space-4)', alignItems: 'center', marginTop: 'var(--space-2)' }}>
                      {/* Closer Info */}
                      <div>
                        <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-1)' }}>
                          {payout.closer_name}
                        </div>
                        <div className="text-small text-muted">
                          {payout.sales_count} {payout.sales_count === 1 ? 'sale' : 'sales'} • Default rate: {payout.default_rate}%
                        </div>
                      </div>

                      {/* Cash Collected */}
                      <div>
                        <div className="text-small text-muted">Cash Collected</div>
                        <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-accent)' }}>
                          {formatCurrency(payout.total_cash_collected)}
                        </div>
                      </div>

                      {/* Commission Owed */}
                      <div>
                        <div className="text-small text-muted">Commission Owed</div>
                        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-warning)' }}>
                          {formatCurrency(payout.total_commission)}
                        </div>
                      </div>

                      {/* Breakdown */}
                      <div>
                        <div className="text-small text-muted">Breakdown</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                          {Object.keys(payout.platform_breakdown).length > 0 && (
                            <div style={{ marginBottom: 'var(--space-1)' }}>
                              <strong>Platform:</strong>
                              {Object.entries(payout.platform_breakdown).map(([platform, amount]) => (
                                <div key={platform}>{platform}: {formatCurrency(amount)}</div>
                              ))}
                            </div>
                          )}
                          {Object.keys(payout.payment_breakdown).length > 0 && (
                            <div>
                              <strong>Payment:</strong>
                              {Object.entries(payout.payment_breakdown).map(([method, amount]) => (
                                <div key={method}>{method}: {formatCurrency(amount)}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
