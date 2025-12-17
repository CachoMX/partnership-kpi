"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Closer {
  id: string
  name: string
  closed_deals: number
  total_revenue: number
  total_cash_collected: number
  live_calls: number
  total_calls: number
}

interface ClosersLeaderboardProps {
  closers: Closer[]
}

export function ClosersLeaderboard({ closers }: ClosersLeaderboardProps) {
  // Calculate AOV and sort by cash collected
  const closersWithStats = closers.map(closer => {
    const aov = closer.closed_deals > 0
      ? closer.total_revenue / closer.closed_deals
      : 0

    const closeRate = closer.live_calls > 0
      ? (closer.closed_deals / closer.live_calls) * 100
      : 0

    return {
      ...closer,
      aov,
      closeRate
    }
  }).sort((a, b) => b.total_cash_collected - a.total_cash_collected)

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white">Closers Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-gray-700">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700 hover:bg-gray-800/50">
                <TableHead className="text-gray-400 font-semibold">#</TableHead>
                <TableHead className="text-gray-400 font-semibold">Closer</TableHead>
                <TableHead className="text-gray-400 font-semibold text-right">Closed</TableHead>
                <TableHead className="text-gray-400 font-semibold text-right">AOV</TableHead>
                <TableHead className="text-gray-400 font-semibold text-right">Rev</TableHead>
                <TableHead className="text-gray-400 font-semibold text-right">Cash Collected</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {closersWithStats.map((closer, index) => (
                <TableRow key={closer.id} className="border-gray-700 hover:bg-gray-800/50">
                  <TableCell className="font-medium text-gray-300">{index + 1}.</TableCell>
                  <TableCell className="font-medium text-white">{closer.name}</TableCell>
                  <TableCell className="text-right text-white">{closer.closed_deals}</TableCell>
                  <TableCell className="text-right text-white">
                    ${closer.aov.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell className="text-right text-white">
                    ${closer.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-white">
                    ${closer.total_cash_collected.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </TableCell>
                </TableRow>
              ))}
              {closersWithStats.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                    No closers data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
