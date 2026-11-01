import React, { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import {
  Truck,
  Send,
  Thermometer,
  Droplets,
  Gauge,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Flame,
  Radio,
} from 'lucide-react';

export const TransporterPortal: React.FC = () => {
  const { batches, appendIoTTelemetry, selectedBatchId, setSelectedBatchId } = useBlockchain();

  const selectedBatch = batches.find((b) => b.batchId === selectedBatchId) || batches[0];

  const [locationName, setLocationName] = useState('NH-48 Highway Toll Plaza, Near Surat');
  const [coords, setCoords] = useState<[number, number]>([21.1702, 72.8311]);
  const [temperature, setTemperature] = useState<number>(3.8);
  const [humidity, setHumidity] = useState<number>(82.0);
  const [speedKmH, setSpeedKmH] = useState<number>(64);
  const [notes, setNotes] = useState('Hardware crypto-enclave verified reading. Chiller unit operational.');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<{
    text: string;
    violation: boolean;
    blockIndex: number;
  } | null>(null);

  // Check in real-time if entered temperature will trigger an SLA breach
  const isBreachingSLA =
    selectedBatch &&
    (temperature > selectedBatch.maxSafeTemp || temperature < selectedBatch.minSafeTemp);

  const handleSubmitTelemetry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    setIsSubmitting(true);
    try {
      const res = appendIoTTelemetry(selectedBatch.batchId, {
        locationName,
        coords,
        temperature,
        humidity,
        speedKmH,
        notes,
      });

      setResultMessage({
        text: res.violation
          ? `CRITICAL: Thermal breach smart contract penalty logged to Block #${res.blockIndex}!`
          : `Verified IoT telemetry successfully anchored to Block #${res.blockIndex}.`,
        violation: res.violation,
        blockIndex: res.blockIndex,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateQuickPing = (tempOverride?: number) => {
    if (!selectedBatch) return;
    const tempToUse = tempOverride !== undefined ? tempOverride : selectedBatch.currentTemp;
    const res = appendIoTTelemetry(selectedBatch.batchId, {
      locationName: `Live In-Transit Checkpoint (${selectedBatch.currentCoords[0].toFixed(2)}°N)`,
      coords: selectedBatch.currentCoords,
      temperature: tempToUse,
      humidity: selectedBatch.currentHumidity,
      speedKmH: 62,
      notes: tempOverride && tempOverride > 8
        ? 'ALERT: Chiller auxiliary compressor shut down unexpectedly. Temperature spiked!'
        : 'Automated periodic heartbeat telemetry ping.',
    });

    setResultMessage({
      text: res.violation
        ? `SLA Breach Block #${res.blockIndex} mined! Temperature ${tempToUse}°C breached limits.`
        : `IoT Telemetry Block #${res.blockIndex} mined successfully.`,
      violation: res.violation,
      blockIndex: res.blockIndex,
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-900 p-6 rounded-2xl border border-blue-800/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-900/40">
            <Truck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-100">Transporter &amp; IoT Cold Fleet Portal</h1>
            <p className="text-xs text-slate-300">
              Broadcast cryptographically verified sensor readings and GPS telemetry to the chain
            </p>
          </div>
        </div>

        {/* Quick Batch Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Active Consignment:</span>
          <select
            value={selectedBatch?.batchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="bg-slate-800 text-slate-100 text-xs font-mono rounded-lg px-3 py-2 border border-slate-700"
          >
            {batches.map((b) => (
              <option key={b.batchId} value={b.batchId}>
                {b.itemName.split(' ')[0]} ({b.batchId})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result Alert */}
      {resultMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between ${
            resultMessage.violation
              ? 'bg-rose-950/70 border-rose-600 text-rose-200'
              : 'bg-emerald-950/60 border-emerald-600 text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {resultMessage.violation ? (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <span className="text-xs font-semibold">{resultMessage.text}</span>
          </div>
          <button
            onClick={() => setResultMessage(null)}
            className="text-xs px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Telemetry Input Form */}
        <div className="lg:col-span-2 bg-slate-900/90 p-6 md:p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
              Append IoT Telemetry Block
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Vehicle: {selectedBatch?.truckId || 'TRUCK-IND-901'}
            </span>
          </div>

          <form onSubmit={handleSubmitTelemetry} className="space-y-5 text-xs">
            {/* Location */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Checkpoint / Location Name *</label>
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full bg-slate-800 text-slate-100 rounded-xl p-3 border border-slate-700"
                placeholder="e.g. Surat Toll Expressway Exit 4"
              />
            </div>

            {/* GPS Coords */}
            <div className="grid grid-cols-2 gap-4 font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Latitude (°N)</label>
                <input
                  type="number"
                  step="any"
                  value={coords[0]}
                  onChange={(e) => setCoords([parseFloat(e.target.value) || 0, coords[1]])}
                  className="w-full bg-slate-800 text-slate-100 rounded-lg p-2.5 border border-slate-700"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Longitude (°E)</label>
                <input
                  type="number"
                  step="any"
                  value={coords[1]}
                  onChange={(e) => setCoords([coords[0], parseFloat(e.target.value) || 0])}
                  className="w-full bg-slate-800 text-slate-100 rounded-lg p-2.5 border border-slate-700"
                />
              </div>
            </div>

            {/* Telemetry Sensor Gauges Input */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
              <div
                className={`p-3 rounded-xl border ${
                  isBreachingSLA
                    ? 'bg-rose-950/40 border-rose-600 ring-2 ring-rose-500/50'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <label className="flex items-center justify-between text-slate-300 font-sans font-semibold mb-1">
                  <span>Reefer Temp (°C)</span>
                  <Thermometer className="w-4 h-4 text-amber-400" />
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full bg-slate-800 text-slate-100 text-base font-bold rounded-lg p-2 border border-slate-700"
                />
                <div className="text-[10px] text-slate-400 mt-1 font-sans">
                  Allowed: {selectedBatch?.minSafeTemp}°C - {selectedBatch?.maxSafeTemp}°C
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <label className="flex items-center justify-between text-slate-300 font-sans font-semibold mb-1">
                  <span>Humidity (%)</span>
                  <Droplets className="w-4 h-4 text-cyan-400" />
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={humidity}
                  onChange={(e) => setHumidity(parseFloat(e.target.value))}
                  className="w-full bg-slate-800 text-slate-100 text-base font-bold rounded-lg p-2 border border-slate-700"
                />
                <div className="text-[10px] text-slate-400 mt-1 font-sans">Target: 70% - 90%</div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <label className="flex items-center justify-between text-slate-300 font-sans font-semibold mb-1">
                  <span>Speed (km/h)</span>
                  <Gauge className="w-4 h-4 text-emerald-400" />
                </label>
                <input
                  type="number"
                  required
                  value={speedKmH}
                  onChange={(e) => setSpeedKmH(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 text-slate-100 text-base font-bold rounded-lg p-2 border border-slate-700"
                />
                <div className="text-[10px] text-slate-400 mt-1 font-sans">GPS Telematics</div>
              </div>
            </div>

            {/* Smart contract warning banner if temperature is out of bounds */}
            {isBreachingSLA && (
              <div className="p-3.5 bg-rose-950/80 border border-rose-600 rounded-xl text-rose-200 flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold">Automatic Smart Contract SLA Breach Alert!</div>
                  <p className="text-[11px] opacity-90">
                    Entered temperature ({temperature}°C) violates safe cold chain thresholds ({selectedBatch.minSafeTemp}°C to {selectedBatch.maxSafeTemp}°C). Appending this block will autonomously execute the SLA penalty contract on-chain.
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Trip / Telematics Remarks</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-800 text-slate-100 rounded-xl p-3 border border-slate-700"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition ${
                isBreachingSLA
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/60'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-950/60'
              }`}
            >
              <Send className="w-4 h-4" />
              {isSubmitting
                ? 'Validating & Mining Telemetry Block...'
                : isBreachingSLA
                ? 'Sign & Mine Telemetry (SLA Breach Triggered)'
                : 'Sign & Mine IoT Telemetry Block'}
            </button>
          </form>
        </div>

        {/* Right: Batch Overview & Quick Actions */}
        <div className="space-y-6">
          <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-slate-100 text-sm border-b border-slate-800 pb-2">
              Consignment Cold Chain Profile
            </h3>

            {selectedBatch && (
              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-slate-400">Item:</div>
                  <div className="font-bold text-slate-200">{selectedBatch.itemName}</div>
                </div>
                <div>
                  <div className="text-slate-400">Current Status:</div>
                  <div className="font-semibold text-blue-400">{selectedBatch.currentStatus}</div>
                </div>
                <div>
                  <div className="text-slate-400">Safe Temperature Envelope:</div>
                  <div className="font-mono text-emerald-400 font-bold">
                    {selectedBatch.minSafeTemp}°C to {selectedBatch.maxSafeTemp}°C
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Origin → Destination:</div>
                  <div className="text-slate-300">
                    {selectedBatch.originLocation.split(',')[0]} → {selectedBatch.destinationLocation.split(',')[0]}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Simulation One-Clickers */}
          <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-3">
            <h3 className="font-bold text-slate-100 text-sm">Quick IoT Simulator Tools</h3>
            <p className="text-[11px] text-slate-400">
              Generate simulated IoT sensor events to immediately append verified blocks to the chain:
            </p>

            <button
              onClick={() => handleSimulateQuickPing(selectedBatch?.currentTemp)}
              className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition border border-slate-700"
            >
              <Cpu className="w-4 h-4 text-emerald-400" />
              Simulate Normal IoT Heartbeat Ping
            </button>

            <button
              onClick={() => handleSimulateQuickPing(12.4)}
              className="w-full py-2.5 px-3 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition border border-rose-800/60"
            >
              <Flame className="w-4 h-4 text-rose-400" />
              Simulate Thermal Spike (12.4°C Breach)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
