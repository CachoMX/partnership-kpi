"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CloserStats {
  total_calls: number
  live_calls: number
  closed_deals: number
  offers_made: number
  no_shows: number
  total_revenue: number
  total_cash_collected: number
  total_commission: number
}

interface ClosersPerformanceDashboardProps {
  stats: CloserStats
}

export function ClosersPerformanceDashboard({ stats }: ClosersPerformanceDashboardProps) {
  const closeRate = stats.live_calls > 0
    ? ((stats.closed_deals / stats.live_calls) * 100).toFixed(2)
    : '0.00'

  const showRate = stats.total_calls > 0
    ? (100 - (stats.no_shows / stats.total_calls) * 100).toFixed(2)
    : '0.00'

  const aov = stats.closed_deals > 0
    ? (stats.total_revenue / stats.closed_deals).toFixed(2)
    : '0.00'

  const cashPerCall = stats.live_calls > 0
    ? (stats.total_cash_collected / stats.live_calls).toFixed(2)
    : '0.00'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-center mb-8">Closers Performance</h2>
      </div>

      {/* Top Row - Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Booked Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.total_calls.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Live Calls Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.live_calls.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Closed Deal Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.closed_deals.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">AOV</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">${aov}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Close rate %</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{closeRate}%</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Revenue Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${(stats.total_revenue / 1000000).toFixed(2)}M
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Offers Made</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.offers_made.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">No Shows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.no_shows.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Show rate %</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{showRate}%</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Cash collected per call</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{cashPerCall}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${stats.total_commission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Cash Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${(stats.total_cash_collected / 1000000).toFixed(2)}M
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
