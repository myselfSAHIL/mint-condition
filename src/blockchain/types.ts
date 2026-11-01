export type StakeholderRole = 'farmer' | 'transporter' | 'retailer' | 'consumer' | 'auditor';

export type BatchStatus = 'Registered' | 'In Transit' | 'Under Inspection' | 'At Store' | 'Sold/Consumed';

export interface RouteWaypoint {
  name: string;
  coords: [number, number]; // [lat, lng]
  reached: boolean;
  reachedAt?: string;
  isBreachPoint?: boolean;
}

export interface IoTTelemetry {
  gps: [number, number];
  temperature: number; // in Celsius
  humidity: number; // in %
  speedKmH: number;
  batteryLevel?: number;
  tamperSealIntact: boolean;
  timestamp: string;
}

export interface FoodBatch {
  batchId: string;
  itemName: string;
  category: 'Fresh Produce' | 'Dairy & Poultry' | 'Seafood & Meat' | 'Beverages' | 'Organic Spices';
  quantity: string;
  originLocation: string;
  originCoords: [number, number];
  destinationLocation: string;
  destinationCoords: [number, number];
  harvestDate: string;
  expiryDate: string;
  minSafeTemp: number;
  maxSafeTemp: number;
  currentTemp: number;
  currentHumidity: number;
  currentStatus: BatchStatus;
  farmerName: string;
  farmerWallet: string;
  transporterName: string;
  retailerName: string;
  truckId: string;
  currentCoords: [number, number];
  routeWaypoints: RouteWaypoint[];
  historyPoints: Array<[number, number]>;
  thermalBreaches: Array<{
    timestamp: string;
    coords: [number, number];
    locationName: string;
    recordedTemp: number;
    threshold: number;
  }>;
  deviations: Array<{
    timestamp: string;
    coords: [number, number];
    reason: string;
  }>;
}

export type TransactionType =
  | 'BATCH_CREATION'
  | 'TRANSIT_TELEMETRY'
  | 'THERMAL_BREACH_ALERT'
  | 'QUALITY_INSPECTION'
  | 'STORE_DELIVERY'
  | 'SMART_CONTRACT_SLA';

export interface BlockchainTransaction {
  id: string;
  batchId: string;
  type: TransactionType;
  actor: {
    name: string;
    role: StakeholderRole;
    publicKey: string;
  };
  payload: {
    itemName?: string;
    status?: BatchStatus;
    locationName?: string;
    coordinates?: [number, number];
    temperature?: number;
    humidity?: number;
    speedKmH?: number;
    inspectionGrade?: 'A+' | 'A' | 'B' | 'REJECTED';
    slaViolation?: boolean;
    violationDetails?: string;
    notes?: string;
    customMetadata?: Record<string, any>;
  };
  timestamp: string;
  signature?: string;
}

export interface BlockData {
  index: number;
  timestamp: string;
  transactions: BlockchainTransaction[];
  previousHash: string;
  hash: string;
  nonce: number;
  difficulty: number;
  merkleRoot: string;
  miner: string;
  // Metadata for simulated tampering
  isTampered?: boolean;
  originalHash?: string;
}

export interface ChainValidationResult {
  isValid: boolean;
  brokenBlockIndex: number | null;
  errorMessage: string | null;
  checkedBlocksCount: number;
  verificationTimestamp: string;
}
