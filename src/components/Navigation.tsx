"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UserGroupIcon,
  UsersIcon,
  TrophyIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import {
  UserGroupIcon as UserGroupIconSolid,
  UsersIcon as UsersIconSolid,
  TrophyIcon as TrophyIconSolid,
  ChartBarIcon as ChartBarIconSolid,
} from "@heroicons/react/24/solid";

const Navigation = () => {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Players",
      href: "/players",
      icon: UserGroupIcon,
      iconSolid: UserGroupIconSolid,
    },
    {
      name: "Pairs",
      href: "/pairs",
      icon: UsersIcon,
      iconSolid: UsersIconSolid,
    },
    {
      name: "Matches",
      href: "/matches",
      icon: TrophyIcon,
      iconSolid: TrophyIconSolid,
    },
    {
      name: "Rankings",
      href: "/rankings",
      icon: ChartBarIcon,
      iconSolid: ChartBarIconSolid,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (pathname === "/" && item.href === "/players");
          const Icon = isActive ? item.iconSolid : item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive
                  ? "text-emerald-600 bg-emerald-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs mt-1 font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
