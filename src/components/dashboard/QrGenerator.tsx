import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import QRCode from 'qrcode';
import {
  QrCode,
  Printer,
  Download,
  Plus,
  Trash2,
  ExternalLink,
  Layers,
  Sparkles,
  Wifi,
  Eye,
  CheckCircle,
  Copy,
  Table as TableIcon,
} from 'lucide-react';

export const QrGenerator: React.FC = () => {
  const {
    activeTenant,
    tables,
    generateTableBatch,
    deleteTable,
    setSelectedTable,
    setCurrentView,
  } = useStore();

  const [activeTableNumber, setActiveTableNumber] = useState<string>(
    tables[0]?.tableNumber || '1'
  );
  const [standFormat, setStandFormat] = useState<'tent' | 'sticker'>('tent');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [batchStart, setBatchStart] = useState<number>(1);
  const [batchEnd, setBatchEnd] = useState<number>(10);
  const [batchSection, setBatchSection] = useState<string>('Dining Area');
  const [showBatchModal, setShowBatchModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const selectedTableObj = tables.find((t) => t.tableNumber === activeTableNumber) || tables[0];
  const targetUrl = `https://tabletap.app/r/${activeTenant.slug}?table=${activeTableNumber}`;

  // Generate QR code data URL whenever target URL changes
  useEffect(() => {
    QRCode.toDataURL(targetUrl, {
      width: 400,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error(err));
  }, [targetUrl]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${activeTenant.slug}-table-${activeTableNumber}-qr.png`;
    a.click();
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleBatchGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    generateTableBatch(batchStart, batchEnd, batchSection);
    setShowBatchModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-500" /> Dynamic QR Code & Printable Table Stands
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Generate printable QR stickers, table tent cards, and acrylic stand inserts encoded with table numbers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 no-print">
          <button
            onClick={() => setShowBatchModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
          >
            <Plus className="w-4 h-4 text-amber-500" />
            <span>Batch Add Tables</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print Stand Sheet</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tables Table & Selector */}
        <div className="lg:col-span-5 space-y-4 no-print">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <TableIcon className="w-4 h-4 text-amber-500" /> Configured Tables ({tables.length})
              </span>
              <span className="text-[11px] text-slate-500">Select to preview stand</span>
            </div>

            <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
              {tables.map((t) => {
                const isSelected = t.tableNumber === activeTableNumber;
                return (
                  <div
                    key={t.id}
                    onClick={() => setActiveTableNumber(t.tableNumber)}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 shadow-sm'
                        : 'border-slate-800/80 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-200'
                        }`}
                      >
                        {t.tableNumber}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200">Table {t.tableNumber}</div>
                        <div className="text-[11px] text-slate-400">{t.section || 'Main Area'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400">
                        {t.totalScans} scans
                      </span>
                      {tables.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTable(t.id);
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded transition"
                          title="Delete table"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick actions for selected table */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs">
            <div className="text-slate-300 font-semibold">Active Table URL:</div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-amber-400 break-all text-[11px] flex items-center justify-between">
              <span>{targetUrl}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyUrl}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium border border-slate-700 transition"
              >
                {copiedLink ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied URL!' : 'Copy Link'}</span>
              </button>

              <button
                onClick={handleDownloadQr}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium border border-slate-700 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PNG QR</span>
              </button>

              <button
                onClick={() => {
                  setSelectedTable(activeTableNumber);
                  setCurrentView('customer');
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold transition shadow-sm"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Simulate Scan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Print-Ready Table Stand Preview */}
        <div className="lg:col-span-7 space-y-4">
          {/* Format Selector */}
          <div className="flex items-center justify-between no-print text-xs">
            <span className="text-slate-400 font-medium">Stand Format Preview:</span>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setStandFormat('tent')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  standFormat === 'tent'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Table Tent Card (Double-Sided)
              </button>
              <button
                onClick={() => setStandFormat('sticker')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  standFormat === 'sticker'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Acrylic Badge / Sticker
              </button>
            </div>
          </div>

          {/* Printable Container */}
          <div className="printable-stand-sheet bg-white text-slate-950 rounded-3xl p-8 shadow-2xl border-4 border-slate-300 relative mx-auto max-w-md transition-all">
            {/* Stand Format 1: Tent Card */}
            {standFormat === 'tent' && (
              <div className="space-y-6">
                {/* Fold Guide Line (Top / Back Panel) */}
                <div className="border border-dashed border-slate-400 rounded-2xl p-4 bg-slate-50 text-center opacity-75">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">
                    ▲ Back Side / Fold Area ▲
                  </div>
                  <div className="font-bold text-sm text-slate-800">{activeTenant.name}</div>
                  <div className="text-[11px] text-slate-600">Table {activeTableNumber} · Free Guest Wi-Fi: {activeTenant.wifi.ssid}</div>
                </div>

                <div className="flex items-center gap-2 my-2">
                  <div className="h-px bg-slate-300 flex-1 border-t border-dashed border-slate-400" />
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest px-2 bg-white">
                    Fold along this line
                  </span>
                  <div className="h-px bg-slate-300 flex-1 border-t border-dashed border-slate-400" />
                </div>

                {/* Front Facing Stand Body */}
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Store Header */}
                  <div className="flex items-center gap-2.5">
                    <img
                      src={activeTenant.logoUrl}
                      alt={activeTenant.name}
                      className="w-10 h-10 rounded-xl object-cover shadow-sm border border-slate-200"
                    />
                    <div className="text-left">
                      <div className="font-extrabold text-base leading-tight text-slate-900 tracking-tight">
                        {activeTenant.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {activeTenant.tagline}
                      </div>
                    </div>
                  </div>

                  {/* Table Badge */}
                  <div
                    className="px-4 py-1.5 rounded-full text-white font-extrabold text-xs shadow-md tracking-wider uppercase flex items-center gap-1.5"
                    style={{ backgroundColor: activeTenant.themeColor }}
                  >
                    <span>Table {activeTableNumber}</span>
                    {selectedTableObj?.section && <span>· {selectedTableObj.section}</span>}
                  </div>

                  {/* High Quality Crisp QR */}
                  <div className="p-3 bg-white rounded-2xl shadow-xl border-2 border-slate-200 inline-block">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt={`QR code for Table ${activeTableNumber}`}
                        className="w-52 h-52 object-contain"
                      />
                    ) : (
                      <div className="w-52 h-52 flex items-center justify-center text-slate-400">
                        Generating QR...
                      </div>
                    )}
                  </div>

                  {/* CTA Details */}
                  <div className="space-y-1.5 max-w-xs">
                    <div className="font-bold text-sm text-slate-900">
                      Scan with your phone camera
                    </div>
                    <div className="text-xs text-slate-600 leading-relaxed">
                      Instant digital menu · Earn loyalty stamps · Free Wi-Fi · Leave feedback
                    </div>
                  </div>

                  {/* Wi-Fi & Powered footer */}
                  <div className="w-full pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-mono">
                      <Wifi className="w-3.5 h-3.5 text-slate-700" /> {activeTenant.wifi.ssid}
                    </span>
                    <span className="font-semibold text-slate-400">No app download required</span>
                  </div>
                </div>
              </div>
            )}

            {/* Stand Format 2: Acrylic Badge / Sticker */}
            {standFormat === 'sticker' && (
              <div className="flex flex-col items-center text-center space-y-4 py-4">
                <div className="flex items-center gap-2">
                  <img
                    src={activeTenant.logoUrl}
                    alt={activeTenant.name}
                    className="w-9 h-9 rounded-lg object-cover"
                  />
                  <div className="font-bold text-base text-slate-900">{activeTenant.name}</div>
                </div>

                <div
                  className="px-5 py-1 rounded-full text-white font-extrabold text-xs tracking-wider uppercase"
                  style={{ backgroundColor: activeTenant.themeColor }}
                >
                  TABLE {activeTableNumber}
                </div>

                <div className="p-3 bg-white rounded-2xl shadow-lg border border-slate-200">
                  {qrDataUrl && (
                    <img
                      src={qrDataUrl}
                      alt={`Table ${activeTableNumber}`}
                      className="w-56 h-56 object-contain"
                    />
                  )}
                </div>

                <div className="font-bold text-sm text-slate-900">
                  Scan for Digital Menu & Rewards
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {activeTenant.wifi.ssid ? `Wi-Fi: ${activeTenant.wifi.ssid} (${activeTenant.wifi.password})` : ''}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Batch Add Tables Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 text-sm">Batch Generate QR Table Stands</h3>
              <button
                onClick={() => setShowBatchModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBatchGenerate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Starting Table #</label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={batchStart ?? 1}
                    onChange={(e) => setBatchStart(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Ending Table #</label>
                  <input
                    type="number"
                    min={batchStart}
                    max={200}
                    value={batchEnd ?? 10}
                    onChange={(e) => setBatchEnd(parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Section / Area Label</label>
                <input
                  type="text"
                  placeholder="e.g., Patio, Indoor Dining, Bar Counter, Terrace"
                  value={batchSection || ''}
                  onChange={(e) => setBatchSection(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                Will create {batchEnd - batchStart + 1} table QR records with dynamic URL:{' '}
                <span className="font-mono text-amber-400">
                  https://tabletap.app/r/{activeTenant.slug}?table=[{batchStart}..{batchEnd}]
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition"
                >
                  Generate Stands
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
