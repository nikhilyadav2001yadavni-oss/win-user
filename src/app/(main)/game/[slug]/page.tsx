"use client";

import { useParams } from "next/navigation";
import { ColorChanger } from "../_components/color-changer";
import { DiceRoll } from "../_components/dice-roll";

const games = {
  "color-changer": ColorChanger,
  "dice-roll": DiceRoll,
} as const;

export default function GamePage() {
  const params = useParams();
  const slug = params.slug;

  const gameSlug = Array.isArray(slug) ? slug[0] : slug;

  const GameComponent =
    games[gameSlug as keyof typeof games];

  if (!GameComponent) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-muted-foreground">
          Game not found.
        </p>
      </div>
    );
  }

  return (
    <div>
      <GameComponent />
    </div>
  );
}
