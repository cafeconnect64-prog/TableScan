import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { TableOrder, OrderStatus } from '../../types';
import {
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  ChefHat,
  Bell,
  ArrowRight,
  Filter,
  Check,
  Receipt,
  User,
  Coffee,
  Volume2,
  VolumeX,
  Sparkles,
  Banknote,
} from 'lucide-react';

export const KitchenOrdersManager: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    markOrderAsCashPaid,
    activeTenant,
    serviceRequests,
    updateServiceRequestStatus,
    playNotificationSound,
  } = useStore();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const pendingServiceRequests = serviceRequests.filter((r) => r.status !== 'completed');
  const filteredOrders = orders.filter((o) => {
    if (filter === 'all') return true;
    return o.status === filter;
  });

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const servedCount = orders.filter((o) => o.status === 'served').length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
            New Order (Pending)
          </span>
        );
      case 'preparing':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Chef Preparing
          </span>
        );
      case 'served':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            Served at Table
          </span>
        );
      case 'paid':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Completed & Paid
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-500/20 text-slate-400 border border-slate-500/30">
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-100">Live Kitchen & Table Orders (KDS)</h2>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-extrabold text-[11px] animate-bounce">
                {pendingCount} New
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time table orders sent by guests scanning the QR menu. Update kitchen preparation status and print bills.
          </p>
        </div>

        {/* Filter Pills & Audio Controls */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              if (!soundEnabled) playNotificationSound();
              setSoundEnabled(!soundEnabled);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
              soundEnabled
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title="Toggle Kitchen Order Chime Sound"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'Chime ON' : 'Muted'}</span>
          </button>

          <button
            type="button"
            onClick={playNotificationSound}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 transition"
            title="Test bell sound"
          >
            🔔 Test
          </button>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto">
            {(['all', 'pending', 'preparing', 'served', 'paid'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-lg capitalize font-semibold whitespace-nowrap transition ${
                  filter === st
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st} {st === 'pending' && pendingCount > 0 ? `(${pendingCount})` : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Table Service Bell & Waiter Calls */}
      {pendingServiceRequests.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border border-amber-500/50 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <h3 className="font-extrabold text-sm text-amber-300 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>Active Table Service Calls</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-xs font-black">
                  {pendingServiceRequests.length} Pending
                </span>
              </h3>
            </div>
            <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
              Guests waiting for staff assistance
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingServiceRequests.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 flex flex-col justify-between gap-3 shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-xs font-mono">
                      Table {req.tableNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {req.createdAt}
                    </span>
                  </div>

                  <div className="mt-2">
                    <div className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                      <span>{req.title}</span>
                    </div>
                    {req.note && (
                      <div className="text-[11px] text-amber-200/90 italic mt-1 bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20">
                        "{req.note}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-900">
                  {req.status === 'pending' ? (
                    <button
                      type="button"
                      onClick={() => updateServiceRequestStatus(req.id, 'acknowledged')}
                      className="flex-1 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold rounded-lg border border-amber-500/40 text-xs transition"
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <span className="flex-1 text-[11px] font-bold text-amber-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Staff En Route
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => updateServiceRequestStatus(req.id, 'completed')}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow-sm transition flex items-center justify-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Done
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Pending Kitchen Action</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">{pendingCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Waiting for chef start</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>In Kitchen Preparation</span>
            <ChefHat className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{preparingCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Cooking / brewing now</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Served to Tables</span>
            <UtensilsCrossed className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">{servedCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Enjoying table meal</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Table Orders Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {activeTenant.currency}{totalRevenue.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{orders.length} total table tickets</div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full p-12 text-center border border-dashed border-slate-800 rounded-2xl text-xs text-slate-500">
            No table orders found for filter "{filter}".
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-lg ${
                order.status === 'pending'
                  ? 'bg-gradient-to-b from-rose-950/40 to-slate-900 border-rose-500/50 ring-1 ring-rose-500/20'
                  : order.status === 'preparing'
                  ? 'bg-slate-900/90 border-amber-500/40'
                  : order.status === 'served'
                  ? 'bg-slate-900/70 border-cyan-500/40'
                  : 'bg-slate-900/40 border-slate-800/80 opacity-80'
              }`}
            >
              {/* Order Ticket Header */}
              <div className="p-4 border-b border-slate-800 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-slate-100 font-mono">
                      Order #{order.orderNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-black text-xs">
                      Table {order.tableNumber}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" /> {order.createdAt}
                    </span>
                    {order.customerName && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1 truncate max-w-[120px]">
                          <User className="w-3 h-3 text-slate-500" /> {order.customerName}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {getStatusBadge(order.status)}
                  {order.paymentStatus === 'paid' ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{order.paymentMethod === 'counter' ? 'Paid in Cash (कैश भुगतान)' : `Paid via ${order.paymentMethod?.toUpperCase()}`}</span>
                    </span>
                  ) : order.paymentMethod === 'counter' ? (
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Banknote className="w-3 h-3 text-amber-400" />
                      <span>Cash Payment (कैश पेमेंट - काउंटर)</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-950/60 border border-rose-500/40 px-2 py-0.5 rounded-full">
                      Digital Payment Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="p-4 space-y-2.5 flex-1">
                <div className="space-y-1.5 text-xs">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-start justify-between gap-2"
                    >
                      <div>
                        <div className="font-bold text-slate-100 flex items-center gap-1.5">
                          <span className="font-mono text-amber-400 font-extrabold">
                            {item.quantity}x
                          </span>
                          <span>{item.name}</span>
                        </div>
                        {item.specialInstructions && (
                          <div className="text-[11px] text-amber-300/90 italic mt-0.5">
                            Note: {item.specialInstructions}
                          </div>
                        )}
                      </div>
                      <span className="font-mono text-slate-400 font-medium">
                        {order.currency}{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {order.notes && (
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/20 text-[11px] text-amber-200">
                    <strong>Table Request:</strong> {order.notes}
                  </div>
                )}
              </div>

              {/* Bill & Quick Action Transitions */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div>
                    <span className="text-slate-400">Total Bill</span>
                    {order.transactionId && (
                      <span className="text-[10px] text-slate-500 font-mono ml-1">
                        ({order.transactionId})
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {order.currency}{order.totalAmount.toFixed(2)}
                  </span>
                </div>

                {/* Workflow Buttons */}
                <div className="space-y-2 text-xs">
                  {/* Quick Cash Receipt Button if payment pending and method is counter/cash */}
                  {order.paymentStatus !== 'paid' && (
                    <button
                      type="button"
                      onClick={() => markOrderAsCashPaid(order.id)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95"
                      title="Receive cash from customer and mark as paid"
                    >
                      <Banknote className="w-4 h-4 text-emerald-200" />
                      <span>Accept Cash Payment ({order.currency}{order.totalAmount.toFixed(2)} कैश प्राप्त हुआ)</span>
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="col-span-2 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <ChefHat className="w-4 h-4" />
                        <span>Accept & Start Preparing</span>
                      </button>
                    )}

                    {order.status === 'preparing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'served')}
                        className="col-span-2 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <UtensilsCrossed className="w-4 h-4" />
                        <span>Mark Served to Table {order.tableNumber}</span>
                      </button>
                    )}

                    {order.status === 'served' && (
                      <button
                        onClick={() => {
                          if (order.paymentStatus !== 'paid') {
                            markOrderAsCashPaid(order.id);
                          } else {
                            updateOrderStatus(order.id, 'paid');
                          }
                        }}
                        className="col-span-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        <span>Settle Bill & Complete Order</span>
                      </button>
                    )}

                    {order.status === 'paid' && (
                      <div className="col-span-2 text-center text-emerald-400 font-semibold text-xs py-1">
                        ✓ Completed & Paid ({order.paymentMethod === 'counter' ? 'Cash' : order.paymentMethod?.toUpperCase()})
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
