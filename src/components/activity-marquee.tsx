import Link from "next/link";

const activities = [
  {
    type: "earning",
    user: "Meera D.",
    value: "64 TRX",
    text: "earned 64 TRX",
  },
  {
    type: "join",
    user: "Amit V.",
    text: "joined from Pune",
  },
  {
    type: "deposit",
    user: "Anjali V.",
    value: "1.866 ETH",
    text: "deposited 1.866 ETH",
  },
  {
    type: "deposit",
    user: "Karan R.",
    value: "4.33 SOL",
    text: "deposited 4.33 SOL",
  },
  {
    type: "deposit",
    user: "Karan P.",
    value: "5.48 BNB",
    text: "deposited 5.48 BNB",
  },
  {
    type: "earning",
    user: "Suresh H.",
    value: "6.46 SOL",
    text: "earned 6.46 SOL",
  },
];

export function ActivityMarquee() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 overflow-hidden border-t bg-background">
      <div className="flex h-6 items-center">
        <div className="animate-marquee flex shrink-0 whitespace-nowrap">
          {[...activities, ...activities].map((activity, index) => (
            <div
              key={`${activity.user}-${index}`}
              className="mx-6 inline-flex items-center gap-1 text-xs"
            >
              <span className="font-semibold text-foreground">
                {activity.user}
              </span>

              <span className="text-muted-foreground">
                {activity.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
