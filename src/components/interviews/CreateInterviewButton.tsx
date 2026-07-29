"use client";

import { Plus } from "lucide-react";
import { useCreateInterview } from "@/components/interviews/CreateInterviewProvider";
import { Button, type ButtonProps } from "@/components/ui/Button";

export function CreateInterviewButton({
  children = "New interview",
  showIcon = true,
  brand = true,
  ...props
}: ButtonProps & { showIcon?: boolean }) {
  const { openCreateInterview } = useCreateInterview();

  return (
    <Button
      type="button"
      onClick={openCreateInterview}
      leadingIcon={showIcon ? Plus : undefined}
      brand={brand}
      {...props}
    >
      {children}
    </Button>
  );
}
