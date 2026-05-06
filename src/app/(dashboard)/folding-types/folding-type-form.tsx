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

export interface FoldingTypeFormInitialData {
  id?: number;
  foldingTypeName?: string;
  price?: number;
}

export interface FoldingTypeFormProps {
  mode: "create" | "edit";
  initial?: FoldingTypeFormInitialData | null;
  onSuccess?: (result?: unknown) => void;
  redirectOnSuccess?: string;
  mutate?: () => Promise<any>;
}

export function FoldingTypeForm({
  mode,
  initial,
  onSuccess,
  redirectOnSuccess = "/folding-types",
  mutate,
}: FoldingTypeFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { backWithScrollRestore } = useScrollRestoration("folding-types-list");

  const schema = z.object({
    foldingTypeName: z.string().min(1, "Folding type name is required"),
    price: z.string()
      .min(1, "Price is required")
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Price must be a number greater than 0",
      }),
  });

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      foldingTypeName: initial?.foldingTypeName ?? "",
      price: initial?.price ? String(initial.price) : "",
    },
  });

  const { control, handleSubmit } = form;
  const isCreate = mode === "create";

  const onSubmit = async (formData: FormValues) => {
    setSubmitting(true);
    try {
      let res;
      const payload = {
        foldingTypeName: formData.foldingTypeName,
        price: Number(formData.price),
      };

      if (mode === "create") {
        res = await apiPost("/api/folding-types", payload);
        toast.success("Folding type created successfully");
        onSuccess?.(res);
      } else if (mode === "edit" && initial?.id) {
        res = await apiPatch(`/api/folding-types/${initial.id}`, payload);
        toast.success("Folding type updated successfully");
        onSuccess?.(res);
      }

      if (mutate) {
        await mutate();
      }

      router.push(redirectOnSuccess);
    } catch (err) {
      toast.error((err as Error).message || "Failed to save folding type");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePriceChange = (value: string) => {
    // Allow only numbers and up to 2 decimal places
    const regex = /^\d*\.?\d{0,2}$/;
    if (value === "" || regex.test(value)) {
      return value;
    }
    // Return current value from form if new value is invalid
    return form.getValues("price");
  };

  return (
    <Form {...form}>
      <AppCard>
        <AppCard.Header>
          <AppCard.Title>
            {isCreate ? "Create Folding Type" : "Edit Folding Type"}
          </AppCard.Title>
          <AppCard.Description>
            {isCreate
              ? "Add a new folding type to the master data."
              : "Update folding type information."}
          </AppCard.Description>
        </AppCard.Header>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <AppCard.Content>
            <FormSection legend="Folding Type Information">
              <FormRow cols={2} from="md">
                <TextInput
                  control={control}
                  name="foldingTypeName"
                  label="Folding Type Name"
                  placeholder="Enter folding type name"
                  required
                />
                <TextInput
                  control={control}
                  name="price"
                  label="Price"
                  placeholder="Enter price"
                  required
                  onValueChange={handlePriceChange}
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
              {isCreate ? "Create Folding Type" : "Save Changes"}
            </AppButton>
          </AppCard.Footer>
        </form>
      </AppCard>
    </Form>
  );
}

export default FoldingTypeForm;
