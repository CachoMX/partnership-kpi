"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RevenueTrendChartProps {
  data: Array<{
    date: string
    revenue: number
    cash: number
  }>
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <p style={{
          color: 'var(--color-text-primary)',
          fontWeight: 'var(--font-semibold)',
          marginBottom: '8px'
        }}>
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '2px',
              backgroundColor: entry.color
            }}></div>
            <span style={{
              color: 'var(--color-text-secondary)',
              fontSize: '13px'
            }}>
              {entry.name}:
            </span>
            <span style={{
              color: entry.color,
              fontWeight: 'var(--font-semibold)',
              fontSize: '14px'
            }}>
              ${entry.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  return (
    <Card className="card-featured" style={{ border: 'none' }}>
      <CardHeader>
        <CardTitle className="text-h2">Revenue Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accent-secondary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-accent-secondary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              stroke="var(--color-text-muted)"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="var(--color-text-muted)"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-accent)"
              strokeWidth={2}
              fill="url(#colorRevenue)"
              name="Revenue"
            />
            <Area
              type="monotone"
              dataKey="cash"
              stroke="var(--color-accent-secondary)"
              strokeWidth={2}
              fill="url(#colorCash)"
              name="Cash Collected"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
