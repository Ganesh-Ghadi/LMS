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
import { apiPost, apiPatch, apiGet } from "@/lib/api-client";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { CreateAreaData, UpdateAreaData } from "@/types/areas";
import { City } from "@/types/cities";
import { AppSelect } from "@/components/common/app-select";
import useSWR from "swr";

export interface AreaFormInitialData {
  id?: number;
  name?: string;
  cityId: number;
}

export interface AreaFormProps {
  mode: "create" | "edit";
  initial?: AreaFormInitialData | null;
  onSuccess?: (result?: unknown) => void;
  redirectOnSuccess?: string;
  mutate?: () => Promise<any>;
}

export function AreaForm({
  mode,
  initial,
  onSuccess,
  redirectOnSuccess = "/areas",
  mutate,
}: AreaFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { backWithScrollRestore } = useScrollRestoration("areas-list");

  const schema = z.object({
    name: z.string().min(1, "Area name is required"),
    cityId: z
      .number({
        required_error: "City is required",
        invalid_type_error: "Please select a city",
      })
      .min(1, "City is required"),
  });

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      name: initial?.name ?? "",
      cityId: initial?.cityId,
    },
  });

  const { control, handleSubmit } = form;
  const cityIdValue = form.watch("cityId");
  const isCreate = mode === "create";

  // Fetch cities for dropdown
  const { data: citiesData } = useSWR<{ data: City[] }>(
    "/api/cities?perPage=100",
    apiGet
  );

  const onSubmit = async (formData: FormValues) => {
    setSubmitting(true);
    try {
      let res;
      if (mode === "create") {
        const payload: CreateAreaData = {
          name: formData.name,
          cityId: formData.cityId,
        };
        res = await apiPost("/api/areas", payload);
        toast.success("Area created successfully");
        onSuccess?.(res);
      } else if (mode === "edit" && initial?.id) {
        const payload: UpdateAreaData = {
          name: formData.name,
          cityId: formData.cityId,
        };
        res = await apiPatch(`/api/areas/${initial.id}`, payload);
        toast.success("Area updated successfully");
        onSuccess?.(res);
      }

      if (mutate) {
        await mutate();
      }

      router.push(redirectOnSuccess);
    } catch (err) {
      toast.error((err as Error).message || "Failed to save area");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <AppCard>
        <AppCard.Header>
          <AppCard.Title>
            {isCreate ? "Create Area" : "Edit Area"}
          </AppCard.Title>
          <AppCard.Description>
            {isCreate
              ? "Add a new area to the master data."
              : "Update area information."}
          </AppCard.Description>
        </AppCard.Header>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <AppCard.Content>
            <FormSection legend="Area Information">
              <FormRow cols={2} from="md">
                <TextInput
                  control={control}
                  name="name"
                  label="Area Name"
                  placeholder="Enter area name"
                  required
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium">City</label>
                  <AppSelect
                    value={cityIdValue ? String(cityIdValue) : "__none"}
                    onValueChange={(value) => {
                      const numValue = parseInt(value);
                      form.setValue("cityId", numValue, {
                        shouldValidate: true,
                      });
                    }}
                    placeholder="Select city"
                  >
                    <AppSelect.Item value="__none">No City</AppSelect.Item>
                    {citiesData?.data?.map((city: City) => (
                      <AppSelect.Item key={city.id} value={String(city.id)}>
                        {city.city}
                      </AppSelect.Item>
                    ))}
                  </AppSelect>
                </div>
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
              {isCreate ? "Create Area" : "Save Changes"}
            </AppButton>
          </AppCard.Footer>
        </form>
      </AppCard>
    </Form>
  );
}

export default AreaForm;
