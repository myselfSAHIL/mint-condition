import React, { useState, useEffect, useRef } from 'react';
import { FoodBatch } from '../blockchain/types';
import {
  Truck,
  Flame,
  Radio,
  Wifi,
  Navigation,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  Thermometer,
  Droplets,
  Gauge,
  ChevronLeft,
  ChevronRight,
  Crosshair,
} from 'lucide-react';

interface IndiaTacticalMapProps {
  batches: FoodBatch[];
  selectedBatchId: string | null;
  onSelectBatch: (batchId: string) => void;
  onOpenDrawer: (batch: FoodBatch) => void;
}

// Convert Lat, Lng to SVG Coordinate Space (width 1000, height 1200)
// India mainland spans approx: Lat 7.5°N - 36.5°N, Lng 68.0°E - 97.5°E
export const projectToSvg = (lat: number, lng: number): [number, number] => {
  const minLng = 67.5;
  const maxLng = 98.0;
  const minLat = 6.5;
  const maxLat = 37.2;

  const width = 1000;
  const height = 1200;

  const x = 50 + ((lng - minLng) / (maxLng - minLng)) * (width - 100);
  const y = 60 + ((maxLat - lat) / (maxLat - minLat)) * (height - 120);

  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
};

// Strategic Indian Logistics Hubs matching the user reference image
export const INDIAN_HUBS: Array<{
  id: string;
  name: string;
  state: string;
  coords: [number, number];
  role: 'major_hub' | 'transit_gate' | 'origin' | 'port';
}> = [
  { id: 'SHM', name: 'Shimla / Kinnaur', state: 'HIMACHAL', coords: [31.5385, 78.2562], role: 'origin' },
  { id: 'CHD', name: 'Chandigarh', state: 'PUNJAB', coords: [30.7333, 76.7794], role: 'transit_gate' },
  { id: 'DEL', name: 'New Delhi (Azadpur)', state: 'DELHI', coords: [28.6139, 77.2090], role: 'major_hub' },
  { id: 'JAI', name: 'Jaipur', state: 'RAJASTHAN', coords: [26.9124, 75.7873], role: 'transit_gate' },
  { id: 'AND', name: 'Anand Dairy Hub', state: 'GUJARAT', coords: [22.5645, 72.9289], role: 'origin' },
  { id: 'AMD', name: 'Ahmedabad', state: 'GUJARAT', coords: [23.0225, 72.5714], role: 'major_hub' },
  { id: 'SRT', name: 'Surat', state: 'GUJARAT', coords: [21.1702, 72.8311], role: 'transit_gate' },
  { id: 'NSK', name: 'Nashik', state: 'MAHARASHTRA', coords: [19.9975, 73.7898], role: 'transit_gate' },
  { id: 'BOM', name: 'Mumbai (APMC Vashi)', state: 'MAHARASHTRA', coords: [19.0760, 72.8777], role: 'major_hub' },
  { id: 'PUN', name: 'Pune', state: 'MAHARASHTRA', coords: [18.5204, 73.8567], role: 'major_hub' },
  { id: 'GOA', name: 'Panaji / Margao', state: 'GOA', coords: [15.2993, 74.1240], role: 'port' },
  { id: 'SLP', name: 'Solapur', state: 'MAHARASHTRA', coords: [17.6599, 75.9064], role: 'transit_gate' },
  { id: 'HYD', name: 'Hyderabad', state: 'TELANGANA', coords: [17.3850, 78.4867], role: 'major_hub' },
  { id: 'BLR', name: 'Bengaluru', state: 'KARNATAKA', coords: [12.9716, 77.5946], role: 'major_hub' },
  { id: 'MAA', name: 'Chennai Port', state: 'TAMIL NADU', coords: [13.0827, 80.2707], role: 'port' },
  { id: 'COI', name: 'Coimbatore', state: 'TAMIL NADU', coords: [11.0168, 76.9558], role: 'transit_gate' },
  { id: 'KOC', name: 'Cochin Harbour', state: 'KERALA', coords: [9.9312, 76.2673], role: 'port' },
  { id: 'NGP', name: 'Nagpur', state: 'MAHARASHTRA', coords: [21.1458, 79.0882], role: 'major_hub' },
  { id: 'RPR', name: 'Raipur', state: 'CHHATTISGARH', coords: [21.2514, 81.6296], role: 'transit_gate' },
  { id: 'SBP', name: 'Sambalpur', state: 'ODISHA', coords: [21.4669, 83.9812], role: 'transit_gate' },
  { id: 'BBI', name: 'Bhubaneswar', state: 'ODISHA', coords: [20.2961, 85.8245], role: 'transit_gate' },
  { id: 'CCU', name: 'Kolkata (New Town)', state: 'WEST BENGAL', coords: [22.5726, 88.3639], role: 'major_hub' },
  { id: 'PAT', name: 'Patna', state: 'BIHAR', coords: [25.5941, 85.1376], role: 'transit_gate' },
  { id: 'LKO', name: 'Lucknow', state: 'UTTAR PRADESH', coords: [26.8467, 80.9462], role: 'major_hub' },
  { id: 'SKM', name: 'Ravangla / Temi', state: 'SIKKIM', coords: [27.2415, 88.5298], role: 'origin' },
  { id: 'IXB', name: 'Siliguri Hub', state: 'WEST BENGAL', coords: [26.7271, 88.3953], role: 'transit_gate' },
];

// Major Indian state paths in SVG coordinate space
// These represent the authentic visual silhouettes matching the reference HUD image
const INDIA_COASTLINE_SVG_PATH = `
  M 324,120
  L 365,115 L 420,135 L 460,195 L 440,245 L 415,270 L 435,285
  L 480,270 L 525,275 L 565,315 L 610,345 L 675,340 L 730,345
  L 790,340 L 850,335 L 900,345 L 910,380 L 890,410 L 845,430
  L 820,445 L 780,450 L 755,475 L 720,490 L 685,490 L 670,535
  L 685,570 L 670,590 L 635,620 L 595,650 L 555,710 L 520,740
  L 485,785 L 450,835 L 435,895 L 425,950 L 415,990 L 390,1035
  L 360,1070 L 340,1050 L 325,1015 L 315,970 L 295,925 L 275,870
  L 255,820 L 235,765 L 220,695 L 205,655 L 180,640 L 160,635
  L 140,630 L 120,610 L 105,585 L 115,565 L 140,555 L 175,555
  L 190,540 L 185,520 L 155,510 L 110,515 L 80,530 L 70,495
  L 95,465 L 115,445 L 145,420 L 180,390 L 210,355 L 235,320
  L 250,285 L 265,255 L 260,220 L 275,190 L 295,160 Z
`;

// Regional state divider lines for tactical HUD
const STATE_BOUNDARIES: Array<{ id: string; name: string; path: string; labelPos: [number, number] }> = [
  {
    id: 'MAH',
    name: 'MAHARASHTRA',
    path: 'M 180,640 L 245,630 L 330,640 L 410,650 L 470,645 L 490,690 L 450,730 L 380,750 L 310,750 L 255,820',
    labelPos: [320, 685],
  },
  {
    id: 'GOA',
    name: 'GOA [ACTIVE]',
    path: 'M 252,805 L 270,808 L 272,830 L 254,828 Z',
    labelPos: [282, 822],
  },
  {
    id: 'KAR',
    name: 'KARNATAKA',
    path: 'M 255,820 L 310,750 L 380,750 L 390,810 L 380,880 L 360,930 L 330,950 L 295,925',
    labelPos: [330, 850],
  },
  {
    id: 'GUJ',
    name: 'GUJARAT',
    path: 'M 180,640 L 215,615 L 220,555 L 185,520 L 155,510',
    labelPos: [150, 560],
  },
  {
    id: 'RAJ',
    name: 'RAJASTHAN',
    path: 'M 185,520 L 235,460 L 285,440 L 320,410 L 310,480 L 260,515 L 220,555',
    labelPos: [230, 465],
  },
  {
    id: 'MP',
    name: 'MADHYA PRADESH',
    path: 'M 260,515 L 310,480 L 400,470 L 470,510 L 490,580 L 470,645 L 410,650 L 330,640 L 245,630 L 220,555',
    labelPos: [360, 555],
  },
  {
    id: 'TN',
    name: 'TAMIL NADU',
    path: 'M 360,930 L 380,880 L 435,895 L 415,990 L 360,1070 L 340,1050 L 350,990',
    labelPos: [390, 960],
  },
  {
    id: 'KER',
    name: 'KERALA',
    path: 'M 295,925 L 330,950 L 350,990 L 340,1050 L 315,970',
    labelPos: [305, 1000],
  },
  {
    id: 'AP_TS',
    name: 'ANDHRA & TELANGANA',
    path: 'M 380,750 L 450,730 L 520,740 L 485,785 L 450,835 L 435,895 L 380,880 L 390,810',
    labelPos: [435, 785],
  },
  {
    id: 'ODI',
    name: 'ODISHA',
    path: 'M 490,690 L 520,740 L 555,710 L 595,650 L 565,610 L 500,630',
    labelPos: [545, 660],
  },
  {
    id: 'WB',
    name: 'WEST BENGAL',
    path: 'M 595,650 L 635,620 L 670,590 L 685,570 L 670,535 L 630,540 L 590,590',
    labelPos: [640, 580],
  },
  {
    id: 'UP_BIH',
    name: 'UTTAR PRADESH & BIHAR',
    path: 'M 310,480 L 400,470 L 470,510 L 540,490 L 620,495 L 630,540 L 500,630 L 470,510',
    labelPos: [450, 480],
  },
  {
    id: 'DEL_PUN',
    name: 'DELHI & PUNJAB',
    path: 'M 260,255 L 310,270 L 320,410 L 285,440 L 235,320',
    labelPos: [275, 330],
  },
  {
    id: 'HIM_JK',
    name: 'HIMACHAL & KASHMIR',
    path: 'M 275,190 L 324,120 L 365,115 L 420,135 L 415,270 L 310,270 L 260,255',
    labelPos: [330, 200],
  },
  {
    id: 'NE',
    name: 'NORTH EAST (ASSAM/SIKKIM)',
    path: 'M 675,340 L 730,345 L 790,340 L 850,335 L 900,345 L 890,410 L 780,450 L 720,490 L 670,535 L 675,340',
    labelPos: [780, 410],
  },
  {
    id: 'SRI',
    name: 'SRI LANKA (SLLANYA)',
    path: 'M 435,1080 C 455,1065 470,1090 465,1115 C 460,1135 440,1140 430,1125 C 420,1110 425,1090 435,1080 Z',
    labelPos: [445, 1115],
  },
];

// Major Indian National Highway Interconnect Grid Lines
const INTERSTATE_HIGHWAYS: Array<[[number, number], [number, number]]> = [
  // Golden Quadrilateral & Freight Corridors
  [projectToSvg(31.5385, 78.2562), projectToSvg(30.7333, 76.7794)], // Shimla -> Chandigarh
  [projectToSvg(30.7333, 76.7794), projectToSvg(28.6139, 77.2090)], // Chandigarh -> Delhi
  [projectToSvg(28.6139, 77.2090), projectToSvg(26.9124, 75.7873)], // Delhi -> Jaipur
  [projectToSvg(26.9124, 75.7873), projectToSvg(23.0225, 72.5714)], // Jaipur -> Ahmedabad
  [projectToSvg(23.0225, 72.5714), projectToSvg(22.5645, 72.9289)], // Ahmedabad -> Anand
  [projectToSvg(22.5645, 72.9289), projectToSvg(21.1702, 72.8311)], // Anand -> Surat
  [projectToSvg(21.1702, 72.8311), projectToSvg(19.9975, 73.7898)], // Surat -> Nashik
  [projectToSvg(19.9975, 73.7898), projectToSvg(19.0760, 72.8777)], // Nashik -> Mumbai
  [projectToSvg(19.0760, 72.8777), projectToSvg(18.5204, 73.8567)], // Mumbai -> Pune
  [projectToSvg(18.5204, 73.8567), projectToSvg(15.2993, 74.1240)], // Pune -> Goa
  [projectToSvg(15.2993, 74.1240), projectToSvg(12.9716, 77.5946)], // Goa -> Bengaluru
  [projectToSvg(18.5204, 73.8567), projectToSvg(17.6599, 75.9064)], // Pune -> Solapur
  [projectToSvg(17.6599, 75.9064), projectToSvg(17.3850, 78.4867)], // Solapur -> Hyderabad
  [projectToSvg(17.3850, 78.4867), projectToSvg(12.9716, 77.5946)], // Hyderabad -> Bengaluru
  [projectToSvg(12.9716, 77.5946), projectToSvg(13.0827, 80.2707)], // Bengaluru -> Chennai
  [projectToSvg(12.9716, 77.5946), projectToSvg(11.0168, 76.9558)], // Bengaluru -> Coimbatore
  [projectToSvg(11.0168, 76.9558), projectToSvg(9.9312, 76.2673)],  // Coimbatore -> Cochin
  [projectToSvg(28.6139, 77.2090), projectToSvg(26.8467, 80.9462)], // Delhi -> Lucknow
  [projectToSvg(26.8467, 80.9462), projectToSvg(25.5941, 85.1376)], // Lucknow -> Patna
  [projectToSvg(25.5941, 85.1376), projectToSvg(26.7271, 88.3953)], // Patna -> Siliguri
  [projectToSvg(26.7271, 88.3953), projectToSvg(27.2415, 88.5298)], // Siliguri -> Sikkim
  [projectToSvg(26.7271, 88.3953), projectToSvg(22.5726, 88.3639)], // Siliguri -> Kolkata
  [projectToSvg(21.1458, 79.0882), projectToSvg(21.2514, 81.6296)], // Nagpur -> Raipur
  [projectToSvg(21.2514, 81.6296), projectToSvg(21.4669, 83.9812)], // Raipur -> Sambalpur
  [projectToSvg(21.4669, 83.9812), projectToSvg(20.2961, 85.8245)], // Sambalpur -> Bhubaneswar
  [projectToSvg(20.2961, 85.8245), projectToSvg(22.5726, 88.3639)], // Bhubaneswar -> Kolkata
  [projectToSvg(28.6139, 77.2090), projectToSvg(21.1458, 79.0882)], // Delhi -> Nagpur (North-South spine)
  [projectToSvg(21.1458, 79.0882), projectToSvg(17.3850, 78.4867)], // Nagpur -> Hyderabad
];

export const IndiaTacticalMap: React.FC<IndiaTacticalMapProps> = ({
  batches,
  selectedBatchId,
  onSelectBatch,
  onOpenDrawer,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredHub, setHoveredHub] = useState<string | null>(null);
  const [activeRegion, setActiveRegion] = useState<string>('GOA');
  const [currentTime, setCurrentTime] = useState<string>('');

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Live UTC Clock for HUD Header
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toUTCString().slice(17, 25) + ' UTC | DATE: ' + now.toLocaleDateString('en-GB')
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const selectedBatch = batches.find((b) => b.batchId === selectedBatchId) || batches[0];

  // Pan and drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div
      className="relative w-full h-[calc(100vh-4.5rem)] bg-[#020b18] overflow-hidden select-none font-mono"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* HUD Scanlines and Background Grid Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 229, 255, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 229, 255, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* TOP HUD TELEMETRY HEADER BAR (From Reference Image) */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-[#031326]/85 backdrop-blur-md px-5 py-3 rounded-2xl border border-cyan-500/30 text-cyan-400 text-xs shadow-2xl shadow-cyan-950/50">
        <div className="space-y-0.5">
          <div className="text-[10px] tracking-widest text-cyan-500/80 font-bold uppercase">
            SYS: MAP // IN_REGION01 | LOC: INDIA | PROTOCOL: MINTCONDITION
          </div>
          <div className="text-sm md:text-base font-extrabold text-cyan-300 tracking-wider flex items-center gap-2">
            <span>VIEWPORT:</span>
            <span className="text-white bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-500/50 font-black">
              {selectedBatch ? selectedBatch.itemName.toUpperCase().split(' ')[0] : 'ALL CORRIDORS'}{' '}
              [ACTIVE]
            </span>
          </div>
        </div>

        {/* Top Right System Status */}
        <div className="flex items-center gap-4 text-right">
          <div>
            <div className="text-[11px] font-bold text-cyan-200">{currentTime}</div>
            <div className="text-[10px] text-emerald-400 flex items-center justify-end gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              SYSTEM STATUS: OPERATIONAL
            </div>
          </div>
          <div className="p-2 bg-cyan-950/60 rounded-xl border border-cyan-500/40 text-cyan-300">
            <Wifi className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* INTERACTIVE VECTOR SVG CANVAS */}
      <div className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing">
        <svg
          ref={svgRef}
          viewBox="0 0 1000 1200"
          className="w-full h-full max-h-[95vh] transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel / 100})`,
            transformOrigin: 'center center',
          }}
        >
          <defs>
            {/* Neon Cyan Glow Filter */}
            <filter id="neon-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Neon Pink/Magenta Active Filter (Matching Reference Image) */}
            <filter id="pink-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Red Alert Breach Filter */}
            <filter id="alert-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Tactical Crosshairs & Lat/Lng Grid Markers */}
          <g className="text-[10px] fill-cyan-700/50 stroke-cyan-800/30 font-mono">
            {/* Latitude Grid Lines */}
            <line x1="50" y1="200" x2="950" y2="200" strokeDasharray="4 6" />
            <text x="60" y="195">32° N [HIMALAYAN]</text>

            <line x1="50" y1="460" x2="950" y2="460" strokeDasharray="4 6" />
            <text x="60" y="455">24° N [TROPIC OF CANCER]</text>

            <line x1="50" y1="740" x2="950" y2="740" strokeDasharray="4 6" />
            <text x="60" y="735">16° N [DECCAN SECTOR]</text>

            <line x1="50" y1="1020" x2="950" y2="1020" strokeDasharray="4 6" />
            <text x="60" y="1015">08° N [INDIAN OCEAN]</text>

            {/* Longitude Grid Lines */}
            <line x1="200" y1="60" x2="200" y2="1140" strokeDasharray="4 6" />
            <text x="205" y="1130">72° E</text>

            <line x1="450" y1="60" x2="450" y2="1140" strokeDasharray="4 6" />
            <text x="455" y="1130">80° E [CENTRAL MERIDIAN]</text>

            <line x1="700" y1="60" x2="700" y2="1140" strokeDasharray="4 6" />
            <text x="705" y="1130">88° E</text>
          </g>

          {/* 1. INDIA MAINLAND OUTER COASTLINE & BOUNDARY */}
          <path
            d={INDIA_COASTLINE_SVG_PATH}
            fill="rgba(4, 25, 48, 0.45)"
            stroke="#00e5ff"
            strokeWidth="2.2"
            strokeLinejoin="round"
            filter="url(#neon-glow)"
          />

          {/* 2. STATE BOUNDARIES WITH SUBTLE GLOWING LINES */}
          {STATE_BOUNDARIES.map((st) => {
            const isGoa = st.id === 'GOA';
            const isHighlighted = isGoa || (selectedBatch && selectedBatch.itemName.includes(st.name.split(' ')[0]));

            return (
              <g key={st.id} className="cursor-pointer group">
                <path
                  d={st.path}
                  fill={isGoa ? 'rgba(255, 0, 128, 0.15)' : 'none'}
                  stroke={isGoa ? '#ff007f' : isHighlighted ? '#38bdf8' : 'rgba(0, 229, 255, 0.35)'}
                  strokeWidth={isGoa ? '3.5' : '1.4'}
                  strokeDasharray={isGoa ? 'none' : '4 3'}
                  filter={isGoa ? 'url(#pink-glow)' : 'none'}
                />

                {/* State Label */}
                <text
                  x={st.labelPos[0]}
                  y={st.labelPos[1]}
                  textAnchor="middle"
                  className={`text-[9px] font-bold tracking-widest ${
                    isGoa
                      ? 'fill-pink-400 font-extrabold text-[12px]'
                      : 'fill-cyan-500/60 group-hover:fill-cyan-300'
                  }`}
                >
                  {st.name}
                </text>
              </g>
            );
          })}

          {/* 3. GOA ACTIVE CALLOUT BOX (Exact reference image recreation!) */}
          <g className="cursor-pointer" onClick={() => setActiveRegion('GOA')}>
            {/* Highlighted Goa Box with Callout Lines */}
            <line x1="272" y1="815" x2="330" y2="815" stroke="#ff007f" strokeWidth="1.8" filter="url(#pink-glow)" />
            <circle cx="272" cy="815" r="3" fill="#ff007f" />

            <rect
              x="330"
              y="798"
              width="135"
              height="36"
              rx="4"
              fill="rgba(20, 2, 14, 0.9)"
              stroke="#ff007f"
              strokeWidth="1.6"
              filter="url(#pink-glow)"
            />
            <text x="340" y="814" className="fill-pink-300 font-black text-[11px] tracking-wider">
              GOA [ACTIVE]
            </text>
            <text x="340" y="827" className="fill-pink-400/80 font-mono text-[9px]">
              Panaji • Margao
            </text>
          </g>

          {/* 4. INTERSTATE HIGHWAY ARTERIES */}
          {INTERSTATE_HIGHWAYS.map(([from, to], i) => (
            <line
              key={i}
              x1={from[0]}
              y1={from[1]}
              x2={to[0]}
              y2={to[1]}
              stroke="rgba(0, 229, 255, 0.3)"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />
          ))}

          {/* 5. ACTIVE BATCH CONSIGNMENT PATHS (Vibrant Electric Cyan & Traversal Polylines) */}
          {batches.map((b) => {
            const isSelected = b.batchId === selectedBatchId;
            const hasBreach = b.thermalBreaches.length > 0;
            const svgPoints = b.routeWaypoints.map((wp) => projectToSvg(wp.coords[0], wp.coords[1]));
            const pointsString = svgPoints.map((p) => `${p[0]},${p[1]}`).join(' ');

            return (
              <g key={b.batchId}>
                {/* Full Planned Route */}
                <polyline
                  points={pointsString}
                  fill="none"
                  stroke={isSelected ? '#00f0ff' : 'rgba(0, 229, 255, 0.4)'}
                  strokeWidth={isSelected ? '3.5' : '1.8'}
                  strokeDasharray="6 4"
                  filter={isSelected ? 'url(#neon-glow)' : 'none'}
                />

                {/* Historical Traversed Path */}
                {b.historyPoints && b.historyPoints.length > 1 && (
                  <polyline
                    points={b.historyPoints
                      .map((p) => {
                        const pt = projectToSvg(p[0], p[1]);
                        return `${pt[0]},${pt[1]}`;
                      })
                      .join(' ')}
                    fill="none"
                    stroke={hasBreach ? '#ef4444' : '#00e5ff'}
                    strokeWidth={isSelected ? '4.5' : '2.5'}
                    strokeLinecap="round"
                    filter={hasBreach ? 'url(#alert-glow)' : 'url(#neon-glow)'}
                  />
                )}

                {/* Thermal Breach Hazard Geofence Circle */}
                {b.thermalBreaches.map((breach, idx) => {
                  const pt = projectToSvg(breach.coords[0], breach.coords[1]);
                  return (
                    <g key={idx} className="cursor-pointer" onClick={() => onOpenDrawer(b)}>
                      <circle
                        cx={pt[0]}
                        cy={pt[1]}
                        r="35"
                        fill="rgba(239, 68, 68, 0.2)"
                        stroke="#ef4444"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        filter="url(#alert-glow)"
                      >
                        <animate attributeName="r" values="25;45;25" dur="3s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="3s" repeatCount="indefinite" />
                      </circle>
                      <text
                        x={pt[0]}
                        y={pt[1] - 38}
                        textAnchor="middle"
                        className="fill-red-400 font-bold text-[10px] tracking-wider"
                      >
                        ⚠️ BREACH: {breach.recordedTemp}°C
                      </text>
                    </g>
                  );
                })}

                {/* Animated Moving Truck Marker */}
                {b.currentCoords && (
                  <g
                    className="cursor-pointer transition-all hover:scale-125"
                    onClick={() => {
                      onSelectBatch(b.batchId);
                      onOpenDrawer(b);
                    }}
                  >
                    {(() => {
                      const pt = projectToSvg(b.currentCoords[0], b.currentCoords[1]);
                      return (
                        <g transform={`translate(${pt[0]}, ${pt[1]})`}>
                          {/* Pulsing Radar Ring */}
                          <circle
                            r="18"
                            fill="none"
                            stroke={hasBreach ? '#ef4444' : '#00e5ff'}
                            strokeWidth="1.5"
                            opacity="0.75"
                          >
                            <animate attributeName="r" values="10;28;10" dur="2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.9;0;0.9" dur="2s" repeatCount="indefinite" />
                          </circle>

                          {/* Outer Badge */}
                          <circle
                            r="11"
                            fill={hasBreach ? '#991b1b' : '#032030'}
                            stroke={isSelected ? '#facc15' : hasBreach ? '#ef4444' : '#00f0ff'}
                            strokeWidth="2.2"
                            filter="url(#neon-glow)"
                          />

                          {/* Center Core */}
                          <circle r="4" fill={hasBreach ? '#fca5a5' : '#38bdf8'} />

                          {/* Floating Telemetry Tag */}
                          <rect
                            x="-50"
                            y="-32"
                            width="100"
                            height="18"
                            rx="3"
                            fill="rgba(2, 11, 24, 0.95)"
                            stroke={hasBreach ? '#ef4444' : '#00e5ff'}
                            strokeWidth="1"
                          />
                          <text
                            x="0"
                            y="-20"
                            textAnchor="middle"
                            className="fill-white font-mono text-[9px] font-bold"
                          >
                            {b.itemName.split(' ')[0]} | {b.currentTemp}°C
                          </text>
                        </g>
                      );
                    })()}
                  </g>
                )}
              </g>
            );
          })}

          {/* 6. LOGISTICS HUB NODES (White/Cyan Glowing Dots from Reference Image) */}
          {INDIAN_HUBS.map((hub) => {
            const pt = projectToSvg(hub.coords[0], hub.coords[1]);
            const isHovered = hoveredHub === hub.id;

            return (
              <g
                key={hub.id}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredHub(hub.id)}
                onMouseLeave={() => setHoveredHub(null)}
              >
                {/* Node Outer Halo */}
                <circle
                  cx={pt[0]}
                  cy={pt[1]}
                  r={hub.role === 'major_hub' ? '7' : '4.5'}
                  fill="rgba(0, 229, 255, 0.2)"
                  stroke="#00e5ff"
                  strokeWidth="1"
                />

                {/* Node Center Core */}
                <circle
                  cx={pt[0]}
                  cy={pt[1]}
                  r={hub.role === 'major_hub' ? '3.5' : '2.5'}
                  fill="#ffffff"
                  filter="url(#neon-glow)"
                />

                {/* City Name Label */}
                <text
                  x={pt[0] + 8}
                  y={pt[1] + 3}
                  className={`text-[8.5px] font-mono transition-all ${
                    isHovered
                      ? 'fill-cyan-200 font-bold text-[10px]'
                      : 'fill-cyan-400/70 group-hover:fill-cyan-200'
                  }`}
                >
                  {hub.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* BOTTOM LEFT HUD PANEL (Exact recreation from user reference image) */}
      <div className="absolute bottom-6 left-6 z-20 max-w-sm w-full bg-[#031326]/90 backdrop-blur-md p-4 rounded-2xl border border-cyan-500/40 text-cyan-300 text-xs shadow-2xl shadow-cyan-950/60 space-y-2">
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-1.5">
          <div className="font-extrabold text-[11px] tracking-wider text-cyan-200">
            REGION DETAILS // COLD-CHAIN TELEMETRY
          </div>
          <span className="text-[10px] text-emerald-400 font-bold">ONLINE</span>
        </div>

        <div className="font-black text-white text-sm">
          STATE / HUB: {selectedBatch ? selectedBatch.itemName : 'GOA SECTOR [GA]'}
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-300">
          <div>
            <span className="text-cyan-500">• DATA POINTS: </span>
            <span className="font-bold text-white">7,231 verified</span>
          </div>
          <div>
            <span className="text-cyan-500">• REEFER TEMP: </span>
            <span
              className={`font-bold ${
                selectedBatch && selectedBatch.currentTemp > selectedBatch.maxSafeTemp
                  ? 'text-red-400'
                  : 'text-emerald-400'
              }`}
            >
              {selectedBatch ? `${selectedBatch.currentTemp}°C` : '3.8°C'}
            </span>
          </div>
          <div>
            <span className="text-cyan-500">• SENSOR FLOW: </span>
            <span className="font-bold text-white">1.5 km/min</span>
          </div>
          <div>
            <span className="text-cyan-500">• DLT INTEGRITY: </span>
            <span className="font-bold text-emerald-400">100% IMMUTABLE</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-cyan-500/20 text-[10px] text-cyan-400/80">
          <span>LAST UPDATED: [3s ago]</span>
          <button
            onClick={() => onOpenDrawer(selectedBatch)}
            className="text-cyan-300 hover:text-white underline font-bold"
          >
            Open Live Telemetry Drawer →
          </button>
        </div>
      </div>

      {/* BOTTOM RIGHT HUD CONTROLS (From Reference Image) */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col items-end gap-2 text-xs">
        <div className="bg-[#031326]/90 backdrop-blur-md px-4 py-2 rounded-xl border border-cyan-500/40 text-cyan-300 flex items-center gap-3 shadow-xl">
          <div className="text-[10px] font-bold">
            ZOOM: <span className="text-white font-mono">{zoomLevel}%</span>
          </div>
          <span className="text-cyan-700">|</span>
          <div className="text-[10px] text-cyan-400">
            LAYERS: <span className="text-emerald-400 font-bold">LIVE TELEMETRY / GPS / DLT</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-[#031326]/90 backdrop-blur-md p-1.5 rounded-xl border border-cyan-500/40 shadow-xl">
          <button
            onClick={() => setZoomLevel((z) => Math.max(70, z - 15))}
            className="p-2 hover:bg-cyan-900/50 rounded-lg text-cyan-300 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.min(220, z + 15))}
            className="p-2 hover:bg-cyan-900/50 rounded-lg text-cyan-300 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-2 hover:bg-cyan-900/50 rounded-lg text-cyan-300 transition"
            title="Reset Centered View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
