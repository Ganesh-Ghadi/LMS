"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { apiGet } from "@/lib/api-client";
import { toast } from "@/lib/toast";
import RemarkForm, {
  RemarkFormInitialData,
} from "@/app/(dashboard)/remarks/remark-form";
import { Remark } from "@/types/remarks";

export default function EditRemarkPage() {
  const params = useParams<{ id?: string }>();
  const id = params?.id;

  const {
    data: remark,
    error,
    isLoading,
    mutate,
  } = useSWR<Remark>(id ? `/api/remarks/${id}` : null, apiGet);

  const initialData = useMemo<RemarkFormInitialData | null>(() => {
    if (!remark) return null;
    return {
      id: remark.id,
      remarkName: remark.remarkName,
    };
  }, [remark]);

  if (error) {
    toast.error((error as Error).message || "Failed to load remark");
    return (
      <div className="p-6">
        <div className="text-center text-muted-foreground">
          Failed to load remark. Please try again.
        </div>
      </div>
    );
  }

  if (isLoading || (id && !remark)) {
    return <div className="p-6">Loading...</div>;
  }

  return <RemarkForm mode="edit" initial={initialData} mutate={mutate} />;
}
