import { useState } from "react";
import {
  Bell,
  Check,
  CheckCircle2,
  Clock,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  Smartphone,
  User,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useHotelData } from "@/mock/store";

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountDialog({ open, onOpenChange }: AccountDialogProps) {
  const { staff, roles, saveStaff } = useHotelData();
  const me = staff[0] ?? {
    id: "staff-1",
    name: "Celine Laurent",
    email: "c.laurent@22boutique.com",
    roleId: "admin",
    status: "active" as const,
    permissions: [],
  };

  const myRole = roles.find((r) => r.id === me.roleId);

  // Form states
  const [name, setName] = useState(me.name);
  const [email, setEmail] = useState(me.email);
  const [phone, setPhone] = useState("+33 1 42 68 55 22");
  const [department, setDepartment] = useState("Front Office & Concierge");

  // Security states
  const [twoFactor, setTwoFactor] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Notification states
  const [vipArrivalsNotify, setVipArrivalsNotify] = useState(true);
  const [highOccupancyNotify, setHighOccupancyNotify] = useState(true);
  const [roomStatusNotify, setRoomStatusNotify] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveStaff({
      ...me,
      name,
      email,
    });
    toast.success("Account profile updated", {
      description: "Operator details successfully synchronized.",
    });
    onOpenChange(false);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    toast.success("Security credentials updated", {
      description: "Your password has been changed securely.",
    });
  };

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:p-6 p-4">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-3">
            <Avatar className="size-12 ring-2 ring-primary/20">
              <AvatarFallback className="bg-primary/10 font-serif text-sm font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                <span>{name}</span>
                <Badge variant="outline" className="border-primary/30 text-primary text-[10px]">
                  {myRole?.name ?? "Administrator"}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                22 Boutique Hotel Operator Account · ID: 22B-EMP-001
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="profile" className="mt-2 w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="gap-1.5 text-xs">
              <User className="size-3.5" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-1.5 text-xs">
              <Shield className="size-3.5" />
              <span>Security & Access</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5 text-xs">
              <Bell className="size-3.5" />
              <span>Notifications</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4 pt-4">
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="operator-name" className="text-xs">
                    Full Name
                  </Label>
                  <Input
                    id="operator-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="operator-email" className="text-xs">
                    Hotel Staff Email
                  </Label>
                  <Input
                    id="operator-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="operator-phone" className="text-xs">
                    Internal Extension / Phone
                  </Label>
                  <Input
                    id="operator-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="operator-dept" className="text-xs">
                    Assigned Department
                  </Label>
                  <Input
                    id="operator-dept"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              {/* Duty Shift info */}
              <div className="flex items-center justify-between rounded-lg border border-border/80 bg-muted/40 p-3 text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  <div>
                    <span className="font-semibold text-foreground">Current Shift: </span>
                    <span className="text-muted-foreground">Morning Shift (07:00 - 15:30 CET)</span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  On Duty
                </Badge>
              </div>

              {/* Assigned Permissions list */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Authorized System Permissions
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    myRole?.permissions ?? [
                      "reservations.manage",
                      "rooms.manage",
                      "guests.manage",
                      "staff.manage",
                    ]
                  ).map((perm) => (
                    <Badge
                      key={perm}
                      variant="outline"
                      className="font-mono text-[10px] text-muted-foreground bg-muted/30"
                    >
                      {perm}
                    </Badge>
                  ))}
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="gap-1.5">
                  <Check className="size-3.5" /> Save Changes
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4 pt-4">
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="rounded-lg border border-border/80 bg-muted/30 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="size-4 text-primary" />
                    <div>
                      <div className="text-xs font-semibold text-foreground">
                        Two-Factor Authentication (2FA)
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Require an authenticator app code for hotel admin actions.
                      </div>
                    </div>
                  </div>
                  <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <KeyRound className="size-3.5 text-primary" />
                  <span>Update Password</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="curr-pass" className="text-xs">
                      Current Password
                    </Label>
                    <Input
                      id="curr-pass"
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="new-pass" className="text-xs">
                      New Password
                    </Label>
                    <Input
                      id="new-pass"
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="text-xs font-medium text-muted-foreground">Active Terminals</div>
                <div className="flex items-center justify-between rounded-md border border-border/70 p-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span className="font-medium text-foreground">
                      Front Desk Station 1 (This Session)
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">IP 192.168.1.42</span>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="submit" size="sm" className="gap-1.5">
                  <Lock className="size-3.5" /> Update Password
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-3.5 pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border/80 p-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-foreground">
                    VIP Guest Arrival Alerts
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Instant chime when a VIP guest checks into the hotel.
                  </div>
                </div>
                <Switch checked={vipArrivalsNotify} onCheckedChange={setVipArrivalsNotify} />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/80 p-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-foreground">
                    High Occupancy Threshold (&gt;85%)
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Alert the team when room capacity reaches peak threshold.
                  </div>
                </div>
                <Switch checked={highOccupancyNotify} onCheckedChange={setHighOccupancyNotify} />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/80 p-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-foreground">
                    Housekeeping Room Status Updates
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Notify when a room changes from dirty to inspected/ready.
                  </div>
                </div>
                <Switch checked={roomStatusNotify} onCheckedChange={setRoomStatusNotify} />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  toast.success("Notification preferences saved");
                  onOpenChange(false);
                }}
              >
                Save Preferences
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
