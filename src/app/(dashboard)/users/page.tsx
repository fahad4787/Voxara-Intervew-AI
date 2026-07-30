"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Users } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { PageHeader } from "@/components/layout/Container";
import { DashboardContent } from "@/components/layout/DashboardShell";
import { AddAdminModal } from "@/components/users/AddAdminModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import { PageSpinner } from "@/components/ui/PageSpinner";
import { apiFetch } from "@/lib/api/client";
import type { AuthUser } from "@/lib/auth/types";
import { listPortalUsers } from "@/lib/firebase/users";
import { formatDate } from "@/lib/utils/format";

function roleLabel(role: AuthUser["role"]) {
  return role === "superadmin" ? "Superadmin" : "Admin";
}

function withSelf(list: AuthUser[], self: AuthUser) {
  if (list.some((item) => item.id === self.id)) return list;
  return [self, ...list];
}

export default function UsersPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [admins, setAdmins] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<AuthUser | null>(null);
  const [removing, setRemoving] = useState(false);

  const load = useCallback(async (self: AuthUser) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listPortalUsers();
      setAdmins(withSelf(data, self));
    } catch {
      // Rules may still be self-only until redeployed — always show you.
      setAdmins([self]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!user) return;
    if (user.role !== "superadmin") {
      router.replace("/dashboard");
      return;
    }
    void load(user);
  }, [ready, user, router, load]);

  const handleRemove = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      await apiFetch(`/api/admins/${removeTarget.id}`, { method: "DELETE" });
      setAdmins((prev) => prev.filter((a) => a.id !== removeTarget.id));
      setRemoveTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove admin");
      setRemoveTarget(null);
    } finally {
      setRemoving(false);
    }
  };

  if (!ready || !user || user.role !== "superadmin") {
    return (
      <DashboardContent>
        <PageSpinner label="Loading users…" />
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <PageHeader
        eyebrow="Access"
        title="User management"
        description="Add admins who can create interviews and review scorecards."
        actions={
          <Button
            size="sm"
            leadingIcon={Plus}
            onClick={() => setAddOpen(true)}
            brand
          >
            Add admin
          </Button>
        }
      />

      {error ? (
        <InlineAlert className="mb-4">{error}</InlineAlert>
      ) : null}

      {loading ? (
        <PageSpinner label="Loading users…" />
      ) : admins.length === 0 ? (
        <Panel>
          <PanelBody>
            <EmptyState
              icon={<Users className="h-5 w-5" />}
              title="No users yet"
              description="Create an admin so someone else can run interviews."
              action={
                <Button
                  leadingIcon={Plus}
                  onClick={() => setAddOpen(true)}
                  brand
                >
                  Add admin
                </Button>
              }
            />
          </PanelBody>
        </Panel>
      ) : (
        <Panel>
          <PanelHeader
            title={`${admins.length} user${admins.length === 1 ? "" : "s"}`}
            description="Superadmin can add and remove admins."
          />
          <PanelBody className="!p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--ink-faint)]">
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Role</th>
                    <th className="px-5 py-3 font-medium">Added</th>
                    <th className="px-5 py-3 font-medium">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {admins.map((admin) => {
                    const isSelf = admin.id === user.id;
                    const canRemove =
                      admin.role !== "superadmin" && !isSelf;

                    return (
                      <tr key={admin.id}>
                        <td className="px-5 py-3.5 font-medium text-[var(--ink)]">
                          {admin.name}
                          {isSelf ? (
                            <span className="ml-2 text-xs font-normal text-[var(--ink-faint)]">
                              You
                            </span>
                          ) : null}
                        </td>
                        <td className="px-5 py-3.5 text-[var(--ink-muted)]">
                          {admin.email}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge
                            tone={
                              admin.role === "superadmin" ? "brand" : "neutral"
                            }
                          >
                            {roleLabel(admin.role)}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 font-[family-name:var(--font-data)] text-[var(--ink-muted)]">
                          {formatDate(admin.createdAt)}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {canRemove ? (
                            <Button
                              variant="dangerGhost"
                              size="sm"
                              iconOnly
                              leadingIcon={Trash2}
                              aria-label={`Remove ${admin.name}`}
                              onClick={() => setRemoveTarget(admin)}
                            />
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </PanelBody>
        </Panel>
      )}

      <AddAdminModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={(admin) =>
          setAdmins((prev) =>
            prev.some((a) => a.id === admin.id) ? prev : [...prev, admin],
          )
        }
      />

      <ConfirmModal
        open={Boolean(removeTarget)}
        onClose={() => {
          if (!removing) setRemoveTarget(null);
        }}
        onConfirm={handleRemove}
        title="Remove admin?"
        description={
          removeTarget
            ? `${removeTarget.name} (${removeTarget.email}) will lose access immediately.`
            : undefined
        }
        confirmLabel="Remove"
        loading={removing}
      />
    </DashboardContent>
  );
}
