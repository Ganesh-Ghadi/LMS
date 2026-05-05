"use client";

import { AppCard } from "@/components/common/app-card";
import { AppButton } from "@/components/common/app-button";
import Link from "next/link";
import { Map, MapPin, Users, Settings } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import { PERMISSIONS } from "@/config/roles";

export default function InternalDashboard() {
  const { can } = usePermissions();

  const cards = [
    {
      title: "States",
      description: "Manage states and regions",
      href: "/states",
      icon: Map,
      permission: PERMISSIONS.VIEW_STATES,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Cities",
      description: "Manage cities within states",
      href: "/cities",
      icon: MapPin,
      permission: PERMISSIONS.VIEW_CITIES,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Users",
      description: "Manage user accounts",
      href: "/users",
      icon: Users,
      permission: PERMISSIONS.VIEW_USERS,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Roles",
      description: "Manage roles and permissions",
      href: "/roles",
      icon: Settings,
      permission: PERMISSIONS.VIEW_ROLES,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
    },
  ].filter(card => can(card.permission));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your new project boilerplate.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <AppCard key={card.href} className="hover:shadow-md transition-shadow">
            <AppCard.Header className="flex flex-row items-center justify-between space-y-0 pb-2">
              <AppCard.Title className="text-sm font-medium">
                {card.title}
              </AppCard.Title>
              <div className={`h-8 w-8 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </AppCard.Header>
            <AppCard.Content>
              <p className="text-xs text-muted-foreground mb-4">
                {card.description}
              </p>
              <AppButton size="sm" variant="outline" className="w-full" asChild>
                <Link href={card.href}>Open Module</Link>
              </AppButton>
            </AppCard.Content>
          </AppCard>
        ))}
      </div>
    </div>
  );
}
