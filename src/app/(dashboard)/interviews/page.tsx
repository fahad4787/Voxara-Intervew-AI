"use client";

import { Briefcase } from "lucide-react";
import { useOwnerInterviews } from "@/hooks/useInterviews";
import { PageHeader } from "@/components/layout/Container";
import { DashboardContent } from "@/components/layout/DashboardShell";
import { CreateInterviewButton } from "@/components/interviews/CreateInterviewButton";
import { InterviewCard } from "@/components/interviews/InterviewCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Progress";

export default function InterviewsPage() {
  const { interviews, loading, removeInterview } = useOwnerInterviews();

  return (
    <DashboardContent>
      <PageHeader
        eyebrow="Pipeline"
        title="Interviews"
        description="Create JD-based AI interviews, share candidate links, and review scored reports."
        actions={<CreateInterviewButton />}
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8" />
        </div>
      ) : interviews.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-5 w-5" />}
          title="No interviews yet"
          description="Create your first interview from a job description. The AI will generate questions and an invite link for the candidate."
          action={
            <CreateInterviewButton>Create interview</CreateInterviewButton>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
          {interviews.map((interview) => (
            <InterviewCard
              key={interview.id}
              interview={interview}
              onDelete={removeInterview}
            />
          ))}
        </div>
      )}
    </DashboardContent>
  );
}
