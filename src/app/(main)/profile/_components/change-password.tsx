"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";

const formSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required."),

    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters.")
      .max(100, "New password must be at most 100 characters.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and a number."
      ),

    confirmPassword: z
      .string()
      .min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export function ChangePassword() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const result = await apiFetch("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      toast.success(
        result?.message || "Password changed successfully."
      );

      form.reset();
    } catch (error) {
      console.error("Change password failed:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to change password."
      );
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading text-base font-medium">
          Change Password
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Update your password to keep your account secure.
        </p>
      </div>

      <form
        id="change-password-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-md"
      >
        <FieldGroup>
          {/* Current Password */}
          <Controller
            name="currentPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="current-password">
                  Current Password
                </FieldLabel>

                <Input
                  {...field}
                  id="current-password"
                  type="password"
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  aria-invalid={fieldState.invalid}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* New Password */}
          <Controller
            name="newPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="new-password">
                  New Password
                </FieldLabel>

                <Input
                  {...field}
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  aria-invalid={fieldState.invalid}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Confirm Password */}
          <Controller
            name="confirmPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="confirm-password">
                  Confirm New Password
                </FieldLabel>

                <Input
                  {...field}
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  aria-invalid={fieldState.invalid}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="flex justify-center gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={form.formState.isSubmitting}
            >
              Reset
            </Button>

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? "Changing..."
                : "Change Password"}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}
