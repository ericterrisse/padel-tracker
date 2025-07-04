"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrophyIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import {
  TrophyIcon as TrophyIconSolid,
  ChartBarIcon as ChartBarIconSolid,
} from "@heroicons/react/24/solid";

const Navigation = () => {
  const pathname = usePathname();

  const navItems = [
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
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-around py-3">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (pathname === "/" && item.href === "/matches");
            const Icon = isActive ? item.iconSolid : item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "text-emerald-400 bg-emerald-500/10"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs mt-1 font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
