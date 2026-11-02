import React, { useState } from 'react';
import { BlockchainProvider, useBlockchain } from './context/BlockchainContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { LiveMap } from './components/LiveMap';
import { LedgerExplorer } from './components/LedgerExplorer';
import { FarmerPortal } from './components/FarmerPortal';
import { TransporterPortal } from './components/TransporterPortal';
import { RetailerPortal } from './components/RetailerPortal';
import { ConsumerView } from './components/ConsumerView';
import { Boxes, ShieldCheck, Heart, Terminal, Compass } from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [consumerTargetBatchId, setConsumerTargetBatchId] = useState<string>('BATCH-HP-APL-2026-081');
  const { setSelectedBatchId } = useBlockchain();

  const handleNavigateToConsumer = (batchId: string) => {
    setConsumerTargetBatchId(batchId);
    setActiveTab('consumer');
  };

  const handleSelectBatchForMap = (batchId: string) => {
    setSelectedBatchId(batchId);
    setActiveTab('map');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <Dashboard
            onNavigateTab={setActiveTab}
            onSelectBatchForMap={handleSelectBatchForMap}
          />
        )}
        {activeTab === 'map' && (
          <LiveMap
            onNavigateToExplorer={() => setActiveTab('explorer')}
            onNavigateToConsumer={handleNavigateToConsumer}
          />
        )}
        {activeTab === 'explorer' && <LedgerExplorer />}
        {activeTab === 'farmer' && (
          <FarmerPortal
            onBatchCreated={(batchId) => {
              setSelectedBatchId(batchId);
              setActiveTab('map');
            }}
          />
        )}
        {activeTab === 'transporter' && <TransporterPortal />}
        {activeTab === 'retailer' && <RetailerPortal />}
        {activeTab === 'consumer' && (
          <ConsumerView initialBatchId={consumerTargetBatchId} />
        )}
      </main>

      {/* Footer (only visible when not on fullscreen map) */}
      {activeTab !== 'map' && (
        <footer className="border-t border-slate-800 bg-slate-900/60 py-6 text-xs text-slate-400 mt-12">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-slate-200">MintCondition DLT Protocol v2.0</span>
              <span>•</span>
              <span>Smart Food Supply Chain &amp; Cold-Chain Simulator</span>
            </div>

            <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
              <span>SHA-256 Consensus Engine</span>
              <span>•</span>
              <span>FSSAI Cold-Chain Regulatory Standard</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BlockchainProvider>
      <AppContent />
    </BlockchainProvider>
  );
};

export default App;
