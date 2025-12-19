"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, UserPlus } from "lucide-react"
import { toast } from "sonner"

interface UserManagementProps {
  onUserAdded?: () => void
}

export function AdminUserManagement({ onUserAdded }: UserManagementProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'closer' as 'admin' | 'closer' | 'setter'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add user')
      }

      toast.success(`${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} added successfully!`)

      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'closer'
      })

      setIsOpen(false)
      onUserAdded?.()
    } catch (error: any) {
      toast.error(error.message || 'Failed to add user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="btn btn-primary">
          <UserPlus className="w-5 h-5" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)'
      }}>
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--color-text-primary)' }}>Add New User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <Label htmlFor="name" className="form-label">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="John Doe"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <Label htmlFor="email" className="form-label">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="john@example.com"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <Label htmlFor="password" className="form-label">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="••••••••"
              className="form-input"
              minLength={6}
            />
          </div>

          <div className="form-group">
            <Label htmlFor="role" className="form-label">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value: 'admin' | 'closer' | 'setter') =>
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="closer">Closer</SelectItem>
                <SelectItem value="setter">Setter</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <Button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              {loading ? 'Adding...' : 'Add User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
