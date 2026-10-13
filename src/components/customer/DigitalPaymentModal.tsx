import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { TableOrder } from '../../types';
import QRCode from 'qrcode';
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  X,
  Lock,
  Smartphone,
  Receipt,
  Download,
  DollarSign,
  ArrowRight,
  Sparkles,
  Banknote,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  order: TableOrder;
  onClose: () => void;
  onPaymentSuccess: (order: TableOrder) => void;
}

export const DigitalPaymentModal: React.FC<Props> = ({
  order,
  onClose,
  onPaymentSuccess,
}) => {
  const { activeTenant, payOrderOnline, markOrderAsCashPaid } = useStore();
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'counter'>('upi');
  const [upiQrUrl, setUpiQrUrl] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(order.paymentStatus === 'paid');
  const [receiptData, setReceiptData] = useState<{ txnId: string; date: string } | null>(
    order.paymentStatus === 'paid'
      ? { txnId: order.transactionId || 'TXN-984210', date: order.paidAt || 'Today' }
      : null
  );

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [tipAmount, setTipAmount] = useState<number>(0);

  const merchantUpi = activeTenant.payments?.upiId || 'artisanroast@okhdfcbank';
  const merchantName = activeTenant.payments?.upiPayeeName || activeTenant.name;
  const totalToPay = order.totalAmount + tipAmount;

  // Dynamic UPI URI
  const upiIntentString = `upi://pay?pa=${merchantUpi}&pn=${encodeURIComponent(
    merchantName
  )}&am=${totalToPay.toFixed(2)}&cu=${
    activeTenant.currency === '₹' ? 'INR' : 'USD'
  }&tn=Table_${order.tableNumber}_Order_${order.orderNumber}`;

  useEffect(() => {
    QRCode.toDataURL(upiIntentString, {
      width: 320,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setUpiQrUrl(url))
      .catch((err) => console.error(err));
  }, [upiIntentString]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(merchantUpi);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleFillTestCard = () => {
    setCardNumber('4242 •••• •••• 4242');
    setCardExpiry('12/28');
    setCardCvc('888');
    setCardHolder(order.customerName || 'Sophia Vance');
  };

  const handleExecutePayment = (method: 'upi' | 'card') => {
    setIsProcessing(true);

    setTimeout(() => {
      const generatedTxn = `${method.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
      payOrderOnline(order.id, method, generatedTxn);

      setIsProcessing(false);
      setPaidSuccess(true);
      setReceiptData({
        txnId: generatedTxn,
        date: 'Just now',
      });

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
      });

      onPaymentSuccess({
        ...order,
        paymentStatus: 'paid',
        paymentMethod: method,
        transactionId: generatedTxn,
      });
    }, 1200);
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-end animate-fade-in text-xs">
      <div className="h-[94%] w-full bg-slate-900 border-t border-slate-800 rounded-t-3xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Table Payment & Bill</h3>
              <div className="text-[10px] text-slate-400 font-mono">
                Order #{order.orderNumber} · Table {order.tableNumber}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {paidSuccess && receiptData ? (
            /* PAID DIGITAL RECEIPT */
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-gradient-to-b from-emerald-950/60 to-slate-950 border border-emerald-500/40 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="font-extrabold text-base text-emerald-300">
                  Payment Successful!
                </div>
                <div className="text-slate-300 text-[11px]">
                  Bill settled for Table {order.tableNumber}. Kitchen notified!
                </div>
              </div>

              {/* Digital Tax Invoice / Receipt */}
              <div className="p-4 rounded-xl bg-white text-slate-950 shadow-xl border border-slate-300 space-y-3 font-mono">
                <div className="text-center pb-2 border-b border-dashed border-slate-300">
                  <div className="font-extrabold text-sm">{activeTenant.name}</div>
                  <div className="text-[10px] text-slate-500">
                    Official Tax Receipt #{order.orderNumber}
                  </div>
                  <div className="text-[10px] text-slate-500">{receiptData.date}</div>
                </div>

                <div className="space-y-1 text-[11px]">
                  {order.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{i.quantity}x {i.name}</span>
                      <span>{order.currency}{(i.price * i.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-dashed border-slate-300 space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>{order.currency}{order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax & Surcharge</span>
                    <span>{order.currency}{order.tax.toFixed(2)}</span>
                  </div>
                  {tipAmount > 0 && (
                    <div className="flex justify-between text-amber-700 font-semibold">
                      <span>Staff Gratuity / Tip</span>
                      <span>{order.currency}{tipAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-300">
                    <span>TOTAL PAID</span>
                    <span>{order.currency}{(order.totalAmount + tipAmount).toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-slate-500 space-y-0.5 border-t border-dashed border-slate-300">
                  <div>Payment Mode: {order.paymentMethod?.toUpperCase()}</div>
                  <div>Reference: {receiptData.txnId}</div>
                  <div className="text-emerald-700 font-bold">STATUS: COMPLETED & VERIFIED</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition text-xs flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition text-xs flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Done</span>
                </button>
              </div>
            </div>
          ) : (
            /* PAYMENT SELECTION & GATEWAY */
            <>
              {/* Total Amount Pill */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-[11px]">Total to Pay (Table {order.tableNumber})</div>
                  <div className="font-black text-2xl font-mono text-amber-400">
                    {order.currency}{totalToPay.toFixed(2)}
                  </div>
                  {tipAmount > 0 && (
                    <div className="text-[10px] text-emerald-400 font-medium">
                      Includes {order.currency}{tipAmount.toFixed(2)} staff tip
                    </div>
                  )}
                </div>

                {order.paymentMethod === 'counter' ? (
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    Cash at Counter (कैश पेमेंट)
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold uppercase tracking-wider">
                    Payment Pending
                  </span>
                )}
              </div>

              {/* Server Tip Selector */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-300 font-medium flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Add Server Tip / बख्शीश (Optional)</span>
                  </span>
                  {tipAmount > 0 && (
                    <button
                      type="button"
                      onClick={() => setTipAmount(0)}
                      className="text-rose-400 hover:underline text-[10px]"
                    >
                      Remove tip
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 20, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTipAmount(amt)}
                      className={`py-1.5 rounded-lg border font-mono font-bold text-xs transition ${
                        tipAmount === amt
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {amt === 0 ? 'No Tip' : `+${activeTenant.currency}${amt}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method Switcher */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
                    paymentMethod === 'upi'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span className="font-bold text-[11px]">UPI / QR Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
                    paymentMethod === 'card'
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="font-bold text-[11px]">Credit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('counter')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
                    paymentMethod === 'counter'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span className="font-bold text-[11px]">Pay at Counter</span>
                </button>
              </div>

              {/* OPTION 1: UPI / QR PAYMENT */}
              {paymentMethod === 'upi' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                  <div className="text-slate-300 text-xs font-semibold">
                    Scan with any UPI App or tap to open
                  </div>

                  {/* QR Image */}
                  <div className="p-2 bg-white rounded-2xl shadow-xl inline-block border-2 border-slate-200">
                    {upiQrUrl ? (
                      <img src={upiQrUrl} alt="UPI Payment QR" className="w-44 h-44 object-contain" />
                    ) : (
                      <div className="w-44 h-44 flex items-center justify-center text-slate-400">
                        Loading QR...
                      </div>
                    )}
                  </div>

                  {/* Merchant VPA & Copy */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                    <span className="truncate">{merchantUpi}</span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 flex items-center gap-1"
                    >
                      {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Quick App Intent Launchers */}
                  <div className="space-y-2 pt-1">
                    <a
                      href={upiIntentString}
                      className="block w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition text-xs"
                    >
                      Open in GPay / PhonePe / Paytm ({order.currency}{order.totalAmount.toFixed(2)})
                    </a>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleExecutePayment('upi')}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold rounded-xl border border-slate-700 transition text-xs flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <span>Verifying Bank Settlement...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>I Have Completed Payment</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* OPTION 2: CREDIT / DEBIT CARD (Stripe Simulation) */}
              {paymentMethod === 'card' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-semibold">Card Details</span>
                    <button
                      type="button"
                      onClick={handleFillTestCard}
                      className="text-amber-400 hover:underline text-[11px] flex items-center gap-1 font-medium"
                    >
                      <Sparkles className="w-3 h-3" /> Fill Test Card
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-slate-400 mb-1 font-medium text-[11px]">
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="4242 •••• •••• 4242"
                        value={cardNumber || ''}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium text-[11px]">
                          Expiry
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry || ''}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500 text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium text-[11px]">
                          CVC / CVV
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          placeholder="•••"
                          value={cardCvc || ''}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500 text-center"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleExecutePayment('card')}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold rounded-xl shadow-lg transition text-xs flex items-center justify-center gap-2 mt-2"
                  >
                    {isProcessing ? (
                      <span>Authorizing Card...</span>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Pay {order.currency}{totalToPay.toFixed(2)} Securely</span>
                      </>
                    )}
                  </button>

                  <div className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> 256-bit encrypted via Stripe
                  </div>
                </div>
              )}

              {/* OPTION 3: PAY AT COUNTER */}
              {paymentMethod === 'counter' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-slate-100 text-sm">Pay Cash at Counter (कैश भुगतान)</div>
                  <p className="text-slate-400 text-xs">
                    Show Order #{order.orderNumber} to the server or cashier at the counter when you finish your meal.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        markOrderAsCashPaid(order.id);
                        const cashTxn = `CASH-${Math.floor(100000 + Math.random() * 900000)}`;
                        setReceiptData({
                          txnId: cashTxn,
                          date: 'Just now',
                        });
                        setPaidSuccess(true);
                        onPaymentSuccess({
                          ...order,
                          paymentStatus: 'paid',
                          paymentMethod: 'counter',
                          transactionId: cashTxn,
                          paidAt: 'Just now',
                          status: order.status === 'served' ? 'paid' : order.status,
                        });
                        confetti({
                          particleCount: 80,
                          spread: 60,
                          origin: { y: 0.6 },
                        });
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirm Cash Paid (कैश दिया)</span>
                    </button>

                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition text-xs"
                    >
                      Pay Later at Counter
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
