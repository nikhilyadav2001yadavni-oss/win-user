"use client";
import { LockKeyhole } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { useAppSelector } from "@/lib/hooks";

export function PersonalDetails() {
  const profile = useAppSelector(
    (state) => state.user.user
  );
  const fname = profile?.name?.split(" ")[0];
  const lname = profile?.name?.split(" ")[1];
  const formattedDob = profile?.dob
  ? new Date(profile.dob).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  : "";
  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h2 className="font-heading font-medium text-base">Personal information</h2>
          <Badge className="rounded-sm" variant="outline">
            <LockKeyhole data-icon="inline-start" />
            Private
          </Badge>
        </div>
        <dl className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3 xl:gap-12">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground text-xs">First name</dt>
              <dd className="text-sm">{fname || "--"}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground text-xs">Date of birth</dt>
              <dd className="text-sm">{formattedDob || "--"}</dd>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground text-xs">Last name</dt>
              <dd className="text-sm">{lname || "--"}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground text-xs">Personal email</dt>
              <dd className="text-sm">{profile?.email || "--"}</dd>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground text-xs">Pronouns</dt>
              <dd className="text-sm">{profile?.name || "--"}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground text-xs">Work phone</dt>
              <dd className="text-sm">{profile?.phone || "--"}</dd>
            </div>
          </div>
        </dl>
      </div>

      <Separator className="my-4" />

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h2 className="font-heading font-medium text-base">Address</h2>
          <Badge className="rounded-sm" variant="outline">
            <LockKeyhole data-icon="inline-start" />
            Private
          </Badge>
        </div>
        <dl className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3 xl:gap-12">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground text-xs">Home address</dt>
              <dd className="text-sm">{profile?.address || "--"}</dd>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground text-xs">Country</dt>
              <dd className="text-sm">{profile?.country || "--"}</dd>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground text-xs">City</dt>
              <dd className="text-sm">{profile?.city || "--"}</dd>
            </div>
          </div>
        </dl>
      </div>
    </>
  );
}
