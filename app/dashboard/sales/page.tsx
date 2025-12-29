"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw, DollarSign, Filter, ChevronDown, ChevronRight, ExternalLink } from "lucide-react"
import { DateRangeFilter } from "@/components/date-range-filter"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface Call {
  id: string
  timestamp: string | null
  booking_date: string | null
  lead_name: string | null
  lead_email: string | null
  lead_phone: string | null
  result: string | null
  revenue: number
  cash_collected: number
  cash_collected_2: number
  closer_id: string | null
  closer_name: string
  setter_id: string | null
  setter_name: string | null
  notes: string | null
  call_recording_link: string | null
  lead_source: string | null
  medium: string | null
  campaign: string | null
  offer_made: boolean
}

interface Closer {
  id: string
  name: string
  commission_rate: number
}

interface Setter {
  id: string
  name: string
}

export default function SalesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [calls, setCalls] = useState<Call[]>([])
  const [closers, setClosers] = useState<Closer[]>([])
  const [setters, setSetters] = useState<Setter[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [filterCloserId, setFilterCloserId] = useState('')
  const [filterSetterId, setFilterSetterId] = useState('')
  const [filterResult, setFilterResult] = useState('Closed')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState<number | null>(null)
  const [isLimited, setIsLimited] = useState(false)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const resultOptions = ['Closed', 'Follow-Up Scheduled', 'No Show', 'DQ', 'Reschedule', 'Other']

  const fetchData = async (fromDate?: string, toDate?: string, loadAll?: boolean) => {
    const from = fromDate ?? dateFrom
    const to = toDate ?? dateTo

    setLoading(true)
    try {
      // Build query params
      const params = new URLSearchParams()
      if (from) params.append('dateFrom', from)
      if (to) params.append('dateTo', to)
      if (filterCloserId) params.append('closerId', filterCloserId)
      if (filterSetterId) params.append('setterId', filterSetterId)
      if (filterResult) {
        params.append('result', filterResult)
        setIsLimited(false)
      } else if (!loadAll) {
        params.append('limit', '1000')
        setIsLimited(true)
      } else {
        setIsLimited(false)
      }
      const queryString = params.toString() ? `?${params.toString()}` : ''

      const [salesRes, closersRes, settersRes] = await Promise.all([
        fetch(`/api/sales${queryString}`),
        fetch('/api/closers'),
        fetch('/api/setters')
      ])

      if (!salesRes.ok) throw new Error('Failed to fetch sales')

      const salesData = await salesRes.json()
      const closersData = await closersRes.json()
      const settersData = await settersRes.json()

      setCalls(salesData.data || [])
      setTotalCount(salesData.totalCount || null)
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
      router.push('/dashboard')
    } else if (!authLoading && user && user.role === 'admin') {
      fetchData()
    }
  }, [user, authLoading, router])

  // Refetch when filters change
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchData()
    }
  }, [filterCloserId, filterSetterId, filterResult])

  const handleUpdateAssignment = async (
    callId: string,
    type: 'closer' | 'setter',
    id: string | null,
    name: string | null
  ) => {
    setUpdatingId(callId)
    try {
      const payload: any = { callId }
      if (type === 'closer') {
        payload.closerId = id
        payload.closerName = name
      } else {
        payload.setterId = id
        payload.setterName = name
      }

      const res = await fetch('/api/sales/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update')
      }

      // Update local state
      setCalls(prev => prev.map(call => {
        if (call.id === callId) {
          if (type === 'closer') {
            return { ...call, closer_id: id, closer_name: name || '' }
          } else {
            return { ...call, setter_id: id, setter_name: name }
          }
        }
        return call
      }))

      toast.success(`${type === 'closer' ? 'Closer' : 'Setter'} updated`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update')
    } finally {
      setUpdatingId(null)
    }
  }

  const formatDate = (timestamp: string | null) => {
    if (!timestamp) return '-'
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
  }

  // Create a map of closer commission rates
  const closerCommissionRates = closers.reduce((acc, c) => {
    acc[c.id] = c.commission_rate || 0
    return acc
  }, {} as Record<string, number>)

  // Calculate commission for a call (rate is stored as percentage, e.g. 10 = 10%)
  const getCommission = (call: Call) => {
    if (!call.closer_id) return 0
    const rate = closerCommissionRates[call.closer_id] || 0
    const cash = (call.cash_collected || 0) + (call.cash_collected_2 || 0)
    return cash * (rate / 100)
  }

  // Calculate totals
  const totals = calls.reduce((acc, call) => ({
    revenue: acc.revenue + (call.revenue || 0),
    cash: acc.cash + (call.cash_collected || 0) + (call.cash_collected_2 || 0),
    commission: acc.commission + getCommission(call)
  }), { revenue: 0, cash: 0, commission: 0 })

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-accent)' }}></div>
          <div style={{ color: 'var(--color-text-primary)' }} className="text-lg">Loading sales...</div>
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
              <Link href="/dashboard">
                <Button className="btn btn-secondary" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <div className="badge-live">
                <span>SALES</span>
              </div>
              <div>
                <h1 className="text-h1" style={{ marginBottom: 'var(--space-1)' }}>
                  Commission Tracking
                </h1>
                <p className="text-small" style={{ color: 'var(--color-text-muted)' }}>
                  Manage closer & setter assignments
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

      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: 'var(--space-6)' }}>
        {/* Filters Section */}
        <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', flexWrap: 'wrap', alignItems: 'center' }}>
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

          {/* Closer Filter */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            backgroundColor: 'var(--color-bg-card)',
            padding: 'var(--space-3)',
            borderRadius: '8px',
            border: '1px solid var(--color-border)'
          }}>
            <Filter className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            <select
              value={filterCloserId}
              onChange={(e) => setFilterCloserId(e.target.value)}
              style={{
                backgroundColor: 'var(--color-bg-card)',
                color: 'var(--color-text-primary)',
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                fontSize: 'var(--text-sm)'
              }}
            >
              <option value="" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}>All Closers</option>
              {closers.map(c => (
                <option key={c.id} value={c.id} style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Setter Filter */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            backgroundColor: 'var(--color-bg-card)',
            padding: 'var(--space-3)',
            borderRadius: '8px',
            border: '1px solid var(--color-border)'
          }}>
            <Filter className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            <select
              value={filterSetterId}
              onChange={(e) => setFilterSetterId(e.target.value)}
              style={{
                backgroundColor: 'var(--color-bg-card)',
                color: 'var(--color-text-primary)',
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                fontSize: 'var(--text-sm)'
              }}
            >
              <option value="" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}>All Setters</option>
              {setters.map(s => (
                <option key={s.id} value={s.id} style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Result Filter */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            backgroundColor: 'var(--color-bg-card)',
            padding: 'var(--space-3)',
            borderRadius: '8px',
            border: '1px solid var(--color-border)'
          }}>
            <Filter className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            <select
              value={filterResult}
              onChange={(e) => setFilterResult(e.target.value)}
              style={{
                backgroundColor: 'var(--color-bg-card)',
                color: 'var(--color-text-primary)',
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                fontSize: 'var(--text-sm)'
              }}
            >
              <option value="" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}>All Results</option>
              {resultOptions.map(r => (
                <option key={r} value={r} style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}>{r}</option>
              ))}
            </select>
          </div>

          {/* Totals */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-4)' }}>
            <div className="card-report" style={{ padding: 'var(--space-3) var(--space-4)', minWidth: 'auto' }}>
              <div className="text-small text-muted">Total Revenue</div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-accent)' }}>
                {formatCurrency(totals.revenue)}
              </div>
            </div>
            <div className="card-report" style={{ padding: 'var(--space-3) var(--space-4)', minWidth: 'auto' }}>
              <div className="text-small text-muted">Total Cash</div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-accent)' }}>
                {formatCurrency(totals.cash)}
              </div>
            </div>
            <div className="card-report" style={{ padding: 'var(--space-3) var(--space-4)', minWidth: 'auto' }}>
              <div className="text-small text-muted">Total Commission</div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-warning)' }}>
                {formatCurrency(totals.commission)}
              </div>
            </div>
            <div className="card-report" style={{ padding: 'var(--space-3) var(--space-4)', minWidth: 'auto' }}>
              <div className="text-small text-muted">Calls</div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-primary)' }}>
                {isLimited && totalCount && totalCount > calls.length ? (
                  <span>{calls.length.toLocaleString()} <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>of {totalCount.toLocaleString()}</span></span>
                ) : (
                  calls.length.toLocaleString()
                )}
              </div>
              {isLimited && totalCount && totalCount > calls.length && (
                <button
                  onClick={() => {
                    if (confirm(`This will load ${totalCount.toLocaleString()} calls. This may take a moment. Continue?`)) {
                      fetchData(dateFrom, dateTo, true)
                    }
                  }}
                  style={{
                    marginTop: 'var(--space-2)',
                    padding: '4px 8px',
                    fontSize: 'var(--text-xs)',
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '4px',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  Load All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sales Table */}
        <div className="card">
          <div className="table-wrapper" style={{ maxHeight: 'calc(100vh - 320px)', overflowY: 'auto' }}>
            <table className="table">
              <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--color-bg-card)', zIndex: 1 }}>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>Date</th>
                  <th>Lead</th>
                  <th>Result</th>
                  <th style={{ textAlign: 'right' }}>Revenue</th>
                  <th style={{ textAlign: 'right' }}>Cash</th>
                  <th style={{ textAlign: 'right' }}>Comm %</th>
                  <th style={{ textAlign: 'right' }}>Commission</th>
                  <th>Closer</th>
                  <th>Setter</th>
                </tr>
              </thead>
              <tbody>
                {calls.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>
                      No sales found for the selected filters
                    </td>
                  </tr>
                ) : (
                  calls.map((call) => {
                    const commRate = call.closer_id ? (closerCommissionRates[call.closer_id] || 0) : 0
                    const isExpanded = expandedRow === call.id
                    return (
                      <>
                        <tr key={call.id} style={{ opacity: updatingId === call.id ? 0.5 : 1 }}>
                          <td>
                            <button
                              onClick={() => setExpandedRow(isExpanded ? null : call.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                color: 'var(--color-text-primary)',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }}>{formatDate(call.booking_date)}</td>
                          <td>
                            <div style={{ fontWeight: 'var(--font-medium)' }}>{call.lead_name || '-'}</div>
                            {call.lead_email && (
                              <div className="text-small text-muted">{call.lead_email}</div>
                            )}
                          </td>
                          <td>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: 'var(--text-xs)',
                              fontWeight: 'var(--font-medium)',
                              backgroundColor: call.result === 'Closed'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : call.result === 'No Show'
                                  ? 'rgba(239, 68, 68, 0.15)'
                                  : 'rgba(59, 130, 246, 0.15)',
                              color: call.result === 'Closed'
                                ? '#10b981'
                                : call.result === 'No Show'
                                  ? '#ef4444'
                                  : '#3b82f6'
                            }}>
                              {call.result || '-'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 'var(--font-medium)' }}>
                            {formatCurrency(call.revenue || 0)}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 'var(--font-bold)', color: 'var(--color-accent)' }}>
                            {formatCurrency((call.cash_collected || 0) + (call.cash_collected_2 || 0))}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 'var(--font-medium)', color: 'var(--color-text-muted)' }}>
                            {commRate > 0 ? `${commRate}%` : '-'}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 'var(--font-medium)', color: 'var(--color-warning)' }}>
                            {formatCurrency(getCommission(call))}
                          </td>
                          <td>
                            <select
                              value={call.closer_id || ''}
                              onChange={(e) => {
                                const selectedCloser = closers.find(c => c.id === e.target.value)
                                handleUpdateAssignment(
                                  call.id,
                                  'closer',
                                  e.target.value || null,
                                  selectedCloser?.name || null
                                )
                              }}
                              disabled={updatingId === call.id}
                              style={{
                                backgroundColor: 'var(--color-bg-secondary)',
                                color: 'var(--color-text-primary)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: 'var(--text-sm)',
                                cursor: 'pointer',
                                minWidth: '120px'
                              }}
                            >
                              <option value="" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}>-- None --</option>
                              {closers.map(c => (
                                <option key={c.id} value={c.id} style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}>{c.name}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <select
                              value={call.setter_id || ''}
                              onChange={(e) => {
                                const selectedSetter = setters.find(s => s.id === e.target.value)
                                handleUpdateAssignment(
                                  call.id,
                                  'setter',
                                  e.target.value || null,
                                  selectedSetter?.name || null
                                )
                              }}
                              disabled={updatingId === call.id}
                              style={{
                                backgroundColor: 'var(--color-bg-secondary)',
                                color: 'var(--color-text-primary)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: 'var(--text-sm)',
                                cursor: 'pointer',
                                minWidth: '120px'
                              }}
                            >
                              <option value="" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}>-- None --</option>
                              {setters.map(s => (
                                <option key={s.id} value={s.id} style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}>{s.name}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${call.id}-details`}>
                            <td colSpan={10} style={{ padding: 0 }}>
                              <div style={{
                                backgroundColor: 'var(--color-bg-secondary)',
                                padding: 'var(--space-4)',
                                borderTop: '1px solid var(--color-border)',
                                borderBottom: '1px solid var(--color-border)'
                              }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                  {/* Contact Info */}
                                  <div>
                                    <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)', color: 'var(--color-text-primary)' }}>
                                      📞 Contact Details
                                    </h4>
                                    <div className="text-small" style={{ color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
                                      {call.lead_phone && <div><strong>Phone:</strong> {call.lead_phone}</div>}
                                      {call.lead_email && <div><strong>Email:</strong> {call.lead_email}</div>}
                                      {!call.lead_phone && !call.lead_email && <div>No contact details</div>}
                                    </div>
                                  </div>

                                  {/* Marketing Info */}
                                  <div>
                                    <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)', color: 'var(--color-text-primary)' }}>
                                      📊 Lead Source
                                    </h4>
                                    <div className="text-small" style={{ color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
                                      {call.lead_source && <div><strong>Source:</strong> {call.lead_source}</div>}
                                      {call.medium && <div><strong>Medium:</strong> {call.medium}</div>}
                                      {call.campaign && <div><strong>Campaign:</strong> {call.campaign}</div>}
                                      {!call.lead_source && !call.medium && !call.campaign && <div>No lead source data</div>}
                                    </div>
                                  </div>

                                  {/* Call Details */}
                                  <div>
                                    <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)', color: 'var(--color-text-primary)' }}>
                                      💰 Financial Details
                                    </h4>
                                    <div className="text-small" style={{ color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
                                      <div><strong>Revenue:</strong> {formatCurrency(call.revenue)}</div>
                                      <div><strong>Cash Collected (1):</strong> {formatCurrency(call.cash_collected)}</div>
                                      <div><strong>Cash Collected (2):</strong> {formatCurrency(call.cash_collected_2)}</div>
                                      <div><strong>Offer Made:</strong> {call.offer_made ? 'Yes' : 'No'}</div>
                                    </div>
                                  </div>

                                  {/* Recording Link */}
                                  <div>
                                    <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)', color: 'var(--color-text-primary)' }}>
                                      🎙️ Call Recording
                                    </h4>
                                    {call.call_recording_link ? (
                                      <a
                                        href={call.call_recording_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: 'var(--space-1)',
                                          color: 'var(--color-accent)',
                                          textDecoration: 'none',
                                          fontSize: 'var(--text-sm)',
                                          fontWeight: 'var(--font-medium)'
                                        }}
                                      >
                                        View Recording <ExternalLink className="w-3 h-3" />
                                      </a>
                                    ) : (
                                      <div className="text-small" style={{ color: 'var(--color-text-muted)' }}>No recording available</div>
                                    )}
                                  </div>
                                </div>

                                {/* Notes */}
                                {call.notes && (
                                  <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
                                    <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)', color: 'var(--color-text-primary)' }}>
                                      📝 Notes
                                    </h4>
                                    <div className="text-small" style={{ color: 'var(--color-text-muted)', whiteSpace: 'pre-wrap' }}>
                                      {call.notes}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
