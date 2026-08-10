import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine,
} from "recharts";

export default function ForecastChart({ history, forecast }) {
  const historyPoints = history.map((h) => ({
    date: h.date,
    actual: h.quantity,
  }));

  const forecastPoints = forecast.map((f) => ({
    date: f.date,
    predicted: f.predicted_quantity,
    band: [f.lower_bound, f.upper_bound],
  }));

  const combined = [...historyPoints, ...forecastPoints];
  const splitDate = forecast.length > 0 ? forecast[0].date : null;

  return (
    <div style={{ width: "100%", height: 340 }}>
      <ResponsiveContainer>
        <ComposedChart data={combined} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="#26374A" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#5D6E80", fontSize: 11, fontFamily: "JetBrains Mono" }}
            axisLine={{ stroke: "#26374A" }}
            tickLine={false}
            minTickGap={40}
          />
          <YAxis
            tick={{ fill: "#5D6E80", fontSize: 11, fontFamily: "JetBrains Mono" }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: "#1C2A38",
              border: "1px solid #34495F",
              borderRadius: 6,
              fontSize: 12,
              fontFamily: "Inter",
            }}
            labelStyle={{ color: "#8A9BAE" }}
          />
          <Area
            type="monotone"
            dataKey="band"
            stroke="none"
            fill="#4FC3D9"
            fillOpacity={0.08}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#8A9BAE"
            strokeWidth={2}
            dot={false}
            connectNulls
            name="Historical"
          />
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#4FC3D9"
            strokeWidth={2}
            strokeDasharray="4 3"
            dot={false}
            connectNulls
            name="Forecast"
          />
          {splitDate && (
            <ReferenceLine x={splitDate} stroke="#34495F" strokeDasharray="3 3" />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
