"use client"

import type { Deal, Partner } from "@/app/page"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, DollarSign } from "lucide-react"

type CommissionChartProps = {
  deals: Deal[]
  partners: Partner[]
}

export function CommissionChart({ deals, partners }: CommissionChartProps) {
  // Calculate commissions by month
  const getCommission = (deal: Deal) => {
    const partner = partners.find((p) => p.id === deal.partnerId)
    if (!partner) return 0
    const tier = partner.commissionTiers.find((t) => t.id === deal.commissionTierId)
    const rate = tier?.rate || partner.commissionRate
    return (deal.dealValue * rate) / 100
  }

  const closedDeals = deals.filter((d) => d.status === "won")

  // Group by month
  const monthlyData = closedDeals.reduce(
    (acc, deal) => {
      const date = new Date(deal.closeDate)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const monthName = date.toLocaleDateString("en-US", { year: "numeric", month: "short" })
      const commission = getCommission(deal)

      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthName,
          monthKey,
          total: 0,
          deals: [],
          partnerBreakdown: {} as Record<string, { name: string; total: number }>,
        }
      }

      acc[monthKey].total += commission
      acc[monthKey].deals.push(deal)

      // Add to partner breakdown
      const partnerName = deal.partnerName
      if (!acc[monthKey].partnerBreakdown[partnerName]) {
        acc[monthKey].partnerBreakdown[partnerName] = { name: partnerName, total: 0 }
      }
      acc[monthKey].partnerBreakdown[partnerName].total += commission

      return acc
    },
    {} as Record<
      string,
      {
        month: string
        monthKey: string
        total: number
        deals: Deal[]
        partnerBreakdown: Record<string, { name: string; total: number }>
      }
    >,
  )

  // Sort by month
  const sortedMonths = Object.values(monthlyData).sort((a, b) => a.monthKey.localeCompare(b.monthKey))

  // Calculate month-over-month growth
  const getMonthOverMonthGrowth = (currentIndex: number) => {
    if (currentIndex === 0) return null
    const current = sortedMonths[currentIndex].total
    const previous = sortedMonths[currentIndex - 1].total
    if (previous === 0) return null
    return ((current - previous) / previous) * 100
  }

  const maxCommission = Math.max(...sortedMonths.map((m) => m.total), 1)

  if (closedDeals.length === 0) {
    return null
  }

  return (
    <Card className="p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-indigo-600" />
            Commission Tracking
          </h2>
          <p className="text-muted-foreground mt-1">Month-over-month commission breakdown by partner</p>
        </div>
      </div>

      <div className="space-y-6">
        {sortedMonths.map((monthData, index) => {
          const growth = getMonthOverMonthGrowth(index)
          const partnerBreakdownArray = Object.values(monthData.partnerBreakdown).sort((a, b) => b.total - a.total)

          return (
            <div key={monthData.monthKey} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-foreground">{monthData.month}</h3>
                  <Badge variant="secondary" className="font-mono">
                    ${monthData.total.toLocaleString()}
                  </Badge>
                  <span className="text-sm text-muted-foreground">({monthData.deals.length} deals)</span>
                  {growth !== null && (
                    <Badge
                      variant="outline"
                      className={growth >= 0 ? "text-green-600 border-green-200" : "text-red-600 border-red-200"}
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {growth >= 0 ? "+" : ""}
                      {growth.toFixed(1)}%
                    </Badge>
                  )}
                </div>
              </div>

              {/* Visual bar */}
              <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                <div
                  className="absolute h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
                  style={{ width: `${(monthData.total / maxCommission) * 100}%` }}
                />
              </div>

              {/* Partner breakdown */}
              <div className="flex flex-wrap gap-2 pl-4">
                {partnerBreakdownArray.map((partner) => (
                  <Badge key={partner.name} variant="outline" className="text-xs">
                    {partner.name}: ${partner.total.toLocaleString()}
                  </Badge>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {sortedMonths.length > 1 && (
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Average/Month</p>
              <p className="text-xl font-bold text-foreground">
                $
                {(sortedMonths.reduce((sum, m) => sum + m.total, 0) / sortedMonths.length).toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Best Month</p>
              <p className="text-xl font-bold text-green-600">
                ${Math.max(...sortedMonths.map((m) => m.total)).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Commissions</p>
              <p className="text-xl font-bold text-indigo-600">
                ${sortedMonths.reduce((sum, m) => sum + m.total, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
