import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MetricSparklineProps {
  data: number[];
  color?: string;
}

export function MetricSparkline({ data, color = '#8B5CF6' }: MetricSparklineProps) {
  // Convert array to chart data format
  const chartData = data.map((value, index) => ({
    index,
    value,
  }));

  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
