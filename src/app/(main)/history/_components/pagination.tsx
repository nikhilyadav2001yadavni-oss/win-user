import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PaginationProps = {
  page: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

export function Pagination({
  page,
  totalPages,
  totalCount,
  limit,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-1">
      {/* Left side */}
      <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
        {totalCount} row(s) total.
      </div>

      <div className="flex w-full items-center gap-8 lg:w-fit">

        {/* Rows per page */}
        <div className="hidden items-center gap-2 lg:flex">
          <Label
            htmlFor="rows-per-page"
            className="text-sm font-medium"
          >
            Rows per page
          </Label>

          <Select
            value={`${limit}`}
            onValueChange={(value) => {
              onLimitChange(Number(value));
            }}
          >
            <SelectTrigger
              size="sm"
              className="w-20"
              id="rows-per-page"
            >
              <SelectValue placeholder={limit} />
            </SelectTrigger>

            <SelectContent side="top">
              <SelectGroup>
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem
                    key={pageSize}
                    value={`${pageSize}`}
                  >
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Page information */}
        <div className="flex w-fit items-center justify-center text-sm font-medium">
          Page {page} of {totalPages}
        </div>

        {/* Navigation */}
        <div className="ml-auto flex items-center gap-2 lg:ml-0">

          {/* First */}
          <Button
            variant="outline"
            className="hidden size-8 lg:flex"
            size="icon"
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
          >
            <span className="sr-only">
              Go to first page
            </span>

            <ChevronsLeft className="size-4" />
          </Button>

          {/* Previous */}
          <Button
            variant="outline"
            className="size-8"
            size="icon"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <span className="sr-only">
              Go to previous page
            </span>

            <ChevronLeft className="size-4" />
          </Button>

          {/* Next */}
          <Button
            variant="outline"
            className="size-8"
            size="icon"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            <span className="sr-only">
              Go to next page
            </span>

            <ChevronRight className="size-4" />
          </Button>

          {/* Last */}
          <Button
            variant="outline"
            className="hidden size-8 lg:flex"
            size="icon"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
          >
            <span className="sr-only">
              Go to last page
            </span>

            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
