"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Bell, Mail, Calendar, DollarSign } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function EmailNotificationSettings() {
  const [email, setEmail] = useState("")
  const [notifications, setNotifications] = useState({
    dealsStale: true,
    closeDate: true,
    payoutsDue: true,
    weeklyDigest: false,
  })
  const [daysBeforeClose, setDaysBeforeClose] = useState(7)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSave = () => {
    // In a real implementation, this would save to a backend
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Email Notification Settings</h2>
      </div>

      {saveSuccess && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">Notification settings saved successfully!</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="notificationEmail">Notification Email</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="notificationEmail"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSave}>Save</Button>
          </div>
          <p className="text-sm text-muted-foreground">Receive alerts and updates about your partnership activities</p>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">Alert Types</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <Label htmlFor="dealsStale" className="font-medium cursor-pointer">
                    Stale Deals Alert
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when deals haven't been updated in over 2 weeks
                  </p>
                </div>
              </div>
              <Switch
                id="dealsStale"
                checked={notifications.dealsStale}
                onCheckedChange={(checked) => setNotifications({ ...notifications, dealsStale: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="closeDate" className="font-medium cursor-pointer">
                    Upcoming Close Dates
                  </Label>
                  <p className="text-sm text-muted-foreground mb-2">Get notified before a deal's expected close date</p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="30"
                      value={daysBeforeClose}
                      onChange={(e) => setDaysBeforeClose(Number(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">days before close</span>
                  </div>
                </div>
              </div>
              <Switch
                id="closeDate"
                checked={notifications.closeDate}
                onCheckedChange={(checked) => setNotifications({ ...notifications, closeDate: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <Label htmlFor="payoutsDue" className="font-medium cursor-pointer">
                    Payouts Due Reminder
                  </Label>
                  <p className="text-sm text-muted-foreground">Monthly reminder of outstanding payouts to affiliates</p>
                </div>
              </div>
              <Switch
                id="payoutsDue"
                checked={notifications.payoutsDue}
                onCheckedChange={(checked) => setNotifications({ ...notifications, payoutsDue: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <Label htmlFor="weeklyDigest" className="font-medium cursor-pointer">
                    Weekly Digest
                  </Label>
                  <p className="text-sm text-muted-foreground">Receive a weekly summary of all partnership activity</p>
                </div>
              </div>
              <Switch
                id="weeklyDigest"
                checked={notifications.weeklyDigest}
                onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyDigest: checked })}
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <Button onClick={handleSave} className="w-full">
            Save All Settings
          </Button>
        </div>
      </div>
    </Card>
  )
}
