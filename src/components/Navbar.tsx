import React from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { StakeholderRole } from '../blockchain/types';
import {
  Boxes,
  MapPin,
  Compass,
  Database,
  Sprout,
  Truck,
  Store,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { currentRole, setCurrentRole, stats, validationResult } = useBlockchain();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'map', label: 'India Live Map', icon: Compass },
    { id: 'explorer', label: 'Ledger Explorer', icon: Database },
    { id: 'farmer', label: 'Farmer Portal', icon: Sprout },
    { id: 'transporter', label: 'Transporter IoT', icon: Truck },
    { id: 'retailer', label: 'Retailer Portal', icon: Store },
    { id: 'consumer', label: 'Consumer Verification', icon: QrCode },
  ];

  const roles: { id: StakeholderRole; label: string }[] = [
    { id: 'farmer', label: 'Farmer' },
    { id: 'transporter', label: 'Transporter' },
    { id: 'retailer', label: 'Retailer' },
    { id: 'consumer', label: 'Consumer' },
    { id: 'auditor', label: 'Auditor' },
  ];

  return (
    <header className="sticky top-0 z-[500] bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40">
              <Boxes className="w-5 h-5 text-slate-950 font-black" />
            </div>
            <div>
              <div className="font-black text-slate-100 text-sm tracking-tight flex items-center gap-1.5">
                <span className="text-emerald-400">Mint</span><span>Condition</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  DLT
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono -mt-0.5">
                Food Cold-Chain Protocol
              </div>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    isActive
                      ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Elements */}
          <div className="flex items-center gap-3">
            {/* Blockchain Health Pill */}
            <div
              onClick={() => setActiveTab('explorer')}
              className={`cursor-pointer px-2.5 py-1 rounded-full text-[11px] font-mono flex items-center gap-1.5 border transition ${
                validationResult && !validationResult.isValid
                  ? 'bg-rose-950/80 text-rose-300 border-rose-600 animate-pulse'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-emerald-500/50'
              }`}
              title="Click to view full Ledger Explorer"
            >
              {validationResult && !validationResult.isValid ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span className="font-bold">Tamper Detected!</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-slate-400">Block</span>
                  <span className="text-emerald-400 font-bold">#{stats.totalBlocks}</span>
                </>
              )}
            </div>

            {/* Role Switcher Pill */}
            <div className="hidden sm:flex items-center bg-slate-800/80 p-0.5 rounded-xl border border-slate-700 text-[11px]">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setCurrentRole(r.id);
                    if (r.id === 'farmer') setActiveTab('farmer');
                    else if (r.id === 'transporter') setActiveTab('transporter');
                    else if (r.id === 'retailer') setActiveTab('retailer');
                    else if (r.id === 'consumer') setActiveTab('consumer');
                  }}
                  className={`px-2 py-1 rounded-lg font-medium transition ${
                    currentRole === r.id
                      ? 'bg-emerald-600 text-white font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Subnavigation Row */}
        <div className="xl:hidden flex items-center gap-1.5 overflow-x-auto py-2 border-t border-slate-800 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
