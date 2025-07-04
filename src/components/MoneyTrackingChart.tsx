"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type PlayerMoneyStats = {
  playerId: string;
  playerName: string;
  totalEarned: number;
  totalLost: number;
  netBalance: number;
  matchHistory: {
    date: Date;
    amount: number;
    cumulativeBalance: number;
  }[];
};

interface MoneyTrackingChartProps {
  playerMoneyStats: PlayerMoneyStats[];
}

const colors = [
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#f97316", // orange
  "#06b6d4", // cyan
  "#84cc16", // lime
];

export default function MoneyTrackingChart({
  playerMoneyStats,
}: MoneyTrackingChartProps) {
  // Create a unified timeline of all match dates
  const allDates = new Set<string>();
  playerMoneyStats.forEach((player) => {
    player.matchHistory.forEach((match) => {
      allDates.add(match.date.toISOString().split("T")[0]);
    });
  });

  const sortedDates = Array.from(allDates).sort();

  // Create chart data
  const chartData = sortedDates.map((dateStr) => {
    const dataPoint: Record<string, string | number> = { date: dateStr };

    playerMoneyStats.forEach((player) => {
      // Find the latest balance for this player up to this date
      let balance = 0;
      for (const match of player.matchHistory) {
        const matchDate = match.date.toISOString().split("T")[0];
        if (matchDate <= dateStr) {
          balance = match.cumulativeBalance;
        } else {
          break;
        }
      }
      dataPoint[player.playerName] = balance;
    });

    return dataPoint;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatTooltip = (value: number, name: string) => {
    return [`€${value.toFixed(2)}`, name];
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="#9ca3af"
            fontSize={12}
          />
          <YAxis
            stroke="#9ca3af"
            fontSize={12}
            tickFormatter={(value) => `€${value}`}
          />
          <Tooltip
            formatter={formatTooltip}
            labelFormatter={(label) => formatDate(label)}
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "8px",
              color: "#f3f4f6",
            }}
          />
          <Legend />
          {playerMoneyStats.map((player, index) => (
            <Line
              key={player.playerId}
              type="monotone"
              dataKey={player.playerName}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
