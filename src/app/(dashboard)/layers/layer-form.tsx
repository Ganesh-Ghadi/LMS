"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@/components/common";
import { AppCard } from "@/components/common/app-card";
import { TextInput } from "@/components/common/text-input";
import { FormSection, FormRow } from "@/components/common/app-form";
import { apiPost, apiPatch } from "@/lib/api-client";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";

export interface LayerFormInitialData {
  id?: number;
  name?: string;
  description?: string | null;
  ironingRate?: number | string;
  dryCleaningRate?: number | string;
}

export interface LayerFormProps {
  mode: "create" | "edit";
  initial?: LayerFormInitialData | null;
  onSuccess?: (result?: unknown) => void;
  redirectOnSuccess?: string;
  mutate?: () => Promise<any>;
}

export function LayerForm({
  mode,
  initial,
  onSuccess,
  redirectOnSuccess = "/layers",
  mutate,
}: LayerFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { backWithScrollRestore } = useScrollRestoration("layers-list");

  const schema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional().nullable(),
    ironingRate: z.string()
      .min(1, "Ironing rate is required")
      .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: "Ironing rate must be a number at least 0",
      }),
    dryCleaningRate: z.string()
      .min(1, "Dry cleaning rate is required")
      .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: "Dry cleaning rate must be a number at least 0",
      }),
  });

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      ironingRate: initial?.ironingRate ? String(initial.ironingRate) : "",
      dryCleaningRate: initial?.dryCleaningRate ? String(initial.dryCleaningRate) : "",
    },
  });

  const { control, handleSubmit } = form;
  const isCreate = mode === "create";

  const onSubmit = async (formData: FormValues) => {
    setSubmitting(true);
    try {
      let res;
      const payload = {
        name: formData.name,
        description: formData.description || null,
        ironingRate: Number(formData.ironingRate),
        dryCleaningRate: Number(formData.dryCleaningRate),
      };

      if (mode === "create") {
        res = await apiPost("/api/layers", payload);
        toast.success("Layer created successfully");
        onSuccess?.(res);
      } else if (mode === "edit" && initial?.id) {
        res = await apiPatch(`/api/layers/${initial.id}`, payload);
        toast.success("Layer updated successfully");
        onSuccess?.(res);
      }

      if (mutate) {
        await mutate();
      }

      router.push(redirectOnSuccess);
    } catch (err) {
      toast.error((err as Error).message || "Failed to save layer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNumericChange = (value: string) => {
    // Allow only numbers and up to 2 decimal places
    const regex = /^\d*\.?\d{0,2}$/;
    if (value === "" || regex.test(value)) {
      return value;
    }
    return null; // Return null to indicate invalid value
  };

  return (
    <Form {...form}>
      <AppCard>
        <AppCard.Header>
          <AppCard.Title>
            {isCreate ? "Create Layer" : "Edit Layer"}
          </AppCard.Title>
          <AppCard.Description>
            {isCreate
              ? "Add a new layer to the master data."
              : "Update layer information."}
          </AppCard.Description>
        </AppCard.Header>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <AppCard.Content>
            <FormSection legend="Layer Information">
              <FormRow cols={2}>
                <TextInput
                  control={control}
                  name="name"
                  label="Name"
                  placeholder="Enter layer name"
                  required
                />
                <TextInput
                  control={control}
                  name="description"
                  label="Description"
                  placeholder="Enter description (optional)"
                />
              </FormRow>
              <FormRow cols={2}>
                <TextInput
                  control={control}
                  name="ironingRate"
                  label="Ironing Rate"
                  placeholder="Enter ironing rate"
                  required
                  onValueChange={(val) => {
                    const result = handleNumericChange(val);
                    return result !== null ? result : form.getValues("ironingRate");
                  }}
                />
                <TextInput
                  control={control}
                  name="dryCleaningRate"
                  label="Dry Cleaning Rate"
                  placeholder="Enter dry cleaning rate"
                  required
                  onValueChange={(val) => {
                    const result = handleNumericChange(val);
                    return result !== null ? result : form.getValues("dryCleaningRate");
                  }}
                />
              </FormRow>
            </FormSection>
          </AppCard.Content>
          <AppCard.Footer className="justify-end">
            <AppButton
              type="button"
              variant="secondary"
              onClick={backWithScrollRestore}
              disabled={submitting}
              iconName="X"
            >
              Cancel
            </AppButton>
            <AppButton
              type="submit"
              iconName={isCreate ? "Plus" : "Save"}
              isLoading={submitting}
              disabled={submitting || !form.formState.isValid}
            >
              {isCreate ? "Create Layer" : "Save Changes"}
            </AppButton>
          </AppCard.Footer>
        </form>
      </AppCard>
    </Form>
  );
}

export default LayerForm;
