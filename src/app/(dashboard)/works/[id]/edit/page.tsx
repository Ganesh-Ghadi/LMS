"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { apiGet } from "@/lib/api-client";
import { WorkForm, WorkFormInitialData } from "../../work-form";
import { Work } from "@/types/works";
import { toast } from "@/lib/toast";

export default function EditWorkPage() {
  const params = useParams();
  const id = params.id as string;

  const {
    data: work,
    error,
    isLoading,
    mutate,
  } = useSWR<Work>(id ? `/api/works/${id}` : null, apiGet);

  const initialData = useMemo<WorkFormInitialData | null>(() => {
    if (!work) return null;
    return {
      id: work.id,
      workName: work.workName,
      rate: work.rate,
    };
  }, [work]);

  if (error) {
    toast.error((error as Error).message || "Failed to load work");
    return (
      <div className="p-6">
        <div className="text-center text-muted-foreground">
          Failed to load work. Please try again.
        </div>
      </div>
    );
  }

  if (isLoading || (id && !work)) {
    return <div className="p-6">Loading...</div>;
  }

  return <WorkForm mode="edit" initial={initialData} mutate={mutate} />;
}
