"use client";

import { WorkForm } from "../work-form";

export default function NewWorkPage() {
  return (
    <div className="container mx-auto py-6">
      <WorkForm mode="create" />
    </div>
  );
}
