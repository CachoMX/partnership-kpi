"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw } from "lucide-react"
import { ClosersPerformanceDashboard } from "@/components/closers-performance-dashboard"
import { ClosersLeaderboard } from "@/components/closers-leaderboard"
import { SettersLeaderboard } from "@/components/setters-leaderboard"
import { AddCallForm } from "@/components/add-call-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
  const [closers, setClosers] = useState<Closer[]>([])
  const [setters, setSetters] = useState<Setter[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddCallDialogOpen, setIsAddCallDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("performance")

  const fetchData = async () => {
    setLoading(true)
    try {
      const [closersRes, settersRes] = await Promise.all([
        fetch('/api/closers'),
        fetch('/api/setters')
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
    fetchData()
  }, [])

  // Calculate aggregate stats for the performance dashboard
  const aggregateStats = {
    total_calls: closers.reduce((sum, c) => sum + c.total_calls, 0),
    live_calls: closers.reduce((sum, c) => sum + c.live_calls, 0),
    closed_deals: closers.reduce((sum, c) => sum + c.closed_deals, 0),
    offers_made: closers.reduce((sum, c) => sum + c.offers_made, 0),
    no_shows: closers.reduce((sum, c) => sum + c.no_shows, 0),
    total_revenue: closers.reduce((sum, c) => sum + c.total_revenue, 0),
    total_cash_collected: closers.reduce((sum, c) => sum + c.total_cash_collected, 0),
    total_commission: closers.reduce((sum, c) => sum + c.total_commission, 0),
  }

  const handleCallAdded = () => {
    setIsAddCallDialogOpen(false)
    fetchData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Closers KPI Dashboard</h1>
            <p className="text-gray-400 text-lg">Track performance, deals, and leaderboards</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchData}
              variant="outline"
              size="lg"
              className="gap-2 bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </Button>
            <Dialog open={isAddCallDialogOpen} onOpenChange={setIsAddCallDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-5 h-5" />
                  Add Call
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Add New Call</DialogTitle>
                </DialogHeader>
                <AddCallForm
                  closers={closers}
                  setters={setters}
                  onSuccess={handleCallAdded}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 bg-gray-800 border-gray-700">
            <TabsTrigger value="performance" className="data-[state=active]:bg-gray-700 text-white">
              Performance
            </TabsTrigger>
            <TabsTrigger value="closers" className="data-[state=active]:bg-gray-700 text-white">
              Closers Leaderboard
            </TabsTrigger>
            <TabsTrigger value="setters" className="data-[state=active]:bg-gray-700 text-white">
              Setters Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <ClosersPerformanceDashboard stats={aggregateStats} />
          </TabsContent>

          <TabsContent value="closers" className="space-y-6">
            <ClosersLeaderboard closers={closers} />
          </TabsContent>

          <TabsContent value="setters" className="space-y-6">
            <SettersLeaderboard setters={setters} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
