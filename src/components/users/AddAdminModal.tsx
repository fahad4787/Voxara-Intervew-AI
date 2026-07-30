"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { apiFetch } from "@/lib/api/client";
import type { AuthUser } from "@/lib/auth/types";
import { getPasswordStrength } from "@/lib/utils/password";

export function AddAdminModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (admin: AuthUser) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const reset = () => {
    setForm({ name: "", email: "", password: "", confirmPassword: "" });
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    if (loading) return;
    reset();
    onClose();
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (getPasswordStrength(form.password) === "weak") {
      setError("Choose a stronger password before continuing.");
      return;
    }

    setLoading(true);
    try {
      const admin = await apiFetch<AuthUser>("/api/admins", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });
      onCreated(admin);
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create admin");
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      eyebrow="User management"
      title="Add admin"
      description="They can sign in and run interviews. Only you can add or remove admins."
      className="sm:max-w-md"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" form="add-admin-form" loading={loading} brand>
            Create admin
          </Button>
        </div>
      }
    >
      <form id="add-admin-form" onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Full name"
          name="name"
          autoComplete="name"
          placeholder="Jordan Lee"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
        <Input
          label="Work email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
        />
        <PasswordInput
          label="Temporary password"
          name="password"
          autoComplete="new-password"
          placeholder="Create a strong password"
          value={form.password}
          onChange={(e) =>
            setForm((f) => ({ ...f, password: e.target.value }))
          }
          showStrength
          required
          minLength={8}
        />
        <PasswordInput
          label="Confirm password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Re-enter password"
          value={form.confirmPassword}
          onChange={(e) =>
            setForm((f) => ({ ...f, confirmPassword: e.target.value }))
          }
          error={
            form.confirmPassword && form.confirmPassword !== form.password
              ? "Passwords do not match"
              : undefined
          }
          required
          minLength={8}
        />
        {error ? <InlineAlert>{error}</InlineAlert> : null}
      </form>
    </Modal>
  );
}
