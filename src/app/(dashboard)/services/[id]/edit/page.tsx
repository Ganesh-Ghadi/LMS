"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { apiGet } from "@/lib/api-client";
import { ServiceForm, ServiceFormInitialData } from "../../service-form";
import { Service } from "@/types/services";
import { toast } from "@/lib/toast";

export default function EditServicePage() {
  const params = useParams();
  const id = params.id as string;

  const {
    data: service,
    error,
    isLoading,
    mutate,
  } = useSWR<Service>(id ? `/api/services/${id}` : null, apiGet);

  const initialData = useMemo<ServiceFormInitialData | null>(() => {
    if (!service) return null;
    return {
      id: service.id,
      serviceName: service.serviceName,
      rate: service.rate,
    };
  }, [service]);

  if (error) {
    toast.error((error as Error).message || "Failed to load service");
    return (
      <div className="p-6">
        <div className="text-center text-muted-foreground">
          Failed to load service. Please try again.
        </div>
      </div>
    );
  }

  if (isLoading || (id && !service)) {
    return <div className="p-6">Loading...</div>;
  }

  return <ServiceForm mode="edit" initial={initialData} mutate={mutate} />;
}
