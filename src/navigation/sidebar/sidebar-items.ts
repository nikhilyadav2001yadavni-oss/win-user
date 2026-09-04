import {
  CircleDollarSignIcon,
  CircleQuestionMarkIcon,
  DicesIcon,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";

export type NavBadge = "new" | "soon";

export interface NavSubItem {
  id: string;
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

interface NavItemBase {
  id: string;
  title: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

export interface NavMainLinkItem extends NavItemBase {
  url: string;
  subItems?: never;
}

export interface NavMainParentItem extends NavItemBase {
  subItems: NavSubItem[];
}

export type NavMainItem = NavMainLinkItem | NavMainParentItem;

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Dashboards",
    items: [
      {
        id: "default",
        title: "Overview",
        url: "/default",
        icon: LayoutDashboard,
      },
      {
        id: "history",
        title: "History",
        url: "/history",
        icon: CircleDollarSignIcon,
      },
      {
        id: "games",
        title: "Games",
        url: "/game",
        icon: DicesIcon,
      },
      {
        id: "support",
        title: "Support",
        url: "/support",
        icon: CircleQuestionMarkIcon,
      },
      /*{
        id: "productivity",
        title: "Productivity",
        url: "/productivity",
        icon: ListTodo,
      },
      {
        id: "ecommerce",
        title: "E-commerce",
        url: "/ecommerce",
        icon: ShoppingBag,
      },
      {
        id: "academy",
        title: "Academy",
        url: "/academy",
        icon: GraduationCap,
      },
      {
        id: "logistics",
        title: "Logistics",
        url: "/logistics",
        icon: Forklift,
      },
      {
        id: "infrastructure",
        title: "Infrastructure",
        url: "/infrastructure",
        icon: Server,
      },
      {
        id: "file-manager",
        title: "File Manager",
        url: "/file-manager",
        icon: FolderOpen,
        badge: "new",
      },
      {
        id: "patient-monitoring",
        title: "Patient Monitoring",
        url: "/patient-monitoring",
        icon: HeartPulse,
        badge: "new",
      },*/
    ],
  },
  /*{
    id: 2,
    label: "Pages",
    items: [
      {
        id: "email",
        title: "Email",
        url: "/mail",
        icon: Mail,
      },
      {
        id: "chat",
        title: "Chat",
        url: "/chat",
        icon: MessageSquare,
      },
      {
        id: "calendar",
        title: "Calendar",
        url: "/calendar",
        icon: Calendar,
      },
      {
        id: "kanban",
        title: "Kanban",
        url: "/kanban",
        icon: Kanban,
      },
      {
        id: "tasks",
        title: "Tasks",
        url: "/tasks",
        icon: CheckSquare,
      },
      {
        id: "invoice",
        title: "Invoice",
        url: "/invoice",
        icon: ReceiptText,
      },
      {
        id: "profile",
        title: "Profile",
        url: "/profile",
        icon: UserRound,
        badge: "new",
      },
      {
        id: "users",
        title: "Users",
        url: "/users",
        icon: Users,
      },
      {
        id: "roles",
        title: "Roles",
        url: "/roles",
        icon: Lock,
      },
      {
        id: "authentication",
        title: "Authentication",
        icon: Fingerprint,
        subItems: [
          { id: "auth-login-v1", title: "Login v1", url: "/auth/v1/login", newTab: true },
          { id: "auth-login-v2", title: "Login v2", url: "/auth/v2/login", newTab: true },
          { id: "auth-register-v1", title: "Register v1", url: "/auth/v1/register", newTab: true },
          { id: "auth-register-v2", title: "Register v2", url: "/auth/v2/register", newTab: true },
        ],
      },
    ],
  },
  {
    id: 3,
    label: "Legacy",
    items: [
      {
        id: "legacy-dashboards",
        title: "Dashboards",
        subItems: [
          { id: "legacy-default", title: "Default V1", url: "/default-v1" },
          { id: "legacy-crm", title: "CRM V1", url: "/crm-v1" },
          { id: "legacy-finance", title: "Finance V1", url: "/finance-v1" },
          { id: "legacy-analytics", title: "Analytics V1", url: "/analytics-v1" },
        ],
      },
    ],
  },
  {
    id: 4,
    label: "Misc",
    items: [
      {
        id: "others",
        title: "Others",
        url: "/coming-soon",
        icon: SquareArrowUpRight,
        badge: "soon",
        disabled: true,
      },
    ],
  },*/
];
