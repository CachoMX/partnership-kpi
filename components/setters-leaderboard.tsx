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

interface Setter {
  id: string
  name: string
  total_calls_booked: number
  total_shows: number
  total_closes: number
  show_rate: number
  close_rate: number
  total_revenue_generated: number
}

interface SettersLeaderboardProps {
  setters: Setter[]
}

export function SettersLeaderboard({ setters }: SettersLeaderboardProps) {
  // Sort by total revenue generated
  const sortedSetters = [...setters].sort((a, b) => b.total_revenue_generated - a.total_revenue_generated)

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white">Setters Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-gray-700">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700 hover:bg-gray-800/50">
                <TableHead className="text-gray-400 font-semibold">#</TableHead>
                <TableHead className="text-gray-400 font-semibold">Setter</TableHead>
                <TableHead className="text-gray-400 font-semibold text-right">Booked</TableHead>
                <TableHead className="text-gray-400 font-semibold text-right">Shows</TableHead>
                <TableHead className="text-gray-400 font-semibold text-right">Show Rate</TableHead>
                <TableHead className="text-gray-400 font-semibold text-right">Closes</TableHead>
                <TableHead className="text-gray-400 font-semibold text-right">Close Rate</TableHead>
                <TableHead className="text-gray-400 font-semibold text-right">Revenue Gen.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSetters.map((setter, index) => (
                <TableRow key={setter.id} className="border-gray-700 hover:bg-gray-800/50">
                  <TableCell className="font-medium text-gray-300">{index + 1}.</TableCell>
                  <TableCell className="font-medium text-white">{setter.name}</TableCell>
                  <TableCell className="text-right text-white">{setter.total_calls_booked}</TableCell>
                  <TableCell className="text-right text-white">{setter.total_shows}</TableCell>
                  <TableCell className="text-right text-white">
                    {setter.show_rate.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right text-white">{setter.total_closes}</TableCell>
                  <TableCell className="text-right text-white">
                    {setter.close_rate.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right font-semibold text-white">
                    ${setter.total_revenue_generated.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </TableCell>
                </TableRow>
              ))}
              {sortedSetters.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-400 py-8">
                    No setters data available
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
