"use client";

import { LayerForm } from "../layer-form";

export default function NewLayerPage() {
  return (
    <div className="container mx-auto py-6">
      <LayerForm mode="create" />
    </div>
  );
}
