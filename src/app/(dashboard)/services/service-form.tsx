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

export interface ServiceFormInitialData {
  id?: number;
  serviceName?: string;
  rate?: number | string;
}

export interface ServiceFormProps {
  mode: "create" | "edit";
  initial?: ServiceFormInitialData | null;
  onSuccess?: (result?: unknown) => void;
  redirectOnSuccess?: string;
  mutate?: () => Promise<any>;
}

export function ServiceForm({
  mode,
  initial,
  onSuccess,
  redirectOnSuccess = "/services",
  mutate,
}: ServiceFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { backWithScrollRestore } = useScrollRestoration("services-list");

  const schema = z.object({
    serviceName: z.string().min(1, "Service name is required"),
    rate: z.string()
      .min(1, "Rate is required")
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Rate must be a number greater than 0",
      }),
  });

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      serviceName: initial?.serviceName ?? "",
      rate: initial?.rate ? String(initial.rate) : "",
    },
  });

  const { control, handleSubmit } = form;
  const isCreate = mode === "create";

  const onSubmit = async (formData: FormValues) => {
    setSubmitting(true);
    try {
      let res;
      const payload = {
        serviceName: formData.serviceName,
        rate: Number(formData.rate),
      };

      if (mode === "create") {
        res = await apiPost("/api/services", payload);
        toast.success("Service created successfully");
        onSuccess?.(res);
      } else if (mode === "edit" && initial?.id) {
        res = await apiPatch(`/api/services/${initial.id}`, payload);
        toast.success("Service updated successfully");
        onSuccess?.(res);
      }

      if (mutate) {
        await mutate();
      }

      router.push(redirectOnSuccess);
    } catch (err) {
      toast.error((err as Error).message || "Failed to save service");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRateChange = (value: string) => {
    // Allow only numbers and up to 2 decimal places
    const regex = /^\d*\.?\d{0,2}$/;
    if (value === "" || regex.test(value)) {
      return value;
    }
    // Return current value from form if new value is invalid
    return form.getValues("rate");
  };

  return (
    <Form {...form}>
      <AppCard>
        <AppCard.Header>
          <AppCard.Title>
            {isCreate ? "Create Service" : "Edit Service"}
          </AppCard.Title>
          <AppCard.Description>
            {isCreate
              ? "Add a new service to the master data."
              : "Update service information."}
          </AppCard.Description>
        </AppCard.Header>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <AppCard.Content>
            <FormSection legend="Service Information">
              <FormRow cols={2} from="md">
                <TextInput
                  control={control}
                  name="serviceName"
                  label="Service Name"
                  placeholder="Enter service name"
                  required
                />
                <TextInput
                  control={control}
                  name="rate"
                  label="Rate"
                  placeholder="Enter rate"
                  required
                  onValueChange={handleRateChange}
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
              {isCreate ? "Create Service" : "Save Changes"}
            </AppButton>
          </AppCard.Footer>
        </form>
      </AppCard>
    </Form>
  );
}

export default ServiceForm;
