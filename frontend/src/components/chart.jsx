import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const colorMap = {
  temperature: { stroke: '#f59e0b', fill: '#f59e0b' },
  humidity: { stroke: '#3b82f6', fill: '#3b82f6' },
  co2: { stroke: '#22c55e', fill: '#22c55e' },
  pm25: { stroke: '#a855f7', fill: '#a855f7' },
};

const labelMap = {
  temperature: 'Temperature (°C)',
  humidity: 'Humidity (%)',
  co2: 'CO₂ (ppm)',
  pm25: 'PM2.5 (µg/m³)',
};

export default function Chart({ type, data }) {
  const colors = colorMap[type];
  const label = labelMap[type];

  return (
    <div className="chart-card">
      <h3 className="chart-title">{label}</h3>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.fill} stopOpacity={0.3} />
              <stop offset="100%" stopColor={colors.fill} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} 
            stroke="rgba(255,255,255,0.1)"
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} 
            stroke="rgba(255,255,255,0.1)"
            domain={['auto', 'auto']}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#fff',
            }}
            labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={colors.stroke}
            strokeWidth={2}
            fill={`url(#gradient-${type})`}
            dot={false}
            activeDot={{ r: 6, fill: colors.stroke, stroke: 'white', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}