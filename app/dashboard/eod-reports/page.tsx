"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw, Calendar, User, TrendingUp } from "lucide-react"
import { DateRangeFilter } from "@/components/date-range-filter"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface EODReport {
  id: string
  date: string
  user_id: string
  user_name: string
  user_role: string
  calls_made: number
  appointments_set: number
  shows_expected: number
  follow_ups_scheduled: number
  wins: string
  challenges: string
  tomorrow_goals: string
  notes: string
  timestamp: string
  created_at: string
}

export default function EODReportsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState<EODReport[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const fetchReports = async (fromDate?: string, toDate?: string) => {
    const from = fromDate ?? dateFrom
    const to = toDate ?? dateTo

    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (from) params.append('dateFrom', from)
      if (to) params.append('dateTo', to)
      const queryString = params.toString() ? `?${params.toString()}` : ''

      const response = await fetch(`/api/eod${queryString}`)
      if (!response.ok) throw new Error('Failed to fetch EOD reports')

      const data = await response.json()
      setReports(data.data || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to load EOD reports')
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
      fetchReports()
    }
  }, [user, authLoading, router])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Calculate aggregate stats
  const stats = reports.reduce((acc, report) => ({
    total_calls: acc.total_calls + (report.calls_made || 0),
    total_appointments: acc.total_appointments + (report.appointments_set || 0),
    total_shows_expected: acc.total_shows_expected + (report.shows_expected || 0),
    total_follow_ups: acc.total_follow_ups + (report.follow_ups_scheduled || 0),
  }), { total_calls: 0, total_appointments: 0, total_shows_expected: 0, total_follow_ups: 0 })

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-accent)' }}></div>
          <div style={{ color: 'var(--color-text-primary)' }} className="text-lg">Loading EOD reports...</div>
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
                <span>EOD REPORTS</span>
              </div>
              <div>
                <h1 className="text-h1" style={{ marginBottom: 'var(--space-1)' }}>
                  End of Day Reports
                </h1>
                <p className="text-small" style={{ color: 'var(--color-text-muted)' }}>
                  Team daily performance summaries
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => fetchReports()}
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
            onApply={(from, to) => fetchReports(from, to)}
          />

          {/* Stats Summary */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-4)' }}>
            <div className="card-report" style={{ padding: 'var(--space-3) var(--space-4)', minWidth: 'auto' }}>
              <div className="text-small text-muted">Total Calls</div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-accent)' }}>
                {stats.total_calls}
              </div>
            </div>
            <div className="card-report" style={{ padding: 'var(--space-3) var(--space-4)', minWidth: 'auto' }}>
              <div className="text-small text-muted">Appointments</div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-accent)' }}>
                {stats.total_appointments}
              </div>
            </div>
            <div className="card-report" style={{ padding: 'var(--space-3) var(--space-4)', minWidth: 'auto' }}>
              <div className="text-small text-muted">Reports</div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-primary)' }}>
                {reports.length}
              </div>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="card">
          <div className="table-wrapper" style={{ maxHeight: 'calc(100vh - 320px)', overflowY: 'auto' }}>
            <table className="table">
              <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--color-bg-card)', zIndex: 1 }}>
                <tr>
                  <th>Date</th>
                  <th>Team Member</th>
                  <th>Role</th>
                  <th style={{ textAlign: 'center' }}>Calls</th>
                  <th style={{ textAlign: 'center' }}>Appointments</th>
                  <th style={{ textAlign: 'center' }}>Shows Expected</th>
                  <th style={{ textAlign: 'center' }}>Follow-ups</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>
                      No EOD reports found for the selected date range
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => {
                    const isExpanded = expandedRow === report.id
                    return (
                      <>
                        <tr key={report.id}>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                              {formatDate(report.date)}
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                              <span style={{ fontWeight: 'var(--font-medium)' }}>{report.user_name}</span>
                            </div>
                          </td>
                          <td>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: 'var(--text-xs)',
                              fontWeight: 'var(--font-medium)',
                              backgroundColor: report.user_role === 'closer'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : 'rgba(59, 130, 246, 0.15)',
                              color: report.user_role === 'closer' ? '#10b981' : '#3b82f6',
                              textTransform: 'capitalize'
                            }}>
                              {report.user_role}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 'var(--font-medium)' }}>
                            {report.calls_made}
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 'var(--font-medium)', color: 'var(--color-accent)' }}>
                            {report.appointments_set}
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 'var(--font-medium)' }}>
                            {report.shows_expected || '-'}
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 'var(--font-medium)' }}>
                            {report.follow_ups_scheduled || '-'}
                          </td>
                          <td>
                            <Button
                              onClick={() => setExpandedRow(isExpanded ? null : report.id)}
                              size="sm"
                              variant="outline"
                              className="btn btn-secondary"
                            >
                              {isExpanded ? 'Hide Details' : 'View Details'}
                            </Button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${report.id}-details`}>
                            <td colSpan={8} style={{ padding: 0 }}>
                              <div style={{
                                backgroundColor: 'var(--color-bg-secondary)',
                                padding: 'var(--space-4)',
                                borderTop: '1px solid var(--color-border)',
                                borderBottom: '1px solid var(--color-border)'
                              }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
                                  {/* Wins */}
                                  {report.wins && (
                                    <div>
                                      <h4 style={{
                                        fontSize: 'var(--text-sm)',
                                        fontWeight: 'var(--font-semibold)',
                                        marginBottom: 'var(--space-2)',
                                        color: 'var(--color-text-primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-1)'
                                      }}>
                                        🎉 Today's Wins
                                      </h4>
                                      <div className="text-small" style={{ color: 'var(--color-text-muted)', whiteSpace: 'pre-wrap' }}>
                                        {report.wins}
                                      </div>
                                    </div>
                                  )}

                                  {/* Challenges */}
                                  {report.challenges && (
                                    <div>
                                      <h4 style={{
                                        fontSize: 'var(--text-sm)',
                                        fontWeight: 'var(--font-semibold)',
                                        marginBottom: 'var(--space-2)',
                                        color: 'var(--color-text-primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-1)'
                                      }}>
                                        ⚠️ Challenges
                                      </h4>
                                      <div className="text-small" style={{ color: 'var(--color-text-muted)', whiteSpace: 'pre-wrap' }}>
                                        {report.challenges}
                                      </div>
                                    </div>
                                  )}

                                  {/* Tomorrow Goals */}
                                  {report.tomorrow_goals && (
                                    <div>
                                      <h4 style={{
                                        fontSize: 'var(--text-sm)',
                                        fontWeight: 'var(--font-semibold)',
                                        marginBottom: 'var(--space-2)',
                                        color: 'var(--color-text-primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-1)'
                                      }}>
                                        🎯 Tomorrow's Goals
                                      </h4>
                                      <div className="text-small" style={{ color: 'var(--color-text-muted)', whiteSpace: 'pre-wrap' }}>
                                        {report.tomorrow_goals}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Additional Notes */}
                                {report.notes && (
                                  <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
                                    <h4 style={{
                                      fontSize: 'var(--text-sm)',
                                      fontWeight: 'var(--font-semibold)',
                                      marginBottom: 'var(--space-2)',
                                      color: 'var(--color-text-primary)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 'var(--space-1)'
                                    }}>
                                      📝 Additional Notes
                                    </h4>
                                    <div className="text-small" style={{ color: 'var(--color-text-muted)', whiteSpace: 'pre-wrap' }}>
                                      {report.notes}
                                    </div>
                                  </div>
                                )}

                                {/* Timestamp */}
                                <div style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                                  Submitted: {new Date(report.timestamp).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                  })}
                                </div>
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
