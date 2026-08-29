"use client";
import { BadgeCheck, Ellipsis, Eye, Mail, Pencil, UserRoundX } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { ProfileRecord } from "./profile-data";
import { useAppSelector } from "@/lib/hooks";
import { EditProfileDialog } from "./edit-profile";
import { useState } from "react";


export function ProfileHeader() {
  const user = useAppSelector(
    (state) => state.user.user
  );
  const [open, setOpen] = useState(false);
  const fname = user?.name?.split(" ")[0];
  const lname = user?.name?.split(" ")[1];
  return (
    <div className="flex flex-col gap-5 px-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <div className="grid size-18 shrink-0 place-items-center sm:size-23">
          <span className="sr-only">Profile 92% complete</span>
          <svg aria-hidden="true" className="col-start-1 row-start-1 size-full -rotate-90" viewBox="0 0 100 100">
            <circle
              className="fill-none stroke-green-500 dark:stroke-green-600"
              cx="50"
              cy="50"
              pathLength="100"
              r="46"
              strokeDasharray="92 100"
              strokeLinecap="round"
              strokeWidth="2.5"
            />
          </svg>
          <Avatar className="col-start-1 row-start-1 size-16 after:border-0 sm:size-20">
            <AvatarImage alt={user?.name} src={user?.profilepicture} />
            <AvatarFallback>{fname?.charAt(0) || ""} {lname?.charAt(0) || ""}</AvatarFallback>
          </Avatar>
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-col gap-0.5">
            <h1 className="truncate font-heading font-semibold text-xl leading-6 tracking-tight sm:text-2xl sm:leading-7">
              {user?.name}
            </h1>
            <p className="truncate text-muted-foreground text-sm leading-5">
              {user?.email}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {user?.isVerified ? (
            <Badge className="rounded-sm bg-green-600 text-white" variant="default">
              <BadgeCheck data-icon="inline-start" />
              Verified
            </Badge>
            ) : (
            <Badge className="rounded-sm bg-red-600 text-white" variant="default">
              <BadgeCheck data-icon="inline-start" />
              Not verified
            </Badge>
            )}
            {/* <Badge className="rounded-sm" variant="outline">
              {profile.employmentType}
            </Badge>
            <Badge className="rounded-sm" variant="outline">
              {profile.workplace}
            </Badge>
            <Badge className="rounded-sm" variant="outline">
              {profile.timeZone}
            </Badge> */}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* <Button size="sm" asChild variant="outline">
          <a href={`mailto:${user?.email}`}>
            <Mail data-icon="inline-start" />
            Email
          </a>
        </Button> */}
        <Button size="sm" onClick={() => setOpen(true)}>
          <Pencil data-icon="inline-start" />
          Edit profile
        </Button>
        <EditProfileDialog open={open} setOpen={setOpen} />
      </div>
    </div>
  );
}
