
import React from 'react';

interface KPICardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  colorClass?: string;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, subLabel, trend, colorClass = "text-blue-600" }) => {
  return (
    <div className="glass-card p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100">
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-end justify-between">
        <div>
          <h3 className={`text-2xl font-black tracking-tighter ${colorClass}`}>{value}</h3>
          {subLabel && <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase">{subLabel}</p>}
        </div>
        {trend && (
          <div className={`flex items-center text-[10px] font-black px-2 py-1 rounded-lg ${trend.isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span className="ml-1">{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;
