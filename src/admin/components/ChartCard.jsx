import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';

export function ChartCard({ title, subtitle }) {
  const [period, setPeriod] = useState('7d');
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const { orders } = useOrders();
  const count = period === '1y' ? 12 : period === '30d' ? 30 : 7;
  const data = Array.from({length:count}, (_, i) => {
    const start = new Date(); start.setHours(0,0,0,0);
    if(period === '1y') { start.setDate(1); start.setMonth(start.getMonth()-(count-1-i)); } else start.setDate(start.getDate()-(count-1-i));
    const end = new Date(start); if(period === '1y') end.setMonth(end.getMonth()+1); else end.setDate(end.getDate()+1);
    const group = orders.filter(o => new Date(o.createdAt) >= start && new Date(o.createdAt) < end);
    return {label:start.toLocaleDateString('en-IN', period === '1y' ? {month:'short'} : {day:'numeric',month:'short'}), revenue:group.filter(o => o.status === 'Delivered').reduce((s,o) => s+o.total,0), orders:group.length, customers:new Set(group.map(o => o.userId)).size};
  });
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const maxOrders = Math.max(...data.map((d) => d.orders), 1);

  // Fixed SVG coordinate dimensions
  const width = 640;
  const height = 220;
  const paddingX = 40;
  const paddingTop = 25;
  const paddingBottom = 35;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingTop - paddingBottom;

  // Calculate coordinates for points
  const points = data.map((item, index) => {
    const x = paddingX + (index / (data.length - 1 || 1)) * chartWidth;
    const y = paddingTop + chartHeight - (item.revenue / maxRevenue) * chartHeight;
    return { x, y, item, index };
  });

  // Generate SVG smooth bezier path
  const linePath = points.reduce((acc, point, index, arr) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const prev = arr[index - 1];
    const controlX = (prev.x + point.x) / 2;
    return `${acc} C ${controlX} ${prev.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
  }, '');

  // Generate SVG area fill path
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

  // Grid line values
  const yAxisTicks = [0, 0.33, 0.66, 1].map((ratio) => {
    const val = Math.round(maxRevenue * ratio);
    const y = paddingTop + chartHeight - ratio * chartHeight;
    return { val, y };
  });

  // Dynamic Tooltip Tracking Calculations
  const hoveredPoint = hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex] : null;
  const leftPercent = hoveredPoint ? (hoveredPoint.x / width) * 100 : 0;
  const isNearTop = hoveredPoint ? hoveredPoint.y < 65 : false;
  const topPercent = hoveredPoint
    ? isNearTop
      ? ((hoveredPoint.y + 16) / height) * 100
      : ((hoveredPoint.y - 14) / height) * 100
    : 0;

  let transformX = '-50%';
  if (leftPercent < 20) {
    transformX = '-10%';
  } else if (leftPercent > 80) {
    transformX = '-90%';
  }
  const transformY = isNearTop ? '0%' : '-100%';

  return (
    <div className="rounded-2xl bg-surface border border-border p-5 shadow-subtle flex flex-col justify-between h-full min-h-[360px]">
      {/* 1. Header & Controls (Stable Fixed Structure) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 shrink-0">
        <div>
          <h3 className="text-base font-black text-text-primary tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-text-secondary mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Period Selector Tabs */}
        <div className="inline-flex items-center p-1 rounded-xl bg-surface-soft border border-border self-start sm:self-auto shrink-0">
          {[
            { id: '7d', label: '7D' },
            { id: '30d', label: '30D' },
            { id: '1y', label: '1Y' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setPeriod(tab.id);
                setHoveredIndex(null);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                period === tab.id
                  ? 'bg-surface text-primary shadow-2xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Constant Height Legend Row (Zero Layout Shifting) */}
      <div className="h-6 flex items-center gap-4 px-1 text-xs shrink-0 mb-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="font-semibold text-text-secondary text-xs">Revenue (₹)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-secondary/80" />
          <span className="font-semibold text-text-secondary text-xs">Orders</span>
        </div>
      </div>

      {/* 3. SVG Interactive Chart Container with Fixed Height & Absolute Floating Tooltip */}
      <div className="relative w-full h-[230px] flex items-center justify-center overflow-hidden select-none">
        {/* Dynamic Tracking Floating Tooltip Overlay - follows hovered point seamlessly */}
        {hoveredPoint && (
          <div
            className="pointer-events-none absolute z-30 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface/95 backdrop-blur-md border border-border shadow-lg text-xs font-bold text-text-primary whitespace-nowrap transition-all duration-150 ease-out"
            style={{
              left: `${leftPercent}%`,
              top: `${topPercent}%`,
              transform: `translate(${transformX}, ${transformY})`,
              pointerEvents: 'none',
            }}
          >
            <span className="text-text-muted font-bold">{data[hoveredIndex].label}:</span>
            <span className="text-primary font-black">
              ₹{data[hoveredIndex].revenue.toLocaleString('en-IN')}
            </span>
            <span className="text-secondary-dark font-black text-[11px]">
              ({data[hoveredIndex].orders} orders)
            </span>
          </div>
        )}

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible select-none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.30" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background horizontal gridlines */}
          {yAxisTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={paddingX}
                y1={tick.y}
                x2={width - paddingX}
                y2={tick.y}
                stroke="currentColor"
                className="text-border/60"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingX - 8}
                y={tick.y + 3}
                textAnchor="end"
                className="text-[9px] fill-text-muted font-medium"
              >
                {tick.val >= 1000 ? `${(tick.val / 1000).toFixed(0)}k` : tick.val}
              </text>
            </g>
          ))}

          {/* Secondary Series: Background Order Bars */}
          {data.map((item, i) => {
            const barWidth = Math.min(24, (chartWidth / data.length) * 0.4);
            const x = points[i].x - barWidth / 2;
            const barHeight = (item.orders / maxOrders) * (chartHeight * 0.65);
            const y = paddingTop + chartHeight - barHeight;
            const isHovered = hoveredIndex === i;

            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={4}
                className={`transition-all duration-200 cursor-pointer ${
                  isHovered
                    ? 'fill-secondary'
                    : 'fill-secondary/20 hover:fill-secondary/40'
                }`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}

          {/* Area under line */}
          <path d={areaPath} fill="url(#revenueGradient)" />

          {/* Primary Curve Line */}
          <path
            d={linePath}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Vertical Guide Line on Hover */}
          {hoveredIndex !== null && points[hoveredIndex] && (
            <line
              x1={points[hoveredIndex].x}
              y1={paddingTop}
              x2={points[hoveredIndex].x}
              y2={paddingTop + chartHeight}
              stroke="var(--primary)"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              className="opacity-70 pointer-events-none"
            />
          )}

          {/* Interactive Data Points & Hover Columns */}
          {points.map((pt, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <g key={i}>
                {/* Transparent wider touch column */}
                <rect
                  x={pt.x - chartWidth / (data.length * 2)}
                  y={paddingTop}
                  width={chartWidth / data.length}
                  height={chartHeight + paddingBottom}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />

                {/* Point circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 3.5}
                  className={`transition-all duration-150 pointer-events-none ${
                    isHovered
                      ? 'fill-primary stroke-surface stroke-[3px]'
                      : 'fill-primary'
                  }`}
                />

                {/* X-axis label */}
                <text
                  x={pt.x}
                  y={height - 10}
                  textAnchor="middle"
                  className={`text-[10px] font-bold transition-colors pointer-events-none ${
                    isHovered ? 'fill-primary font-black' : 'fill-text-secondary'
                  }`}
                >
                  {pt.item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
