import React from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import {
  Activity,
  Layers,
  Truck,
  ShieldCheck,
  ShieldAlert,
  Thermometer,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Clock,
  Compass,
  ArrowRight,
  Database,
  ExternalLink,
} from 'lucide-react';

interface DashboardProps {
  onNavigateTab: (tab: string) => void;
  onSelectBatchForMap: (batchId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateTab,
  onSelectBatchForMap,
}) => {
  const { batches, blockchain, stats, validationResult, runChainValidation, isValidating } =
    useBlockchain();

  const complianceRate =
    batches.length > 0
      ? Math.round(
          ((batches.length - stats.thermalBreachesCount) / batches.length) * 100
        )
      : 100;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
              ● MINTCONDITION MAINNET SIMULATOR
            </span>
            <span className="text-xs text-slate-400">Consensus: Proof-of-Work (SHA-256)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight">
            Smart Food Supply Chain &amp; Cold-Chain DLT
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Decentralized ledger monitoring perishables across Indian interstate corridors. Real-time IoT temperature telematics, automated smart contract SLAs, and immutable cryptographic fraud prevention.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigateTab('map')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition"
          >
            <Compass className="w-4 h-4" />
            Live India Map Tracker
          </button>
          <button
            onClick={() => onNavigateTab('explorer')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition"
          >
            <Database className="w-4 h-4 text-blue-400" />
            Inspect Raw Blocks
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Blocks Mined */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Ledger Blocks Mined</span>
            <div className="p-2 bg-blue-950/60 rounded-lg text-blue-400 border border-blue-800/60">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-100 font-mono">
            #{stats.totalBlocks}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
            <span className="text-emerald-400">PoW Difficulty: 2</span> • Immutable
          </div>
        </div>

        {/* Active In-Transit Consignments */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>In-Transit Active Trucks</span>
            <div className="p-2 bg-emerald-950/60 rounded-lg text-emerald-400 border border-emerald-800/60">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            {stats.inTransitBatches}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span>Across 4 National Highways</span>
          </div>
        </div>

        {/* Cold-Chain Compliance % */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Cold-Chain SLA Health</span>
            <div className="p-2 bg-amber-950/60 rounded-lg text-amber-400 border border-amber-800/60">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-100 font-mono">
            {complianceRate}%
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span className={stats.thermalBreachesCount > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
              {stats.thermalBreachesCount} Thermal Breaches
            </span>
          </div>
        </div>

        {/* Cryptographic Ledger Health */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>DLT Integrity Status</span>
            <div
              className={`p-2 rounded-lg border ${
                validationResult && !validationResult.isValid
                  ? 'bg-rose-950/60 text-rose-400 border-rose-800/60 animate-pulse'
                  : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
              }`}
            >
              {validationResult && !validationResult.isValid ? (
                <ShieldAlert className="w-4 h-4" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
            </div>
          </div>
          <div className="text-xl font-bold font-mono">
            {validationResult && !validationResult.isValid ? (
              <span className="text-rose-400">TAMPER ALERT</span>
            ) : (
              <span className="text-emerald-400">100% VERIFIED</span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <button
              onClick={runChainValidation}
              disabled={isValidating}
              className="text-xs text-blue-400 hover:underline flex items-center gap-0.5"
            >
              {isValidating ? 'Auditing...' : 'Run Audit →'}
            </button>
            <span className="text-[10px] text-slate-500">SHA-256</span>
          </div>
        </div>
      </div>

      {/* Active Indian Logistics Corridors Table */}
      <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-400" />
              Active Interstate Food Logistics Batches
            </h2>
            <p className="text-xs text-slate-400">
              Real-time telemetry stream across Indian national highways and agricultural cold corridors
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('map')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
          >
            Open Live Map View <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Batch &amp; Commodity</th>
                <th className="py-3 px-3">Transit Corridor</th>
                <th className="py-3 px-3">Reefer Telemetry</th>
                <th className="py-3 px-3">Safe Threshold</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {batches.map((batch) => {
                const hasBreach = batch.thermalBreaches.length > 0;
                const isTempOutOfBounds =
                  batch.currentTemp > batch.maxSafeTemp || batch.currentTemp < batch.minSafeTemp;

                return (
                  <tr key={batch.batchId} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-200">{batch.itemName}</div>
                      <div className="text-[11px] font-mono text-emerald-400">{batch.batchId}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="text-slate-200 font-medium truncate max-w-xs">
                        {batch.originLocation.split(',')[0]} → {batch.destinationLocation.split(',')[0]}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Truck: {batch.truckId}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-mono">
                      <div
                        className={`font-bold ${
                          isTempOutOfBounds ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {batch.currentTemp}°C / {batch.currentHumidity}% RH
                      </div>
                      <div className="text-[10px] text-slate-500">Live IoT Ping</div>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-300">
                      {batch.minSafeTemp}°C to {batch.maxSafeTemp}°C
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            hasBreach
                              ? 'bg-rose-950 text-rose-300 border-rose-700/60'
                              : batch.currentStatus === 'In Transit'
                              ? 'bg-blue-950 text-blue-300 border-blue-700/60'
                              : 'bg-purple-950 text-purple-300 border-purple-700/60'
                          }`}
                        >
                          {hasBreach ? '⚠️ Thermal Breach' : batch.currentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => {
                          onSelectBatchForMap(batch.batchId);
                          onNavigateTab('map');
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
                      >
                        Track GPS →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stakeholder Fast Launcher Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab('farmer')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-600/60 cursor-pointer transition shadow-xl group space-y-2"
        >
          <div className="text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
            <span>Role: Farmer / Producer</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
          <h3 className="font-bold text-slate-100 text-sm">Register New Harvest Batch</h3>
          <p className="text-[11px] text-slate-400">
            Mint new crop batch with geo-coordinates, harvest date, and safe temperature limits onto the blockchain.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('transporter')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-600/60 cursor-pointer transition shadow-xl group space-y-2"
        >
          <div className="text-blue-400 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
            <span>Role: Transporter / Fleet</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
          <h3 className="font-bold text-slate-100 text-sm">IoT Telemetry &amp; GPS Ingress</h3>
          <p className="text-[11px] text-slate-400">
            Stream temperature, humidity, and location updates. Automatically execute smart contract rules if limits breach.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('retailer')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-600/60 cursor-pointer transition shadow-xl group space-y-2"
        >
          <div className="text-purple-400 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
            <span>Role: Retailer / Store</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
          <h3 className="font-bold text-slate-100 text-sm">Delivery Receipt &amp; Quality Check</h3>
          <p className="text-[11px] text-slate-400">
            Inspect cold-chain integrity, assign quality grade (A+/A/B), and sign delivery confirmation block.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('consumer')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-600/60 cursor-pointer transition shadow-xl group space-y-2"
        >
          <div className="text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
            <span>Role: Public Consumer</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
          <h3 className="font-bold text-slate-100 text-sm">Scan QR &amp; Trace Provenance</h3>
          <p className="text-[11px] text-slate-400">
            Verify tamper-proof farm-to-fork origin certificate, unbroken cold chain verification, and audit trail.
          </p>
        </div>
      </div>
    </div>
  );
};
