// Application navigation tree definition. Items filtered at runtime based on user permissions.
// Keeps UI structure & required permissions centralized (avoid scattering nav logic).
import { PERMISSIONS } from "@/config/roles";

import {
  LayoutDashboard,
  Users,
  Settings,
  MapPin,
  Map,
  Database,
} from "lucide-react";
import type { ComponentType } from "react";

export type NavLeafItem = {
  type?: "item";
  title: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  permission: string; // permission required to view
  /** When true (default), consider nested routes under href as active. When false, requires exact pathname match. */
  matchChildren?: boolean;
};

export type NavGroupItem = {
  type: "group";
  title: string;
  icon: ComponentType<{ className?: string }>;
  children: (NavLeafItem | NavGroupItem)[]; // support nested groups
};

export type NavItem = NavLeafItem | NavGroupItem;

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: PERMISSIONS.VIEW_DASHBOARD,
  },

  {
    type: "group",
    title: "Basic",
    icon: Database,
    children: [
      {
        title: "States",
        href: "/states",
        icon: Map,
        permission: PERMISSIONS.VIEW_STATES,
      },
      {
        title: "Cities",
        href: "/cities",
        icon: MapPin,
        permission: PERMISSIONS.VIEW_CITIES,
      },
    ],
  },

  {
    type: "group",
    title: "Settings",
    icon: Settings,
    children: [
      {
        title: "Roles",
        href: "/roles",
        icon: Users,
        permission: PERMISSIONS.VIEW_ROLES,
      },
      {
        title: "Users",
        href: "/users",
        icon: Users,
        permission: PERMISSIONS.VIEW_USERS,
      },
    ],
  },
];
