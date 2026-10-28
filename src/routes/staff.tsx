import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  CheckCircle2,
  KeyRound,
  Lock,
  LogOut,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useI18n } from "@/i18n";
import { useHotelData } from "@/mock/store";
import type { Permission, Role, StaffMember, StaffStatus } from "@/types";

const ALL_PERMISSIONS: { key: Permission; label: string; desc: string }[] = [
  {
    key: "reservations.view",
    label: "View Reservations",
    desc: "Browse reservations and room rack",
  },
  {
    key: "reservations.manage",
    label: "Create & Edit Bookings",
    desc: "Add bookings, modify dates and rates",
  },
  {
    key: "rooms.manage",
    label: "Manage Rooms",
    desc: "Change housekeeping and maintenance states",
  },
  {
    key: "guests.manage",
    label: "Manage Guests",
    desc: "Create, view and edit guest VIP profiles",
  },
  {
    key: "staff.manage",
    label: "Manage Staff",
    desc: "Add staff accounts and configure role permissions",
  },
  {
    key: "settings.manage",
    label: "Manage Settings",
    desc: "Change hotel configuration, branding and rates",
  },
  { key: "backup.manage", label: "Database Backup", desc: "Export and import database backups" },
];

export const Route = createFileRoute("/staff")({
  validateSearch: (s: Record<string, unknown>): { q?: string | undefined } => ({
    q: typeof s["q"] === "string" ? s["q"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Staff & Permissions — 22 Boutique Hotel" },
      {
        name: "description",
        content: "Staff accounts, security roles and access permissions for 22 Boutique Hotel.",
      },
      { property: "og:title", content: "Staff & Permissions — 22 Boutique Hotel" },
      {
        property: "og:description",
        content: "Staff accounts, security roles and access permissions for 22 Boutique Hotel.",
      },
    ],
  }),
  component: StaffPage,
});

export function StaffPage() {
  const { t } = useI18n();
  const { staff, roles, saveStaff } = useHotelData();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  const [newStaffForm, setNewStaffForm] = useState({
    name: "",
    email: "",
    roleId: "reception",
    status: "active" as StaffStatus,
    permissions: ["reservations.view", "reservations.manage", "guests.manage"] as Permission[],
  });

  const activeStaffCount = staff.filter((s) => s.status === "active").length;

  const filteredStaff = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return staff.filter((m) => {
      if (roleFilter !== "all" && m.roleId !== roleFilter) return false;
      if (q && !m.name.toLowerCase().includes(q) && !m.email.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [staff, searchQuery, roleFilter]);

  const handleRoleChangeForNew = (roleId: string) => {
    const roleObj = roles.find((r) => r.id === roleId);
    setNewStaffForm((prev) => ({
      ...prev,
      roleId,
      permissions: roleObj ? [...roleObj.permissions] : prev.permissions,
    }));
  };

  const handleRoleChangeForEdit = (roleId: string) => {
    if (!editingStaff) return;
    const roleObj = roles.find((r) => r.id === roleId);
    setEditingStaff({
      ...editingStaff,
      roleId,
      permissions: roleObj ? [...roleObj.permissions] : editingStaff.permissions,
    });
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffForm.name.trim() || !newStaffForm.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    saveStaff(newStaffForm);
    toast.success(`Staff account for ${newStaffForm.name} created.`);
    setIsAddOpen(false);
    setNewStaffForm({
      name: "",
      email: "",
      roleId: "reception",
      status: "active",
      permissions: ["reservations.view", "reservations.manage", "guests.manage"],
    });
  };

  const handleUpdateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    saveStaff(editingStaff);
    toast.success(`Staff member ${editingStaff.name} updated.`);
    setEditingStaff(null);
  };

  const toggleStaffStatus = (member: StaffMember) => {
    const nextStatus: StaffStatus = member.status === "active" ? "inactive" : "active";
    saveStaff({ ...member, status: nextStatus });
    toast.info(`${member.name} marked as ${nextStatus}.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.staff")}
        subtitle="Manage hotel operators, front desk staff credentials, and role privileges."
        actions={
          <Button onClick={() => setIsAddOpen(true)} className="gap-2 shadow-xs">
            <UserPlus className="size-4" />
            <span>Add Staff Account</span>
          </Button>
        }
      />

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-border py-3">
          <CardContent className="px-4 py-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Total Staff Directory</span>
              <Users className="size-3.5 text-primary" />
            </div>
            <div className="mt-1 text-2xl font-bold tracking-tight tabular">{staff.length}</div>
          </CardContent>
        </Card>

        <Card className="border-border py-3">
          <CardContent className="px-4 py-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Active Operators</span>
              <UserCheck className="size-3.5 text-emerald-500" />
            </div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular">
              {activeStaffCount}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border py-3">
          <CardContent className="px-4 py-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Configured Roles</span>
              <ShieldCheck className="size-3.5 text-sky-500" />
            </div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-foreground tabular">
              {roles.length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border py-3">
          <CardContent className="px-4 py-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Access Model</span>
              <Lock className="size-3.5 text-amber-500" />
            </div>
            <div className="mt-1 text-sm font-semibold tracking-tight text-foreground pt-1">
              Role-Based (RBAC)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 sm:p-4 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff by name or email..."
            className="h-9 pl-9 pr-8 text-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-9 w-[160px] text-xs">
              <SelectValue placeholder="Role Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(searchQuery || roleFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setRoleFilter("all");
              }}
              className="h-9 text-xs text-muted-foreground hover:text-foreground px-2"
            >
              <RotateCcw className="size-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Staff Directory Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="min-w-[180px] text-xs font-semibold">Staff Member</TableHead>
                <TableHead className="w-[180px] text-xs font-semibold">Email</TableHead>
                <TableHead className="w-[150px] text-xs font-semibold">Role</TableHead>
                <TableHead className="w-[100px] text-xs font-semibold text-center">
                  Status
                </TableHead>
                <TableHead className="min-w-[180px] text-xs font-semibold">Privileges</TableHead>
                <TableHead className="w-[110px] text-xs font-semibold text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((member) => {
                const initials = member.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2);
                const roleObj = roles.find((r) => r.id === member.roleId);

                return (
                  <TableRow key={member.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8 ring-1 ring-border">
                          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-semibold text-xs text-foreground">{member.name}</div>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">{member.email}</TableCell>

                    <TableCell>
                      <Badge variant="outline" className="font-medium text-[11px] capitalize">
                        {roleObj?.name ?? member.roleId}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center">
                      <button
                        type="button"
                        onClick={() => toggleStaffStatus(member)}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                          member.status === "active"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-muted text-muted-foreground border border-border"
                        }`}
                        title="Click to toggle active/inactive"
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            member.status === "active" ? "bg-emerald-500" : "bg-muted-foreground"
                          }`}
                        />
                        <span className="capitalize">{member.status}</span>
                      </button>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Shield className="size-3.5 text-primary shrink-0" />
                        <span>
                          {member.permissions.length} of {ALL_PERMISSIONS.length} privileges
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-foreground"
                          onClick={() => setEditingStaff(member)}
                          title="Edit staff details and permissions"
                        >
                          <Pencil className="size-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between border-t border-border/80 px-4 py-2.5 text-xs text-muted-foreground">
          <span>
            Showing <strong className="text-foreground">{filteredStaff.length}</strong> of{" "}
            {staff.length} staff records
          </span>
          <span className="font-mono text-[11px]">SevenA Hospitality Admin</span>
        </div>
      </div>

      {/* Role Privileges Reference Grid */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <CardTitle className="text-sm font-semibold">
              Standard Roles & Permission Architecture
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Preset capability matrices configured for 22 Boutique Hotel operations.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-border/80 bg-muted/20 p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-foreground">{r.name}</span>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {r.permissions.length} grants
                </Badge>
              </div>
              <ul className="space-y-1 text-[11px] text-muted-foreground">
                {r.permissions.map((p) => (
                  <li key={p} className="flex items-center gap-1.5 truncate">
                    <Check className="size-3 text-emerald-500 shrink-0" />
                    <span className="truncate">{p.replace(".", " ")}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Add Staff Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
            <DialogDescription>
              Create an operator account and assign system privileges.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateStaff} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="staff-name">Full Name *</Label>
              <Input
                id="staff-name"
                required
                value={newStaffForm.name}
                onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                placeholder="Marc Dupont"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staff-email">Email Address *</Label>
              <Input
                id="staff-email"
                type="email"
                required
                value={newStaffForm.email}
                onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                placeholder="m.dupont@22boutique.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Assigned Role</Label>
                <Select value={newStaffForm.roleId} onValueChange={handleRoleChangeForNew}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Account Status</Label>
                <Select
                  value={newStaffForm.status}
                  onValueChange={(v: StaffStatus) =>
                    setNewStaffForm({ ...newStaffForm, status: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Permissions list */}
            <div className="space-y-2 border-t border-border pt-3">
              <Label className="text-xs">Granular Permissions</Label>
              <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
                {ALL_PERMISSIONS.map((perm) => {
                  const checked = newStaffForm.permissions.includes(perm.key);
                  return (
                    <div
                      key={perm.key}
                      onClick={() => {
                        const next = checked
                          ? newStaffForm.permissions.filter((p) => p !== perm.key)
                          : [...newStaffForm.permissions, perm.key];
                        setNewStaffForm({ ...newStaffForm, permissions: next });
                      }}
                      className="flex items-start gap-2.5 rounded-md border border-border p-2 text-left cursor-pointer hover:bg-muted/40 transition-colors"
                    >
                      <Checkbox checked={checked} className="mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-foreground">{perm.label}</div>
                        <div className="text-[10px] text-muted-foreground">{perm.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Account</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Modal */}
      {editingStaff && (
        <Dialog open={!!editingStaff} onOpenChange={(o) => !o && setEditingStaff(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Staff: {editingStaff.name}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateStaff} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input
                  value={editingStaff.name}
                  onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editingStaff.email}
                  onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Select value={editingStaff.roleId} onValueChange={handleRoleChangeForEdit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select
                    value={editingStaff.status}
                    onValueChange={(v: StaffStatus) =>
                      setEditingStaff({ ...editingStaff, status: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Permissions list */}
              <div className="space-y-2 border-t border-border pt-3">
                <Label className="text-xs">Granular Permissions</Label>
                <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
                  {ALL_PERMISSIONS.map((perm) => {
                    const checked = editingStaff.permissions.includes(perm.key);
                    return (
                      <div
                        key={perm.key}
                        onClick={() => {
                          const next = checked
                            ? editingStaff.permissions.filter((p) => p !== perm.key)
                            : [...editingStaff.permissions, perm.key];
                          setEditingStaff({ ...editingStaff, permissions: next });
                        }}
                        className="flex items-start gap-2.5 rounded-md border border-border p-2 text-left cursor-pointer hover:bg-muted/40 transition-colors"
                      >
                        <Checkbox checked={checked} className="mt-0.5" />
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-foreground">{perm.label}</div>
                          <div className="text-[10px] text-muted-foreground">{perm.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingStaff(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
