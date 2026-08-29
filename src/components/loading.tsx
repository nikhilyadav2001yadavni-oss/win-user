"use client"

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { useAppSelector } from "@/lib/hooks";

export function Loading() {
    const isLoading = useAppSelector(
    (state) => state.loading.isLoading
  );

  if (!isLoading) return null;
  return (
    <Empty className="w-full fixed inset-0 z-50 flex items-center justify-center bg-background/90">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Spinner />
        </EmptyMedia>
        <EmptyTitle>Please wait</EmptyTitle>
      </EmptyHeader>
    </Empty>
  )
}
