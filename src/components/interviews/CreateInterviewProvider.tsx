"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { InterviewForm } from "@/components/interviews/InterviewForm";
import { Modal } from "@/components/ui/Modal";

type CreateInterviewContextValue = {
  open: boolean;
  openCreateInterview: () => void;
  closeCreateInterview: () => void;
};

const CreateInterviewContext =
  createContext<CreateInterviewContextValue | null>(null);

function CreateInterviewUrlSync({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setOpen(true);
    }
  }, [searchParams, setOpen]);

  return null;
}

export function CreateInterviewProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const closeCreateInterview = useCallback(() => {
    setOpen(false);
    if (
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("create") === "1"
    ) {
      router.replace(pathname);
    }
  }, [pathname, router]);

  const openCreateInterview = useCallback(() => {
    setOpen(true);
  }, []);

  const value = useMemo(
    () => ({ open, openCreateInterview, closeCreateInterview }),
    [open, openCreateInterview, closeCreateInterview],
  );

  return (
    <CreateInterviewContext.Provider value={value}>
      {children}
      <Suspense fallback={null}>
        <CreateInterviewUrlSync setOpen={setOpen} />
      </Suspense>
      <Modal
        open={open}
        onClose={closeCreateInterview}
        eyebrow="New session"
        title="Create interview"
        description="Paste the job description. Ava will generate an opening, topics, and adaptive follow-ups."
        bodyClassName="p-0"
        className="sm:max-w-2xl"
      >
        {open ? (
          <InterviewForm
            layout="modal"
            onCancel={closeCreateInterview}
            onSuccess={closeCreateInterview}
          />
        ) : null}
      </Modal>
    </CreateInterviewContext.Provider>
  );
}

export function useCreateInterview() {
  const ctx = useContext(CreateInterviewContext);
  if (!ctx) {
    throw new Error(
      "useCreateInterview must be used within CreateInterviewProvider",
    );
  }
  return ctx;
}
