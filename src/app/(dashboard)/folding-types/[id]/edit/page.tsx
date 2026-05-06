"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { apiGet } from "@/lib/api-client";
import { FoldingTypeForm, FoldingTypeFormInitialData } from "../../folding-type-form";
import { FoldingType } from "@/types/folding-types";
import { toast } from "@/lib/toast";

export default function EditFoldingTypePage() {
  const params = useParams();
  const id = params.id as string;

  const {
    data: foldingType,
    error,
    isLoading,
    mutate,
  } = useSWR<FoldingType>(id ? `/api/folding-types/${id}` : null, apiGet);

  const initialData = useMemo<FoldingTypeFormInitialData | null>(() => {
    if (!foldingType) return null;
    return {
      id: foldingType.id,
      foldingTypeName: foldingType.foldingTypeName,
      price: foldingType.price,
    };
  }, [foldingType]);

  if (error) {
    toast.error((error as Error).message || "Failed to load folding type");
    return (
      <div className="p-6">
        <div className="text-center text-muted-foreground">
          Failed to load folding type. Please try again.
        </div>
      </div>
    );
  }

  if (isLoading || (id && !foldingType)) {
    return <div className="p-6">Loading...</div>;
  }

  return <FoldingTypeForm mode="edit" initial={initialData} mutate={mutate} />;
}
