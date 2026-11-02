import React, { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { Block } from '../blockchain/Block';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Hash,
  Clock,
  Cpu,
  Layers,
  Database,
  AlertTriangle,
  Flame,
  CheckCircle2,
  RefreshCw,
  FileCode,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Terminal,
  Key,
  Sliders,
} from 'lucide-react';

export const LedgerExplorer: React.FC = () => {
  const {
    blockchain,
    validationResult,
    isValidating,
    runChainValidation,
    tamperBlockPayload,
    resetChainToClean,
  } = useBlockchain();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterBreachesOnly, setFilterBreachesOnly] = useState(false);
  const [expandedBlockIndex, setExpandedBlockIndex] = useState<number | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Tamper Injection Modal State
  const [isTamperModalOpen, setIsTamperModalOpen] = useState(false);
  const [tamperTargetBlockIndex, setTamperTargetBlockIndex] = useState<number>(4);
  const [tamperNewTemp, setTamperNewTemp] = useState<string>('3.5');
  const [tamperNotes, setTamperNotes] = useState<string>('Tampered: Operator manually faked sensor logs.');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleVerify = async () => {
    await runChainValidation();
  };

  const handleInjectTamper = () => {
    tamperBlockPayload(tamperTargetBlockIndex, {
      temperature: parseFloat(tamperNewTemp) || 3.0,
      notes: tamperNotes,
      slaViolation: false, // Malicious actor tries to erase the SLA violation!
    });
    setIsTamperModalOpen(false);
  };

  // Filter blocks
  const filteredBlocks = blockchain.chain.filter((block) => {
    if (filterBreachesOnly && !block.hasThermalBreach()) return false;
    if (!searchQuery) return true;

    const q = searchQuery.toLowerCase();
    const indexMatch = block.index.toString() === q;
    const hashMatch = block.hash.toLowerCase().includes(q);
    const prevHashMatch = block.previousHash.toLowerCase().includes(q);
    const txMatch = block.transactions.some(
      (tx) =>
        tx.batchId.toLowerCase().includes(q) ||
        tx.id.toLowerCase().includes(q) ||
        tx.actor.name.toLowerCase().includes(q)
    );

    return indexMatch || hashMatch || prevHashMatch || txMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header & Verification Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-950/80 rounded-xl text-blue-400 border border-blue-800/60">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-100">Immutable Ledger Explorer</h1>
              <p className="text-xs text-slate-400">
                Cryptographic SHA-256 Distributed Ledger • Consensus: Proof-of-Work (PoW)
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Verify Chain Button */}
          <button
            onClick={handleVerify}
            disabled={isValidating}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg ${
              isValidating
                ? 'bg-slate-700 text-slate-300 cursor-wait'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50 hover:shadow-emerald-600/30'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isValidating ? 'animate-spin' : ''}`} />
            {isValidating ? 'Auditing Ledger Hashes...' : 'Verify Chain Integrity'}
          </button>

          {/* Tamper Simulation Demo Trigger */}
          <button
            onClick={() => setIsTamperModalOpen(true)}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <Sliders className="w-4 h-4 text-rose-400" />
            Simulate Tamper
          </button>

          {/* Reset Clean Button */}
          <button
            onClick={resetChainToClean}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
            title="Reset Blockchain to Clean Genesis State"
          >
            Reset Chain
          </button>
        </div>
      </div>

      {/* Validation Result Banner */}
      {validationResult && (
        <div
          className={`p-5 rounded-2xl border transition-all ${
            validationResult.isValid
              ? 'bg-emerald-950/50 border-emerald-700/60 text-emerald-200'
              : 'bg-rose-950/70 border-rose-600 text-rose-100 shadow-2xl shadow-rose-950/50 animate-pulse'
          }`}
        >
          <div className="flex items-start gap-3.5">
            {validationResult.isValid ? (
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 w-full">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm sm:text-base">
                  {validationResult.isValid
                    ? `✓ Ledger Integrity 100% Cryptographically Verified`
                    : `⚠️ FRAUD / DATA TAMPER DETECTED ON LEDGER!`}
                </h3>
                <span className="text-[11px] font-mono opacity-75">
                  Checked {validationResult.checkedBlocksCount} Blocks
                </span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {validationResult.isValid
                  ? `Every block's SHA-256 hash matches its transactions' Merkle root and points flawlessly to its ancestor block. No records have been modified.`
                  : validationResult.errorMessage}
              </p>
              {!validationResult.isValid && validationResult.brokenBlockIndex !== null && (
                <div className="mt-2 text-xs font-mono bg-rose-900/60 p-2.5 rounded-lg border border-rose-700/70">
                  Critical: Block #{validationResult.brokenBlockIndex} fails consensus verification.
                  Subsequent chain links are invalidated.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by block #, SHA-256 hash, Batch ID, or signer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 text-xs text-slate-200 placeholder-slate-500 rounded-lg pl-9 pr-4 py-2 border border-slate-700 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        <button
          onClick={() => setFilterBreachesOnly(!filterBreachesOnly)}
          className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
            filterBreachesOnly
              ? 'bg-red-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          Thermal Breaches Only ({blockchain.chain.filter((b) => b.hasThermalBreach()).length})
        </button>
      </div>

      {/* Chain Stream of Blocks */}
      <div className="space-y-4">
        {filteredBlocks.map((block) => {
          const isExpanded = expandedBlockIndex === block.index;
          const hasBreach = block.hasThermalBreach();
          const isTampered = block.isTampered;
          const isGenesis = block.index === 0;

          return (
            <div
              key={block.index}
              className={`rounded-2xl border transition-all ${
                isTampered
                  ? 'bg-rose-950/40 border-rose-600 ring-2 ring-rose-500/50'
                  : hasBreach
                  ? 'bg-slate-900/90 border-amber-600/50 hover:border-amber-500'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              } shadow-xl overflow-hidden`}
            >
              {/* Block Header Summary */}
              <div
                onClick={() => setExpandedBlockIndex(isExpanded ? null : block.index)}
                className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/30 transition select-none"
              >
                <div className="flex items-center gap-3.5">
                  {/* Block Index Badge */}
                  <div
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold font-mono text-sm border shadow-inner ${
                      isTampered
                        ? 'bg-rose-900/60 border-rose-500 text-rose-200'
                        : hasBreach
                        ? 'bg-amber-950/60 border-amber-500/70 text-amber-300'
                        : 'bg-blue-950/60 border-blue-800/80 text-blue-300'
                    }`}
                  >
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-sans">Block</span>
                    <span>#{block.index}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200">
                        {isGenesis ? 'Genesis Block (Network Root)' : block.transactions[0]?.type || 'Transaction'}
                      </span>
                      {hasBreach && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700/60 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-400" />
                          Temp Threshold Alert (&gt; 8°C)
                        </span>
                      )}
                      {isTampered && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-600 animate-pulse">
                          ⚠️ Tampered Payload
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{new Date(block.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <span>Miner: {block.miner}</span>
                    </div>
                  </div>
                </div>

                {/* Hashes Summary */}
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-left md:text-right">
                    <div className="text-[10px] text-slate-500 font-mono">Block SHA-256 Hash</div>
                    <div className="font-mono text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                      <span>{block.hash.slice(0, 14)}...{block.hash.slice(-8)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(block.hash);
                        }}
                        className="text-slate-500 hover:text-slate-200"
                        title="Copy full hash"
                      >
                        {copiedHash === block.hash ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="text-slate-400 p-1">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Expanded Technical Detail View */}
              {isExpanded && (
                <div className="p-6 bg-slate-950/80 border-t border-slate-800/80 space-y-6">
                  {/* Cryptographic Headers Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                      <div className="text-slate-500 text-[10px] uppercase">Nonce (PoW Counter)</div>
                      <div className="text-slate-100 font-bold text-sm mt-0.5">{block.nonce}</div>
                    </div>
                    <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                      <div className="text-slate-500 text-[10px] uppercase">Difficulty Target</div>
                      <div className="text-slate-100 font-bold text-sm mt-0.5">{block.difficulty} Leading Zeros</div>
                    </div>
                    <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 col-span-1 md:col-span-2">
                      <div className="text-slate-500 text-[10px] uppercase">Previous Block Hash</div>
                      <div className="text-blue-400 truncate mt-0.5 text-[11px] font-bold">
                        {block.previousHash || '0 (Root)'}
                      </div>
                    </div>
                  </div>

                  {/* Merkle Root & Full Hash */}
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[10px] uppercase">Transaction Merkle Root</span>
                      <span className="text-slate-400 text-[10px]">Tree Hash</span>
                    </div>
                    <div className="text-amber-400 font-bold break-all text-[11px]">{block.merkleRoot}</div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-slate-500 text-[10px] uppercase">Recalculated Hash Validation</span>
                      <span className={`text-[11px] font-bold ${block.hash === block.calculateHash() ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {block.hash === block.calculateHash() ? '✓ Hash Matches' : '❌ HASH CORRUPTED'}
                      </span>
                    </div>
                  </div>

                  {/* Transactions Payload Table */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <FileCode className="w-3.5 h-3.5 text-blue-400" />
                        Transactions Payload ({block.transactions.length})
                      </h4>
                    </div>

                    <div className="space-y-3">
                      {block.transactions.map((tx, txIdx) => (
                        <div
                          key={txIdx}
                          className="p-4 rounded-xl bg-slate-900/95 border border-slate-800 text-xs font-mono space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                            <span className="text-blue-400 font-bold">{tx.id}</span>
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                              Batch: {tx.batchId}
                            </span>
                            <span className="text-slate-400 text-[10px]">
                              Signer: {tx.actor.name} ({tx.actor.role})
                            </span>
                          </div>

                          {/* Payload Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-[11px]">
                            {tx.payload.status && (
                              <div>
                                <span className="text-slate-500">Status: </span>
                                <span className="text-slate-200 font-bold">{tx.payload.status}</span>
                              </div>
                            )}
                            {tx.payload.temperature !== undefined && (
                              <div>
                                <span className="text-slate-500">Temp: </span>
                                <span
                                  className={`font-bold ${
                                    tx.payload.temperature > 8 ? 'text-rose-400' : 'text-emerald-400'
                                  }`}
                                >
                                  {tx.payload.temperature}°C
                                </span>
                              </div>
                            )}
                            {tx.payload.humidity !== undefined && (
                              <div>
                                <span className="text-slate-500">Humidity: </span>
                                <span className="text-cyan-400">{tx.payload.humidity}%</span>
                              </div>
                            )}
                            {tx.payload.locationName && (
                              <div className="sm:col-span-2">
                                <span className="text-slate-500">Location: </span>
                                <span className="text-slate-300">{tx.payload.locationName}</span>
                              </div>
                            )}
                          </div>

                          {tx.payload.notes && (
                            <div className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                              <span className="text-slate-500 font-semibold">Audit Notes: </span>
                              {tx.payload.notes}
                            </div>
                          )}

                          {tx.payload.violationDetails && (
                            <div className="text-[11px] text-rose-300 bg-rose-950/40 p-2 rounded-lg border border-rose-800/50">
                              <span className="font-bold">SLA Breach Flag: </span>
                              {tx.payload.violationDetails}
                            </div>
                          )}

                          <div className="text-[10px] text-slate-500 truncate pt-1">
                            Signature: {tx.signature || '0x00'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tamper Injection Modal */}
      {isTamperModalOpen && (
        <div className="fixed inset-0 z-[700] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-rose-700/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-rose-400 font-bold text-base">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <span>Simulate Malicious Ledger Tamper</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              In a traditional centralized database, an attacker can covertly alter temperature logs to hide an SLA penalty. Inject a fake reading into the ledger to test MintCondition's cryptographic SHA-256 detection!
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Target Block Index:</label>
                <select
                  value={tamperTargetBlockIndex}
                  onChange={(e) => setTamperTargetBlockIndex(Number(e.target.value))}
                  className="w-full bg-slate-800 text-slate-100 rounded-lg p-2 border border-slate-700 font-mono"
                >
                  {blockchain.chain.map((b) => (
                    <option key={b.index} value={b.index}>
                      Block #{b.index} — {b.transactions[0]?.batchId || 'Genesis'} ({b.miner})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Tampered Sensor Temperature (°C):
                </label>
                <input
                  type="text"
                  value={tamperNewTemp}
                  onChange={(e) => setTamperNewTemp(e.target.value)}
                  placeholder="e.g. 3.2"
                  className="w-full bg-slate-800 text-slate-100 rounded-lg p-2 border border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Falsified Notes / Reason:</label>
                <input
                  type="text"
                  value={tamperNotes}
                  onChange={(e) => setTamperNotes(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 rounded-lg p-2 border border-slate-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsTamperModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleInjectTamper}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-900/50"
              >
                Corrupt Block Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
