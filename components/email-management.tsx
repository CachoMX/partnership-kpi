"use client"

import { useState } from "react"
import type { Partner, Deal } from "@/app/page"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Send, Copy } from "lucide-react"

type EmailManagementProps = {
  partners: Partner[]
  deals: Deal[]
}

export function EmailManagement({ partners, deals }: EmailManagementProps) {
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [emailContent, setEmailContent] = useState("")

  // Find partners with deals needing follow-up
  const partnersWithFollowUps = partners.filter((partner) => {
    return deals.some((deal) => deal.partnerId === partner.id && deal.status === "needs-followup")
  })

  const generateEmailTemplate = (partner: Partner) => {
    const partnerDeals = deals.filter((deal) => deal.partnerId === partner.id && deal.status === "needs-followup")

    const dealsText = partnerDeals
      .map(
        (deal, index) =>
          `${index + 1}. ${deal.dealName} - $${deal.dealValue.toLocaleString()}\n   Notes: ${deal.followUpNotes || "No notes available"}`,
      )
      .join("\n\n")

    return `Hi ${partner.mainContact},

I hope this email finds you well! I wanted to reach out for our monthly check-in regarding some prospects that need follow-up.

Here are the deals we're tracking:

${dealsText}

Could you provide an update on the status of these prospects? Any insights on next steps or if there's anything I can do to help move these forward would be greatly appreciated.

Looking forward to hearing from you!

Best regards`
  }

  const handleSelectPartner = (partner: Partner) => {
    setSelectedPartner(partner)
    setEmailContent(generateEmailTemplate(partner))
  }

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(emailContent)
  }

  const handleSendEmail = () => {
    if (selectedPartner) {
      const subject = encodeURIComponent("Monthly Partnership Check-in - Follow-up Needed")
      const body = encodeURIComponent(emailContent)
      window.open(`mailto:${selectedPartner.email}?subject=${subject}&body=${body}`)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Partners with Follow-ups</h2>
        <p className="text-muted-foreground mb-6">
          Partners with deals in "Needs Follow-Up" status that require check-ins
        </p>

        {partnersWithFollowUps.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No partners with follow-ups needed</p>
          </div>
        ) : (
          <div className="space-y-3">
            {partnersWithFollowUps.map((partner) => {
              const followUpCount = deals.filter(
                (deal) => deal.partnerId === partner.id && deal.status === "needs-followup",
              ).length

              return (
                <div
                  key={partner.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary ${
                    selectedPartner?.id === partner.id ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => handleSelectPartner(partner)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{partner.name}</h3>
                      <p className="text-sm text-muted-foreground">{partner.mainContact}</p>
                      <p className="text-sm text-muted-foreground">{partner.email}</p>
                    </div>
                    <Badge variant="secondary">{followUpCount} deals</Badge>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Email Template</h2>
          {selectedPartner && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button size="sm" onClick={handleSendEmail}>
                <Send className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </div>
          )}
        </div>

        {!selectedPartner ? (
          <div className="text-center py-12 text-muted-foreground">
            <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Select a partner to generate an email template</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">To: {selectedPartner.email}</p>
              <p className="text-sm text-muted-foreground">Subject: Monthly Partnership Check-in - Follow-up Needed</p>
            </div>

            <Textarea
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              rows={18}
              className="font-mono text-sm"
              placeholder="Email content will appear here..."
            />

            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Edit the template to personalize your message</li>
                <li>Click "Send Email" to open your email client with the template</li>
                <li>Or copy the template and paste it into your preferred email tool</li>
              </ul>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
