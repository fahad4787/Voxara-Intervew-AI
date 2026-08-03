import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { PageSpinner } from "@/components/ui/PageSpinner";

export default function LoginPage() {
  return (
    <Suspense fallback={<PageSpinner fill={false} className="min-h-40 py-10" />}>
      <LoginForm />
    </Suspense>
  );
}
