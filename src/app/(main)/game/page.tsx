import { GameCards } from "./_components/game-cards";
import { MainCard } from "./_components/main-card";

export default function Page() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
        <MainCard />
        <GameCards />
    </div>
  );
}