import { useState } from "react"
import { useProjects } from "@/hooks/useProjects"
import {
  useMembers,
  useAddMember,
  useUpdateMemberRole,
  useRemoveMember,
} from "@/hooks/useMembers"
import { MEMBER_ROLE_CONFIG } from "@/config"
import { formatDate, getInitials } from "@/lib/utils"
import type { ProjectMember, MemberRole } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Users,
  UserPlus,
  Trash2,
  Inbox,
} from "lucide-react"

// ── Add Member Dialog ─────────────────────────────────────────────────────────

interface AddMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (userId: string, role: MemberRole) => void
  isPending: boolean
}

function AddMemberDialog({ open, onOpenChange, onSubmit, isPending }: AddMemberDialogProps) {
  const [userId, setUserId] = useState("")
  const [role, setRole] = useState<MemberRole>("member")

  const handleOpenChange = (value: boolean) => {
    if (value) {
      setUserId("")
      setRole("member")
    }
    onOpenChange(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId.trim()) return
    onSubmit(userId.trim(), role)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Add a new member to this project by entering their user ID or email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-id">User ID or Email</Label>
            <Input
              id="user-id"
              placeholder="Enter user ID or email address"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(val) => setRole(val as MemberRole)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(MEMBER_ROLE_CONFIG) as MemberRole[]).map((r) => (
                  <SelectItem key={r} value={r}>
                    {MEMBER_ROLE_CONFIG[r].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !userId.trim()}>
              {isPending ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Role Select Cell ──────────────────────────────────────────────────────────

interface RoleSelectorProps {
  member: ProjectMember
  projectId: string
  onRoleChange: (memberId: string, role: MemberRole) => void
  isPending: boolean
}

function RoleSelector({ member, projectId: _projectId, onRoleChange, isPending }: RoleSelectorProps) {
  const cfg = MEMBER_ROLE_CONFIG[member.role]

  return (
    <Select
      value={member.role}
      onValueChange={(val) => onRoleChange(member.id, val as MemberRole)}
      disabled={isPending}
    >
      <SelectTrigger className="w-[120px] h-8">
        <SelectValue>
          <Badge variant="secondary" className={`${cfg.bgColor} ${cfg.color} text-[10px]`}>
            {cfg.label}
          </Badge>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(MEMBER_ROLE_CONFIG) as MemberRole[]).map((r) => {
          const roleCfg = MEMBER_ROLE_CONFIG[r]
          return (
            <SelectItem key={r} value={r}>
              <Badge variant="secondary" className={`${roleCfg.bgColor} ${roleCfg.color} text-[10px]`}>
                {roleCfg.label}
              </Badge>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}

// ── Loading Skeleton ──────────────────────────────────────────────────────────

function TeamSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48 ml-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const { data: projects, isLoading: projectsLoading } = useProjects()
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")

  const projectId = selectedProjectId || projects?.[0]?.id || ""
  const {
    data: members,
    isLoading: membersLoading,
    isError,
  } = useMembers(projectId || undefined)

  const addMember = useAddMember()
  const updateRole = useUpdateMemberRole()
  const removeMember = useRemoveMember()

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<ProjectMember | null>(null)

  const isLoading = projectsLoading || (!!projectId && membersLoading)

  if (isLoading && !projects) {
    return <TeamSkeleton />
  }

  const handleAddMember = (userId: string, role: MemberRole) => {
    if (!projectId) return
    addMember.mutate(
      { projectId, userId, role },
      { onSuccess: () => setAddDialogOpen(false) },
    )
  }

  const handleRoleChange = (memberId: string, role: MemberRole) => {
    if (!projectId) return
    updateRole.mutate({ projectId, memberId, role })
  }

  const handleRemoveMember = () => {
    if (!projectId || !removeTarget) return
    removeMember.mutate(
      { projectId, memberId: removeTarget.id },
      { onSuccess: () => setRemoveTarget(null) },
    )
  }

  const selectedProject = projects?.find((p) => p.id === projectId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-muted-foreground mt-1">Manage project team members and roles</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={projectId} onValueChange={(val) => setSelectedProjectId(val)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects?.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setAddDialogOpen(true)} disabled={!projectId}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>
      </div>

      {/* No project selected */}
      {!projectId && !projectsLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-sm">No projects found. Create a project first to manage team members.</p>
          </CardContent>
        </Card>
      )}

      {/* Loading members */}
      {projectId && membersLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {projectId && isError && !membersLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">Could not load members</h3>
            <p className="text-muted-foreground text-sm">
              There was an error loading the team members. Please try again later.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {projectId && !membersLoading && !isError && members && members.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No team members yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Add members to "{selectedProject?.name}" to start collaborating.
            </p>
            <Button onClick={() => setAddDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Members Table */}
      {projectId && !membersLoading && !isError && members && members.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              {selectedProject?.name} Members
              <Badge variant="secondary" className="ml-1 text-[10px]">
                {members.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Manage roles and permissions for team members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => {
                  const memberName = member.user?.full_name ?? member.user_id
                  const memberEmail = member.user?.email ?? "—"
                  const avatarUrl = member.user?.avatar_url
                  const initials = member.user?.full_name
                    ? getInitials(member.user.full_name)
                    : member.user_id.slice(0, 2).toUpperCase()

                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={avatarUrl} alt={memberName} />
                            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{memberName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {memberEmail}
                      </TableCell>
                      <TableCell>
                        <RoleSelector
                          member={member}
                          projectId={projectId}
                          onRoleChange={handleRoleChange}
                          isPending={updateRole.isPending}
                        />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(member.created_at)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setRemoveTarget(member)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Member Dialog */}
      <AddMemberDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddMember}
        isPending={addMember.isPending}
      />

      {/* Remove Confirmation Dialog */}
      <AlertDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-medium">
                {removeTarget?.user?.full_name ?? removeTarget?.user_id}
              </span>{" "}
              from this project? They will lose access to all project resources.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeMember.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
