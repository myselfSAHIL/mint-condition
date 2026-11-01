import React, { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { FoodBatch } from '../blockchain/types';
import {
  Sprout,
  PlusCircle,
  CheckCircle2,
  Calendar,
  Thermometer,
  MapPin,
  Package,
  Layers,
  ArrowRight,
  Shield,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const PRESET_TEMPLATES = [
  {
    name: 'Kinnaur Royal Apples',
    category: 'Fresh Produce' as FoodBatch['category'],
    origin: 'Kalpa Orchard, Kinnaur, Himachal Pradesh',
    originCoords: [31.5385, 78.2562] as [number, number],
    destination: 'APMC Market, Mumbai',
    destinationCoords: [19.076, 73.0076] as [number, number],
    quantity: '3,000 kg (150 Crates)',
    minTemp: 1.5,
    maxTemp: 5.5,
    initialTemp: 3.2,
    farmer: 'Devinder Negi',
  },
  {
    name: 'Gir Organic A2 Vedic Ghee & Butter',
    category: 'Dairy & Poultry' as FoodBatch['category'],
    origin: 'Gir Gaushala, Junagadh, Gujarat',
    originCoords: [21.5222, 70.4579] as [number, number],
    destination: 'Bengaluru Organic Mart',
    destinationCoords: [12.9716, 77.5946] as [number, number],
    quantity: '1,200 Jars (500ml)',
    minTemp: 4.0,
    maxTemp: 12.0,
    initialTemp: 6.5,
    farmer: 'Mansukhbhai Patel',
  },
  {
    name: 'Nashik Valley Export Grapes (Sonaka)',
    category: 'Fresh Produce' as FoodBatch['category'],
    origin: 'Dindori Vineyard, Nashik, Maharashtra',
    originCoords: [20.2013, 73.8344] as [number, number],
    destination: 'JNPT Port Container Terminal, Navi Mumbai',
    destinationCoords: [18.9499, 72.9511] as [number, number],
    quantity: '5,000 kg Pre-Cooled',
    minTemp: 0.5,
    maxTemp: 4.0,
    initialTemp: 2.1,
    farmer: 'Sanjay Bhamre',
  },
];

export const FarmerPortal: React.FC<{ onBatchCreated?: (batchId: string) => void }> = ({
  onBatchCreated,
}) => {
  const { registerNewBatch, batches } = useBlockchain();

  const [itemName, setItemName] = useState('Kinnaur Royal Apples');
  const [category, setCategory] = useState<FoodBatch['category']>('Fresh Produce');
  const [quantity, setQuantity] = useState('2,500 kg');
  const [originLocation, setOriginLocation] = useState('Kalpa Orchard, Kinnaur, Himachal Pradesh');
  const [originCoords, setOriginCoords] = useState<[number, number]>([31.5385, 78.2562]);
  const [destinationLocation, setDestinationLocation] = useState('APMC Vashi, Navi Mumbai');
  const [destinationCoords, setDestinationCoords] = useState<[number, number]>([19.076, 73.0076]);
  const [harvestDate, setHarvestDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 45);
    return d.toISOString().split('T')[0];
  });
  const [minSafeTemp, setMinSafeTemp] = useState<number>(2.0);
  const [maxSafeTemp, setMaxSafeTemp] = useState<number>(6.0);
  const [initialTemp, setInitialTemp] = useState<number>(3.5);
  const [farmerName, setFarmerName] = useState('Devinder Negi');
  const [notes, setNotes] = useState('Grade-A organic certified harvest with clean cold chain dispatch.');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastCreatedBatch, setLastCreatedBatch] = useState<{
    batchId: string;
    blockIndex: number;
  } | null>(null);

  const applyTemplate = (tpl: (typeof PRESET_TEMPLATES)[0]) => {
    setItemName(tpl.name);
    setCategory(tpl.category);
    setOriginLocation(tpl.origin);
    setOriginCoords(tpl.originCoords);
    setDestinationLocation(tpl.destination);
    setDestinationCoords(tpl.destinationCoords);
    setQuantity(tpl.quantity);
    setMinSafeTemp(tpl.minTemp);
    setMaxSafeTemp(tpl.maxTemp);
    setInitialTemp(tpl.initialTemp);
    setFarmerName(tpl.farmer);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = registerNewBatch({
        itemName,
        category,
        quantity,
        originLocation,
        originCoords,
        destinationLocation,
        destinationCoords,
        harvestDate,
        expiryDate,
        minSafeTemp,
        maxSafeTemp,
        initialTemp,
        farmerName,
        notes,
      });

      setLastCreatedBatch(res);
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });

      if (onBatchCreated) {
        onBatchCreated(res.batchId);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 p-6 rounded-2xl border border-emerald-800/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-900/40">
            <Sprout className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-100">Farmer &amp; Producer Portal</h1>
            <p className="text-xs text-slate-300">
              Register fresh farm harvests directly onto the immutable AgriLedger DLT
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Presets:
          </span>
          {PRESET_TEMPLATES.map((tpl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => applyTemplate(tpl)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              {tpl.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Creation Success Banner */}
      {lastCreatedBatch && (
        <div className="p-5 bg-emerald-950/60 border border-emerald-600 rounded-2xl text-emerald-200 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-sm">
                Batch Successfully Minted On-Chain: {lastCreatedBatch.batchId}
              </div>
              <div className="text-xs text-emerald-300/80 font-mono">
                Anchored to Block #{lastCreatedBatch.blockIndex} with cryptographically signed metadata.
              </div>
            </div>
          </div>
          <button
            onClick={() => setLastCreatedBatch(null)}
            className="text-xs bg-emerald-800/80 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900/90 p-6 md:p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Package className="w-4 h-4 text-emerald-400" />
          Batch Identification &amp; Commodity Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Commodity / Item Name *</label>
            <input
              type="text"
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full bg-slate-800/90 text-slate-100 rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-emerald-500"
              placeholder="e.g. Organic Kashmiri Saffron"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as FoodBatch['category'])}
              className="w-full bg-slate-800/90 text-slate-100 rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="Fresh Produce">Fresh Produce</option>
              <option value="Dairy & Poultry">Dairy & Poultry</option>
              <option value="Seafood & Meat">Seafood & Meat</option>
              <option value="Beverages">Beverages</option>
              <option value="Organic Spices">Organic Spices</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Quantity / Units *</label>
            <input
              type="text"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-slate-800/90 text-slate-100 rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-emerald-500"
              placeholder="e.g. 2,000 kg"
            />
          </div>
        </div>

        {/* Origin & Destination */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs pt-2">
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Farm / Origin Node (Dispatch)</span>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Origin Location Name:</label>
              <input
                type="text"
                required
                value={originLocation}
                onChange={(e) => setOriginLocation(e.target.value)}
                className="w-full bg-slate-800 text-slate-100 rounded-lg p-2.5 border border-slate-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div>
                <label className="block text-[11px] text-slate-500">Origin Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={originCoords[0]}
                  onChange={(e) => setOriginCoords([parseFloat(e.target.value) || 0, originCoords[1]])}
                  className="w-full bg-slate-800 text-slate-200 rounded p-1.5 border border-slate-700"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500">Origin Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={originCoords[1]}
                  onChange={(e) => setOriginCoords([originCoords[0], parseFloat(e.target.value) || 0])}
                  className="w-full bg-slate-800 text-slate-200 rounded p-1.5 border border-slate-700"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span>Target Retail Market (Fulfillment)</span>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Destination Location Name:</label>
              <input
                type="text"
                required
                value={destinationLocation}
                onChange={(e) => setDestinationLocation(e.target.value)}
                className="w-full bg-slate-800 text-slate-100 rounded-lg p-2.5 border border-slate-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div>
                <label className="block text-[11px] text-slate-500">Dest. Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={destinationCoords[0]}
                  onChange={(e) => setDestinationCoords([parseFloat(e.target.value) || 0, destinationCoords[1]])}
                  className="w-full bg-slate-800 text-slate-200 rounded p-1.5 border border-slate-700"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500">Dest. Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={destinationCoords[1]}
                  onChange={(e) => setDestinationCoords([destinationCoords[0], parseFloat(e.target.value) || 0])}
                  className="w-full bg-slate-800 text-slate-200 rounded p-1.5 border border-slate-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cold-Chain Thresholds & Dates */}
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3 pt-3">
          <Thermometer className="w-4 h-4 text-amber-400" />
          Smart Contract Cold Chain SLA &amp; Shelf Life Parameters
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <label className="block text-slate-300 font-sans font-semibold mb-1.5">Harvest Date</label>
            <input
              type="date"
              required
              value={harvestDate}
              onChange={(e) => setHarvestDate(e.target.value)}
              className="w-full bg-slate-800 text-slate-100 rounded-xl p-3 border border-slate-700"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-sans font-semibold mb-1.5">Expiry Date</label>
            <input
              type="date"
              required
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full bg-slate-800 text-slate-100 rounded-xl p-3 border border-slate-700"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-sans font-semibold mb-1.5">Safe Temp Min (°C)</label>
            <input
              type="number"
              step="0.5"
              required
              value={minSafeTemp}
              onChange={(e) => setMinSafeTemp(parseFloat(e.target.value))}
              className="w-full bg-slate-800 text-slate-100 rounded-xl p-3 border border-slate-700"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-sans font-semibold mb-1.5">Safe Temp Max (°C)</label>
            <input
              type="number"
              step="0.5"
              required
              value={maxSafeTemp}
              onChange={(e) => setMaxSafeTemp(parseFloat(e.target.value))}
              className="w-full bg-slate-800 text-slate-100 rounded-xl p-3 border border-slate-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Producer / Farmer Name</label>
            <input
              type="text"
              required
              value={farmerName}
              onChange={(e) => setFarmerName(e.target.value)}
              className="w-full bg-slate-800 text-slate-100 rounded-xl p-3 border border-slate-700"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Initial Dispatch Temp (°C)</label>
            <input
              type="number"
              step="0.1"
              required
              value={initialTemp}
              onChange={(e) => setInitialTemp(parseFloat(e.target.value))}
              className="w-full bg-slate-800 text-slate-100 rounded-xl p-3 border border-slate-700 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1.5">Audit &amp; Certification Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-800 text-slate-100 rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-emerald-500 text-xs"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60 transition"
        >
          <PlusCircle className="w-5 h-5" />
          {isSubmitting ? 'Hashing & Mining Block...' : 'Mint & Anchor Batch to Blockchain'}
        </button>
      </form>
    </div>
  );
};
