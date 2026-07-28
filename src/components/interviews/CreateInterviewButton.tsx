"use client";

import { Plus } from "lucide-react";
import { useCreateInterview } from "@/components/interviews/CreateInterviewProvider";
import { Button, type ButtonProps } from "@/components/ui/Button";

export function CreateInterviewButton({
  children = "New interview",
  showIcon = true,
  ...props
}: ButtonProps & { showIcon?: boolean }) {
  const { openCreateInterview } = useCreateInterview();

  return (
    <Button type="button" onClick={openCreateInterview} {...props}>
      {showIcon ? <Plus className="h-4 w-4" /> : null}
      {children}
    </Button>
  );
}
