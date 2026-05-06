"use client";

import { ServiceForm } from "../service-form";

export default function NewServicePage() {
  return (
    <div className="container mx-auto py-6">
      <ServiceForm mode="create" />
    </div>
  );
}
