import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { CHART_COLORS } from '@/lib/format'

const grid = 'var(--border)'
const tickStyle = { fill: 'var(--muted-foreground)', fontSize: 11 }

export function SparkArea({ data, dataKey, color }: { data: any[]; dataKey: string; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id={`g-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color || CHART_COLORS[0]} stopOpacity={0.5} />
            <stop offset="100%" stopColor={color || CHART_COLORS[0]} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey={dataKey} stroke={color || CHART_COLORS[0]}
          strokeWidth={1.6} fill={`url(#g-${dataKey})`} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function TrendArea({ data, keys, height = 320 }:
  { data: any[]; keys: { key: string; name: string; color?: string }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
        <CartesianGrid stroke={grid} strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={tickStyle} />
        <YAxis tick={tickStyle} />
        <Tooltip contentStyle={{ background: 'var(--popover)', border: `1px solid ${grid}`, borderRadius: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {keys.map((k, i) => (
          <Area key={k.key} type="monotone" dataKey={k.key} name={k.name}
            stroke={k.color || CHART_COLORS[i % CHART_COLORS.length]}
            fill={k.color || CHART_COLORS[i % CHART_COLORS.length]}
            fillOpacity={0.15} strokeWidth={2} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function HBar({ data, dataKey = 'value', nameKey = 'name', height = 280 }:
  { data: any[]; dataKey?: string; nameKey?: string; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 80, bottom: 4 }}>
        <CartesianGrid stroke={grid} strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={tickStyle} />
        <YAxis type="category" dataKey={nameKey} tick={tickStyle} width={120} />
        <Tooltip contentStyle={{ background: 'var(--popover)', border: `1px solid ${grid}`, borderRadius: 12 }} />
        <Bar dataKey={dataKey} radius={[0, 6, 6, 0]}>
          {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function Donut({ data, height = 240 }: { data: any[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2}>
          {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ background: 'var(--popover)', border: `1px solid ${grid}`, borderRadius: 12 }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function VBar({ data, dataKey = 'value', nameKey = 'name', height = 280 }:
  { data: any[]; dataKey?: string; nameKey?: string; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 24 }}>
        <CartesianGrid stroke={grid} strokeDasharray="3 3" />
        <XAxis dataKey={nameKey} tick={tickStyle} angle={-15} textAnchor="end" interval={0} height={60} />
        <YAxis tick={tickStyle} />
        <Tooltip contentStyle={{ background: 'var(--popover)', border: `1px solid ${grid}`, borderRadius: 12 }} />
        <Bar dataKey={dataKey} radius={[8, 8, 0, 0]}>
          {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function LineSeries({ data, keys, height = 280 }:
  { data: any[]; keys: { key: string; name: string; color?: string }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
        <CartesianGrid stroke={grid} strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={tickStyle} />
        <YAxis tick={tickStyle} />
        <Tooltip contentStyle={{ background: 'var(--popover)', border: `1px solid ${grid}`, borderRadius: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {keys.map((k, i) => (
          <Line key={k.key} type="monotone" dataKey={k.key} name={k.name}
            stroke={k.color || CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2}
            dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

export function Heatmap({ rows, cols, data, valueKey = 'value', rowKey, colKey, height = 360 }:
  { rows: string[]; cols: string[]; data: any[]; valueKey?: string;
    rowKey: string; colKey: string; height?: number }) {
  const max = Math.max(...data.map((d) => d[valueKey] || 0), 1)
  const lookup: Record<string, Record<string, number>> = {}
  data.forEach((d) => {
    (lookup[d[rowKey]] = lookup[d[rowKey]] || {})[d[colKey]] = d[valueKey] || 0
  })
  return (
    <div className="overflow-auto" style={{ maxHeight: height }}>
      <table className="text-xs border-separate" style={{ borderSpacing: 2 }}>
        <thead>
          <tr>
            <th className="text-left px-2 sticky left-0 bg-card z-10"></th>
            {cols.map((c) => <th key={c} className="px-1 text-muted-foreground font-normal">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r}>
              <td className="px-2 py-1 sticky left-0 bg-card text-foreground whitespace-nowrap max-w-[200px] truncate" title={r}>{r}</td>
              {cols.map((c) => {
                const v = lookup[r]?.[c] || 0
                const a = max ? v / max : 0
                return (
                  <td key={c} className="text-center rounded"
                      style={{
                        background: `color-mix(in oklab, var(--primary) ${Math.round(8 + 70 * a)}%, transparent)`,
                        color: a > 0.5 ? 'white' : 'inherit',
                        minWidth: 36, padding: '6px 4px',
                      }} title={`${r} · ${c}: ${v}`}>
                    {v || ''}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
