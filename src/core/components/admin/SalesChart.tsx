'use client'

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'

type SalesData = {
  date: string
  value: number
}

export function SalesChart({ data }: { data: SalesData[] }) {
  return (
    <div className="h-80 w-full rounded-xl border border-[var(--color-admin-border)] bg-[var(--color-admin-bg)] p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">Vendas por dia (últimos 30 dias)</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(value) => `R$${Number(value).toFixed(0)}`} />
          <Tooltip
            formatter={(value) => {
              const num = typeof value === 'number' ? value : Number(value)
              if (Number.isNaN(num)) return ['R$0.00', 'Vendas']
              return [`R$${num.toFixed(2)}`, 'Vendas']
            }}
          />
          <Line type="monotone" dataKey="value" stroke="var(--color-info)" strokeWidth={2} dot={{ r: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
