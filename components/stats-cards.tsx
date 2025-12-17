import { Card } from "@/components/ui/card"
import { Users, DollarSign, Handshake, ArrowRightLeft, Percent } from "lucide-react"

type StatsCardsProps = {
  totalPartners: number
  totalPayoutsDue: number
  totalDealsClosed: number
  totalIntrosMade: number
  totalCommissions: number
  deals: any[] // Add deals parameter to calculate recurring payouts
}

export function StatsCards({
  totalPartners,
  totalPayoutsDue,
  totalDealsClosed,
  totalIntrosMade,
  totalCommissions,
  deals,
}: StatsCardsProps) {
  const recurringPayouts =
    deals
      ?.filter(
        (deal) =>
          deal.status === "Won" && deal.commissionType === "Recurring" && deal.affiliatePaidStatus !== "Affiliate Paid",
      )
      .reduce((total, deal) => {
        const closeDate = new Date(deal.closeDate)
        const today = new Date()
        const monthsElapsed = Math.max(
          0,
          (today.getFullYear() - closeDate.getFullYear()) * 12 + (today.getMonth() - closeDate.getMonth()),
        )
        const commissionValue = Number.parseFloat(deal.commissionTier.replace(/[^0-9.-]+/g, ""))
        return total + commissionValue * (monthsElapsed + 1)
      }, 0) || 0

  const stats = [
    {
      title: "Total Partners",
      value: totalPartners,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Intros Made",
      value: totalIntrosMade,
      icon: ArrowRightLeft,
      color: "text-sky-600",
    },
    {
      title: "Total Commissions",
      value: `$${totalCommissions.toLocaleString()}`,
      icon: Percent,
      color: "text-indigo-600",
    },
    {
      title: "Payouts Due",
      value: `$${totalPayoutsDue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-amber-600",
    },
    {
      title: "Deals Closed",
      value: totalDealsClosed,
      icon: Handshake,
      color: "text-purple-600",
    },
    {
      title: "Recurring Payouts",
      value: `$${recurringPayouts.toLocaleString()}`, // Display calculated recurring payouts
      icon: DollarSign,
      color: "text-green-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
      {stats.map((stat) => (
        <Card key={stat.title} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
