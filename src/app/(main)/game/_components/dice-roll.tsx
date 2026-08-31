"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { apiFetch } from "@/lib/api";
import { useAppSelector } from "@/lib/hooks";

const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

const DICE_NUMBERS = [1, 2, 3, 4, 5, 6] as const;

const betAmounts = [1, 5, 10, 15, 20, 25];

type Prediction = (typeof DICE_NUMBERS)[number];

type BetType = "single" | "range";

type ApiBetType =
  | "SINGLE_NUMBERS"
  | "NUMBER_RANGE";

type DiceBetResponse = {
  success: boolean;
  message: string;
  data: {
    gameId: string;
    result: "WIN" | "LOSE";
    betType: ApiBetType;
    betAmount: number;
    userProfitLoss: number;
    gamingWalletBalance: number;
    selectedNumber: number | null;
    selectedRange:
      | {
          from: number;
          to: number;
        }
      | null;
    diceResult: Prediction;
  };
};

type DiceTransaction = {
  _id: string;
  userId: string;
  category: "GAME_WIN" | "GAME_LOSE";
  status: string;
  amount: number;
  currency: string;
  network: string;
  fee: number;
  netAmount: number;

  metadata: {
    gamingWalletAmount: number;
    gameId: string;
    notes: string;
  };

  createdAt: string;
  updatedAt: string;
  transactionId: string;

  gameType: "DICE_ROLL";

  userColor: null;
  winningColor: null;

  result: "WIN" | "LOSE";

  betType: ApiBetType;
  selectedNumber: number | null;

  selectedRange:
    | {
        from: number;
        to: number;
      }
    | null;

  diceResult: Prediction;
};

type DiceTransactionsResponse = {
  success: boolean;
  message: string;
  data: {
    transactions: DiceTransaction[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  };
};

const betTypes: {
  name: string;
  value: BetType;
}[] = [
  {
    name: "Single Numbers",
    value: "single",
  },
  {
    name: "Number Range",
    value: "range",
  },
];

export const DiceRoll = () => {
  const user = useAppSelector(
    (state) => state.user.user
  );

  const gamingWalletBalance =
    user?.wallet?.gamingWallet ?? 0;

  const [balance, setBalance] = useState(
    gamingWalletBalance
  );

  const [bet, setBet] = useState<number | "">("");

  const [prediction, setPrediction] =
    useState<Prediction | null>(null);

  const [rangeFrom, setRangeFrom] =
    useState<Prediction>(1);

  const [rangeTo, setRangeTo] =
    useState<Prediction>(6);

  const [dice, setDice] =
    useState<Prediction>(1);

  const [rolling, setRolling] =
    useState(false);

  const [betTypeValue, setBetTypeValue] =
    useState<BetType>("single");

  const [message, setMessage] = useState(
    "Predict the dice outcome and place your bet."
  );

  const [history, setHistory] = useState<
    DiceTransaction[]
  >([]);

  const [totalHistoryCount, setTotalHistoryCount] =
    useState(0);

  const [isLoadingHistory, setIsLoadingHistory] =
    useState(true);

  const animationRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null
    );

  /*
   * Keep local balance synchronized with Redux.
   */
  useEffect(() => {
    setBalance(gamingWalletBalance);
  }, [gamingWalletBalance]);

  /*
   * Clear selected bet if balance becomes smaller
   * than the selected bet.
   */
  useEffect(() => {
    if (
      typeof bet === "number" &&
      bet > balance
    ) {
      setBet("");
    }
  }, [balance, bet]);

  /*
   * Cleanup dice animation.
   */
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    };
  }, []);

  /*
   * Fetch dice game transactions.
   */
  const fetchGameTransactions =
    useCallback(async () => {
      try {
        setIsLoadingHistory(true);

        const json: DiceTransactionsResponse =
          await apiFetch(
            "/games/gameTransactions?gameName=DICE_ROLL",
            {
              method: "GET",
            }
          );

        if (!json.success) {
          throw new Error(
            json.message ||
              "Failed to fetch game transactions"
          );
        }

        setHistory(
          json.data?.transactions ?? []
        );

        setTotalHistoryCount(
          json.data?.totalCount ?? 0
        );
      } catch (error) {
        console.error(
          "Failed to fetch dice transactions:",
          error
        );
      } finally {
        setIsLoadingHistory(false);
      }
    }, []);

  /*
   * Fetch history on mount.
   */
  useEffect(() => {
    fetchGameTransactions();
  }, [fetchGameTransactions]);

  /*
   * Change bet type.
   */
  const handleBetTypeChange = (
    type: BetType
  ) => {
    setBetTypeValue(type);
    setPrediction(null);

    if (type === "single") {
      setMessage(
        "Select a number from 1 to 6."
      );
    } else {
      setMessage(
        "Select a number range."
      );
    }
  };

  /*
   * Change range FROM.
   */
  const handleRangeFromChange = (
    value: Prediction
  ) => {
    setRangeFrom(value);

    if (value > rangeTo) {
      setRangeTo(value);

      setMessage(
        `Range selected: ${value} - ${value}.`
      );

      return;
    }

    setMessage(
      `Range selected: ${value} - ${rangeTo}.`
    );
  };

  /*
   * Change range TO.
   */
  const handleRangeToChange = (
    value: Prediction
  ) => {
    if (value < rangeFrom) {
      setMessage(
        "The 'To' number cannot be smaller than 'From'."
      );

      return;
    }

    setRangeTo(value);

    setMessage(
      `Range selected: ${rangeFrom} - ${value}.`
    );
  };

  /*
   * Animate the dice locally.
   *
   * IMPORTANT:
   * This is only visual animation.
   * The actual result comes from the backend.
   */
  const animateDice = () => {
    let rolls = 0;

    animationRef.current = setInterval(() => {
      const randomFace =
        DICE_NUMBERS[
          Math.floor(
            Math.random() * DICE_NUMBERS.length
          )
        ];

      setDice(randomFace);

      rolls++;

      /*
       * Stop animation after approximately 1.2s.
       */
      if (rolls >= 12) {
        if (animationRef.current) {
          clearInterval(
            animationRef.current
          );

          animationRef.current = null;
        }
      }
    }, 100);
  };

  /*
   * Place dice bet.
   */
  const rollDice = async () => {
    const amount = Number(bet);

    /*
     * Validate single-number prediction.
     */
    if (
      betTypeValue === "single" &&
      !prediction
    ) {
      setMessage(
        "Please predict a number from 1 to 6."
      );

      return;
    }

    /*
     * Validate range.
     */
    if (
      betTypeValue === "range" &&
      rangeFrom > rangeTo
    ) {
      setMessage(
        "Please select a valid number range."
      );

      return;
    }

    /*
     * Validate amount.
     */
    if (!amount || amount <= 0) {
      setMessage(
        "Please select a valid bet."
      );

      return;
    }

    /*
     * Validate balance.
     */
    if (amount > balance) {
      setMessage(
        "You don't have enough coins."
      );

      return;
    }

    /*
     * Prevent duplicate requests.
     */
    if (rolling) {
      return;
    }

    try {
      setRolling(true);
      setMessage("🎲 Rolling...");

      /*
       * Start visual dice animation.
       */
      animateDice();

      /*
       * Backend bet type.
       */
      const apiBetType: ApiBetType =
        betTypeValue === "single"
          ? "SINGLE_NUMBERS"
          : "NUMBER_RANGE";

      /*
       * Build API payload.
       */
      const payload = {
        betType: apiBetType,
        betAmount: String(amount),

        selectedNumber:
          betTypeValue === "single"
            ? prediction
            : null,

        selectedRange:
          betTypeValue === "range"
            ? {
                from: rangeFrom,
                to: rangeTo,
              }
            : null,
      };

      /*
       * Backend determines the actual result.
       */
      const json: DiceBetResponse =
        await apiFetch(
          "/games/bet/dice-roll",
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );

      if (!json.success) {
        throw new Error(
          json.message ||
            "Unable to place your bet."
        );
      }

      const data = json.data;

      /*
       * Make sure animation is stopped.
       */
      if (animationRef.current) {
        clearInterval(
          animationRef.current
        );

        animationRef.current = null;
      }

      /*
       * IMPORTANT:
       * Use the backend dice result.
       */
      setDice(data.diceResult);

      /*
       * IMPORTANT:
       * Use backend wallet balance.
       */
      setBalance(
        data.gamingWalletBalance
      );

      /*
       * Show backend message.
       */
      setMessage(json.message);

      /*
       * Refresh transaction history.
       */
      await fetchGameTransactions();
    } catch (error) {
      console.error(
        "Dice roll error:",
        error
      );

      if (animationRef.current) {
        clearInterval(
          animationRef.current
        );

        animationRef.current = null;
      }

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setRolling(false);
    }
  };

  /*
   * Whether the most recent result is a win.
   *
   * This is based on the API message/result state.
   * We use the current dice + prediction/range only
   * for the visual result state.
   */
  const isCurrentWin = (() => {
    if (rolling) {
      return false;
    }

    if (betTypeValue === "single") {
      return (
        prediction !== null &&
        dice === prediction
      );
    }

    return (
      dice >= rangeFrom &&
      dice <= rangeTo
    );
  })();

  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_520px]">
      {/* Dice Game */}
      <Card className="overflow-hidden">
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

          {/* Dice */}
          <div
            className={`
              flex flex-col items-center justify-center rounded-xl
              border bg-muted/20 py-5
              ${
                rolling
                  ? "animate-pulse"
                  : ""
              }
              ${
                !rolling &&
                isCurrentWin
                  ? "border-green-500/50 bg-green-500/5"
                  : ""
              }
            `}
          >
            <div className="flex size-24 items-center justify-center rounded-xl border bg-background text-6xl shadow-sm">
              {DICE_FACES[dice - 1]}
            </div>

            <p className="mt-3 text-xs font-medium text-muted-foreground">
              {rolling
                ? "Rolling..."
                : `Dice: ${dice}`}
            </p>
          </div>

          {/* Bet Type */}
          <div className="space-y-2">
            <Label className="text-sm">
              Bet Type
            </Label>

            <div className="grid grid-cols-2 gap-2">
              {betTypes.map((betType) => {
                const isSelected =
                  betType.value ===
                  betTypeValue;

                return (
                  <Button
                    key={betType.value}
                    type="button"
                    variant={
                      isSelected
                        ? "default"
                        : "outline"
                    }
                    className="h-9 px-2 text-sm font-bold"
                    disabled={rolling}
                    onClick={() =>
                      handleBetTypeChange(
                        betType.value
                      )
                    }
                  >
                    {betType.name}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Single Number */}
          {betTypeValue === "single" && (
            <div className="space-y-2">
              <Label className="text-sm">
                Predict the Outcome
              </Label>

              <div className="grid grid-cols-6 gap-2">
                {DICE_NUMBERS.map(
                  (number) => {
                    const isSelected =
                      prediction ===
                      number;

                    return (
                      <Button
                        key={number}
                        type="button"
                        variant={
                          isSelected
                            ? "default"
                            : "outline"
                        }
                        className="h-9 px-2 text-sm font-bold"
                        disabled={rolling}
                        onClick={() => {
                          setPrediction(
                            number
                          );

                          
                        }}
                      >
                        {number}
                      </Button>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* Number Range */}
          {betTypeValue === "range" && (
            <div className="space-y-2">
              <Label className="text-sm">
                Select Number Range
              </Label>

              <div className="grid grid-cols-2 gap-3">
                {/* From */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    From
                  </Label>

                  <select
                    value={rangeFrom}
                    disabled={rolling}
                    onChange={(event) =>
                      handleRangeFromChange(
                        Number(
                          event.target.value
                        ) as Prediction
                      )
                    }
                    className="h-9 w-full rounded-md border bg-background px-2 text-sm font-medium"
                  >
                    {DICE_NUMBERS.map(
                      (number) => (
                        <option
                          key={number}
                          value={number}
                        >
                          {number}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* To */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    To
                  </Label>

                  <select
                    value={rangeTo}
                    disabled={rolling}
                    onChange={(event) =>
                      handleRangeToChange(
                        Number(
                          event.target.value
                        ) as Prediction
                      )
                    }
                    className="h-9 w-full rounded-md border bg-background px-2 text-sm font-medium"
                  >
                    {DICE_NUMBERS.filter(
                      (number) =>
                        number >= rangeFrom
                    ).map((number) => (
                      <option
                        key={number}
                        value={number}
                      >
                        {number}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-md bg-muted/50 p-2 text-center text-xs text-muted-foreground">
                Selected Range:{" "}
                <span className="font-semibold text-foreground">
                  {rangeFrom} -{" "}
                  {rangeTo}
                </span>
              </div>
            </div>
          )}

          {/* Bet */}
          <div className="space-y-2">
            <Label className="text-sm">
              Your Bet
            </Label>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {betAmounts.map(
                (amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant={
                      bet === amount
                        ? "default"
                        : "outline"
                    }
                    className="h-9 px-2 text-sm font-bold"
                    disabled={
                      rolling ||
                      amount > balance
                    }
                    onClick={() =>
                      setBet(amount)
                    }
                  >
                    {amount}
                  </Button>
                )
              )}
            </div>

            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Min: 1</span>

              <span>
                Max: {balance}
              </span>
            </div>
          </div>

          {/* Roll */}
          <Button
            type="button"
            className="w-full"
            disabled={
              rolling ||
              !bet ||
              (betTypeValue ===
                "single" &&
                !prediction)
            }
            onClick={rollDice}
          >
            <Dices className="mr-2 size-4" />

            {rolling
              ? "Rolling..."
              : "Roll Dice"}
          </Button>

          {/* Result */}
          {!rolling && message !== "Predict the dice outcome and place your bet." && (
            <div
              className={`rounded-lg border p-4 text-center ${
                isCurrentWin
                  ? "border-green-500/30 bg-green-500/10"
                  : "border-red-500/30 bg-red-500/10"
              }`}
            >
              <p className="text-xs text-muted-foreground">
                Dice Result
              </p>

              <p
                className={`mt-1 text-3xl font-bold ${
                  isCurrentWin
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {DICE_FACES[dice - 1]}{" "}
                {dice}
              </p>

              <p
                className={`mt-1 text-xs font-medium ${
                  isCurrentWin
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {isCurrentWin
                  ? "🎉 You Won!"
                  : "❌ You Lost!"}
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
            <CardTitle className="text-base">
              Recent Bets
            </CardTitle>

            <Badge
              variant="outline"
              className="text-[10px]"
            >
              {totalHistoryCount}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-3">
          {isLoadingHistory ? (
            <div className="flex min-h-[180px] items-center justify-center text-xs text-muted-foreground">
              Loading recent bets...
            </div>
          ) : history.length === 0 ? (
            <div className="flex min-h-[180px] items-center justify-center text-center text-xs text-muted-foreground">
              No bets yet.
              <br />
              Your recent bets will appear here.
            </div>
          ) : (
            <div className="space-y-2">
              {history
                .slice(0, 10)
                .map((item) => {
                  const won =
                    item.result ===
                    "WIN";

                  return (
                    <div
                      key={item._id}
                      className="rounded-lg border p-3"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex size-7 items-center justify-center rounded-md bg-muted text-lg">
                            {
                              DICE_FACES[
                                item.diceResult -
                                  1
                              ]
                            }
                          </span>

                          <div>
                            <p className="text-sm font-medium">
                              {item.betType ===
                              "SINGLE_NUMBERS"
                                ? `Prediction: ${item.selectedNumber}`
                                : `Range: ${item.selectedRange?.from} - ${item.selectedRange?.to}`}
                            </p>

                            <p className="text-[11px] text-muted-foreground">
                              Bet:{" "}
                              {
                                item.amount
                              }{" "}
                              {
                                item.currency
                              }
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-xs font-semibold ${
                            won
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {won
                            ? "WIN"
                            : "LOSS"}
                        </span>
                      </div>

                      {/* Result */}
                      <div className="mt-2 flex items-center justify-between border-t pt-2 text-xs">
                        <span className="text-muted-foreground">
                          Dice Result
                        </span>

                        <span className="font-semibold">
                          {
                            DICE_FACES[
                              item.diceResult -
                                1
                            ]
                          }{" "}
                          {
                            item.diceResult
                          }
                        </span>
                      </div>

                      {/* P/L */}
                      <div className="mt-1 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          P/L
                        </span>

                        <span
                          className={
                            won
                              ? "font-semibold text-green-600"
                              : "font-semibold text-red-600"
                          }
                        >
                          {won
                            ? `+${item.amount}`
                            : `-${item.amount}`}
                        </span>
                      </div>

                      {/* Balance */}
                      <div className="mt-1 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Balance
                        </span>

                        <span className="font-medium">
                          {
                            item.metadata
                              .gamingWalletAmount
                          }
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

// import { useEffect, useRef, useState } from "react";
// import { Coins, Dices } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";

// const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

// const betAmounts = [1, 5, 10, 15, 20, 25];

// type Prediction = 1 | 2 | 3 | 4 | 5 | 6;
// type BetType = "single" | "range";

// type BetHistory = {
//   id: number;
//   betType: BetType;
//   prediction?: Prediction;
//   from?: Prediction;
//   to?: Prediction;
//   result: Prediction;
//   amount: number;
//   won: boolean;
// };

// const betTypes: {
//   name: string;
//   value: BetType;
// }[] = [
//   {
//     name: "Single Numbers",
//     value: "single",
//   },
//   {
//     name: "Number Range",
//     value: "range",
//   },
// ];

// export const DiceRoll = () => {
//   const [balance, setBalance] = useState(1000);
//   const [bet, setBet] = useState<number | "">("");

//   const [prediction, setPrediction] = useState<Prediction | null>(null);

//   const [rangeFrom, setRangeFrom] = useState<Prediction>(1);
//   const [rangeTo, setRangeTo] = useState<Prediction>(6);

//   const [dice, setDice] = useState<Prediction>(1);
//   const [rolling, setRolling] = useState(false);

//   const [betTypeValue, setBetTypeValue] =
//     useState<BetType>("single");

//   const [message, setMessage] = useState(
//     "Predict the dice outcome and place your bet."
//   );

//   const [history, setHistory] = useState<BetHistory[]>([]);

//   const animationRef =
//     useRef<ReturnType<typeof setInterval> | null>(null);

//   useEffect(() => {
//     return () => {
//       if (animationRef.current) {
//         clearInterval(animationRef.current);
//       }
//     };
//   }, []);

//   const handleBetTypeChange = (type: BetType) => {
//     setBetTypeValue(type);
//     setPrediction(null);

//     if (type === "single") {
//       setMessage("Select a number from 1 to 6.");
//     } else {
//       setMessage("Select a number range.");
//     }
//   };

//   const handleRangeFromChange = (value: Prediction) => {
//     setRangeFrom(value);

//     // Make sure "To" is never smaller than "From"
//     if (value > rangeTo) {
//       setRangeTo(value);
//     }

//     setMessage(`Range selected: ${value} - ${Math.max(value, rangeTo)}.`);
//   };

//   const handleRangeToChange = (value: Prediction) => {
//     if (value < rangeFrom) {
//       setMessage("The 'To' number cannot be smaller than 'From'.");
//       return;
//     }

//     setRangeTo(value);

//     setMessage(`Range selected: ${rangeFrom} - ${value}.`);
//   };

//   const rollDice = () => {
//     const amount = Number(bet);

//     // Validate bet type
//     if (betTypeValue === "single" && !prediction) {
//       setMessage("Please predict a number from 1 to 6.");
//       return;
//     }

//     if (betTypeValue === "range" && rangeFrom > rangeTo) {
//       setMessage("Please select a valid number range.");
//       return;
//     }

//     // Validate amount
//     if (!amount || amount <= 0) {
//       setMessage("Please select a valid bet.");
//       return;
//     }

//     if (amount > balance) {
//       setMessage("You don't have enough coins.");
//       return;
//     }

//     if (rolling) return;

//     setRolling(true);
//     setMessage("🎲 Rolling...");

//     let rolls = 0;

//     animationRef.current = setInterval(() => {
//       const randomFace = (Math.floor(Math.random() * 6) +
//         1) as Prediction;

//       setDice(randomFace);

//       rolls++;

//       if (rolls >= 12) {
//         if (animationRef.current) {
//           clearInterval(animationRef.current);
//           animationRef.current = null;
//         }

//         const finalRoll = (Math.floor(Math.random() * 6) +
//           1) as Prediction;

//         setDice(finalRoll);

//         // -----------------------------
//         // Determine win
//         // -----------------------------

//         let won = false;

//         if (betTypeValue === "single") {
//           won = finalRoll === prediction;
//         }

//         if (betTypeValue === "range") {
//           won =
//             finalRoll >= rangeFrom &&
//             finalRoll <= rangeTo;
//         }

//         // -----------------------------
//         // Balance
//         // -----------------------------

//         if (won) {
//           setBalance((prev) => prev + amount);

//           setMessage(
//             `🎉 You won! The dice rolled ${finalRoll}. You received ${
//               amount * 2
//             } coins!`
//           );
//         } else {
//           setBalance((prev) => prev - amount);

//           if (betTypeValue === "single") {
//             setMessage(
//               `❌ You lost! The dice rolled ${finalRoll}. Your prediction was ${prediction}.`
//             );
//           } else {
//             setMessage(
//               `❌ You lost! The dice rolled ${finalRoll}. Your range was ${rangeFrom} - ${rangeTo}.`
//             );
//           }
//         }

//         // -----------------------------
//         // Add to history
//         // -----------------------------

//         const historyItem: BetHistory = {
//           id: Date.now(),
//           betType: betTypeValue,
//           result: finalRoll,
//           amount,
//           won,
//           ...(betTypeValue === "single"
//             ? {
//                 prediction: prediction!,
//               }
//             : {
//                 from: rangeFrom,
//                 to: rangeTo,
//               }),
//         };

//         setHistory((prev) =>
//           [historyItem, ...prev].slice(0, 10)
//         );

//         setRolling(false);
//       }
//     }, 100);
//   };

//   const isWin =
//     !rolling &&
//     message.includes("won");

//   const isResult =
//     !rolling &&
//     (message.includes("won") || message.includes("lost"));

//   return (
//     <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_520px]">
//       {/* Dice Game */}
//       <Card className="overflow-hidden">
//         <CardContent className="space-y-4 p-5">
//           {/* Balance */}
//           <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-4 py-3">
//             <span className="text-xs text-muted-foreground">
//               Available Balance
//             </span>

//             <div className="flex items-center gap-1.5 text-lg font-bold">
//               <Coins className="size-4 text-yellow-500" />
//               {balance}
//             </div>
//           </div>

//           {/* Dice */}
//           <div
//             className={`
//               flex flex-col items-center justify-center rounded-xl
//               border bg-muted/20 py-5
//               ${rolling ? "animate-pulse" : ""}
//               ${
//                 isWin
//                   ? "border-green-500/50 bg-green-500/5"
//                   : ""
//               }
//             `}
//           >
//             <div className="flex size-24 items-center justify-center rounded-xl border bg-background text-6xl shadow-sm">
//               {DICE_FACES[dice - 1]}
//             </div>

//             <p className="mt-3 text-xs font-medium text-muted-foreground">
//               {rolling ? "Rolling..." : `Dice: ${dice}`}
//             </p>
//           </div>

//           {/* Bet Type */}
//           <div className="space-y-2">
//             <Label className="text-sm">Bet Type</Label>

//             <div className="grid grid-cols-2 gap-2">
//               {betTypes.map((betType) => {
//                 const isSelected =
//                   betType.value === betTypeValue;

//                 return (
//                   <Button
//                     key={betType.value}
//                     type="button"
//                     variant={
//                       isSelected ? "default" : "outline"
//                     }
//                     className="h-9 px-2 text-sm font-bold"
//                     disabled={rolling}
//                     onClick={() =>
//                       handleBetTypeChange(betType.value)
//                     }
//                   >
//                     {betType.name}
//                   </Button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Single Number */}
//           {betTypeValue === "single" && (
//             <div className="space-y-2">
//               <Label className="text-sm">
//                 Predict the Outcome
//               </Label>

//               <div className="grid grid-cols-6 gap-2">
//                 {(
//                   [1, 2, 3, 4, 5, 6] as Prediction[]
//                 ).map((number) => {
//                   const isSelected =
//                     prediction === number;

//                   return (
//                     <Button
//                       key={number}
//                       type="button"
//                       variant={
//                         isSelected
//                           ? "default"
//                           : "outline"
//                       }
//                       className="h-9 px-2 text-sm font-bold"
//                       disabled={rolling}
//                       onClick={() => {
//                         setPrediction(number);
//                         setMessage(
//                           `You predicted ${number}.`
//                         );
//                       }}
//                     >
//                       {number}
//                     </Button>
//                   );
//                 })}
//               </div>
//             </div>
//           )}

//           {/* Number Range */}
//           {betTypeValue === "range" && (
//             <div className="space-y-2">
//               <Label className="text-sm">
//                 Select Number Range
//               </Label>

//               <div className="grid grid-cols-2 gap-3">
//                 {/* From */}
//                 <div className="space-y-1">
//                   <Label className="text-xs text-muted-foreground">
//                     From
//                   </Label>

//                   <select
//                     value={rangeFrom}
//                     disabled={rolling}
//                     onChange={(event) =>
//                       handleRangeFromChange(
//                         Number(event.target.value) as Prediction
//                       )
//                     }
//                     className="h-9 w-full rounded-md border bg-background px-2 text-sm font-medium"
//                   >
//                     {(
//                       [1, 2, 3, 4, 5, 6] as Prediction[]
//                     ).map((number) => (
//                       <option
//                         key={number}
//                         value={number}
//                       >
//                         {number}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* To */}
//                 <div className="space-y-1">
//                   <Label className="text-xs text-muted-foreground">
//                     To
//                   </Label>

//                   <select
//                     value={rangeTo}
//                     disabled={rolling}
//                     onChange={(event) =>
//                       handleRangeToChange(
//                         Number(event.target.value) as Prediction
//                       )
//                     }
//                     className="h-9 w-full rounded-md border bg-background px-2 text-sm font-medium"
//                   >
//                     {(
//                       [1, 2, 3, 4, 5, 6] as Prediction[]
//                     )
//                       .filter(
//                         (number) => number >= rangeFrom
//                       )
//                       .map((number) => (
//                         <option
//                           key={number}
//                           value={number}
//                         >
//                           {number}
//                         </option>
//                       ))}
//                   </select>
//                 </div>
//               </div>

//               <div className="rounded-md bg-muted/50 p-2 text-center text-xs text-muted-foreground">
//                 Selected Range:{" "}
//                 <span className="font-semibold text-foreground">
//                   {rangeFrom} - {rangeTo}
//                 </span>
//               </div>
//             </div>
//           )}

//           {/* Bet */}
//           <div className="space-y-2">
//             <Label className="text-sm">Your Bet</Label>

//             <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
//               {betAmounts.map((amount) => (
//                 <Button
//                   key={amount}
//                   type="button"
//                   variant={
//                     bet === amount
//                       ? "default"
//                       : "outline"
//                   }
//                   className="h-9 px-2 text-sm font-bold"
//                   disabled={
//                     rolling || amount > balance
//                   }
//                   onClick={() => setBet(amount)}
//                 >
//                   {amount}
//                 </Button>
//               ))}
//             </div>

//             <div className="flex justify-between text-[11px] text-muted-foreground">
//               <span>Min: 1</span>
//               <span>Max: {balance}</span>
//             </div>
//           </div>

//           {/* Roll */}
//           <Button
//             type="button"
//             className="w-full"
//             disabled={
//               rolling ||
//               !bet ||
//               (betTypeValue === "single" &&
//                 !prediction)
//             }
//             onClick={rollDice}
//           >
//             <Dices className="mr-2 size-4" />

//             {rolling ? "Rolling..." : "Roll Dice"}
//           </Button>

//           {/* Result */}
//           {isResult && (
//             <div
//               className={`rounded-lg border p-4 text-center ${
//                 isWin
//                   ? "border-green-500/30 bg-green-500/10"
//                   : "border-red-500/30 bg-red-500/10"
//               }`}
//             >
//               <p className="text-xs text-muted-foreground">
//                 Winning Number
//               </p>

//               <p
//                 className={`mt-1 text-3xl font-bold ${
//                   isWin
//                     ? "text-green-600"
//                     : "text-red-600"
//                 }`}
//               >
//                 {dice}
//               </p>

//               <p
//                 className={`mt-1 text-xs font-medium ${
//                   isWin
//                     ? "text-green-600"
//                     : "text-red-600"
//                 }`}
//               >
//                 {isWin
//                   ? "🎉 Congratulations! You won!"
//                   : "❌ Better luck next time!"}
//               </p>
//             </div>
//           )}

//           {/* Message */}
//           <div className="rounded-lg bg-muted/50 p-3 text-center text-xs">
//             {message}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Recent Bets */}
//       <Card className="h-fit overflow-hidden">
//         <CardHeader className="border-b bg-muted/20 px-4 py-3">
//           <div className="flex items-center justify-between">
//             <CardTitle className="text-base">
//               Recent Bets
//             </CardTitle>

//             <Badge
//               variant="outline"
//               className="text-[10px]"
//             >
//               {history.length}
//             </Badge>
//           </div>
//         </CardHeader>

//         <CardContent className="p-3">
//           {history.length === 0 ? (
//             <div className="flex min-h-[180px] items-center justify-center text-center text-xs text-muted-foreground">
//               No bets yet.
//               <br />
//               Your recent bets will appear here.
//             </div>
//           ) : (
//             <div className="space-y-2">
//               {history.map((item) => (
//                 <div
//                   key={item.id}
//                   className="rounded-lg border p-3"
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       <span className="flex size-7 items-center justify-center rounded-md bg-muted text-lg">
//                         {DICE_FACES[item.result - 1]}
//                       </span>

//                       <div>
//                         <p className="text-sm font-medium">
//                           {item.betType === "single"
//                             ? `Prediction: ${item.prediction}`
//                             : `Range: ${item.from} - ${item.to}`}
//                         </p>

//                         <p className="text-[11px] text-muted-foreground">
//                           Bet: {item.amount}
//                         </p>
//                       </div>
//                     </div>

//                     <span
//                       className={`text-xs font-semibold ${
//                         item.won
//                           ? "text-green-600"
//                           : "text-red-600"
//                       }`}
//                     >
//                       {item.won ? "WIN" : "LOSS"}
//                     </span>
//                   </div>

//                   <div className="mt-2 flex items-center justify-between border-t pt-2 text-xs">
//                     <span className="text-muted-foreground">
//                       Result
//                     </span>

//                     <span className="font-semibold">
//                       {DICE_FACES[item.result - 1]}{" "}
//                       {item.result}
//                     </span>
//                   </div>

//                   <div className="mt-1 flex items-center justify-between text-xs">
//                     <span className="text-muted-foreground">
//                       Payout
//                     </span>

//                     <span
//                       className={
//                         item.won
//                           ? "font-semibold text-green-600"
//                           : "font-semibold text-red-600"
//                       }
//                     >
//                       {item.won
//                         ? `+${item.amount * 2}`
//                         : `-${item.amount}`}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };





// "use client";

// import { useEffect, useRef, useState } from "react";
// import { Coins, Dices } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";

// const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

// const betAmounts = [1, 5, 10, 15, 20, 25];

// type Prediction = 1 | 2 | 3 | 4 | 5 | 6;

// type BetHistory = {
//   id: number;
//   prediction: Prediction;
//   result: Prediction;
//   amount: number;
//   won: boolean;
// };

// export const DiceRoll = () => {
//   const [balance, setBalance] = useState(1000);
//   const [bet, setBet] = useState<number | "">("");
//   const [prediction, setPrediction] = useState<Prediction | null>(null);
//   const [dice, setDice] = useState<Prediction>(1);
//   const [rolling, setRolling] = useState(false);
//   const [message, setMessage] = useState(
//     "Predict the dice outcome and place your bet."
//   );

//   const [history, setHistory] = useState<BetHistory[]>([]);

//   const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);

//   useEffect(() => {
//     return () => {
//       if (animationRef.current) {
//         clearInterval(animationRef.current);
//       }
//     };
//   }, []);

//   const rollDice = () => {
//     const amount = Number(bet);

//     if (!prediction) {
//       setMessage("Please predict a number from 1 to 6.");
//       return;
//     }

//     if (!amount || amount <= 0) {
//       setMessage("Please select a valid bet.");
//       return;
//     }

//     if (amount > balance) {
//       setMessage("You don't have enough coins.");
//       return;
//     }

//     if (rolling) return;

//     setRolling(true);
//     setMessage("🎲 Rolling...");

//     let rolls = 0;

//     animationRef.current = setInterval(() => {
//       const randomFace = (Math.floor(Math.random() * 6) + 1) as Prediction;

//       setDice(randomFace);
//       rolls++;

//       if (rolls >= 12) {
//         if (animationRef.current) {
//           clearInterval(animationRef.current);
//           animationRef.current = null;
//         }

//         const finalRoll = (Math.floor(Math.random() * 6) + 1) as Prediction;

//         setDice(finalRoll);

//         const won = finalRoll === prediction;

//         if (won) {
//           setBalance((prev) => prev + amount);

//           setMessage(
//             `🎉 You won! The dice rolled ${finalRoll}. You received ${
//               amount * 2
//             } coins!`
//           );
//         } else {
//           setBalance((prev) => prev - amount);

//           setMessage(
//             `❌ You lost! The dice rolled ${finalRoll}. Your prediction was ${prediction}.`
//           );
//         }

//         setHistory((prev) => [
//           {
//             id: Date.now(),
//             prediction,
//             result: finalRoll,
//             amount,
//             won,
//           },
//           ...prev,
//         ].slice(0, 10));

//         setRolling(false);
//       }
//     }, 100);
//   };

//   const isWin =
//     !rolling &&
//     prediction !== null &&
//     dice === prediction &&
//     message.includes("won");

//   return (
//     <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_520px]">
//       {/* Dice Game */}
//       <Card className="overflow-hidden">
//         {/* <CardHeader className="border-b bg-muted/20 px-5 py-4">
//           <div className="flex items-center justify-between gap-3">
//             <div>
//               <CardTitle className="flex items-center gap-2 text-lg">
//                 🎲 Dice Predictor
//               </CardTitle>

//               <p className="mt-1 text-xs text-muted-foreground">
//                 Predict the number and win 2× your bet.
//               </p>
//             </div>

//             <Badge
//               variant="secondary"
//               className="flex items-center gap-1 px-2.5 py-1"
//             >
//               <Coins className="size-3.5" />
//               {balance}
//             </Badge>
//           </div>
//         </CardHeader> */}

//         <CardContent className="space-y-4 p-5">
//           {/* Balance */}
//           <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-4 py-3">
//             <span className="text-xs text-muted-foreground">
//               Available Balance
//             </span>

//             <div className="flex items-center gap-1.5 text-lg font-bold">
//               <Coins className="size-4 text-yellow-500" />
//               {balance}
//             </div>
//           </div>

//           {/* Dice */}
//           <div
//             className={`
//               flex flex-col items-center justify-center rounded-xl
//               border bg-muted/20 py-5
//               ${rolling ? "animate-pulse" : ""}
//               ${isWin ? "border-green-500/50 bg-green-500/5" : ""}
//             `}
//           >
//             <div className="flex size-15 items-center justify-center rounded-xl border bg-background text-6xl shadow-sm">
//               {DICE_FACES[dice - 1]}
//             </div>

//             <p className="mt-3 text-xs font-medium text-muted-foreground">
//               {rolling ? "Rolling..." : `Dice: ${dice}`}
//             </p>
//           </div>

//           {/* Prediction */}
//           <div className="space-y-2">
//             <Label className="text-sm">Predict the Outcome</Label>

//             <div className="grid grid-cols-6 gap-2">
//               {([1, 2, 3, 4, 5, 6] as Prediction[]).map((number) => {
//                 const isSelected = prediction === number;

//                 return (
//                   <Button
//                     key={number}
//                     type="button"
//                     variant={isSelected ? "default" : "outline"}
//                     className="h-9 px-2 text-sm font-bold"
//                     disabled={rolling}
//                     onClick={() => {
//                       setPrediction(number);
//                       setMessage(`You predicted ${number}.`);
//                     }}
//                   >
//                     {number}
//                   </Button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Bet */}
//           <div className="space-y-2">
//             <Label className="text-sm">Your Bet</Label>

//             <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
//               {betAmounts.map((amount) => (
//                 <Button
//                   key={amount}
//                   type="button"
//                   variant={bet === amount ? "default" : "outline"}
//                   className="h-9 px-2 text-sm font-bold"
//                   disabled={rolling || amount > balance}
//                   onClick={() => setBet(amount)}
//                 >
//                   {amount}
//                 </Button>
//               ))}
//             </div>

//             <div className="flex justify-between text-[11px] text-muted-foreground">
//               <span>Min: 1</span>
//               <span>Max: {balance}</span>
//             </div>
//           </div>

//           {/* Roll */}
//           <Button
//             type="button"
//             className="w-full"
//             disabled={rolling || !prediction || !bet}
//             onClick={rollDice}
//           >
//             <Dices className="mr-2 size-4" />

//             {rolling ? "Rolling..." : "Roll Dice"}
//           </Button>

//           {/* Result */}
//           {!rolling && prediction && message.includes("won") && (
//             <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-center">
//               <p className="text-xs text-muted-foreground">
//                 Winning Number
//               </p>

//               <p className="mt-1 text-3xl font-bold text-green-600">
//                 {dice}
//               </p>

//               <p className="mt-1 text-xs font-medium text-green-600">
//                 🎉 Congratulations! You won!
//               </p>
//             </div>
//           )}

//           {!rolling && prediction && message.includes("lost") && (
//             <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center">
//               <p className="text-xs text-muted-foreground">
//                 Winning Number
//               </p>

//               <p className="mt-1 text-3xl font-bold text-red-600">
//                 {dice}
//               </p>

//               <p className="mt-1 text-xs font-medium text-red-600">
//                 ❌ Better luck next time!
//               </p>
//             </div>
//           )}

//           {/* Message */}
//           <div className="rounded-lg bg-muted/50 p-3 text-center text-xs">
//             {message}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Recent Bets */}
//       <Card className="h-fit overflow-hidden">
//         <CardHeader className="border-b bg-muted/20 px-4 py-3">
//           <div className="flex items-center justify-between">
//             <CardTitle className="text-base">Recent Bets</CardTitle>

//             <Badge variant="outline" className="text-[10px]">
//               {history.length}
//             </Badge>
//           </div>
//         </CardHeader>

//         <CardContent className="p-3">
//           {history.length === 0 ? (
//             <div className="flex min-h-[180px] items-center justify-center text-center text-xs text-muted-foreground">
//               No bets yet.
//               <br />
//               Your recent bets will appear here.
//             </div>
//           ) : (
//             <div className="space-y-2">
//               {history.map((item) => (
//                 <div
//                   key={item.id}
//                   className="rounded-lg border p-3"
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       <span className="flex size-7 items-center justify-center rounded-md bg-muted text-lg">
//                         {DICE_FACES[item.prediction - 1]}
//                       </span>

//                       <div>
//                         <p className="text-sm font-medium">
//                           Prediction: {item.prediction}
//                         </p>

//                         <p className="text-[11px] text-muted-foreground">
//                           Bet: {item.amount}
//                         </p>
//                       </div>
//                     </div>

//                     <span
//                       className={`text-xs font-semibold ${
//                         item.won
//                           ? "text-green-600"
//                           : "text-red-600"
//                       }`}
//                     >
//                       {item.won ? "WIN" : "LOSS"}
//                     </span>
//                   </div>

//                   <div className="mt-2 flex items-center justify-between border-t pt-2 text-xs">
//                     <span className="text-muted-foreground">
//                       Result
//                     </span>

//                     <span className="font-semibold">
//                       {DICE_FACES[item.result - 1]} {item.result}
//                     </span>
//                   </div>

//                   <div className="mt-1 flex items-center justify-between text-xs">
//                     <span className="text-muted-foreground">
//                       Payout
//                     </span>

//                     <span
//                       className={
//                         item.won
//                           ? "font-semibold text-green-600"
//                           : "font-semibold text-red-600"
//                       }
//                     >
//                       {item.won
//                         ? `+${item.amount * 2}`
//                         : `-${item.amount}`}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };


// "use client";

// import { useEffect, useRef, useState } from "react";
// import { Coins, Dices, RotateCcw } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";

// const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

// type Prediction = 1 | 2 | 3 | 4 | 5 | 6;

// export const DiceRoll = () => {
//   const [balance, setBalance] = useState(1000);
//   const [bet, setBet] = useState("");
//   const [prediction, setPrediction] = useState<Prediction | null>(null);
//   const [dice, setDice] = useState<Prediction>(1);
//   const [rolling, setRolling] = useState(false);
//   const [message, setMessage] = useState(
//     "Predict the dice outcome and place your bet."
//   );

//   const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);

//   useEffect(() => {
//     return () => {
//       if (animationRef.current) {
//         clearInterval(animationRef.current);
//       }
//     };
//   }, []);

//   const rollDice = () => {
//     const amount = Number(bet);

//     if (!prediction) {
//       setMessage("Please predict a number from 1 to 6.");
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

//     if (rolling) return;

//     setRolling(true);
//     setMessage("🎲 Rolling...");

//     let rolls = 0;

//     animationRef.current = setInterval(() => {
//       const randomFace = (Math.floor(Math.random() * 6) + 1) as Prediction;

//       setDice(randomFace);
//       rolls++;

//       if (rolls >= 12) {
//         if (animationRef.current) {
//           clearInterval(animationRef.current);
//           animationRef.current = null;
//         }

//         const finalRoll = (Math.floor(Math.random() * 6) + 1) as Prediction;

//         setDice(finalRoll);
//         setRolling(false);

//         if (finalRoll === prediction) {
//           setBalance((prev) => prev + amount);

//           setMessage(
//             `🎉 You won! The dice rolled ${finalRoll}. You received ${
//               amount * 2
//             } coins!`
//           );
//         } else {
//           setBalance((prev) => prev - amount);

//           setMessage(
//             `❌ You lost! The dice rolled ${finalRoll}. Your prediction was ${prediction}.`
//           );
//         }
//       }
//     }, 100);
//   };

//   const resetGame = () => {
//     if (animationRef.current) {
//       clearInterval(animationRef.current);
//       animationRef.current = null;
//     }

//     setBalance(1000);
//     setBet("");
//     setPrediction(null);
//     setDice(1);
//     setRolling(false);
//     setMessage("Predict the dice outcome and place your bet.");
//   };

//   const isWin =
//     !rolling &&
//     prediction !== null &&
//     dice === prediction &&
//     message.includes("won");

//   return (
//     <div className="mx-auto w-full max-w-2xl">
//       <Card className="overflow-hidden">
//         <CardHeader className="border-b bg-muted/20">
//           <div className="flex items-center justify-between gap-4">
//             <div>
//               <CardTitle className="flex items-center gap-2 text-xl">
//                 🎲 Dice Predictor
//               </CardTitle>

//               <p className="mt-1 text-sm text-muted-foreground">
//                 Predict the number. Match it and win 2× your bet.
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

//           {/* Dice */}
//           <div
//             className={`
//               flex flex-col items-center justify-center rounded-2xl
//               border bg-muted/20 py-8
//               ${rolling ? "animate-pulse" : ""}
//               ${isWin ? "border-green-500/50 bg-green-500/5" : ""}
//             `}
//           >
//             <div className="flex size-32 items-center justify-center rounded-2xl border bg-background text-7xl shadow-sm">
//               {DICE_FACES[dice - 1]}
//             </div>

//             <p className="mt-4 text-sm font-medium text-muted-foreground">
//               {rolling ? "Rolling..." : `Dice: ${dice}`}
//             </p>
//           </div>

//           {/* Prediction */}
//           <div className="space-y-3">
//             <Label>Predict the Outcome</Label>

//             <div className="grid grid-cols-6 gap-2">
//               {([1, 2, 3, 4, 5, 6] as Prediction[]).map((number) => {
//                 const isSelected = prediction === number;

//                 return (
//                   <Button
//                     key={number}
//                     type="button"
//                     variant={isSelected ? "default" : "outline"}
//                     className="h-12 text-lg font-bold"
//                     disabled={rolling}
//                     onClick={() => {
//                       setPrediction(number);
//                       setMessage(`You predicted ${number}.`);
//                     }}
//                   >
//                     {number}
//                   </Button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Bet */}
//           <div className="space-y-2">
//             <Label htmlFor="dice-bet">Bet Amount</Label>

//             <div className="relative">
//               <Coins className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

//               <Input
//                 id="dice-bet"
//                 type="number"
//                 min={1}
//                 max={balance}
//                 value={bet}
//                 disabled={rolling}
//                 onChange={(event) => setBet(event.target.value)}
//                 placeholder="Enter bet"
//                 className="pl-9"
//               />
//             </div>

//             <div className="flex justify-between text-xs text-muted-foreground">
//               <span>Min: 1</span>
//               <span>Max: {balance}</span>
//             </div>
//           </div>

//           {/* Roll */}
//           <Button
//             type="button"
//             size="lg"
//             className="w-full"
//             disabled={rolling || !prediction || !bet}
//             onClick={rollDice}
//           >
//             <Dices className="mr-2 size-5" />

//             {rolling ? "Rolling..." : "Roll Dice"}
//           </Button>

//           {/* Result */}
//           {!rolling && prediction && message.includes("won") && (
//             <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-5 text-center">
//               <p className="text-sm text-muted-foreground">
//                 Winning Number
//               </p>

//               <p className="mt-2 text-4xl font-bold text-green-600">
//                 {dice}
//               </p>

//               <p className="mt-2 text-sm font-medium text-green-600">
//                 🎉 Congratulations! You won!
//               </p>
//             </div>
//           )}

//           {!rolling && prediction && message.includes("lost") && (
//             <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-center">
//               <p className="text-sm text-muted-foreground">
//                 Winning Number
//               </p>

//               <p className="mt-2 text-4xl font-bold text-red-600">
//                 {dice}
//               </p>

//               <p className="mt-2 text-sm font-medium text-red-600">
//                 ❌ Better luck next time!
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
//             disabled={rolling}
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
