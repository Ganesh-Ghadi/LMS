"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import { apiGet } from "@/lib/api-client";
import { AreaForm } from "../../area-form";
import { Area } from "@/types/areas";

export default function EditAreaPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: area, isLoading } = useSWR<Area>(
    id ? `/api/areas/${id}` : null,
    apiGet
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Loading area details...</div>
      </div>
    );
  }

  if (!area) {
    return (
      <div className="container mx-auto py-6 text-center">
        <h1 className="text-2xl font-bold text-destructive">Area not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <AreaForm 
        mode="edit" 
        initial={{
          id: area.id,
          name: area.name,
          cityId: area.cityId
        }} 
      />
    </div>
  );
}
