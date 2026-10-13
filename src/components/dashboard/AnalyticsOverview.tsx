import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  TrendingUp,
  QrCode,
  BookOpen,
  Gift,
  Star,
  Users,
  Clock,
  ArrowUpRight,
  Flame,
} from 'lucide-react';

export const AnalyticsOverview: React.FC = () => {
  const { activeTenant, tables, items, feedback, loyaltyCards } = useStore();

  const totalScans = tables.reduce((acc, t) => acc + t.totalScans, 0) || activeTenant.stats.totalScans;
  const sortedTables = [...tables].sort((a, b) => b.totalScans - a.totalScans);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" /> Table-Top Portal Analytics & Telemetry
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time scan frequency, peak dining hours, table performance, and loyalty engagement metrics.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total QR Scans</span>
            <QrCode className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{totalScans.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="w-3 h-3" /> +18.4% vs last week
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Digital Menu Views</span>
            <BookOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {activeTenant.stats.menuViews.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Avg. 2.8 items viewed / scan
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Loyalty Cards Active</span>
            <Gift className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {loyaltyCards.length || activeTenant.stats.loyaltyCardsIssued}
          </div>
          <div className="text-[11px] text-purple-400 mt-1 font-medium">
            32% repeat customer return rate
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Satisfaction Score</span>
            <Star className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            ★ {activeTenant.stats.averageRating}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Based on {feedback.length || activeTenant.stats.feedbackCount} table responses
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table Performance Leaderboard */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">Table QR Traffic Leaderboard</h3>
            <span className="text-xs text-slate-500 font-mono">By Scan Volume</span>
          </div>

          <div className="space-y-3">
            {sortedTables.slice(0, 6).map((table, idx) => {
              const maxScans = sortedTables[0]?.totalScans || 1;
              const percent = Math.min(100, Math.round((table.totalScans / maxScans) * 100));

              return (
                <div key={table.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 flex items-center gap-2">
                      <span className="text-slate-500 font-mono text-[11px]">#{idx + 1}</span>
                      Table {table.tableNumber} ({table.section || 'Main'})
                    </span>
                    <span className="font-mono text-amber-400 font-bold">{table.totalScans} scans</span>
                  </div>

                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: activeTenant.themeColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Peak Dining Hours */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" /> Peak Scan Hours
            </h3>
            <span className="text-[11px] text-slate-500">Hourly Distribution</span>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { time: '8:00 AM - 10:00 AM', label: 'Morning Rush (Coffee & Pastry)', volume: '34%' },
              { time: '12:00 PM - 2:00 PM', label: 'Lunch Rush', volume: '41%' },
              { time: '3:00 PM - 5:00 PM', label: 'Afternoon Lull / Remote Work', volume: '12%' },
              { time: '6:00 PM - 9:00 PM', label: 'Evening Dinner & Drinks', volume: '23%' },
            ].map((slot, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-200">{slot.time}</div>
                  <div className="text-[11px] text-slate-400">{slot.label}</div>
                </div>
                <span className="font-bold text-amber-400 font-mono">{slot.volume}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/80">
            💡 <strong>Insight:</strong> 68% of customers who scan table stands between 8am and 10am join your loyalty punch card program on the spot.
          </div>
        </div>
      </div>
    </div>
  );
};
