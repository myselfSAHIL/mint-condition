import React, { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import {
  Store,
  CheckCircle2,
  AlertTriangle,
  ClipboardCheck,
  ShieldAlert,
  Thermometer,
  Package,
  Layers,
  Sparkles,
  MapPin,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RetailerPortal: React.FC = () => {
  const { batches, retailerReceiveBatch, selectedBatchId, setSelectedBatchId } = useBlockchain();

  const selectedBatch = batches.find((b) => b.batchId === selectedBatchId) || batches[0];

  const [retailerName, setRetailerName] = useState('FreshPicks Supermarket (South Delhi Hub)');
  const [locationName, setLocationName] = useState('South Extension Retail Store, New Delhi');
  const [coords, setCoords] = useState<[number, number]>([28.5708, 77.2227]);
  const [receivedTemp, setReceivedTemp] = useState<number>(4.2);
  const [grade, setGrade] = useState<'A+' | 'A' | 'B' | 'REJECTED'>('A+');
  const [notes, setNotes] = useState(
    'All crates received in pristine condition. Vacuum seals intact. DLT cold chain verified.'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    batchId: string;
    blockIndex: number;
  } | null>(null);

  const hasTransitBreaches = selectedBatch?.thermalBreaches && selectedBatch.thermalBreaches.length > 0;

  const handleReceive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    setIsSubmitting(true);
    try {
      const res = retailerReceiveBatch(selectedBatch.batchId, {
        retailerName,
        locationName,
        coords,
        receivedTemp,
        grade,
        notes,
      });

      setSuccessInfo({
        batchId: selectedBatch.batchId,
        blockIndex: res.blockIndex,
      });

      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-900 p-6 rounded-2xl border border-purple-800/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-600 rounded-xl text-white shadow-lg shadow-purple-900/40">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-100">Retailer &amp; Store Receiving Portal</h1>
            <p className="text-xs text-slate-300">
              Audit cold-chain integrity, sign delivery acceptance, and log confirmation blocks
            </p>
          </div>
        </div>

        {/* Batch Picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Consignment to Receive:</span>
          <select
            value={selectedBatch?.batchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="bg-slate-800 text-slate-100 text-xs font-mono rounded-lg px-3 py-2 border border-slate-700"
          >
            {batches.map((b) => (
              <option key={b.batchId} value={b.batchId}>
                {b.itemName.split(' ')[0]} [{b.currentStatus}] - {b.batchId}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Success Notification */}
      {successInfo && (
        <div className="p-5 bg-purple-950/60 border border-purple-500 rounded-2xl text-purple-200 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-purple-400 shrink-0" />
            <div>
              <div className="font-bold text-sm">
                Delivery Confirmation Block Anchored: Block #{successInfo.blockIndex}
              </div>
              <div className="text-xs text-purple-300/80 font-mono">
                Batch {successInfo.batchId} status transitioned to &apos;At Store&apos; on immutable ledger.
              </div>
            </div>
          </div>
          <button
            onClick={() => setSuccessInfo(null)}
            className="text-xs bg-purple-800 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Receiving Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form
          onSubmit={handleReceive}
          className="lg:col-span-2 bg-slate-900/90 p-6 md:p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-purple-400" />
              Delivery Inspection &amp; On-Chain Acceptance
            </h2>
            <span className="text-xs font-mono text-purple-400">{selectedBatch?.batchId}</span>
          </div>

          {/* Pre-receipt Cold Chain Audit Box */}
          <div
            className={`p-4 rounded-xl border ${
              hasTransitBreaches
                ? 'bg-rose-950/40 border-rose-700/60 text-rose-200'
                : 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs mb-1">
              {hasTransitBreaches ? (
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
              <span>
                {hasTransitBreaches
                  ? '⚠️ Transit Cold-Chain SLA Breaches Flagged on Ledger!'
                  : '✓ 100% Cold-Chain Compliant Throughout Transit'}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">
              {hasTransitBreaches
                ? `IoT records indicate ${selectedBatch?.thermalBreaches.length} temperature violation during transit. Conduct physical quality and freshness inspection before accepting.`
                : `All recorded telemetry remained strictly within the safe threshold (${selectedBatch?.minSafeTemp}°C to ${selectedBatch?.maxSafeTemp}°C).`}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Store / Receiving Facility *</label>
              <input
                type="text"
                required
                value={retailerName}
                onChange={(e) => setRetailerName(e.target.value)}
                className="w-full bg-slate-800 text-slate-100 rounded-xl p-3 border border-slate-700"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Delivery Location Address *</label>
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full bg-slate-800 text-slate-100 rounded-xl p-3 border border-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-300 font-sans font-semibold mb-1.5">
                Arrival Unloading Temp (°C) *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={receivedTemp}
                onChange={(e) => setReceivedTemp(parseFloat(e.target.value))}
                className="w-full bg-slate-800 text-slate-100 rounded-xl p-3 border border-slate-700"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-sans font-semibold mb-1.5">
                Freshness &amp; Quality Grade *
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as any)}
                className="w-full bg-slate-800 text-slate-100 rounded-xl p-3 border border-slate-700 font-sans font-bold"
              >
                <option value="A+">Grade A+ (Premium / Export Quality)</option>
                <option value="A">Grade A (Standard Fresh)</option>
                <option value="B">Grade B (Discounted / Minor Defect)</option>
                <option value="REJECTED">REJECTED (SLA Failed / Spoiled)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Acceptance &amp; Verification Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 text-slate-100 rounded-xl p-3 border border-slate-700 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || selectedBatch?.currentStatus === 'At Store'}
            className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition ${
              selectedBatch?.currentStatus === 'At Store'
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-950/60'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            {selectedBatch?.currentStatus === 'At Store'
              ? 'Consignment Already Delivered & Received'
              : isSubmitting
              ? 'Mining Store Delivery Block...'
              : 'Sign Delivery Acceptance & Append Block'}
          </button>
        </form>

        {/* Batch Status Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-slate-100 text-sm border-b border-slate-800 pb-2">
              Batch Metadata Summary
            </h3>
            {selectedBatch && (
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-slate-400">Batch ID: </span>
                  <span className="font-mono text-emerald-400 font-bold">{selectedBatch.batchId}</span>
                </div>
                <div>
                  <span className="text-slate-400">Commodity: </span>
                  <span className="text-slate-200 font-bold">{selectedBatch.itemName}</span>
                </div>
                <div>
                  <span className="text-slate-400">Quantity: </span>
                  <span className="text-slate-300">{selectedBatch.quantity}</span>
                </div>
                <div>
                  <span className="text-slate-400">Harvest Date: </span>
                  <span className="font-mono text-slate-300">{selectedBatch.harvestDate}</span>
                </div>
                <div>
                  <span className="text-slate-400">Best Before / Expiry: </span>
                  <span className="font-mono text-slate-300">{selectedBatch.expiryDate}</span>
                </div>
                <div>
                  <span className="text-slate-400">Farmer: </span>
                  <span className="text-slate-300">{selectedBatch.farmerName}</span>
                </div>
                <div>
                  <span className="text-slate-400">Transporter: </span>
                  <span className="text-slate-300">{selectedBatch.transporterName}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
