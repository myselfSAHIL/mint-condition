import React, { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  Thermometer,
  Truck,
  Store,
  Sparkles,
  Layers,
  ArrowRight,
  Search,
  ExternalLink,
  Award,
  AlertTriangle,
  FileCheck,
  Camera,
  X,
} from 'lucide-react';

export const ConsumerView: React.FC<{ initialBatchId?: string }> = ({ initialBatchId }) => {
  const { batches, blockchain } = useBlockchain();

  const [inputBatchId, setInputBatchId] = useState(
    initialBatchId || 'BATCH-HP-APL-2026-081'
  );
  const [activeBatchId, setActiveBatchId] = useState(
    initialBatchId || 'BATCH-HP-APL-2026-081'
  );
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const currentBatch = batches.find(
    (b) => b.batchId.toLowerCase() === activeBatchId.toLowerCase()
  );

  const blockHistory = blockchain.getBatchHistory(activeBatchId);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputBatchId.trim()) {
      setActiveBatchId(inputBatchId.trim());
    }
  };

  const selectBatch = (id: string) => {
    setInputBatchId(id);
    setActiveBatchId(id);
    setIsScannerOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Consumer Search & QR Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 p-6 md:p-8 rounded-3xl border border-emerald-800/60 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Public Consumer DLT Verification Portal
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight">
              Trace Your Food From Soil to Shelf
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Scan product QR code or enter Batch ID to verify real-time harvest provenance, unbroken cold-chain conditions, and cryptographic blockchain authenticity.
            </p>
          </div>

          {/* QR Scanner Launch Button */}
          <button
            onClick={() => setIsScannerOpen(true)}
            className="px-5 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs md:text-sm rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center gap-2.5 transition shrink-0"
          >
            <Camera className="w-5 h-5 text-slate-950" />
            <span>Scan Packaging QR Code</span>
          </button>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-2 relative z-10">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter Batch ID (e.g. BATCH-HP-APL-2026-081)..."
              value={inputBatchId}
              onChange={(e) => setInputBatchId(e.target.value)}
              className="w-full bg-slate-800/90 text-sm text-slate-100 placeholder-slate-400 rounded-xl pl-11 pr-4 py-3 border border-slate-700 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-bold text-xs transition border border-slate-700"
          >
            Verify Batch
          </button>
        </form>

        {/* Quick Batch Suggestions */}
        <div className="mt-4 flex items-center gap-2 flex-wrap text-xs relative z-10">
          <span className="text-slate-400 font-semibold">Try sample batches:</span>
          {batches.map((b) => (
            <button
              key={b.batchId}
              onClick={() => selectBatch(b.batchId)}
              className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] transition ${
                b.batchId === activeBatchId
                  ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                  : 'bg-slate-800/70 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {b.itemName.split(' ')[0]} ({b.batchId})
            </button>
          ))}
        </div>
      </div>

      {/* Main Verification Card */}
      {currentBatch ? (
        <div className="space-y-8">
          {/* Provenance Certificate Badge */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
                    {currentBatch.category}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs font-mono text-slate-400">{currentBatch.batchId}</span>
                </div>
                <h2 className="text-2xl font-black text-slate-100">{currentBatch.itemName}</h2>
                <p className="text-xs text-slate-400">
                  Produced by <strong className="text-slate-200">{currentBatch.farmerName}</strong> • {currentBatch.originLocation}
                </p>
              </div>

              {/* Verification Stamp */}
              <div className="p-3.5 bg-emerald-950/60 rounded-2xl border border-emerald-700/60 text-emerald-300 flex items-center gap-3 shadow-inner">
                <div className="p-2 bg-emerald-600 rounded-xl text-white">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">Blockchain Authenticated</div>
                  <div className="text-[11px] text-emerald-400/80 font-mono">
                    Zero Tamper • {blockHistory.length} Verified Ledger Blocks
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80">
                <div className="text-slate-400 flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>Harvest Date</span>
                </div>
                <div className="font-bold text-slate-100 font-mono text-sm">{currentBatch.harvestDate}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Farm Freshness Verified</div>
              </div>

              <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80">
                <div className="text-slate-400 flex items-center gap-1.5 mb-1">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cold Chain Health</span>
                </div>
                <div
                  className={`font-bold font-mono text-sm ${
                    currentBatch.thermalBreaches.length > 0 ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {currentBatch.thermalBreaches.length > 0
                    ? `1 Alert Recorded`
                    : `100% Compliant`}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Safe range: {currentBatch.minSafeTemp}°C - {currentBatch.maxSafeTemp}°C
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80">
                <div className="text-slate-400 flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Transit Route</span>
                </div>
                <div className="font-bold text-slate-100 truncate text-xs mt-0.5">
                  {currentBatch.originLocation.split(',')[0]} → {currentBatch.destinationLocation.split(',')[0]}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Inter-State Cold Corridor</div>
              </div>

              <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80">
                <div className="text-slate-400 flex items-center gap-1.5 mb-1">
                  <Award className="w-3.5 h-3.5 text-purple-400" />
                  <span>FSSAI &amp; Organic Quality</span>
                </div>
                <div className="font-bold text-purple-400 font-mono text-sm">Grade A+ (Certified)</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Smart Contract SLA Bound</div>
              </div>
            </div>

            {/* Simulated Packaging QR Code Display */}
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-white p-1 rounded-xl flex items-center justify-center shadow-lg">
                  {/* Visual simulated QR */}
                  <div className="w-full h-full bg-slate-900 grid grid-cols-4 gap-0.5 p-1 rounded">
                    <div className="bg-white"></div>
                    <div className="bg-white"></div>
                    <div className="bg-slate-900"></div>
                    <div className="bg-white"></div>
                    <div className="bg-white"></div>
                    <div className="bg-slate-900"></div>
                    <div className="bg-white"></div>
                    <div className="bg-slate-900"></div>
                    <div className="bg-slate-900"></div>
                    <div className="bg-white"></div>
                    <div className="bg-white"></div>
                    <div className="bg-white"></div>
                    <div className="bg-white"></div>
                    <div className="bg-slate-900"></div>
                    <div className="bg-white"></div>
                    <div className="bg-white"></div>
                  </div>
                </div>
                <div>
                  <div className="font-bold text-slate-200 text-xs">Simulated Smart NFC/QR Tag</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    UID: 04:A3:89:12:FE:91 • Hash: {currentBatch.farmerWallet}
                  </div>
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-400">
                Scan this code in any Indian retail supermarket to view this live DLT certificate.
              </div>
            </div>
          </div>

          {/* Block-by-Block Journey Timeline */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  Tamper-Proof Block-by-Block Journey Log
                </h3>
                <p className="text-xs text-slate-400">
                  Chronological trail of verified blockchain blocks anchoring this batch
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/60">
                {blockHistory.length} On-Chain Records
              </span>
            </div>

            <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-800">
              {blockHistory.map(({ block, transaction }, index) => {
                const isCreation = transaction.type === 'BATCH_CREATION';
                const isTelemetry = transaction.type === 'TRANSIT_TELEMETRY';
                const isSlaBreach = transaction.type === 'SMART_CONTRACT_SLA' || transaction.payload.slaViolation;
                const isDelivery = transaction.type === 'STORE_DELIVERY';

                return (
                  <div key={index} className="relative flex items-start gap-5 pl-2">
                    {/* Step Icon Badge */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 shadow-lg ${
                        isSlaBreach
                          ? 'bg-rose-600 border-rose-300 text-white'
                          : isDelivery
                          ? 'bg-purple-600 border-purple-300 text-white'
                          : isCreation
                          ? 'bg-emerald-600 border-emerald-300 text-white'
                          : 'bg-blue-600 border-blue-300 text-white'
                      }`}
                    >
                      {isSlaBreach ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : isDelivery ? (
                        <Store className="w-4 h-4" />
                      ) : isCreation ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Truck className="w-4 h-4" />
                      )}
                    </div>

                    {/* Step Content Card */}
                    <div
                      className={`flex-1 p-5 rounded-2xl border transition-all ${
                        isSlaBreach
                          ? 'bg-rose-950/40 border-rose-700/60'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      } space-y-3`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-100">
                            {isCreation
                              ? '🌱 Farm Origin Registration & Dispatch'
                              : isDelivery
                              ? '🏬 Retail Store Arrival & Quality Receipt'
                              : isSlaBreach
                              ? '⚠️ Cold Chain SLA Breach Logged'
                              : '🚚 Transit Telemetry & GPS Ingress'}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            Block #{block.index}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {new Date(transaction.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                        {transaction.payload.locationName && (
                          <div className="sm:col-span-2">
                            <span className="text-slate-500 font-sans">Location: </span>
                            <span className="text-slate-300">{transaction.payload.locationName}</span>
                          </div>
                        )}
                        {transaction.payload.temperature !== undefined && (
                          <div>
                            <span className="text-slate-500 font-sans">Recorded Temp: </span>
                            <span
                              className={`font-bold ${
                                transaction.payload.temperature > 8 ? 'text-rose-400' : 'text-emerald-400'
                              }`}
                            >
                              {transaction.payload.temperature}°C
                            </span>
                          </div>
                        )}
                      </div>

                      {transaction.payload.notes && (
                        <p className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                          {transaction.payload.notes}
                        </p>
                      )}

                      {transaction.payload.violationDetails && (
                        <div className="text-xs text-rose-300 bg-rose-900/40 p-2.5 rounded-xl border border-rose-700/60 font-semibold">
                          {transaction.payload.violationDetails}
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-500">
                        <span>Block Hash: {block.hash.slice(0, 18)}...</span>
                        <span>Signer: {transaction.actor.name}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="font-bold text-slate-100 text-base">Batch ID Not Found on Ledger</h3>
          <p className="text-xs text-slate-400">
            Please check the Batch ID format or select one of the pre-loaded Indian logistics routes above.
          </p>
        </div>
      )}

      {/* Simulated QR Code Camera Scanner Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-[700] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
                <Camera className="w-5 h-5 text-emerald-400" />
                <span>Simulated Smart Food QR Scanner</span>
              </div>
              <button
                onClick={() => setIsScannerOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Camera Viewfinder Mock */}
            <div className="relative aspect-square bg-slate-950 rounded-2xl border-2 border-dashed border-emerald-500/60 overflow-hidden flex flex-col items-center justify-center p-6 text-center">
              {/* Animated Laser Scan Line */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse shadow-lg shadow-emerald-400/50" />

              <div className="w-48 h-48 border-2 border-emerald-400/80 rounded-2xl relative flex items-center justify-center">
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                <QrCode className="w-24 h-24 text-emerald-400/40 animate-pulse" />
              </div>

              <div className="mt-4 text-xs text-slate-300 font-medium">
                Align camera with product QR code on food packaging
              </div>
            </div>

            {/* Quick Select One to Simulate Instant Scan */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select packaging to scan:
              </div>
              <div className="space-y-1.5">
                {batches.map((b) => (
                  <button
                    key={b.batchId}
                    onClick={() => selectBatch(b.batchId)}
                    className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-emerald-950/80 hover:border-emerald-700/60 text-left border border-slate-700 transition flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-200">{b.itemName}</div>
                      <div className="text-[10px] font-mono text-emerald-400">{b.batchId}</div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">Scan →</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
