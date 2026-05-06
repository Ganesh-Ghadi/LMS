"use client";

import { FoldingTypeForm } from "../folding-type-form";

export default function NewFoldingTypePage() {
  return (
    <div className="container mx-auto py-6">
      <FoldingTypeForm mode="create" />
    </div>
  );
}
