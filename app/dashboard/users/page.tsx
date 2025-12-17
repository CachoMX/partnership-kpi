"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LogOut, Search, Edit2, Trash2, UserPlus, ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface UserData {
  id: string
  email: string
  name: string
  role: 'admin' | 'closer' | 'setter'
  created_at: string
}

export default function UsersManagementPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "", password: "" })
  const [deletingUser, setDeletingUser] = useState<UserData | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (!authLoading && user && user.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers()
    }
  }, [user])

  useEffect(() => {
    if (searchTerm) {
      setFilteredUsers(
        users.filter(u =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.role.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    } else {
      setFilteredUsers(users)
    }
  }, [searchTerm, users])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/users')
      if (!response.ok) throw new Error('Failed to fetch users')

      const data = await response.json()
      setUsers(data.users || [])
      setFilteredUsers(data.users || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  const handleEditClick = (user: UserData) => {
    setEditingUser(user)
    setEditForm({ name: user.name, email: user.email, role: user.role, password: "" })
    setIsEditDialogOpen(true)
  }

  const handleEditSave = async () => {
    if (!editingUser) return

    try {
      const payload: any = {
        userId: editingUser.id,
        name: editForm.name,
        email: editForm.email,
        role: editForm.role
      }

      // Only include password if it's been changed
      if (editForm.password && editForm.password.trim() !== "") {
        payload.password = editForm.password
      }

      const response = await fetch('/api/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to update user')

      toast.success('User updated successfully')
      setIsEditDialogOpen(false)
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user')
    }
  }

  const handleDeleteClick = (user: UserData) => {
    setDeletingUser(user)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return

    try {
      const response = await fetch('/api/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: deletingUser.id })
      })

      if (!response.ok) throw new Error('Failed to delete user')

      toast.success('User deleted successfully')
      setIsDeleteDialogOpen(false)
      setDeletingUser(null)
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-accent)' }}></div>
          <div style={{ color: 'var(--color-text-primary)' }}>Loading users...</div>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <main style={{ backgroundColor: 'var(--color-bg-primary)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'var(--space-4) var(--space-6)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={() => router.push('/dashboard')} className="btn btn-secondary">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-h1" style={{ marginBottom: 'var(--space-1)' }}>User Management</h1>
                <p className="text-small" style={{ color: 'var(--color-text-muted)' }}>
                  Manage all users, closers, and setters
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => router.push('/dashboard')} className="btn btn-secondary">
                Dashboard
              </Button>
              <Button onClick={handleSignOut} className="btn btn-secondary">
                <LogOut className="w-5 h-5" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'var(--space-6)' }}>
        {/* Search Bar */}
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-muted)', pointerEvents: 'none', zIndex: 1 }} />
              <Input
                type="text"
                placeholder="Search by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  paddingLeft: '2.5rem'
                }}
              />
            </div>
            <Button onClick={fetchUsers} className="btn btn-secondary">
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="card-grid" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card-report">
            <div className="text-small text-muted mb-2">Total Users</div>
            <div className="stat-value">{users.length}</div>
          </div>
          <div className="card-report">
            <div className="text-small text-muted mb-2">Closers</div>
            <div className="stat-value">{users.filter(u => u.role === 'closer').length}</div>
          </div>
          <div className="card-report">
            <div className="text-small text-muted mb-2">Setters</div>
            <div className="stat-value">{users.filter(u => u.role === 'setter').length}</div>
          </div>
          <div className="card-report">
            <div className="text-small text-muted mb-2">Admins</div>
            <div className="stat-value">{users.filter(u => u.role === 'admin').length}</div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: 'var(--space-3)', textAlign: 'left', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Name</th>
                  <th style={{ padding: 'var(--space-3)', textAlign: 'left', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Email</th>
                  <th style={{ padding: 'var(--space-3)', textAlign: 'left', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Role</th>
                  <th style={{ padding: 'var(--space-3)', textAlign: 'left', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Created</th>
                  <th style={{ padding: 'var(--space-3)', textAlign: 'right', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: 'var(--space-3)', color: 'var(--color-text-primary)' }}>{u.name}</td>
                    <td style={{ padding: 'var(--space-3)', color: 'var(--color-text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: 'var(--space-3)' }}>
                      <span className="badge-live" style={{
                        backgroundColor: u.role === 'admin' ? 'var(--color-danger-subtle)' : u.role === 'closer' ? 'var(--color-accent-subtle)' : 'var(--color-info)',
                        color: u.role === 'admin' ? 'var(--color-danger)' : u.role === 'closer' ? 'var(--color-accent)' : 'var(--color-text-primary)'
                      }}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--space-3)', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: 'var(--space-3)', textAlign: 'right' }}>
                      <div className="flex gap-2 justify-end">
                        <Button
                          onClick={() => handleEditClick(u)}
                          className="btn btn-secondary"
                          size="sm"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        {u.role !== 'admin' && (
                          <Button
                            onClick={() => handleDeleteClick(u)}
                            className="btn btn-secondary"
                            size="sm"
                            style={{ color: 'var(--color-danger)' }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={editForm.role} onValueChange={(value) => setEditForm({ ...editForm, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="closer">Closer</SelectItem>
                  <SelectItem value="setter">Setter</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-password">New Password (optional)</Label>
              <Input
                id="edit-password"
                type="password"
                placeholder="Leave blank to keep current password"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
              />
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Enter a new password to change it, or leave blank to keep the current password.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsEditDialogOpen(false)} className="btn btn-secondary">
              Cancel
            </Button>
            <Button onClick={handleEditSave} className="btn btn-primary">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--color-danger)' }}>⚠️ Delete User</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Please confirm deletion.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="card" style={{ backgroundColor: 'var(--color-danger-subtle)', border: '1px solid var(--color-danger)', marginBottom: 'var(--space-4)' }}>
              <p style={{ color: 'var(--color-text-primary)', fontWeight: 500, marginBottom: 'var(--space-2)' }}>
                You are about to delete:
              </p>
              <p style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-lg)', fontWeight: 600 }}>
                {deletingUser?.name}
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                {deletingUser?.email}
              </p>
            </div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
              <p style={{ marginBottom: 'var(--space-2)' }}>⚠️ <strong>Warning:</strong> This will permanently delete:</p>
              <ul style={{ listStyleType: 'disc', paddingLeft: 'var(--space-6)', marginBottom: 'var(--space-2)' }}>
                <li>User account and authentication</li>
                <li>All call records associated with this user</li>
                <li>All performance statistics and history</li>
                <li>All revenue and commission data</li>
              </ul>
              <p style={{ color: 'var(--color-danger)', fontWeight: 500 }}>
                This action is irreversible and cannot be undone.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsDeleteDialogOpen(false)} className="btn btn-secondary">
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              className="btn btn-primary"
              style={{
                backgroundColor: 'var(--color-danger)',
                color: 'white'
              }}
            >
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
