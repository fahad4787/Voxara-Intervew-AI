"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { PageHeader } from "@/components/layout/Container";
import { DashboardContent } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { Input } from "@/components/ui/Input";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import { PageSpinner } from "@/components/ui/PageSpinner";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { getPasswordStrength } from "@/lib/utils/password";
import { formatDate } from "@/lib/utils/format";

export default function ProfilePage() {
  const { user, ready, updateProfileDetails, changePassword } = useAuth();

  const [profileForm, setProfileForm] = useState({ name: "", company: "" });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      name: user.name,
      company: user.company || "",
    });
  }, [user]);

  if (!ready || !user) {
    return (
      <DashboardContent narrow>
        <PageSpinner label="Loading profile…" />
      </DashboardContent>
    );
  }

  const onSaveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setProfileLoading(true);
    try {
      await updateProfileDetails({
        name: profileForm.name,
        company: profileForm.company,
      });
      setProfileSuccess("Profile updated.");
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : "Unable to update profile",
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const onChangePassword = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (getPasswordStrength(passwordForm.newPassword) === "weak") {
      setPasswordError("Choose a stronger password before continuing.");
      return;
    }

    if (passwordForm.newPassword === passwordForm.currentPassword) {
      setPasswordError("New password must be different from the current one.");
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordSuccess("Password updated.");
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Unable to update password",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DashboardContent narrow>
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Update your name, company, and password."
      />

      <div className="space-y-6">
        <Panel>
          <PanelBody>
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-semibold text-white">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--ink)]">
                  {user.name}
                </p>
                <p className="truncate text-sm text-[var(--ink-muted)]">
                  {user.email}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge
                    tone={user.role === "superadmin" ? "brand" : "neutral"}
                  >
                    {user.role === "superadmin" ? "Superadmin" : "Admin"}
                  </Badge>
                  <span className="font-[family-name:var(--font-data)] text-xs text-[var(--ink-faint)]">
                    Joined {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader
            title="Profile details"
            description="Your name shows in the sidebar and on shared activity."
          />
          <PanelBody>
            <form onSubmit={onSaveProfile} className="space-y-4">
              <Input
                label="Full name"
                name="name"
                autoComplete="name"
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, name: e.target.value }))
                }
                required
                minLength={2}
              />
              <Input
                label="Work email"
                name="email"
                type="email"
                value={user.email}
                disabled
                hint="Email can’t be changed here. Contact support if you need a new login email."
              />
              <Input
                label="Company"
                name="company"
                autoComplete="organization"
                placeholder="Optional"
                value={profileForm.company}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, company: e.target.value }))
                }
              />

              {profileError ? <InlineAlert>{profileError}</InlineAlert> : null}
              {profileSuccess ? (
                <InlineAlert tone="success">{profileSuccess}</InlineAlert>
              ) : null}

              <div className="flex justify-end">
                <Button type="submit" loading={profileLoading} brand>
                  Save profile
                </Button>
              </div>
            </form>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader
            title="Password"
            description="Choose a strong password you don’t reuse elsewhere."
          />
          <PanelBody>
            <form onSubmit={onChangePassword} className="space-y-4">
              <PasswordInput
                label="Current password"
                name="currentPassword"
                autoComplete="current-password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((f) => ({
                    ...f,
                    currentPassword: e.target.value,
                  }))
                }
                required
              />
              <PasswordInput
                label="New password"
                name="newPassword"
                autoComplete="new-password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((f) => ({
                    ...f,
                    newPassword: e.target.value,
                  }))
                }
                showStrength
                required
                minLength={8}
              />
              <PasswordInput
                label="Confirm new password"
                name="confirmPassword"
                autoComplete="new-password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((f) => ({
                    ...f,
                    confirmPassword: e.target.value,
                  }))
                }
                error={
                  passwordForm.confirmPassword &&
                  passwordForm.confirmPassword !== passwordForm.newPassword
                    ? "Passwords do not match"
                    : undefined
                }
                required
                minLength={8}
              />

              {passwordError ? (
                <InlineAlert>{passwordError}</InlineAlert>
              ) : null}
              {passwordSuccess ? (
                <InlineAlert tone="success">{passwordSuccess}</InlineAlert>
              ) : null}

              <div className="flex justify-end">
                <Button type="submit" loading={passwordLoading} brand>
                  Update password
                </Button>
              </div>
            </form>
          </PanelBody>
        </Panel>
      </div>
    </DashboardContent>
  );
}
