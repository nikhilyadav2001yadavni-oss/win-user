"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useAppSelector } from "@/lib/hooks";
import { apiFetch } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";

type EditProfileProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const formSchema = z.object({
  fname: z
    .string()
    .min(2, "First name must be at least 2 characters.")
    .max(50, "First name is too long."),

  lname: z
    .string()
    .min(2, "Last name must be at least 2 characters.")
    .max(50, "Last name is too long."),

  email: z
    .string()
    .email("Please enter a valid email address."),

  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be 10 digits."),

  dob: z
    .string()
    .min(1, "Date of birth is required."),

  country: z
    .string()
    .min(2, "Country is required."),

  city: z
    .string()
    .min(2, "City is required."),

  address: z
    .string()
    .min(5, "Address must be at least 5 characters.")
    .max(250, "Address is too long."),
});

type FormValues = z.infer<typeof formSchema>;

export const EditProfileDialog = ({
  open,
  setOpen,
}: EditProfileProps) => {
  const user = useAppSelector(
    (state) => state.user.user
  );

  const fname = user?.name?.split(" ")[0] || "";
  const lname =
    user?.name?.split(" ").slice(1).join(" ") || "";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fname,
      lname,
      email: user?.email || "",
      phone: user?.phone || "",
      dob: user?.dob
        ? new Date(user.dob).toISOString().split("T")[0]
        : "",
      country: user?.country || "",
      city: user?.city || "",
      address: user?.address || "",
    },
  });

  /*
   * Update form when user data becomes available
   * or changes in Redux.
   */
  React.useEffect(() => {
    if (!user) return;

    form.reset({
      fname: user.name?.split(" ")[0] || "",
      lname:
        user.name?.split(" ").slice(1).join(" ") || "",
      email: user.email || "",
      phone: user.phone || "",
      dob: user.dob
        ? new Date(user.dob).toISOString().split("T")[0]
        : "",
      country: user.country || "",
      city: user.city || "",
      address: user.address || "",
    });
  }, [user, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      const result = await apiFetch("/user/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: `${data.fname} ${data.lname}`.trim(),
          email: data.email,
          phone: data.phone,
          dob: data.dob,
          country: data.country,
          city: data.city,
          address: data.address,
        }),
      });

      toast.success(
        result?.message || "Profile updated successfully."
      );

      setOpen(false);
    } catch (error) {
      console.error("Profile update failed:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update profile."
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form
          id="edit-profile-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-2"
        >
          <FieldGroup>
            {/* First + Last Name */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="fname"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="profile-fname">
                      First Name
                    </FieldLabel>

                    <Input
                      {...field}
                      id="profile-fname"
                      placeholder="First name"
                      autoComplete="given-name"
                      aria-invalid={fieldState.invalid}
                    />

                    {fieldState.invalid && (
                      <FieldError
                        errors={[fieldState.error]}
                      />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="lname"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="profile-lname">
                      Last Name
                    </FieldLabel>

                    <Input
                      {...field}
                      id="profile-lname"
                      placeholder="Last name"
                      autoComplete="family-name"
                      aria-invalid={fieldState.invalid}
                    />

                    {fieldState.invalid && (
                      <FieldError
                        errors={[fieldState.error]}
                      />
                    )}
                  </Field>
                )}
              />
            </div>

            {/* Email + Phone */}
            <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="profile-email">
                      Email
                    </FieldLabel>

                    <Input
                      {...field}
                      id="profile-email"
                      type="email"
                      placeholder="Email address"
                      autoComplete="email"
                      readOnly
                      aria-invalid={fieldState.invalid}
                    />

                    {fieldState.invalid && (
                      <FieldError
                        errors={[fieldState.error]}
                      />
                    )}
                  </Field>
                )}
              />
            <div className="grid gap-4 sm:grid-cols-2">
              

              <Controller
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="profile-phone">
                      Phone
                    </FieldLabel>

                    <Input
                      {...field}
                      id="profile-phone"
                      type="tel"
                      placeholder="Phone number"
                      autoComplete="tel"
                      readOnly
                      aria-invalid={fieldState.invalid}
                    />

                    {fieldState.invalid && (
                      <FieldError
                        errors={[fieldState.error]}
                      />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="dob"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="profile-dob">
                      Date of Birth
                    </FieldLabel>

                    <Input
                      {...field}
                      id="profile-dob"
                      type="date"
                      aria-invalid={fieldState.invalid}
                    />

                    {fieldState.invalid && (
                      <FieldError
                        errors={[fieldState.error]}
                      />
                    )}
                  </Field>
                )}
              />
            </div>

            {/* DOB + Country */}
            <div className="grid gap-4 sm:grid-cols-2">
              

              <Controller
                name="country"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="profile-country">
                      Country
                    </FieldLabel>

                    <Input
                      {...field}
                      id="profile-country"
                      placeholder="Country"
                      autoComplete="country-name"
                      aria-invalid={fieldState.invalid}
                    />

                    {fieldState.invalid && (
                      <FieldError
                        errors={[fieldState.error]}
                      />
                    )}
                  </Field>
                )}
              />
            <Controller
              name="city"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="profile-city">
                    City
                  </FieldLabel>

                  <Input
                    {...field}
                    id="profile-city"
                    placeholder="City"
                    autoComplete="address-level2"
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />
            </div>

            {/* City */}

            {/* Address */}
            <Controller
              name="address"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="profile-address">
                    Address
                  </FieldLabel>

                  <Textarea
                    {...field}
                    id="profile-address"
                    placeholder="Enter your address"
                    autoComplete="street-address"
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
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
                  ? "Saving..."
                  : "Save Changes"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
};
