"use client";

import { useState } from "react";
import { Coins, Dices } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const COLORS = [
  {
    name: "Red",
    value: "#ef4444",
    className: "bg-red-500 hover:bg-red-600",
  },
  {
    name: "Green",
    value: "#22c55e",
    className: "bg-green-500 hover:bg-green-600",
  },
  {
    name: "Blue",
    value: "#3b82f6",
    className: "bg-blue-500 hover:bg-blue-600",
  },
] as const;

const betAmounts = [1, 5, 10, 15, 20, 25];

type ColorName = (typeof COLORS)[number]["name"];

type BetHistory = {
  id: number;
  selectedColor: ColorName;
  winningColor: ColorName;
  amount: number;
  won: boolean;
};

export const ColorChanger = () => {
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState<number | "">("");
  const [selectedColor, setSelectedColor] = useState<ColorName | "">("");
  const [result, setResult] = useState<ColorName | null>(null);
  const [message, setMessage] = useState(
    "Choose a color and place your bet."
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [history, setHistory] = useState<BetHistory[]>([]);

  const playGame = () => {
    const amount = Number(bet);

    if (!selectedColor) {
      setMessage("Please select a color.");
      return;
    }

    if (!amount || amount <= 0) {
      setMessage("Please select a valid bet.");
      return;
    }

    if (amount > balance) {
      setMessage("You don't have enough coins.");
      return;
    }

    setIsPlaying(true);
    setResult(null);

    setTimeout(() => {
      const winningColor =
        COLORS[Math.floor(Math.random() * COLORS.length)].name;

      const won = selectedColor === winningColor;

      setResult(winningColor);

      if (won) {
        setBalance((prev) => prev + amount);

        setMessage(
          `🎉 You won! ${winningColor} wins. You earned ${
            amount * 2
          } coins!`
        );
      } else {
        setBalance((prev) => prev - amount);

        setMessage(
          `❌ You lost! ${winningColor} wins. Better luck next time!`
        );
      }

      setHistory((prev) => [
        {
          id: Date.now(),
          selectedColor,
          winningColor,
          amount,
          won,
        },
        ...prev,
      ].slice(0, 10));

      setIsPlaying(false);
    }, 800);
  };

  const selectedColorData = COLORS.find(
    (color) => color.name === selectedColor
  );

  const resultColorData = COLORS.find(
    (color) => color.name === result
  );

  const isWin =
    result !== null &&
    selectedColor !== "" &&
    result === selectedColor;

  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_520px]">
      {/* Game Card */}
      <Card className="overflow-hidden">
        {/* <CardHeader className="border-b bg-muted/20 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                🎨 Color Bet
              </CardTitle>

              <p className="mt-1 text-xs text-muted-foreground">
                Pick a color and win 2× your bet.
              </p>
            </div>

            <Badge
              variant="secondary"
              className="flex items-center gap-1 px-2.5 py-1"
            >
              <Coins className="size-3.5" />
              {balance}
            </Badge>
          </div>
        </CardHeader> */}

        <CardContent className="space-y-4 p-5">
          {/* Balance */}
          <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-4 py-3">
            <span className="text-xs text-muted-foreground">
              Available Balance
            </span>

            <div className="flex items-center gap-1.5 text-lg font-bold">
              <Coins className="size-4 text-yellow-500" />
              {balance}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label className="text-sm">Select a Color</Label>

            <div className="grid grid-cols-3 gap-2">
              {COLORS.map((color) => {
                const isSelected = selectedColor === color.name;

                return (
                  <button
                    key={color.name}
                    type="button"
                    disabled={isPlaying}
                    onClick={() => {
                      setSelectedColor(color.name);
                      setResult(null);
                      setMessage(`You selected ${color.name}.`);
                    }}
                    className={`
                      relative flex h-16 items-center justify-center
                      rounded-lg text-sm font-semibold text-white
                      transition-all
                      ${color.className}
                      ${
                        isSelected
                          ? "scale-[1.02] ring-2 ring-primary ring-offset-2"
                          : "opacity-80 hover:opacity-100"
                      }
                      disabled:cursor-not-allowed disabled:opacity-50
                    `}
                  >
                    {color.name}

                    {isSelected && (
                      <span className="absolute right-1.5 top-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[9px]">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bet */}
          <div className="space-y-2">
            <Label className="text-sm">Your Bet</Label>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {betAmounts.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant={bet === amount ? "default" : "outline"}
                  className="h-9 px-2 text-sm font-bold"
                  disabled={isPlaying || amount > balance}
                  onClick={() => setBet(amount)}
                >
                  {amount}
                </Button>
              ))}
            </div>

            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Min: 1</span>
              <span>Max: {balance}</span>
            </div>
          </div>

          {/* Play */}
          <Button
            type="button"
            size="default"
            className="w-full"
            disabled={isPlaying || !selectedColor || !bet}
            onClick={playGame}
          >
            <Dices className="mr-2 size-4" />
            {isPlaying ? "Rolling..." : "Place Bet"}
          </Button>

          {/* Result */}
          {result && resultColorData && (
            <div
              className={`
                rounded-lg border-2 p-4 text-center
                ${isWin ? "bg-green-500/10" : "bg-red-500/10"}
              `}
              style={{
                borderColor: resultColorData.value,
              }}
            >
              <p className="text-xs text-muted-foreground">
                Winning Color
              </p>

              <p
                className="mt-1 text-2xl font-bold"
                style={{
                  color: resultColorData.value,
                }}
              >
                {result}
              </p>

              <p
                className={`mt-1 text-xs font-medium ${
                  isWin ? "text-green-600" : "text-red-600"
                }`}
              >
                {isWin ? "🎉 You Won!" : "❌ You Lost!"}
              </p>
            </div>
          )}

          {/* Message */}
          <div className="rounded-lg bg-muted/50 p-3 text-center text-xs">
            {message}
          </div>
        </CardContent>
      </Card>

      {/* Recent Bets */}
      <Card className="h-fit overflow-hidden">
        <CardHeader className="border-b bg-muted/20 px-4 py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Bets</CardTitle>

            <Badge variant="outline" className="text-[10px]">
              {history.length}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-3">
          {history.length === 0 ? (
            <div className="flex min-h-[180px] items-center justify-center text-center text-xs text-muted-foreground">
              No bets yet.
              <br />
              Your recent bets will appear here.
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item) => {
                const selected = COLORS.find(
                  (color) => color.name === item.selectedColor
                );

                const winning = COLORS.find(
                  (color) => color.name === item.winningColor
                );

                return (
                  <div
                    key={item.id}
                    className="rounded-lg border p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-3 rounded-full"
                          style={{
                            backgroundColor: selected?.value,
                          }}
                        />

                        <span className="text-sm font-medium">
                          {item.selectedColor}
                        </span>
                      </div>

                      <span
                        className={`text-xs font-semibold ${
                          item.won
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {item.won ? "WIN" : "LOSS"}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Bet: {item.amount}</span>

                      <span className="flex items-center gap-1">
                        Win:
                        <span
                          className="font-medium"
                          style={{
                            color: winning?.value,
                          }}
                        >
                          {item.winningColor}
                        </span>
                      </span>
                    </div>

                    <div className="mt-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {item.won
                          ? `+${item.amount}`
                          : `-${item.amount}`}
                      </span>

                      <span className="font-medium">
                        {item.won
                          ? `+${item.amount * 2}`
                          : "0"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// "use client";

// import { useState } from "react";
// import { Coins, Dices, RotateCcw } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";

// const COLORS = [
//   {
//     name: "Red",
//     value: "#ef4444",
//     className: "bg-red-500 hover:bg-red-600",
//   },
//   {
//     name: "Green",
//     value: "#22c55e",
//     className: "bg-green-500 hover:bg-green-600",
//   },
//   {
//     name: "Blue",
//     value: "#3b82f6",
//     className: "bg-blue-500 hover:bg-blue-600",
//   },
// ] as const;
// const betAmount = [1,5,10,15,20,25];
// type ColorName = (typeof COLORS)[number]["name"];

// export const ColorChanger = () => {
//   const [balance, setBalance] = useState(1000);
//   const [bet, setBet] = useState("");
//   const [selectedColor, setSelectedColor] = useState<ColorName | "">("");
//   const [result, setResult] = useState<ColorName | null>(null);
//   const [message, setMessage] = useState(
//     "Choose a color and place your bet."
//   );
//   const [isPlaying, setIsPlaying] = useState(false);

//   const playGame = () => {
//     const amount = Number(bet);

//     if (!selectedColor) {
//       setMessage("Please select a color.");
//       return;
//     }

//     if (!amount || amount <= 0) {
//       setMessage("Please enter a valid bet.");
//       return;
//     }

//     if (amount > balance) {
//       setMessage("You don't have enough coins.");
//       return;
//     }

//     setIsPlaying(true);
//     setResult(null);

//     // Simulate game result
//     setTimeout(() => {
//       const winningColor =
//         COLORS[Math.floor(Math.random() * COLORS.length)].name;

//       setResult(winningColor);

//       if (selectedColor === winningColor) {
//         // Profit = 1x bet
//         // Total returned = 2x bet
//         setBalance((prev) => prev + amount);

//         setMessage(
//           `🎉 You won! ${winningColor} wins. You earned ${amount * 2} coins!`
//         );
//       } else {
//         setBalance((prev) => prev - amount);

//         setMessage(
//           `❌ You lost! ${winningColor} wins. Better luck next time!`
//         );
//       }

//       setIsPlaying(false);
//     }, 800);
//   };

//   const resetGame = () => {
//     setBalance(1000);
//     setBet("");
//     setSelectedColor("");
//     setResult(null);
//     setMessage("Choose a color and place your bet.");
//     setIsPlaying(false);
//   };

//   const selectedColorData = COLORS.find(
//     (color) => color.name === selectedColor
//   );

//   const resultColorData = COLORS.find(
//     (color) => color.name === result
//   );

//   const isWin =
//     result !== null &&
//     selectedColor !== "" &&
//     result === selectedColor;

//   return (
//     <div className="mx-auto w-full max-w-xl">
//       <Card className="overflow-hidden">
//         <CardHeader className="border-b bg-muted/20">
//           <div className="flex items-center justify-between gap-4">
//             <div>
//               <CardTitle className="flex items-center gap-2 text-xl">
//                 🎨 Color Bet
//               </CardTitle>

//               <p className="mt-1 text-sm text-muted-foreground">
//                 Pick a color. If it wins, you get 2× your bet.
//               </p>
//             </div>

//             <Badge
//               variant="secondary"
//               className="flex items-center gap-1 px-3 py-1.5"
//             >
//               <Coins className="size-4" />
//               {balance}
//             </Badge>
//           </div>
//         </CardHeader>

//         <CardContent className="space-y-6 p-6">
//           {/* Balance */}
//           <div className="rounded-xl border bg-muted/20 p-4">
//             <div className="text-sm text-muted-foreground">
//               Available Balance
//             </div>

//             <div className="mt-1 flex items-center gap-2 text-2xl font-bold">
//               <Coins className="size-6 text-yellow-500" />
//               {balance}
//             </div>
//           </div>

//           {/* Color Selection */}
//           <div className="space-y-3">
//             <Label>Select a Color</Label>

//             <div className="grid grid-cols-3 gap-3">
//               {COLORS.map((color) => {
//                 const isSelected = selectedColor === color.name;

//                 return (
//                   <button
//                     key={color.name}
//                     type="button"
//                     disabled={isPlaying}
//                     onClick={() => {
//                       setSelectedColor(color.name);
//                       setResult(null);
//                       setMessage(`You selected ${color.name}.`);
//                     }}
//                     className={`
//                       relative flex h-24 items-center justify-center
//                       rounded-xl font-semibold text-white
//                       transition-all
//                       ${color.className}
//                       ${
//                         isSelected
//                           ? "scale-[1.02] ring-4 ring-primary ring-offset-2"
//                           : "opacity-80 hover:opacity-100"
//                       }
//                       disabled:cursor-not-allowed disabled:opacity-50
//                     `}
//                   >
//                     {color.name}

//                     {isSelected && (
//                       <span className="absolute right-2 top-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
//                         Selected
//                       </span>
//                     )}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Bet */}
//           <div className="space-y-2">
//             <Label htmlFor="bet">Your Bet</Label>
//               <div className="flex flex-wrap justify-between gap-2">
//                 {betAmount.map((amount: number) => {
//                     return (
//                         <Button
//                           key={amount}
//                           type="button"
//                           variant="outline"
//                           className="h-12 text-lg font-bold"
//                           disabled={isPlaying}
//                           onClick={() => {
//                             setBet(amount!);
//                           }}
//                         >
//                           ${amount}
//                         </Button>
//                     )
//                 })}
//               </div>

//             <div className="flex justify-between text-xs text-muted-foreground">
//               <span>Min: 1</span>
//               <span>Max: {balance}</span>
//             </div>
//           </div>

//           {/* Play */}
//           <Button
//             type="button"
//             size="lg"
//             className="w-full"
//             disabled={isPlaying || !selectedColor || !bet}
//             onClick={playGame}
//           >
//             <Dices className="mr-2 size-5" />

//             {isPlaying ? "Rolling..." : "Place Bet"}
//           </Button>

//           {/* Result */}
//           {result && resultColorData && (
//             <div
//               className={`
//                 rounded-xl border-2 p-6 text-center
//                 ${isWin ? "bg-green-500/10" : "bg-red-500/10"}
//               `}
//               style={{
//                 borderColor: resultColorData.value,
//               }}
//             >
//               <p className="text-sm text-muted-foreground">
//                 Winning Color
//               </p>

//               <p
//                 className="mt-2 text-3xl font-bold"
//                 style={{
//                   color: resultColorData.value,
//                 }}
//               >
//                 {result}
//               </p>

//               <p
//                 className={`mt-2 text-sm font-medium ${
//                   isWin ? "text-green-600" : "text-red-600"
//                 }`}
//               >
//                 {isWin ? "🎉 You Won!" : "❌ You Lost!"}
//               </p>
//             </div>
//           )}

//           {/* Message */}
//           <div className="rounded-lg bg-muted/50 p-4 text-center text-sm">
//             {message}
//           </div>

//           {/* Reset */}
//           <Button
//             type="button"
//             variant="outline"
//             className="w-full"
//             disabled={isPlaying}
//             onClick={resetGame}
//           >
//             <RotateCcw className="mr-2 size-4" />
//             Reset Game
//           </Button>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };
