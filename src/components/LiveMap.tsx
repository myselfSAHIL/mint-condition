import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useBlockchain } from '../context/BlockchainContext';
import { FoodBatch } from '../blockchain/types';
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
  Search,
  Filter,
  CheckCircle2,
  Maximize2,
  RefreshCw,
  Clock,
  ArrowRight,
  Sun,
  Moon,
  Satellite,
} from 'lucide-react';

// Tile provider presets that are 100% reliable and fast
const MAP_THEMES = {
  dark: {
    name: 'Dark Slate',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &copy; HERE &copy; OpenStreetMap',
    maxZoom: 16,
  },
  light: {
    name: 'Clean Streets',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    maxZoom: 18,
  },
};

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
    appendIoTTelemetry,
  } = useBlockchain();

  const [activeTheme, setActiveTheme] = useState<'dark' | 'light' | 'satellite'>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_TRANSIT' | 'AT_STORE' | 'BREACH'>('ALL');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const selectedBatch = batches.find((b) => b.batchId === selectedBatchId) || batches[0];

  // 1. Initialize Map on Mount
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center of India: Lat 21.8°N, Lng 79.5°E
    const map = L.map(mapContainerRef.current, {
      center: [21.8, 79.5],
      zoom: 5,
      zoomControl: false,
      minZoom: 4,
      maxZoom: 18,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial Tile Layer
    const themeConfig = MAP_THEMES[activeTheme];
    const tileLayer = L.tileLayer(themeConfig.url, {
      attribution: themeConfig.attribution,
      maxZoom: themeConfig.maxZoom,
    }).addTo(map);

    const routesLayer = L.layerGroup().addTo(map);
    const markersLayer = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    tileLayerRef.current = tileLayer;
    routesLayerRef.current = routesLayer;
    markersLayerRef.current = markersLayer;

    // Critical: Invalidate size after layout pass so map NEVER renders gray/blank
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Handle Tile Theme Switcher (Dark, Light, Satellite)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const themeConfig = MAP_THEMES[activeTheme];
    const newTileLayer = L.tileLayer(themeConfig.url, {
      attribution: themeConfig.attribution,
      maxZoom: themeConfig.maxZoom,
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
  }, [activeTheme]);

  // 3. Render Routes, Waypoints, and Moving Trucks on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const routesLayer = routesLayerRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !routesLayer || !markersLayer) return;

    routesLayer.clearLayers();
    markersLayer.clearLayers();

    batches.forEach((batch) => {
      const isSelected = batch.batchId === selectedBatchId;
      const hasBreach = batch.thermalBreaches.length > 0;

      // Planned Route Polyline
      const plannedPoints = batch.routeWaypoints.map((w) => w.coords);
      if (plannedPoints.length > 1) {
        L.polyline(plannedPoints, {
          color: isSelected ? '#0284c7' : '#64748b',
          weight: isSelected ? 4 : 2,
          opacity: isSelected ? 0.8 : 0.35,
          dashArray: isSelected ? '6, 6' : '4, 8',
        }).addTo(routesLayer);
      }

      // Historical Traversed Trajectory
      if (batch.historyPoints && batch.historyPoints.length > 1) {
        L.polyline(batch.historyPoints, {
          color: hasBreach ? '#ef4444' : isSelected ? '#10b981' : '#0ea5e9',
          weight: isSelected ? 5 : 3.5,
          opacity: isSelected ? 0.95 : 0.6,
        }).addTo(routesLayer);
      }

      // Waypoint Pins
      batch.routeWaypoints.forEach((wp, idx) => {
        const isOrigin = idx === 0;
        const isDestination = idx === batch.routeWaypoints.length - 1;

        if (isOrigin || isDestination || isSelected || wp.isBreachPoint) {
          let html = '';
          if (isOrigin) {
            html = `<div class="flex items-center justify-center w-7 h-7 bg-emerald-600 text-white rounded-full shadow-lg border-2 border-white text-xs font-bold">🌱</div>`;
          } else if (isDestination) {
            html = `<div class="flex items-center justify-center w-7 h-7 bg-purple-600 text-white rounded-full shadow-lg border-2 border-white text-xs font-bold">🏬</div>`;
          } else if (wp.isBreachPoint) {
            html = `<div class="flex items-center justify-center w-7 h-7 bg-rose-600 text-white rounded-full shadow-lg border-2 border-white text-xs font-bold animate-bounce">⚠️</div>`;
          } else {
            html = `<div class="w-3.5 h-3.5 ${
              wp.reached ? 'bg-emerald-500' : 'bg-slate-400'
            } rounded-full border-2 border-white shadow"></div>`;
          }

          const marker = L.marker(wp.coords, {
            icon: L.divIcon({
              html,
              className: 'custom-pin',
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            }),
          }).addTo(markersLayer);

          marker.bindTooltip(
            `<strong>${wp.name}</strong><br/>${
              wp.reached ? `Passed (${wp.reachedAt || 'Yes'})` : 'Scheduled Checkpost'
            }`,
            { direction: 'top', offset: [0, -10] }
          );
        }
      });

      // Thermal Breach Geofencing Alert Ring
      batch.thermalBreaches.forEach((breach) => {
        L.circle(breach.coords, {
          color: '#ef4444',
          fillColor: '#fee2e2',
          fillOpacity: 0.45,
          radius: 35000,
          weight: 2,
        }).addTo(routesLayer);
      });

      // Real-time Moving Truck Marker
      if (batch.currentCoords) {
        const truckPulseClass = hasBreach ? 'bg-rose-500 ring-rose-400' : 'bg-emerald-500 ring-emerald-300';
        const isCurrentSelected = batch.batchId === selectedBatchId;

        const truckHtml = `
          <div class="relative group cursor-pointer transition-transform hover:scale-110">
            <div class="absolute -inset-1.5 rounded-full ${truckPulseClass} opacity-60 animate-ping"></div>
            <div class="relative flex items-center justify-center w-9 h-9 ${
              hasBreach ? 'bg-rose-600' : isCurrentSelected ? 'bg-emerald-600' : 'bg-slate-900'
            } text-white rounded-full shadow-xl border-2 ${
          isCurrentSelected ? 'border-yellow-400 ring-4 ring-yellow-300/40' : 'border-white'
        }">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
                <path d="M15 18H9"/>
                <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
                <circle cx="17" cy="18" r="2"/>
                <circle cx="7" cy="18" r="2"/>
              </svg>
            </div>
            <div class="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/95 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md border border-slate-700 pointer-events-none">
              ${batch.itemName.split(' ')[0]} • ${batch.currentTemp}°C
            </div>
          </div>
        `;

        const truckMarker = L.marker(batch.currentCoords, {
          icon: L.divIcon({
            html: truckHtml,
            className: 'custom-truck',
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          }),
        }).addTo(markersLayer);

        truckMarker.on('click', () => {
          setSelectedBatchId(batch.batchId);
        });
      }
    });
  }, [batches, selectedBatchId, setSelectedBatchId]);

  // Smooth fly to selected batch coordinates
  const selectAndFocusBatch = (batch: FoodBatch) => {
    setSelectedBatchId(batch.batchId);
    if (mapInstanceRef.current && batch.currentCoords) {
      mapInstanceRef.current.flyTo(batch.currentCoords, 7, { duration: 1.2 });
    }
  };

  const handleFitIndiaView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([21.8, 79.5], 5, { duration: 1.0 });
    }
  };

  // Filter Shipments in Sidebar
  const filteredBatches = batches.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      b.itemName.toLowerCase().includes(q) ||
      b.batchId.toLowerCase().includes(q) ||
      b.originLocation.toLowerCase().includes(q) ||
      b.destinationLocation.toLowerCase().includes(q) ||
      b.truckId.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (statusFilter === 'IN_TRANSIT') return b.currentStatus === 'In Transit';
    if (statusFilter === 'AT_STORE') return b.currentStatus === 'At Store';
    if (statusFilter === 'BREACH') return b.thermalBreaches.length > 0;
    return true;
  });

  return (
    <div className="relative w-full h-[calc(100vh-4.5rem)] flex overflow-hidden bg-slate-950 font-sans">
      {/* ======================================================== */}
      {/* 1. LEFT SIDEBAR: ACTIVE SHIPMENTS & COLD CHAIN FLEET     */}
      {/* ======================================================== */}
      <div
        className={`relative z-20 w-full sm:w-[400px] h-full bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl transition-all duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0 sm:w-[70px]'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Truck className="w-5 h-5" />
            </div>
            {isSidebarOpen && (
              <div>
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  <span>Cold-Chain Shipments</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </h2>
                <p className="text-[11px] text-slate-400 font-mono">
                  {batches.filter((b) => b.currentStatus === 'In Transit').length} Active on Indian Highways
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition sm:hidden"
            title="Toggle Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSidebarOpen ? (
          <>
            {/* Search Input */}
            <div className="p-3 border-b border-slate-800/80 bg-slate-900/50">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search item, route, or batch ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800/90 text-xs text-slate-200 placeholder-slate-500 rounded-xl pl-9 pr-3 py-2 border border-slate-700/80 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto text-[11px]">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition ${
                    statusFilter === 'ALL'
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  All ({batches.length})
                </button>
                <button
                  onClick={() => setStatusFilter('IN_TRANSIT')}
                  className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition ${
                    statusFilter === 'IN_TRANSIT'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  In Transit ({batches.filter((b) => b.currentStatus === 'In Transit').length})
                </button>
                <button
                  onClick={() => setStatusFilter('BREACH')}
                  className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition ${
                    statusFilter === 'BREACH'
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  Alerts ({batches.filter((b) => b.thermalBreaches.length > 0).length})
                </button>
              </div>
            </div>

            {/* Shipments Cards List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {filteredBatches.map((batch) => {
                const isSelected = batch.batchId === selectedBatchId;
                const hasBreach = batch.thermalBreaches.length > 0;
                const isTempOutOfBounds =
                  batch.currentTemp > batch.maxSafeTemp || batch.currentTemp < batch.minSafeTemp;
                const reachedCount = batch.routeWaypoints.filter((w) => w.reached).length;
                const totalWaypoints = batch.routeWaypoints.length;
                const progressPct = Math.round((reachedCount / totalWaypoints) * 100);

                return (
                  <div
                    key={batch.batchId}
                    onClick={() => selectAndFocusBatch(batch)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500 shadow-lg ring-1 ring-emerald-500/50'
                        : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                    }`}
                  >
                    {/* Top row: Item Name + Status Pill */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-100 text-xs">{batch.itemName}</h3>
                        <span className="text-[10px] font-mono text-slate-400">{batch.batchId}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          hasBreach
                            ? 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                            : batch.currentStatus === 'In Transit'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                            : 'bg-purple-950/80 text-purple-300 border-purple-700/60'
                        }`}
                      >
                        {hasBreach ? '⚠️ Thermal Breach' : batch.currentStatus}
                      </span>
                    </div>

                    {/* Route summary */}
                    <div className="mt-2 text-[11px] text-slate-300 flex items-center gap-1.5">
                      <span className="truncate font-medium">{batch.originLocation.split(',')[0]}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate font-medium">{batch.destinationLocation.split(',')[0]}</span>
                    </div>

                    {/* Temperature & Progress Badges */}
                    <div className="mt-2.5 flex items-center justify-between border-t border-slate-700/50 pt-2 text-[11px]">
                      {/* Temperature */}
                      <div className="flex items-center gap-1.5">
                        <Thermometer
                          className={`w-3.5 h-3.5 ${
                            isTempOutOfBounds ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        />
                        <span
                          className={`font-mono font-bold ${
                            isTempOutOfBounds ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {batch.currentTemp}°C
                        </span>
                        <span className="text-[10px] text-slate-500">
                          ({batch.minSafeTemp}° - {batch.maxSafeTemp}°)
                        </span>
                      </div>

                      {/* Milestone Progress */}
                      <div className="text-[10px] text-slate-400 font-mono">
                        {reachedCount}/{totalWaypoints} checkpoints ({progressPct}%)
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-700/60 h-1 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          hasBreach ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Collapsed Sidebar Icons */
          <div className="p-2 space-y-3 flex flex-col items-center">
            {batches.map((b) => (
              <button
                key={b.batchId}
                onClick={() => selectAndFocusBatch(b)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs transition ${
                  b.batchId === selectedBatchId
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title={b.itemName}
              >
                {b.itemName.slice(0, 2).toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. MAIN MAP CANVAS: HIGH-DEFINITION LEAFLET INDIA MAP    */}
      {/* ======================================================== */}
      <div className="relative flex-1 h-full overflow-hidden">
        {/* Top Floating Control Bar */}
        <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          {/* Active Consignment Route Banner */}
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700 shadow-xl flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-200">
                {selectedBatch ? selectedBatch.itemName : 'Select Consignment'}
              </span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="text-[11px] text-slate-300 flex items-center gap-1 font-mono">
              <span>{selectedBatch?.originLocation.split(',')[0]}</span>
              <ArrowRight className="w-3 h-3 text-emerald-400" />
              <span>{selectedBatch?.destinationLocation.split(',')[0]}</span>
            </div>
          </div>

          {/* Right Controls: Theme Switcher & Simulation */}
          <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700 shadow-xl">
            {/* Tile Themes */}
            <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-xl text-xs">
              <button
                onClick={() => setActiveTheme('dark')}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                  activeTheme === 'dark'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Dark Night Mode"
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Dark</span>
              </button>
              <button
                onClick={() => setActiveTheme('light')}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                  activeTheme === 'light'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Clear Streets & Cities"
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Streets</span>
              </button>
              <button
                onClick={() => setActiveTheme('satellite')}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                  activeTheme === 'satellite'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Satellite Imagery"
              >
                <Satellite className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Satellite</span>
              </button>
            </div>

            {/* Simulation Play/Pause */}
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                isSimulating
                  ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50 hover:bg-amber-600/40'
                  : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-600/40'
              }`}
            >
              {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isSimulating ? 'Pause GPS' : 'Resume GPS'}</span>
            </button>

            {/* Fit India Button */}
            <button
              onClick={handleFitIndiaView}
              className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Reset India View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div ref={mapContainerRef} className="w-full h-full z-0 bg-slate-950" />

        {/* ======================================================== */}
        {/* 3. BOTTOM FLOATING TELEMETRY & ACTIONS COCKPIT           */}
        {/* ======================================================== */}
        {selectedBatch && (
          <div className="absolute bottom-5 left-4 right-4 sm:left-6 sm:right-auto sm:w-[500px] z-10 bg-slate-900/95 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-slate-700/80 shadow-2xl space-y-3.5 text-xs">
            {/* Header row */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-xs sm:text-sm">
                    {selectedBatch.itemName}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    Vehicle: {selectedBatch.truckId} • {selectedBatch.category}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                  selectedBatch.thermalBreaches.length > 0
                    ? 'bg-rose-950/80 text-rose-300 border-rose-600'
                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-600'
                }`}
              >
                {selectedBatch.thermalBreaches.length > 0
                  ? '⚠️ Alert: Temp Breached'
                  : '✓ Cold-Chain Verified'}
              </span>
            </div>

            {/* Gauges Grid */}
            <div className="grid grid-cols-4 gap-2 text-center font-mono">
              <div
                className={`p-2.5 rounded-xl border ${
                  selectedBatch.currentTemp > selectedBatch.maxSafeTemp ||
                  selectedBatch.currentTemp < selectedBatch.minSafeTemp
                    ? 'bg-rose-950/60 border-rose-600 text-rose-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-200'
                }`}
              >
                <div className="text-[10px] text-slate-400 font-sans">Temp</div>
                <div className="text-base font-bold">{selectedBatch.currentTemp}°C</div>
                <div className="text-[9px] text-slate-400 font-sans">
                  Limit: {selectedBatch.maxSafeTemp}°
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-200">
                <div className="text-[10px] text-slate-400 font-sans">Humidity</div>
                <div className="text-base font-bold text-cyan-400">
                  {selectedBatch.currentHumidity}%
                </div>
                <div className="text-[9px] text-slate-400 font-sans">RH Optimal</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-200">
                <div className="text-[10px] text-slate-400 font-sans">Speed</div>
                <div className="text-base font-bold text-emerald-400">
                  {selectedBatch.currentStatus === 'In Transit' ? '62 km/h' : '0 km/h'}
                </div>
                <div className="text-[9px] text-slate-400 font-sans">GPS Telem.</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-200">
                <div className="text-[10px] text-slate-400 font-sans">Progress</div>
                <div className="text-base font-bold text-blue-400">
                  {selectedBatch.routeWaypoints.filter((w) => w.reached).length}/
                  {selectedBatch.routeWaypoints.length}
                </div>
                <div className="text-[9px] text-slate-400 font-sans">Checkposts</div>
              </div>
            </div>

            {/* Breach message if any */}
            {selectedBatch.thermalBreaches.length > 0 && (
              <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-700 text-rose-200 text-[11px] leading-relaxed">
                <strong>⚠️ Smart Contract Violation:</strong> Temperature spiked to{' '}
                {selectedBatch.thermalBreaches[0].recordedTemp}°C (Safe limit:{' '}
                {selectedBatch.maxSafeTemp}°C). Automated SLA penalty applied to freight contract on ledger.
              </div>
            )}

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
              {/* Trigger Temperature Spike Button */}
              <button
                onClick={() => triggerThermalBreachOnBatch(selectedBatch.batchId, 11.5)}
                className="flex-1 py-2 px-3 bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 border border-rose-800/80 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                title="Test how cold-chain smart contracts react to a compressor failure"
              >
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                Simulate +11.5°C Breach
              </button>

              {/* Reset to Normal Temp */}
              {selectedBatch.thermalBreaches.length > 0 && (
                <button
                  onClick={() =>
                    appendIoTTelemetry(selectedBatch.batchId, {
                      locationName: 'Cold Unit Repaired & Recalibrated',
                      coords: selectedBatch.currentCoords,
                      temperature: 3.5,
                      humidity: 78,
                      speedKmH: 58,
                      notes: 'Chiller compressor restored. Temperature normalized to 3.5°C.',
                    })
                  }
                  className="py-2 px-3 bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-800/80 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Restore 3.5°C
                </button>
              )}

              {/* View on Blockchain Explorer */}
              {onNavigateToExplorer && (
                <button
                  onClick={onNavigateToExplorer}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  Ledger
                </button>
              )}

              {/* View Consumer QR Certificate */}
              {onNavigateToConsumer && (
                <button
                  onClick={() => onNavigateToConsumer(selectedBatch.batchId)}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  QR View
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
