"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { apiGet } from "@/lib/api-client";
import { LayerForm, LayerFormInitialData } from "../../layer-form";
import { Layer } from "@/types/layers";
import { toast } from "@/lib/toast";

export default function EditLayerPage() {
  const params = useParams();
  const id = params.id as string;

  const {
    data: layer,
    error,
    isLoading,
    mutate,
  } = useSWR<Layer>(id ? `/api/layers/${id}` : null, apiGet);

  const initialData = useMemo<LayerFormInitialData | null>(() => {
    if (!layer) return null;
    return {
      id: layer.id,
      name: layer.name,
      description: layer.description,
      ironingRate: layer.ironingRate,
      dryCleaningRate: layer.dryCleaningRate,
    };
  }, [layer]);

  if (error) {
    toast.error((error as Error).message || "Failed to load layer");
    return (
      <div className="p-6">
        <div className="text-center text-muted-foreground">
          Failed to load layer. Please try again.
        </div>
      </div>
    );
  }

  if (isLoading || (id && !layer)) {
    return <div className="p-6">Loading...</div>;
  }

  return <LayerForm mode="edit" initial={initialData} mutate={mutate} />;
}
