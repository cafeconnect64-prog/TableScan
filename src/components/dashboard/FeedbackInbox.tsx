import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  MessageSquare,
  Star,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  Tag,
  Filter,
} from 'lucide-react';
import { CustomerFeedback } from '../../types';

export const FeedbackInbox: React.FC = () => {
  const { feedback, updateFeedbackStatus, activeTenant } = useStore();
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'reviewed' | 'resolved'>('all');

  const filteredFeedback = feedback.filter((item) => {
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });

  const averageRating =
    feedback.length > 0
      ? (feedback.reduce((acc, f) => acc + f.overallRating, 0) / feedback.length).toFixed(1)
      : '5.0';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" /> Anonymous Table Feedback Inbox
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Private feedback collected directly from table QR scans. Resolve customer concerns before they hit public review sites.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs self-start sm:self-auto">
          {(['all', 'new', 'reviewed', 'resolved'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition ${
                statusFilter === filter
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Average Rating</div>
            <div className="text-2xl font-bold text-amber-400 flex items-center gap-1.5 mt-0.5">
              <span>★ {averageRating}</span>
              <span className="text-xs text-slate-500 font-normal">/ 5.0</span>
            </div>
          </div>
          <Star className="w-8 h-8 text-amber-500/20 fill-amber-500" />
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Total Table Reviews</div>
            <div className="text-2xl font-bold text-slate-100 mt-0.5">{feedback.length}</div>
          </div>
          <MessageSquare className="w-8 h-8 text-emerald-500/20" />
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Unresolved Items</div>
            <div className="text-2xl font-bold text-rose-400 mt-0.5">
              {feedback.filter((f) => f.status === 'new').length}
            </div>
          </div>
          <Clock className="w-8 h-8 text-rose-500/20" />
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-3">
        {filteredFeedback.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl text-xs text-slate-500">
            No feedback found for status "{statusFilter}".
          </div>
        ) : (
          filteredFeedback.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                item.status === 'new'
                  ? 'bg-slate-900/80 border-slate-700 shadow-md'
                  : 'bg-slate-900/40 border-slate-800/80 opacity-90'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center text-amber-400 text-sm font-bold">
                    {'★'.repeat(item.overallRating)}
                    <span className="text-slate-700">{'★'.repeat(5 - item.overallRating)}</span>
                  </div>

                  <span className="text-xs font-semibold text-slate-200">
                    Table {item.tableNumber}
                  </span>

                  <span className="text-xs text-slate-500 font-mono">
                    {item.createdAt}
                  </span>
                </div>

                {/* Status Switcher */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  {(['new', 'reviewed', 'resolved'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => updateFeedbackStatus(item.id, status)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition ${
                        item.status === status
                          ? status === 'new'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : status === 'reviewed'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment text */}
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                "{item.comment}"
              </p>

              {/* Category Sub-Ratings */}
              {(item.foodRating || item.serviceRating || item.ambianceRating) && (
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                  {item.foodRating && (
                    <span>Food: <strong className="text-slate-200">{item.foodRating}/5</strong></span>
                  )}
                  {item.serviceRating && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>Service: <strong className="text-slate-200">{item.serviceRating}/5</strong></span>
                    </>
                  )}
                  {item.ambianceRating && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>Ambiance: <strong className="text-slate-200">{item.ambianceRating}/5</strong></span>
                    </>
                  )}
                </div>
              )}

              {/* Tags & Contact */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-[11px]">
                <div className="flex flex-wrap items-center gap-1.5">
                  {item.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] border border-slate-700/60"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {item.customerContact && (
                  <span className="text-slate-400 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-amber-400" /> Contact requested: <strong className="text-slate-200 font-mono">{item.customerContact}</strong>
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
