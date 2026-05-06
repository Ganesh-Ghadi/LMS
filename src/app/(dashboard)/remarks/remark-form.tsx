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

export interface RemarkFormInitialData {
  id?: number;
  remarkName?: string;
}

export interface RemarkFormProps {
  mode: "create" | "edit";
  initial?: RemarkFormInitialData | null;
  onSuccess?: (result?: unknown) => void;
  redirectOnSuccess?: string;
  mutate?: () => Promise<any>;
}

export function RemarkForm({
  mode,
  initial,
  onSuccess,
  redirectOnSuccess = "/remarks",
  mutate,
}: RemarkFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { backWithScrollRestore } = useScrollRestoration("remarks-list");

  const schema = z.object({
    remarkName: z.string().min(1, "Remark name is required"),
  });

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      remarkName: initial?.remarkName ?? "",
    },
  });

  const { control, handleSubmit } = form;
  const isCreate = mode === "create";

  const onSubmit = async (formData: FormValues) => {
    setSubmitting(true);
    try {
      let res;
      const payload = {
        remarkName: formData.remarkName,
      };

      if (mode === "create") {
        res = await apiPost("/api/remarks", payload);
        toast.success("Remark created successfully");
        onSuccess?.(res);
      } else if (mode === "edit" && initial?.id) {
        res = await apiPatch(`/api/remarks/${initial.id}`, payload);
        toast.success("Remark updated successfully");
        onSuccess?.(res);
      }

      if (mutate) {
        await mutate();
      }

      router.push(redirectOnSuccess);
    } catch (err) {
      toast.error((err as Error).message || "Failed to save remark");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <AppCard>
        <AppCard.Header>
          <AppCard.Title>
            {isCreate ? "Create Remark" : "Edit Remark"}
          </AppCard.Title>
          <AppCard.Description>
            {isCreate
              ? "Add a new remark to the master data."
              : "Update remark information."}
          </AppCard.Description>
        </AppCard.Header>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <AppCard.Content>
            <FormSection legend="Remark Information">
              <FormRow cols={2} from="md">
                <TextInput
                  control={control}
                  name="remarkName"
                  label="Remark Name"
                  placeholder="Enter remark name"
                  required
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
              {isCreate ? "Create Remark" : "Save Changes"}
            </AppButton>
          </AppCard.Footer>
        </form>
      </AppCard>
    </Form>
  );
}

export default RemarkForm;
