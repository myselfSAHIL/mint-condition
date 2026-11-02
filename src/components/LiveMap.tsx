import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useBlockchain } from '../context/BlockchainContext';
import { FoodBatch } from '../blockchain/types';
import { IndiaTacticalMap } from './IndiaTacticalMap';
import {
  Truck,
  AlertTriangle,
  Thermometer,
  Droplets,
  Gauge,
  Navigation,
  ShieldCheck,
  ExternalLink,
  Play,
  Pause,
  Flame,
  X,
  Compass,
  Layers,
  Sparkles,
} from 'lucide-react';

export const LiveMap: React.FC<{
  onNavigateToExplorer?: () => void;
  onNavigateToConsumer?: (batchId: string) => void;
}> = ({ onNavigateToExplorer, onNavigateToConsumer }) => {
  const {
    batches,
    selectedBatchId,
    setSelectedBatchId,
    isSimulating,
    setIsSimulating,
    simulationSpeed,
    setSimulationSpeed,
    triggerThermalBreachOnBatch,
  } = useBlockchain();

  // Mode: 'tactical' (Cybernetic HUD vector map from reference image) or 'leaflet' (Tile map)
  const [mapMode, setMapMode] = useState<'tactical' | 'leaflet'>('tactical');

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);

  const [activeDrawerBatch, setActiveDrawerBatch] = useState<FoodBatch | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Sync drawer batch with selectedBatchId
  useEffect(() => {
    if (selectedBatchId) {
      const match = batches.find((b) => b.batchId === selectedBatchId);
      if (match) setActiveDrawerBatch(match);
    }
  }, [selectedBatchId, batches]);

  // Initialize Leaflet Map only if in leaflet mode
  useEffect(() => {
    if (mapMode !== 'leaflet') {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }

    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center of India
    const map = L.map(mapContainerRef.current, {
      center: [22.8, 79.5],
      zoom: 5,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Dark high-contrast OpenStreetMap CartoDB tiles
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; CARTO &copy; OpenStreetMap',
        maxZoom: 19,
        subdomains: 'abcd',
      }
    ).addTo(map);

    const routesLayer = L.layerGroup().addTo(map);
    const markersLayer = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    routesLayerRef.current = routesLayer;
    markersLayerRef.current = markersLayer;

    // Invalidate size after brief timeout to avoid blank tile render issues
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [mapMode]);

  // Render Routes and Markers on Leaflet when in leaflet mode
  useEffect(() => {
    if (mapMode !== 'leaflet') return;

    const map = mapInstanceRef.current;
    const routesLayer = routesLayerRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !routesLayer || !markersLayer) return;

    routesLayer.clearLayers();
    markersLayer.clearLayers();

    const filteredBatches = batches.filter(
      (b) => filterCategory === 'ALL' || b.category === filterCategory
    );

    filteredBatches.forEach((batch) => {
      const isSelected = batch.batchId === selectedBatchId;
      const hasBreach = batch.thermalBreaches.length > 0;

      // Draw planned route
      const plannedPoints = batch.routeWaypoints.map((w) => w.coords);
      if (plannedPoints.length > 1) {
        L.polyline(plannedPoints, {
          color: isSelected ? '#00e5ff' : '#94a3b8',
          weight: isSelected ? 4 : 2,
          opacity: isSelected ? 0.9 : 0.45,
          dashArray: '6, 8',
        }).addTo(routesLayer);
      }

      // Draw historical path
      if (batch.historyPoints && batch.historyPoints.length > 1) {
        L.polyline(batch.historyPoints, {
          color: hasBreach ? '#ef4444' : '#0284c7',
          weight: isSelected ? 5 : 3,
          opacity: 0.85,
        }).addTo(routesLayer);
      }

      // Waypoints
      batch.routeWaypoints.forEach((wp, idx) => {
        const isOrigin = idx === 0;
        const isDestination = idx === batch.routeWaypoints.length - 1;

        let iconHtml = '';
        if (isOrigin) {
          iconHtml = `<div class="flex items-center justify-center w-7 h-7 bg-emerald-600 text-white rounded-full shadow-lg border-2 border-white text-xs font-bold ring-2 ring-emerald-300">🌱</div>`;
        } else if (isDestination) {
          iconHtml = `<div class="flex items-center justify-center w-7 h-7 bg-purple-600 text-white rounded-full shadow-lg border-2 border-white text-xs font-bold ring-2 ring-purple-300">🏬</div>`;
        } else if (wp.isBreachPoint) {
          iconHtml = `<div class="flex items-center justify-center w-7 h-7 bg-red-600 text-white rounded-full shadow-lg border-2 border-white text-xs font-bold animate-bounce ring-4 ring-red-400">⚠️</div>`;
        } else {
          iconHtml = `<div class="w-3.5 h-3.5 ${
            wp.reached ? 'bg-cyan-500 ring-2 ring-cyan-300' : 'bg-slate-400'
          } rounded-full border border-white shadow"></div>`;
        }

        const wpMarker = L.marker(wp.coords, {
          icon: L.divIcon({
            html: iconHtml,
            className: 'custom-waypoint-icon',
            iconSize: isOrigin || isDestination || wp.isBreachPoint ? [28, 28] : [14, 14],
            iconAnchor: isOrigin || isDestination || wp.isBreachPoint ? [14, 14] : [7, 7],
          }),
        }).addTo(markersLayer);

        wpMarker.bindTooltip(
          `<strong>${wp.name}</strong><br/>${
            wp.reached ? `Reached at: ${wp.reachedAt || 'Yes'}` : 'Pending Waypoint'
          }${wp.isBreachPoint ? '<br/><span class="text-red-500 font-bold">⚠️ Thermal Breach Logged!</span>' : ''}`,
          { direction: 'top', offset: [0, -10] }
        );
      });

      // Dynamic Moving Truck Marker
      if (batch.currentStatus === 'In Transit' || batch.currentStatus === 'At Store') {
        const truckPulseColor = hasBreach ? 'bg-red-500 ring-red-400' : 'bg-cyan-500 ring-cyan-300';
        const truckBadgeHtml = `
          <div class="relative group cursor-pointer transition-transform hover:scale-125">
            <div class="absolute -inset-1 rounded-full ${truckPulseColor} opacity-75 animate-ping"></div>
            <div class="relative flex items-center justify-center w-10 h-10 ${
              hasBreach ? 'bg-red-600' : 'bg-slate-900'
            } text-white rounded-full shadow-2xl border-2 ${
          isSelected ? 'border-amber-400 ring-4 ring-amber-300' : 'border-cyan-400'
        }">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 ${
                hasBreach ? 'text-amber-200' : 'text-cyan-400'
              }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
                <path d="M15 18H9"/>
                <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
                <circle cx="17" cy="18" r="2"/>
                <circle cx="7" cy="18" r="2"/>
              </svg>
            </div>
          </div>
        `;

        const truckMarker = L.marker(batch.currentCoords, {
          icon: L.divIcon({
            html: truckBadgeHtml,
            className: 'custom-truck-icon',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          }),
        }).addTo(markersLayer);

        truckMarker.on('click', () => {
          setSelectedBatchId(batch.batchId);
          setActiveDrawerBatch(batch);
        });
      }
    });
  }, [batches, selectedBatchId, filterCategory, mapMode, setSelectedBatchId]);

  const panToBatch = (batch: FoodBatch) => {
    setSelectedBatchId(batch.batchId);
    setActiveDrawerBatch(batch);
    if (mapMode === 'leaflet' && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(batch.currentCoords, 7, { duration: 1.2 });
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-4.5rem)] flex overflow-hidden bg-[#020b18]">
      {/* Top Map Control Bar */}
      <div className="absolute top-16 md:top-20 left-4 z-[400] flex flex-wrap items-center gap-2 bg-[#031326]/90 backdrop-blur-md p-2 rounded-xl border border-cyan-500/30 shadow-2xl">
        {/* Layer Mode Switcher: Tactical HUD Map vs Leaflet Tiles */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-cyan-500/30 text-xs">
          <button
            onClick={() => setMapMode('tactical')}
            className={`px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 transition ${
              mapMode === 'tactical'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : 'text-cyan-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tactical Sci-Fi HUD</span>
          </button>
          <button
            onClick={() => setMapMode('leaflet')}
            className={`px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 transition ${
              mapMode === 'leaflet'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : 'text-cyan-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Street / Satellite Tiles</span>
          </button>
        </div>

        {/* Quick Batch Chips */}
        <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto max-w-md">
          {batches.map((b) => {
            const isSelected = b.batchId === selectedBatchId;
            return (
              <button
                key={b.batchId}
                onClick={() => panToBatch(b)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {b.itemName.split(' ')[0]} ({b.currentTemp}°C)
              </button>
            );
          })}
        </div>

        {/* Simulation Speed & Controls */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
              isSimulating
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50 hover:bg-amber-600/40'
                : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-600/40'
            }`}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isSimulating ? 'Pause' : 'Play'}</span>
          </button>

          <select
            value={simulationSpeed}
            onChange={(e) => setSimulationSpeed(Number(e.target.value))}
            aria-label="Simulation speed multiplier"
            className="bg-slate-800 text-xs text-slate-200 rounded-lg px-2 py-1 border border-slate-700 focus:outline-none"
          >
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={4}>4x</option>
          </select>
        </div>
      </div>

      {/* PRIMARY VIEW: Tactical Vector India Map (Reference Image Recreation) */}
      {mapMode === 'tactical' && (
        <IndiaTacticalMap
          batches={batches}
          selectedBatchId={selectedBatchId}
          onSelectBatch={(id) => setSelectedBatchId(id)}
          onOpenDrawer={(b) => {
            setSelectedBatchId(b.batchId);
            setActiveDrawerBatch(b);
          }}
        />
      )}

      {/* SECONDARY VIEW: Leaflet Interactive Map Container */}
      {mapMode === 'leaflet' && (
        <div ref={mapContainerRef} className="w-full h-full z-0 bg-[#020b18]" />
      )}

      {/* Slide-out Truck & Batch Detail Drawer */}
      {activeDrawerBatch && (
        <div className="absolute top-0 right-0 w-full sm:w-[420px] h-full z-[600] bg-slate-900/95 backdrop-blur-xl border-l border-cyan-500/30 shadow-2xl flex flex-col transition-all duration-300 overflow-y-auto">
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 z-10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-cyan-950/80 rounded-lg text-cyan-400 border border-cyan-800/50">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">{activeDrawerBatch.itemName}</h3>
                <span className="text-[11px] font-mono text-cyan-400">{activeDrawerBatch.batchId}</span>
              </div>
            </div>
            <button
              onClick={() => setActiveDrawerBatch(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="p-5 space-y-5">
            <div className="flex items-center justify-between">
              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                  activeDrawerBatch.currentStatus === 'In Transit'
                    ? 'bg-blue-950/60 text-blue-400 border-blue-800/60'
                    : activeDrawerBatch.currentStatus === 'At Store'
                    ? 'bg-purple-950/60 text-purple-400 border-purple-800/60'
                    : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                }`}
              >
                ● {activeDrawerBatch.currentStatus}
              </span>
              <span className="text-xs text-slate-400 font-mono">Truck: {activeDrawerBatch.truckId}</span>
            </div>

            {/* IoT Real-Time Gauges Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div
                className={`p-3 rounded-xl border ${
                  activeDrawerBatch.currentTemp > activeDrawerBatch.maxSafeTemp ||
                  activeDrawerBatch.currentTemp < activeDrawerBatch.minSafeTemp
                    ? 'bg-red-950/40 border-red-800/60 text-red-300'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Reefer Temp</span>
                  <Thermometer className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold font-mono">
                  {activeDrawerBatch.currentTemp}°C
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Safe: {activeDrawerBatch.minSafeTemp}°C - {activeDrawerBatch.maxSafeTemp}°C
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Chamber RH</span>
                  <Droplets className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-cyan-400">
                  {activeDrawerBatch.currentHumidity}%
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Optimum Humidity</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Current GPS</span>
                  <Navigation className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-xs font-mono text-slate-200">
                  {activeDrawerBatch.currentCoords[0].toFixed(4)}° N
                </div>
                <div className="text-xs font-mono text-slate-200">
                  {activeDrawerBatch.currentCoords[1].toFixed(4)}° E
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Highway Speed</span>
                  <Gauge className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {activeDrawerBatch.currentStatus === 'In Transit' ? '62 km/h' : '0 km/h'}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Telemetry Live</div>
              </div>
            </div>

            {/* Thermal Breach Alert Box */}
            {activeDrawerBatch.thermalBreaches.length > 0 && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-700/70 text-red-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-red-300">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>On-Chain Thermal Breach Detected!</span>
                </div>
                {activeDrawerBatch.thermalBreaches.map((b, i) => (
                  <p key={i} className="text-xs text-red-300/90 leading-relaxed">
                    Spiked to <span className="font-bold underline">{b.recordedTemp}°C</span> near{' '}
                    <strong>{b.locationName}</strong> at {b.timestamp}. Smart contract penalty triggered.
                  </p>
                ))}
              </div>
            )}

            {/* Transit Route Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Route Waypoints &amp; Checkposts</span>
                <span className="text-slate-400 font-mono">
                  {activeDrawerBatch.routeWaypoints.filter((w) => w.reached).length} /{' '}
                  {activeDrawerBatch.routeWaypoints.length} Reached
                </span>
              </div>

              <div className="space-y-2 border-l-2 border-slate-700 ml-3 pl-3">
                {activeDrawerBatch.routeWaypoints.map((wp, idx) => (
                  <div key={idx} className="relative group">
                    <div
                      className={`absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full ${
                        wp.isBreachPoint
                          ? 'bg-red-500 ring-4 ring-red-900'
                          : wp.reached
                          ? 'bg-cyan-500 ring-2 ring-cyan-900'
                          : 'bg-slate-600'
                      }`}
                    />
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`font-medium ${
                          wp.isBreachPoint
                            ? 'text-red-400 font-semibold'
                            : wp.reached
                            ? 'text-slate-200'
                            : 'text-slate-500'
                        }`}
                      >
                        {wp.name}
                      </span>
                      {wp.reached && (
                        <span className="text-[10px] text-cyan-400 font-mono">
                          {wp.reachedAt || 'Passed'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Simulation Action Buttons */}
            <div className="pt-2 border-t border-slate-800 space-y-2.5">
              <div className="text-xs font-semibold text-slate-300">Interactive Simulation Actions:</div>

              <button
                onClick={() => {
                  triggerThermalBreachOnBatch(activeDrawerBatch.batchId, 11.8);
                }}
                className="w-full py-2.5 px-3 bg-red-900/40 hover:bg-red-900/70 text-red-200 border border-red-700/60 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Flame className="w-4 h-4 text-red-400" />
                Simulate Reefer Compressor Failure (+11.8°C Spike)
              </button>

              <div className="grid grid-cols-2 gap-2">
                {onNavigateToExplorer && (
                  <button
                    onClick={onNavigateToExplorer}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    Ledger Explorer
                  </button>
                )}
                {onNavigateToConsumer && (
                  <button
                    onClick={() => onNavigateToConsumer(activeDrawerBatch.batchId)}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                    Public QR View
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
