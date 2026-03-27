// frontend/src/components/NetChart.jsx
// Line chart — custom SVG implementation for maximum reliability
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
  });
}

export default function NetChart({ exams }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const containerRef = useRef(null);

  const chartData = [...exams]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((exam) => ({
      date: formatDate(exam.date),
      net: Number(exam.totalNet),
      originalDate: exam.date
    }));

  if (chartData.length === 0) return null;

  if (chartData.length <= 1) {
    return (
      <div className="flex flex-col items-center justify-center h-[320px] bg-white/[0.02] rounded-xl border border-white/[0.05] text-slate-400">
        <TrendingUp size={32} className="mb-3 opacity-20" />
        <p className="text-sm font-medium">Gelişim grafiği için en az iki sınav gereklidir.</p>
        <p className="text-xs opacity-60 mt-1">İkinci sınavı ekledikten sonra ilerleme trendini görebileceksiniz.</p>
      </div>
    );
  }

  // Chart dimensions
  const width = 800;
  const height = 300;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Scales
  const nets = chartData.map(d => d.net);
  const minNet = Math.min(...nets, 0);
  const maxNet = Math.max(...nets, 10);
  const netRange = maxNet - minNet || 1;

  const points = chartData.map((d, i) => ({
    x: padding + (i * chartWidth) / (chartData.length - 1),
    y: height - padding - ((d.net - minNet) * chartHeight) / netRange,
    data: d
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="net-chart-container relative group" ref={containerRef}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))' }}
      >
        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(v => (
          <line
            key={v}
            x1={padding}
            y1={height - padding - v * chartHeight}
            x2={width - padding}
            y2={height - padding - v * chartHeight}
            stroke="rgba(148, 196, 242, 0.05)"
            strokeWidth="1"
          />
        ))}

        {/* X Axis Labels */}
        {points.map((p, i) => (
          (i === 0 || i === points.length - 1 || points.length < 8) && (
            <text
              key={i}
              x={p.x}
              y={height - padding + 20}
              textAnchor="middle"
              className="fill-slate-500 text-[10px] font-medium"
            >
              {p.data.date}
            </text>
          )
        ))}

        {/* The Line */}
        <motion.path
          d={linePath}
          fill="none"
          stroke="#60a5fa"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />

        {/* Interaction Points */}
        {points.map((p, i) => (
          <g 
            key={i} 
            onMouseEnter={() => setHoveredPoint(p)}
            onMouseLeave={() => setHoveredPoint(null)}
            className="cursor-pointer"
          >
            {/* Invisible larger hit area */}
            <circle cx={p.x} cy={p.y} r="15" fill="transparent" />
            
            {/* Visible dot */}
            <motion.circle
              cx={p.x}
              cy={p.y}
              r={hoveredPoint === p ? 6 : 4}
              fill={hoveredPoint === p ? "#fff" : "#60a5fa"}
              stroke="#0c1220"
              strokeWidth="2"
              animate={{ r: hoveredPoint === p ? 6 : 4 }}
            />
          </g>
        ))}
      </svg>

      {/* Tooltip Overlay */}
      <AnimatePresence>
        {hoveredPoint && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute z-50 pointer-events-none"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`,
              transform: 'translate(-50%, -120%)'
            }}
          >
            <div className="bg-slate-900 border border-white/10 p-2.5 rounded-lg shadow-2xl backdrop-blur-md whitespace-nowrap">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">
                {hoveredPoint.data.date}
              </p>
              <p className="text-sm font-bold text-white">
                Net Score: <span className="text-blue-400">{hoveredPoint.data.net.toFixed(2)}</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
