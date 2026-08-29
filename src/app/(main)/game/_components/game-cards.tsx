"use client";

import type { LucideIcon } from "lucide-react";
import {
  ChevronRightIcon,
  DicesIcon,
  EllipsisIcon,
} from "lucide-react";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

type BadgeColor = "blue" | "red" | "green" | "yellow";

type GameProps = {
  name: string;
  icon: LucideIcon;
  description: string;
  level: string;
  badge: string;
  badgeColor: BadgeColor;
  slug: string;
  isActive: boolean;
};

const badgeColors: Record<BadgeColor, string> = {
  blue: "bg-blue-300 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  red: "bg-red-300 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  green: "bg-green-300 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  yellow: "bg-yellow-300 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
};

const games: GameProps[] = [
  {
    name: "Color Changer",
    icon: EllipsisIcon,
    description:
      "Select a color (RED, GREEN or BLUE) and place your bet. Win 2x bet amount!",
    level: "Beginner",
    badge: "2x Multiplier",
    badgeColor: "blue",
    slug: "color-changer",
    isActive: true,
  },
  {
    name: "Dice Roll",
    icon: DicesIcon,
    description:
      "Roll the dice and predict the outcome. Win 2x bet amount!",
    level: "Beginner",
    badge: "2x Multiplier",
    badgeColor: "red",
    slug: "dice-roll",
    isActive: true,
  },
];

export function GameCards() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      {games.map((game) => (
        <GameCard game={game} key={game.name} />
      ))}
    </div>
  );
}

const GameCard = ({
  game: {
    name,
    icon: Icon,
    description,
    level,
    badge,
    badgeColor,
    slug,
    isActive,
  },
}: {
  game: GameProps;
}) => {
  const router = useRouter();
  const handleGameClick = () => {
    if (!isActive) return;

    router.push(`/game/${slug}`);
  };
  return (
    <Item
      variant="outline"
      className={` ${isActive ? "cursor-pointer" : "grayscale bg-gray-800"}`}
      data-active={isActive}
      onClick={handleGameClick}
    >
      <ItemMedia variant="icon">
        <div className="rounded-lg bg-primary/10 p-1.5 dark:bg-primary/20">
          <Icon className="size-5" />
        </div>
      </ItemMedia>

      <ItemContent>
        <ItemTitle className="text-lg">{name}</ItemTitle>

        <ItemDescription className="line-clamp-3">
          {description}
        </ItemDescription>

        <div className="flex items-center gap-2">
          <Badge
            className={`text-xs font-semibold ${badgeColors[badgeColor]}`}
          >
            {badge}
          </Badge>

          <span className="h-1 w-1 rounded-full bg-primary" />

          <span className="text-xs text-muted-foreground">
            {level}
          </span>
        </div>
      </ItemContent>

      <ItemActions>
        <ChevronRightIcon className="size-4" />
      </ItemActions>
    </Item>
  );
};
