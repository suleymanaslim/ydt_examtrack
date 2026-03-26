// frontend/src/components/NetChart.jsx
// Line chart — reads from JSON format (exam.date, exam.totalNet)

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
  });
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-date">{label}</p>
        <p className="tooltip-net">
          Net: <strong>{payload[0].value.toFixed(2)}</strong>
        </p>
      </div>
    );
  }
  return null;
}

export default function NetChart({ exams }) {
  const chartData = [...exams]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((exam) => ({
      date: formatDate(exam.date),
      net: Number(exam.totalNet),
    }));

  if (chartData.length === 0) return null;

  const maxNet = Math.max(...chartData.map((d) => d.net));
  const minNet = Math.min(...chartData.map((d) => d.net));
  const yDomain = [Math.floor(minNet - 5), Math.ceil(maxNet + 5)];

  return (
    <div className="net-chart">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} margin={{ top: 16, right: 24, left: 16, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 196, 242, 0.08)" />
          <XAxis
            dataKey="date"
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(148, 196, 242, 0.15)' }}
          />
          <YAxis
            domain={yDomain}
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(148, 196, 242, 0.15)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="rgba(148, 196, 242, 0.2)" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="net"
            stroke="#60a5fa"
            strokeWidth={2.5}
            dot={{ fill: '#60a5fa', stroke: '#1e293b', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#e2e8f0', stroke: '#60a5fa', strokeWidth: 2.5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
