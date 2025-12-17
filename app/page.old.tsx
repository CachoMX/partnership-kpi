"use client"

import { useState } from "react"
import { PartnersTable } from "@/components/partners-table"
import { DealsTable } from "@/components/deals-table"
import { AddPartnerDialog } from "@/components/add-partner-dialog"
import { AddDealDialog } from "@/components/add-deal-dialog"
import { StatsCards } from "@/components/stats-cards"
import { CommissionChart } from "@/components/commission-chart"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import { EmailManagement } from "@/components/email-management"
import { EmailNotificationSettings } from "@/components/email-notification-settings"

export type CommissionTier = {
  id: string
  name: string
  rate: number // percentage (0-100)
}

export type Partner = {
  id: string
  name: string
  mainContact: string
  email: string // Added email field for partner communications
  supportAreas: string[]
  website: string
  locations: string[]
  introsReceived: number
  introsMade: number
  payoutsDue: number
  dealsClosed: number
  affiliates: string[]
  lastFollowUp: string
  nextSteps: string
  status: "active" | "pending" | "inactive"
  commissionRate: number // deprecated - keeping for backwards compatibility
  commissionTiers: CommissionTier[]
}

export type Deal = {
  id: string
  dealName: string
  partnerId: string
  partnerName: string
  dealValue: number
  status: "intro-made" | "pitch-made" | "call-booked" | "needs-followup" | "won" | "affiliate-paid" | "lost"
  direction: "outbound" | "inbound"
  closeDate: string
  notes: string
  createdDate: string
  lastUpdated: string
  commissionTierId?: string
  referralName?: string // For "intro-made" status
  callDate?: string // For "call-booked" status
  followUpNotes?: string // For "needs-followup" status
  pitchDate?: string // For "pitch-made" status
  affiliatePaymentDate?: string // Added payment tracking fields for affiliate-paid status
  affiliatePaymentMethod?: string
  affiliatePaymentAmount?: number
  affiliatePaymentReference?: string
  affiliatePaymentNotes?: string
}

const initialPartners: Partner[] = [
  {
    id: "1",
    name: "Hyros",
    mainContact: "Chase Barmore",
    email: "chase@hyros.com",
    supportAreas: ["Attribution Tracking"],
    website: "",
    locations: [],
    introsReceived: 0,
    introsMade: 0,
    payoutsDue: 0,
    dealsClosed: 0,
    affiliates: ["Sam Laydon (Whop)", "Alec Friel", "Jeremy Epperson"],
    lastFollowUp: "2024-11-01",
    nextSteps: "Follow up on Q4 attribution needs",
    status: "active",
    commissionRate: 20,
    commissionTiers: [
      { id: "1-1", name: "Standard", rate: 20 },
      { id: "1-2", name: "Enterprise", rate: 25 },
      { id: "1-3", name: "Premium", rate: 30 },
    ],
  },
  {
    id: "2",
    name: "Whop",
    mainContact: "Sam Laydon",
    email: "sam@whop.com",
    supportAreas: ["Payment Processing"],
    website: "https://whop.com/",
    locations: [],
    introsReceived: 0,
    introsMade: 0,
    payoutsDue: 0,
    dealsClosed: 0,
    affiliates: ["Dave Goodall", "Alpha Dog", "Profit Labs"],
    lastFollowUp: "2024-11-01",
    nextSteps: "Schedule integration demo",
    status: "active",
    commissionRate: 15,
    commissionTiers: [
      { id: "2-1", name: "Basic", rate: 10 },
      { id: "2-2", name: "Standard", rate: 15 },
      { id: "2-3", name: "Pro", rate: 20 },
    ],
  },
  {
    id: "3",
    name: "Tax Saving Experts",
    mainContact: "Alec Friel",
    email: "alec@taxsavingexperts.com",
    supportAreas: ["Tax and Finance"],
    website: "",
    locations: [],
    introsReceived: 0,
    introsMade: 0,
    payoutsDue: 0,
    dealsClosed: 0,
    affiliates: ["LMG Recruiting", "Aaron Leszczynski"],
    lastFollowUp: "2024-10-28",
    nextSteps: "Connect with high-income founders",
    status: "active",
    commissionRate: 25,
    commissionTiers: [
      { id: "3-1", name: "Individual", rate: 20 },
      { id: "3-2", name: "Business", rate: 25 },
      { id: "3-3", name: "VIP", rate: 30 },
    ],
  },
  {
    id: "4",
    name: "Marketing Max",
    mainContact: "Max B",
    email: "max@marketingmax.com",
    supportAreas: ["Marketing Funnels", "Infrastructure Development and builds"],
    website: "https://www.marketingmax.com/",
    locations: [],
    introsReceived: 1,
    introsMade: 0,
    payoutsDue: 0,
    dealsClosed: 0,
    affiliates: ["Eli Rubel", "YourTango", "Business of Senior Care", "David Goodall"],
    lastFollowUp: "2024-11-05",
    nextSteps: "Intro to Brandon Parker",
    status: "active",
    commissionRate: 10,
    commissionTiers: [
      { id: "4-1", name: "10% Lifetime", rate: 10 },
      { id: "4-2", name: "40% First Month", rate: 40 },
    ],
  },
  {
    id: "5",
    name: "Simple Check",
    mainContact: "Hunter Hensley",
    email: "hunter@simplecheck.com",
    supportAreas: ["SaaS"],
    website: "https://www.simplecheck.com/smartform",
    locations: ["Atlanta"],
    introsReceived: 0,
    introsMade: 0,
    payoutsDue: 0,
    dealsClosed: 0,
    affiliates: ["8F Community", "Joe Johnston", "Zach Gatlin"],
    lastFollowUp: "2024-11-03",
    nextSteps: "Schedule product walkthrough",
    status: "active",
    commissionRate: 18,
    commissionTiers: [
      { id: "5-1", name: "Starter", rate: 15 },
      { id: "5-2", name: "Growth", rate: 18 },
      { id: "5-3", name: "Scale", rate: 22 },
    ],
  },
]

const initialDeals: Deal[] = []

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>(initialPartners)
  const [deals, setDeals] = useState<Deal[]>(initialDeals)
  const [isAddPartnerDialogOpen, setIsAddPartnerDialogOpen] = useState(false)
  const [isAddDealDialogOpen, setIsAddDealDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("partners")

  const handleAddPartner = (partner: Omit<Partner, "id">) => {
    const newPartner = {
      ...partner,
      id: Date.now().toString(),
    }
    setPartners([...partners, newPartner])
    setIsAddPartnerDialogOpen(false)
  }

  const handleUpdatePartner = (updatedPartner: Partner) => {
    setPartners(partners.map((p) => (p.id === updatedPartner.id ? updatedPartner : p)))
  }

  const handleDeletePartner = (id: string) => {
    setPartners(partners.filter((p) => p.id !== id))
  }

  const handleAddDeal = (deal: Omit<Deal, "id" | "createdDate" | "lastUpdated">) => {
    const now = new Date().toISOString().split("T")[0]
    const newDeal = {
      ...deal,
      id: Date.now().toString(),
      createdDate: now,
      lastUpdated: now,
    }
    setDeals([...deals, newDeal])
    setIsAddDealDialogOpen(false)
  }

  const handleUpdateDeal = (updatedDeal: Deal) => {
    const dealWithTimestamp = {
      ...updatedDeal,
      lastUpdated: new Date().toISOString().split("T")[0],
    }
    setDeals(deals.map((d) => (d.id === dealWithTimestamp.id ? dealWithTimestamp : d)))
  }

  const handleDeleteDeal = (id: string) => {
    setDeals(deals.filter((d) => d.id !== id))
  }

  const totalPayoutsDue = deals.reduce((sum, deal) => {
    if (deal.status === "won") {
      const partner = partners.find((p) => p.id === deal.partnerId)
      if (partner) {
        const tier = partner.commissionTiers.find((t) => t.id === deal.commissionTierId)
        const rate = tier?.rate || partner.commissionRate
        return sum + (deal.dealValue * rate) / 100
      }
    }
    return sum
  }, 0)

  const totalDealsClosed = deals.filter((deal) => deal.status === "won" && deal.direction === "outbound").length

  const totalIntrosMade = deals.filter((deal) => deal.direction === "outbound").length

  const totalCommissions = deals.reduce((sum, deal) => {
    const partner = partners.find((p) => p.id === deal.partnerId)
    if (partner && (deal.status === "won" || deal.status === "affiliate-paid")) {
      const tier = partner.commissionTiers.find((t) => t.id === deal.commissionTierId)
      const rate = tier?.rate || partner.commissionRate
      return sum + (deal.dealValue * rate) / 100
    }
    return sum
  }, 0)

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Partnership Portal</h1>
            <p className="text-muted-foreground text-lg">Track partners, deals, payouts, and follow-ups in one place</p>
          </div>
        </div>

        <StatsCards
          totalPartners={partners.length}
          totalPayoutsDue={totalPayoutsDue}
          totalDealsClosed={totalDealsClosed}
          totalIntrosMade={totalIntrosMade}
          totalCommissions={totalCommissions}
        />

        <CommissionChart deals={deals} partners={partners} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="partners">Partners</TabsTrigger>
              <TabsTrigger value="deals">Deals</TabsTrigger>
              <TabsTrigger value="emails">Emails</TabsTrigger> // Added email tab for managing partner communications
            </TabsList>
            <Button
              onClick={() =>
                activeTab === "partners" ? setIsAddPartnerDialogOpen(true) : setIsAddDealDialogOpen(true)
              }
              size="lg"
              className="gap-2"
            >
              <Plus className="w-5 h-5" />
              {activeTab === "partners" ? "Add Partner" : "Add Deal"}
            </Button>
          </div>

          <TabsContent value="partners">
            <PartnersTable
              partners={partners}
              deals={deals}
              onUpdate={handleUpdatePartner}
              onDelete={handleDeletePartner}
            />
          </TabsContent>

          <TabsContent value="deals">
            <DealsTable deals={deals} partners={partners} onUpdate={handleUpdateDeal} onDelete={handleDeleteDeal} />
          </TabsContent>

          <TabsContent value="emails">
            <div className="space-y-6">
              <EmailManagement partners={partners} deals={deals} />
              <EmailNotificationSettings />
            </div>
          </TabsContent>
        </Tabs>

        <AddPartnerDialog
          open={isAddPartnerDialogOpen}
          onOpenChange={setIsAddPartnerDialogOpen}
          onAdd={handleAddPartner}
        />

        <AddDealDialog
          open={isAddDealDialogOpen}
          onOpenChange={setIsAddDealDialogOpen}
          onAdd={handleAddDeal}
          partners={partners}
        />
      </div>
    </main>
  )
}
