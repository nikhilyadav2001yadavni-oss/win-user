import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { CalendarDays, Search, UsersRound } from "lucide-react";

type FiltersProps = {
  statusFilter: string;
  setStatusFilter: (statusFilter: string) => void;
  joinedDateFilter: string;
  setJoinedDateFilter: (joinedDateFilter: string) => void;
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
};
export const Filters = ({
  statusFilter,
  setStatusFilter,
  joinedDateFilter,
  setJoinedDateFilter,
  searchQuery,
  setSearchQuery,
}: FiltersProps) => {
    const statusOptions = [
      { value: "all", label: "All" },
      { value: "Subscribed", label: "Subscribed" },
      { value: "Inactive", label: "Inactive" },
      { value: "Unsubscribed", label: "Unsubscribed" },
    ] as const;
    const joinedDateOptions = [
      { value: "all", label: "All time" },
      { value: "30", label: "Last 30 days" },
      { value: "90", label: "Last 90 days" },
    ] as const;
    const sortOptions = [
      { value: "newest", label: "Newest first" },
      { value: "oldest", label: "Oldest first" },
      { value: "name-asc", label: "Name A-Z" },
      { value: "name-desc", label: "Name Z-A" },
    ] as const;
    return (
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full lg:w-80">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-7 rounded-[min(var(--radius-md),12px)] pl-8"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
              }}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <UsersRound />
                Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-35" align="start">
              <DropdownMenuRadioGroup
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                }}
              >
                {statusOptions.map((status) => (
                  <DropdownMenuRadioItem key={status.value} value={status.value}>
                    {status.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarDays />
                Joined date
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40" align="start">
              <DropdownMenuRadioGroup
                value={joinedDateFilter}
                onValueChange={(value) => {
                  setJoinedDateFilter(value);
                }}
              >
                {joinedDateOptions.map((option) => (
                  <DropdownMenuRadioItem key={option.value} value={option.value}>
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center xl:w-auto">
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <CreditCard />
                Billing
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={billingFilter}
                onValueChange={(value) => {
                  table.getColumn("billing")?.setFilterValue(value === "all" ? undefined : value);
                  table.setPageIndex(0);
                }}
              >
                {billingOptions.map((billing) => (
                  <DropdownMenuRadioItem key={billing.value} value={billing.value}>
                    {billing.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowUpDown />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={sortValue}
                onValueChange={(value) => {
                  table.setSorting(sortOptionState[value as keyof typeof sortOptionState] ?? sortOptionState.newest);
                  table.setPageIndex(0);
                }}
              >
                {sortOptions.map((option) => (
                  <DropdownMenuRadioItem key={option.value} value={option.value}>
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </div>
      </div>
    )
}