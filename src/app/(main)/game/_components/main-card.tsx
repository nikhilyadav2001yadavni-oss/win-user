import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  LucideIcon,
  TrophyIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";

const items = [
  {
    name: "Active Games",
    icon: TrophyIcon,
    count: "2",
    bgColor: "bg-blue-500/10 dark:bg-blue-500/10",
    iconColor: "bg-blue-500 text-white",
  },
  {
    name: "Active Players",
    icon: UsersIcon,
    count: "7+",
    bgColor: "bg-green-500/10 dark:bg-green-500/10",
    iconColor: "bg-green-500 text-white",
  },
  {
    name: "Max Win",
    icon: ZapIcon,
    count: "2x",
    bgColor: "bg-orange-500/10 dark:bg-orange-500/10",
    iconColor: "bg-orange-500 text-white",
  },
];

export const MainCard = () => {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      {items.map((item) => (
        <SubCard
          key={item.name}
          name={item.name}
          icon={item.icon}
          count={item.count}
          bgColor={item.bgColor}
          iconColor={item.iconColor}
        />
      ))}
    </div>
  );
};

type SubCardProps = {
  name: string;
  icon: LucideIcon;
  count: string;
  bgColor: string;
  iconColor: string;
};

const SubCard = ({
  name,
  icon: Icon,
  count,
  bgColor,
  iconColor,
}: SubCardProps) => {
  return (
    <Item
      variant="outline"
      className={bgColor}
    >
      <ItemMedia variant="icon">
        <div className={`rounded-lg p-1.5 ${iconColor}`}>
          <Icon className="size-5" />
        </div>
      </ItemMedia>

      <ItemContent>
        <ItemTitle className="text-sm">
          {name}
        </ItemTitle>

        <ItemDescription className="text-lg font-semibold">
          {count}
        </ItemDescription>
      </ItemContent>
    </Item>
  );
};
