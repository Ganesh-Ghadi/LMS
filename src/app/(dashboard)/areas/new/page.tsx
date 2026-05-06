"use client";

import { AreaForm } from "../area-form";

export default function NewAreaPage() {
  return (
    <div className="container mx-auto py-6">
      <AreaForm mode="create" />
    </div>
  );
}
