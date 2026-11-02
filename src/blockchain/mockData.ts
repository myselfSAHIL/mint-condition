import { FoodBatch, BlockchainTransaction } from './types';
import { Blockchain } from './Blockchain';

export const INITIAL_BATCHES: FoodBatch[] = [
  {
    batchId: 'BATCH-HP-APL-2026-081',
    itemName: 'Kinnaur Royal Delicious Apples',
    category: 'Fresh Produce',
    quantity: '2,400 kg (120 Crates)',
    originLocation: 'Kalpa Orchard, Kinnaur, Himachal Pradesh',
    originCoords: [31.5385, 78.2562],
    destinationLocation: 'Vashi APMC Wholesale Market, Navi Mumbai',
    destinationCoords: [19.076, 73.0076],
    harvestDate: '2026-10-24',
    expiryDate: '2026-12-15',
    minSafeTemp: 1.0,
    maxSafeTemp: 6.0,
    currentTemp: 3.8,
    currentHumidity: 84.5,
    currentStatus: 'In Transit',
    farmerName: 'Devinder Negi (Organic Mountain Growers)',
    farmerWallet: '0x71C..9A2B',
    transporterName: 'SnowLine Cold Express Logistics',
    retailerName: 'Reliance Fresh Superstore Vashi',
    truckId: 'TRUCK-HP-12-AE-3944',
    currentCoords: [23.0225, 72.5714], // Near Ahmedabad
    historyPoints: [
      [31.5385, 78.2562], // Kalpa
      [31.1048, 77.1734], // Shimla
      [30.7333, 76.7794], // Chandigarh
      [28.7041, 77.1025], // Delhi
      [26.9124, 75.7873], // Jaipur
      [24.5854, 73.7125], // Udaipur
      [23.0225, 72.5714], // Ahmedabad (Current)
    ],
    routeWaypoints: [
      { name: 'Kalpa Orchard Hub', coords: [31.5385, 78.2562], reached: true, reachedAt: '2026-10-24 07:30' },
      { name: 'Shimla Cold Grading Station', coords: [31.1048, 77.1734], reached: true, reachedAt: '2026-10-24 16:45' },
      { name: 'Chandigarh Checkpost', coords: [30.7333, 76.7794], reached: true, reachedAt: '2026-10-25 04:10' },
      { name: 'Delhi Azadpur Hub', coords: [28.7041, 77.1025], reached: true, reachedAt: '2026-10-25 15:20' },
      { name: 'Jaipur Bypass Toll', coords: [26.9124, 75.7873], reached: true, reachedAt: '2026-10-26 03:00' },
      { name: 'Ahmedabad Cold Junction', coords: [23.0225, 72.5714], reached: true, reachedAt: '2026-10-26 19:40' },
      { name: 'Surat Express Corridor', coords: [21.1702, 72.8311], reached: false },
      { name: 'Vashi APMC Navi Mumbai', coords: [19.076, 73.0076], reached: false },
    ],
    thermalBreaches: [],
    deviations: [],
  },
  {
    batchId: 'BATCH-AMUL-DRY-2026-442',
    itemName: 'Anand A2 Organic Fresh Cow Milk',
    category: 'Dairy & Poultry',
    quantity: '8,000 Litres (Cryo-Tanker)',
    originLocation: 'Amul Dairy Hub, Anand, Gujarat',
    originCoords: [22.5645, 72.9289],
    destinationLocation: 'Begumpet Fresh Supercenter, Hyderabad',
    destinationCoords: [17.4435, 78.469],
    harvestDate: '2026-10-27',
    expiryDate: '2026-11-04',
    minSafeTemp: 1.0,
    maxSafeTemp: 4.5,
    currentTemp: 3.1,
    currentHumidity: 72.0,
    currentStatus: 'In Transit',
    farmerName: 'Tribhuvandas Dairy Cooperative Sangh',
    farmerWallet: '0x88F..441C',
    transporterName: 'Apex CryoTrans India',
    retailerName: 'Ratnadeep Supermarket Begumpet',
    truckId: 'TRUCK-GJ-01-BX-4102',
    currentCoords: [17.6599, 75.9064], // Solapur
    historyPoints: [
      [22.5645, 72.9289], // Anand
      [21.1702, 72.8311], // Surat
      [19.9975, 73.7898], // Nashik (Breach occurred here!)
      [18.5204, 73.8567], // Pune
      [17.6599, 75.9064], // Solapur (Current)
    ],
    routeWaypoints: [
      { name: 'Anand Milk Chilling Plant', coords: [22.5645, 72.9289], reached: true, reachedAt: '2026-10-27 05:00' },
      { name: 'Surat Highway Checkpost', coords: [21.1702, 72.8311], reached: true, reachedAt: '2026-10-27 12:15' },
      {
        name: 'Nashik Industrial Transit',
        coords: [19.9975, 73.7898],
        reached: true,
        reachedAt: '2026-10-27 20:30',
        isBreachPoint: true,
      },
      { name: 'Pune Chakan Hub', coords: [18.5204, 73.8567], reached: true, reachedAt: '2026-10-28 04:00' },
      { name: 'Solapur Express Waypoint', coords: [17.6599, 75.9064], reached: true, reachedAt: '2026-10-28 14:15' },
      { name: 'Hyderabad Begumpet Retail Hub', coords: [17.4435, 78.469], reached: false },
    ],
    thermalBreaches: [
      {
        timestamp: '2026-10-27 20:35:00',
        coords: [19.9975, 73.7898],
        locationName: 'Nashik Industrial Bypass',
        recordedTemp: 9.4,
        threshold: 4.5,
      },
    ],
    deviations: [
      {
        timestamp: '2026-10-27 21:10:00',
        coords: [19.9850, 73.8100],
        reason: 'Temporary 4 km detour due to bridge maintenance near Nashik bypass',
      },
    ],
  },
  {
    batchId: 'BATCH-KRL-SEA-2026-193',
    itemName: 'Malabar Deep-Sea Black Tiger Prawns',
    category: 'Seafood & Meat',
    quantity: '1,500 kg (IQF Blast Frozen)',
    originLocation: 'Cochin Fisheries Harbour, Kochi, Kerala',
    originCoords: [9.9312, 76.2673],
    destinationLocation: 'Chennai Port Cold Storage Terminal',
    destinationCoords: [13.0827, 80.2707],
    harvestDate: '2026-10-25',
    expiryDate: '2027-04-25',
    minSafeTemp: -24.0,
    maxSafeTemp: -18.0,
    currentTemp: -19.6,
    currentHumidity: 90.0,
    currentStatus: 'In Transit',
    farmerName: 'Kerala Coastal Fishermen Cooperative',
    farmerWallet: '0x32D..78EE',
    transporterName: 'BlueOcean Deep Reefer Freight',
    retailerName: 'SeaCrest Seafood Exporters Chennai',
    truckId: 'TRUCK-KL-07-CD-7822',
    currentCoords: [12.9716, 77.5946], // Bengaluru
    historyPoints: [
      [9.9312, 76.2673], // Kochi
      [11.0168, 76.9558], // Coimbatore
      [11.6643, 78.146], // Salem
      [12.9716, 77.5946], // Bengaluru (Current)
    ],
    routeWaypoints: [
      { name: 'Kochi Harbour Blast Freezer', coords: [9.9312, 76.2673], reached: true, reachedAt: '2026-10-25 09:00' },
      { name: 'Coimbatore Inland Port', coords: [11.0168, 76.9558], reached: true, reachedAt: '2026-10-25 18:20' },
      { name: 'Salem Cold Warehouse', coords: [11.6643, 78.146], reached: true, reachedAt: '2026-10-26 02:40' },
      { name: 'Bengaluru Electronic City Hub', coords: [12.9716, 77.5946], reached: true, reachedAt: '2026-10-26 12:00' },
      { name: 'Vellore Golden Quad Gate', coords: [12.9165, 79.1325], reached: false },
      { name: 'Chennai Port Cold Terminal', coords: [13.0827, 80.2707], reached: false },
    ],
    thermalBreaches: [],
    deviations: [],
  },
  {
    batchId: 'BATCH-NGP-ORG-2026-512',
    itemName: 'Nagpur GI-Certified Sweet Mandarin Oranges',
    category: 'Fresh Produce',
    quantity: '4,000 kg (200 Crates)',
    originLocation: 'Katol Citrus Groves, Nagpur, Maharashtra',
    originCoords: [21.1458, 79.0882],
    destinationLocation: 'New Town Fresh Market, Kolkata, West Bengal',
    destinationCoords: [22.5726, 88.3639],
    harvestDate: '2026-10-18',
    expiryDate: '2026-11-20',
    minSafeTemp: 5.0,
    maxSafeTemp: 11.0,
    currentTemp: 7.8,
    currentHumidity: 78.0,
    currentStatus: 'At Store',
    farmerName: 'Vidarbha Organic Citrus Farmer Producer Co.',
    farmerWallet: '0x99A..5521',
    transporterName: 'Central India Reefer Lines',
    retailerName: 'Spencer Hypermarket New Town Kolkata',
    truckId: 'TRUCK-MH-31-DC-1090',
    currentCoords: [22.5726, 88.3639],
    historyPoints: [
      [21.1458, 79.0882], // Nagpur
      [21.2514, 81.6296], // Raipur
      [21.4669, 83.9812], // Sambalpur
      [20.2961, 85.8245], // Bhubaneswar
      [22.5726, 88.3639], // Kolkata
    ],
    routeWaypoints: [
      { name: 'Katol Packhouse Nagpur', coords: [21.1458, 79.0882], reached: true, reachedAt: '2026-10-18 08:00' },
      { name: 'Raipur Logistics Ring', coords: [21.2514, 81.6296], reached: true, reachedAt: '2026-10-18 19:30' },
      { name: 'Sambalpur Highway Gate', coords: [21.4669, 83.9812], reached: true, reachedAt: '2026-10-19 06:15' },
      { name: 'Bhubaneswar Multi-Modal Hub', coords: [20.2961, 85.8245], reached: true, reachedAt: '2026-10-19 17:00' },
      { name: 'New Town Retail Hub Kolkata', coords: [22.5726, 88.3639], reached: true, reachedAt: '2026-10-20 11:45' },
    ],
    thermalBreaches: [],
    deviations: [],
  },
  {
    batchId: 'BATCH-SKM-ORG-2026-039',
    itemName: 'Sikkim 100% Organic Large Black Cardamom',
    category: 'Organic Spices',
    quantity: '500 kg (Vacuum Sealed)',
    originLocation: 'Temi Spice Valley, Ravangla, South Sikkim',
    originCoords: [27.2415, 88.5298],
    destinationLocation: 'Hazratganj Specialty Gourmet, Lucknow',
    destinationCoords: [26.8467, 80.9462],
    harvestDate: '2026-10-28',
    expiryDate: '2028-10-28',
    minSafeTemp: 15.0,
    maxSafeTemp: 26.0,
    currentTemp: 19.2,
    currentHumidity: 45.0,
    currentStatus: 'Registered',
    farmerName: 'Tenzing Lepcha (Himalayan Heritage Spices)',
    farmerWallet: '0x14B..092F',
    transporterName: 'Eastern Himalayan Express',
    retailerName: 'Lucknow Gourmet Haven',
    truckId: 'TRUCK-SK-01-AA-0211',
    currentCoords: [27.2415, 88.5298],
    historyPoints: [[27.2415, 88.5298]],
    routeWaypoints: [
      { name: 'Temi Farm Warehouse', coords: [27.2415, 88.5298], reached: true, reachedAt: '2026-10-28 10:00' },
      { name: 'Siliguri North Bengal Hub', coords: [26.7271, 88.3953], reached: false },
      { name: 'Patna Ganga Expressway Gate', coords: [25.5941, 85.1376], reached: false },
      { name: 'Varanasi Ring Road Hub', coords: [25.3176, 82.9739], reached: false },
      { name: 'Lucknow Hazratganj Supermart', coords: [26.8467, 80.9462], reached: false },
    ],
    thermalBreaches: [],
    deviations: [],
  },
];

export function createPreloadedBlockchain(): Blockchain {
  const chain = new Blockchain(2, 'MintCondition-India-Consensus-Node');

  // Block 1: Farmer registers Batch HP Apples
  const tx1: BlockchainTransaction = {
    id: 'TX-FARM-001-A91',
    batchId: 'BATCH-HP-APL-2026-081',
    type: 'BATCH_CREATION',
    actor: {
      name: 'Devinder Negi',
      role: 'farmer',
      publicKey: '0x71C840294723019AB2',
    },
    payload: {
      itemName: 'Kinnaur Royal Delicious Apples',
      status: 'Registered',
      locationName: 'Kalpa Orchard, Kinnaur, HP',
      coordinates: [31.5385, 78.2562],
      temperature: 3.5,
      humidity: 85,
      notes: 'Harvested at 2,800m elevation. Cold-chain grading certified Grade-A export standard.',
    },
    timestamp: '2026-10-24T08:00:00.000Z',
    signature: '0xecdsa_sig_f91a27e02b7',
  };
  chain.createAndMineBlock([tx1], 'Node-Himachal-Orchard');

  // Block 2: Transporter picks up HP Apples and logs first transit telemetry
  const tx2: BlockchainTransaction = {
    id: 'TX-TRNS-002-B88',
    batchId: 'BATCH-HP-APL-2026-081',
    type: 'TRANSIT_TELEMETRY',
    actor: {
      name: 'SnowLine Cold Express Logistics',
      role: 'transporter',
      publicKey: '0x999B0182CDE41088E2',
    },
    payload: {
      status: 'In Transit',
      locationName: 'Delhi Azadpur Hub Toll Gate',
      coordinates: [28.7041, 77.1025],
      temperature: 3.8,
      humidity: 83.2,
      speedKmH: 64,
      notes: 'Reefer container seal #IND-9021 verified intact. Chiller unit running at 100% capacity.',
    },
    timestamp: '2026-10-25T15:20:00.000Z',
    signature: '0xecdsa_sig_d443b7190ca',
  };
  chain.createAndMineBlock([tx2], 'Node-Delhi-NCR-Gateway');

  // Block 3: Amul Dairy Batch Registration
  const tx3: BlockchainTransaction = {
    id: 'TX-FARM-003-C33',
    batchId: 'BATCH-AMUL-DRY-2026-442',
    type: 'BATCH_CREATION',
    actor: {
      name: 'Tribhuvandas Dairy Cooperative',
      role: 'farmer',
      publicKey: '0x88F00293817441C09',
    },
    payload: {
      itemName: 'Anand A2 Organic Fresh Cow Milk',
      status: 'Registered',
      locationName: 'Amul Dairy Plant, Anand, Gujarat',
      coordinates: [22.5645, 72.9289],
      temperature: 2.8,
      humidity: 70,
      notes: 'Batch pasteurized, microbiological test passed (FSSAI Lic #10012021000142).',
    },
    timestamp: '2026-10-27T05:00:00.000Z',
    signature: '0xecdsa_sig_aa91048b6c',
  };
  chain.createAndMineBlock([tx3], 'Node-Gujarat-Amul-Center');

  // Block 4: Amul Dairy Thermal Breach Alert & Smart Contract Trigger!
  const tx4_telemetry: BlockchainTransaction = {
    id: 'TX-TRNS-004-D72',
    batchId: 'BATCH-AMUL-DRY-2026-442',
    type: 'TRANSIT_TELEMETRY',
    actor: {
      name: 'Apex CryoTrans India',
      role: 'transporter',
      publicKey: '0x777A339900BDE112',
    },
    payload: {
      status: 'In Transit',
      locationName: 'Nashik Industrial Transit Area',
      coordinates: [19.9975, 73.7898],
      temperature: 9.4, // Spiked above 4.5°C threshold!
      humidity: 78.5,
      speedKmH: 42,
      slaViolation: true,
      violationDetails: 'Temp reached 9.4°C (Exceeded SLA ceiling 4.5°C)',
      notes: 'Compressor backup generator engaged following primary alternator trip.',
    },
    timestamp: '2026-10-27T20:35:00.000Z',
    signature: '0xecdsa_sig_88ff192b0c',
  };

  const tx4_smartContract: BlockchainTransaction = {
    id: 'TX-SC-004-E19',
    batchId: 'BATCH-AMUL-DRY-2026-442',
    type: 'SMART_CONTRACT_SLA',
    actor: {
      name: 'MintCondition Automated Escrow Oracle',
      role: 'auditor',
      publicKey: '0x0000SC0000ORACLE0001',
    },
    payload: {
      slaViolation: true,
      violationDetails: 'Rule #ColdChain-A2: Temp exceeded 4.5°C for 42 mins. 15% freight penalty logged to escrow contract.',
      notes: 'Autonomous smart contract execution on Ethereum/DLT simulated EVM layer.',
    },
    timestamp: '2026-10-27T20:36:12.000Z',
    signature: '0xsmart_contract_execution_proof_hash',
  };
  chain.createAndMineBlock([tx4_telemetry, tx4_smartContract], 'Node-Maharashtra-Nashik');

  // Block 5: Seafood deep freeze batch creation & transit
  const tx5: BlockchainTransaction = {
    id: 'TX-FARM-005-F41',
    batchId: 'BATCH-KRL-SEA-2026-193',
    type: 'BATCH_CREATION',
    actor: {
      name: 'Kerala Coastal Fishermen Coop',
      role: 'farmer',
      publicKey: '0x32D81928490178EE9',
    },
    payload: {
      itemName: 'Malabar Deep-Sea Black Tiger Prawns',
      status: 'Registered',
      locationName: 'Cochin Fisheries Blast Freezer',
      coordinates: [9.9312, 76.2673],
      temperature: -21.4,
      humidity: 92,
      notes: 'IQF blast frozen at -35°C within 90 minutes of catch. Traceable vessel #IND-KER-209.',
    },
    timestamp: '2026-10-25T09:00:00.000Z',
    signature: '0xecdsa_sig_76e492b1a',
  };
  chain.createAndMineBlock([tx5], 'Node-Kerala-Cochin-Port');

  // Block 6: Nagpur Oranges Retailer Final Delivery Confirmation
  const tx6: BlockchainTransaction = {
    id: 'TX-RET-006-G82',
    batchId: 'BATCH-NGP-ORG-2026-512',
    type: 'STORE_DELIVERY',
    actor: {
      name: 'Spencer Hypermarket New Town Kolkata',
      role: 'retailer',
      publicKey: '0x99A00281982749911',
    },
    payload: {
      itemName: 'Nagpur GI-Certified Sweet Mandarin Oranges',
      status: 'At Store',
      locationName: 'New Town Retail Hub, Kolkata',
      coordinates: [22.5726, 88.3639],
      temperature: 7.8,
      humidity: 78,
      inspectionGrade: 'A+',
      notes: 'Delivery accepted by Store Manager. All 200 crates received intact. Temperature history verified via DLT.',
    },
    timestamp: '2026-10-20T11:45:00.000Z',
    signature: '0xecdsa_sig_kolkata_retail_approved',
  };
  chain.createAndMineBlock([tx6], 'Node-Bengal-Kolkata-East');

  return chain;
}
