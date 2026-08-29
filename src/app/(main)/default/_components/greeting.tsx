"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { useAppSelector } from "@/lib/hooks";

export function Greeting() {
  const user = useAppSelector(
    (state) => state.user.user
  );

  const now = new Date();

  const hour = now.getHours();

  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 18
        ? "Good afternoon"
        : "Good evening";

  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="grid w-full items-start gap-4">
      <Alert>
        <AlertTitle className="text-lg">
          {greeting}, {user?.name || "User"}.
        </AlertTitle>

        <AlertDescription className="text-xs">
          Here’s your wallet pulse for {formattedDate}
        </AlertDescription>
      </Alert>
    </div>
  );
}
