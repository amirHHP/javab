"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface ChartDataPoint {
  date: string;
  value: number;
}

interface ResultTrendChartProps {
  testName: string;
  data: ChartDataPoint[];
  normalMin: number;
  normalMax: number;
  unit: string;
}

export default function ResultTrendChart({
  testName,
  data,
  normalMin,
  normalMax,
  unit,
}: ResultTrendChartProps) {
  if (data.length < 2) {
    return (
      <div style={{
        padding: "2rem",
        textAlign: "center",
        color: "#94A3B8",
        fontSize: "0.8rem",
      }}>
        برای نمایش نمودار حداقل ۲ نتیجه لازم است
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 200 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#94A3B8" }}
            tickLine={false}
            axisLine={{ stroke: "#E2E8F0" }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94A3B8" }}
            tickLine={false}
            axisLine={{ stroke: "#E2E8F0" }}
            domain={["auto", "auto"]}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(255,255,255,0.95)",
              border: "1px solid #E2E8F0",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              fontSize: "0.8rem",
              direction: "rtl",
            }}
            formatter={(value: number) => [`${value} ${unit}`, testName]}
            labelFormatter={(label) => `تاریخ: ${label}`}
          />
          {normalMin > 0 && (
            <ReferenceLine
              y={normalMin}
              stroke="#10B981"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
            />
          )}
          <ReferenceLine
            y={normalMax}
            stroke="#10B981"
            strokeDasharray="4 4"
            strokeOpacity={0.5}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#0EA5E9"
            strokeWidth={2.5}
            dot={{
              fill: "#0EA5E9",
              strokeWidth: 2,
              stroke: "white",
              r: 5,
            }}
            activeDot={{
              fill: "#0EA5E9",
              strokeWidth: 3,
              stroke: "white",
              r: 7,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
