import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Blockchain } from '../blockchain/Blockchain';
import {
  FoodBatch,
  StakeholderRole,
  ChainValidationResult,
  BlockchainTransaction,
  BatchStatus,
} from '../blockchain/types';
import { INITIAL_BATCHES, createPreloadedBlockchain } from '../blockchain/mockData';

interface BlockchainContextType {
  blockchain: Blockchain;
  batches: FoodBatch[];
  currentRole: StakeholderRole;
  setCurrentRole: (role: StakeholderRole) => void;
  selectedBatchId: string | null;
  setSelectedBatchId: (id: string | null) => void;
  isSimulating: boolean;
  setIsSimulating: (active: boolean) => void;
  simulationSpeed: number;
  setSimulationSpeed: (speed: number) => void;
  validationResult: ChainValidationResult | null;
  isValidating: boolean;
  runChainValidation: () => Promise<ChainValidationResult>;
  registerNewBatch: (batchData: {
    itemName: string;
    category: FoodBatch['category'];
    quantity: string;
    originLocation: string;
    originCoords: [number, number];
    destinationLocation: string;
    destinationCoords: [number, number];
    harvestDate: string;
    expiryDate: string;
    minSafeTemp: number;
    maxSafeTemp: number;
    initialTemp: number;
    farmerName: string;
    notes?: string;
  }) => { batchId: string; blockIndex: number };
  appendIoTTelemetry: (
    batchId: string,
    telemetry: {
      locationName: string;
      coords: [number, number];
      temperature: number;
      humidity: number;
      speedKmH: number;
      notes?: string;
    }
  ) => { blockIndex: number; violation: boolean };
  retailerReceiveBatch: (
    batchId: string,
    data: {
      retailerName: string;
      locationName: string;
      coords: [number, number];
      receivedTemp: number;
      grade: 'A+' | 'A' | 'B' | 'REJECTED';
      notes?: string;
    }
  ) => { blockIndex: number };
  tamperBlockPayload: (blockIndex: number, fakeData: Record<string, any>) => boolean;
  resetChainToClean: () => void;
  triggerThermalBreachOnBatch: (batchId: string, spikeTemp: number) => void;
  stats: {
    totalBlocks: number;
    totalBatches: number;
    inTransitBatches: number;
    deliveredBatches: number;
    thermalBreachesCount: number;
    chainValid: boolean;
  };
}

const BlockchainContext = createContext<BlockchainContextType | null>(null);

export const BlockchainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [blockchain, setBlockchain] = useState<Blockchain>(() => createPreloadedBlockchain());
  const [batches, setBatches] = useState<FoodBatch[]>(INITIAL_BATCHES);
  const [currentRole, setCurrentRole] = useState<StakeholderRole>('farmer');
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>('BATCH-HP-APL-2026-081');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [validationResult, setValidationResult] = useState<ChainValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  // Periodic simulated truck movement along waypoints
  const stepRef = useRef<number>(0);

  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      stepRef.current += 1;
      setBatches((prevBatches) =>
        prevBatches.map((batch) => {
          if (batch.currentStatus !== 'In Transit') return batch;

          // Find current waypoint progress
          const currentWaypoints = batch.routeWaypoints;
          const targetIndex = currentWaypoints.findIndex((w) => !w.reached);

          if (targetIndex === -1) {
            return batch; // All reached
          }

          const targetWaypoint = currentWaypoints[targetIndex];
          const [currLat, currLng] = batch.currentCoords;
          const [targetLat, targetLng] = targetWaypoint.coords;

          // Interpolate small delta movement
          const stepSize = 0.003 * simulationSpeed;
          const dLat = targetLat - currLat;
          const dLng = targetLng - currLng;
          const dist = Math.sqrt(dLat * dLat + dLng * dLng);

          let newLat = currLat;
          let newLng = currLng;
          let updatedWaypoints = [...currentWaypoints];

          if (dist < stepSize * 2) {
            // Reached waypoint!
            newLat = targetLat;
            newLng = targetLng;
            updatedWaypoints[targetIndex] = {
              ...targetWaypoint,
              reached: true,
              reachedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
          } else {
            newLat = currLat + (dLat / dist) * stepSize;
            newLng = currLng + (dLng / dist) * stepSize;
          }

          // Small natural telemetry fluctuation
          const tempNoise = (Math.random() - 0.5) * 0.2;
          const newTemp = parseFloat((batch.currentTemp + tempNoise).toFixed(1));
          const humidityNoise = (Math.random() - 0.5) * 0.8;
          const newHumidity = Math.min(99, Math.max(30, parseFloat((batch.currentHumidity + humidityNoise).toFixed(1))));

          const updatedHistory: Array<[number, number]> = [...batch.historyPoints];
          if (stepRef.current % 3 === 0) {
            updatedHistory.push([newLat, newLng]);
          }

          return {
            ...batch,
            currentCoords: [newLat, newLng],
            currentTemp: newTemp,
            currentHumidity: newHumidity,
            routeWaypoints: updatedWaypoints,
            historyPoints: updatedHistory,
          };
        })
      );
    }, 2500 / simulationSpeed);

    return () => clearInterval(interval);
  }, [isSimulating, simulationSpeed]);

  const runChainValidation = async (): Promise<ChainValidationResult> => {
    setIsValidating(true);
    // Slight simulated compute delay for visual feedback
    await new Promise((r) => setTimeout(r, 600));
    const result = blockchain.verifyIntegrity();
    setValidationResult(result);
    setIsValidating(false);
    return result;
  };

  const registerNewBatch = (batchData: {
    itemName: string;
    category: FoodBatch['category'];
    quantity: string;
    originLocation: string;
    originCoords: [number, number];
    destinationLocation: string;
    destinationCoords: [number, number];
    harvestDate: string;
    expiryDate: string;
    minSafeTemp: number;
    maxSafeTemp: number;
    initialTemp: number;
    farmerName: string;
    notes?: string;
  }) => {
    const timestamp = new Date().toISOString();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const categoryCode = batchData.category.slice(0, 3).toUpperCase();
    const batchId = `BATCH-${categoryCode}-${new Date().getFullYear()}-${randomSuffix}`;
    const truckId = `TRUCK-IND-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBatch: FoodBatch = {
      batchId,
      itemName: batchData.itemName,
      category: batchData.category,
      quantity: batchData.quantity,
      originLocation: batchData.originLocation,
      originCoords: batchData.originCoords,
      destinationLocation: batchData.destinationLocation,
      destinationCoords: batchData.destinationCoords,
      harvestDate: batchData.harvestDate,
      expiryDate: batchData.expiryDate,
      minSafeTemp: batchData.minSafeTemp,
      maxSafeTemp: batchData.maxSafeTemp,
      currentTemp: batchData.initialTemp,
      currentHumidity: 75.0,
      currentStatus: 'Registered',
      farmerName: batchData.farmerName,
      farmerWallet: `0x${Math.random().toString(16).substring(2, 8).toUpperCase()}...`,
      transporterName: 'Assigned Cold Freight Network',
      retailerName: 'Target Retail Fulfillment Hub',
      truckId,
      currentCoords: batchData.originCoords,
      historyPoints: [batchData.originCoords],
      routeWaypoints: [
        { name: `${batchData.originLocation} (Origin)`, coords: batchData.originCoords, reached: true, reachedAt: 'Just now' },
        { name: 'Intermediate Transit Gateway', coords: [(batchData.originCoords[0] + batchData.destinationCoords[0]) / 2, (batchData.originCoords[1] + batchData.destinationCoords[1]) / 2], reached: false },
        { name: `${batchData.destinationLocation} (Destination)`, coords: batchData.destinationCoords, reached: false },
      ],
      thermalBreaches: [],
      deviations: [],
    };

    // Log Batch Creation transaction on Blockchain
    const tx: BlockchainTransaction = {
      id: `TX-FARM-${Date.now().toString(36).toUpperCase()}`,
      batchId,
      type: 'BATCH_CREATION',
      actor: {
        name: batchData.farmerName,
        role: 'farmer',
        publicKey: `0x${Math.random().toString(16).slice(2, 18)}`,
      },
      payload: {
        itemName: batchData.itemName,
        status: 'Registered',
        locationName: batchData.originLocation,
        coordinates: batchData.originCoords,
        temperature: batchData.initialTemp,
        notes: batchData.notes || `Initial batch minted on MintCondition DLT with harvest date ${batchData.harvestDate}.`,
        customMetadata: {
          category: batchData.category,
          quantity: batchData.quantity,
          minSafeTemp: batchData.minSafeTemp,
          maxSafeTemp: batchData.maxSafeTemp,
        },
      },
      timestamp,
      signature: `0xecdsa_sig_${Math.random().toString(16).slice(2, 12)}`,
    };

    const newBlock = blockchain.createAndMineBlock([tx], `Node-${batchData.farmerName.replace(/\s+/g, '')}`);
    setBatches((prev) => [newBatch, ...prev]);
    setSelectedBatchId(batchId);
    setValidationResult(null); // invalidate cache

    return { batchId, blockIndex: newBlock.index };
  };

  const appendIoTTelemetry = (
    batchId: string,
    telemetry: {
      locationName: string;
      coords: [number, number];
      temperature: number;
      humidity: number;
      speedKmH: number;
      notes?: string;
    }
  ) => {
    const timestamp = new Date().toISOString();
    const batch = batches.find((b) => b.batchId === batchId);
    if (!batch) throw new Error('Batch not found');

    const scEval = blockchain.evaluateSmartContract(batch, telemetry.temperature);
    const transactions: BlockchainTransaction[] = [];

    // Telemetry transaction
    const txTelemetry: BlockchainTransaction = {
      id: `TX-IOT-${Date.now().toString(36).toUpperCase()}`,
      batchId,
      type: 'TRANSIT_TELEMETRY',
      actor: {
        name: batch.transporterName || 'Fleet IoT Gateway',
        role: 'transporter',
        publicKey: '0xTRANSPORTER_IOT_PUBKEY_901',
      },
      payload: {
        status: 'In Transit',
        locationName: telemetry.locationName,
        coordinates: telemetry.coords,
        temperature: telemetry.temperature,
        humidity: telemetry.humidity,
        speedKmH: telemetry.speedKmH,
        slaViolation: scEval.violation,
        violationDetails: scEval.reason,
        notes: telemetry.notes || 'Automated IoT telemetry broadcast signed by hardware enclave.',
      },
      timestamp,
      signature: `0xiot_hw_enclave_sig_${Math.random().toString(16).slice(2, 12)}`,
    };
    transactions.push(txTelemetry);

    // If SLA breached, append smart contract execution transaction
    if (scEval.violation) {
      const txBreach: BlockchainTransaction = {
        id: `TX-SLA-${Date.now().toString(36).toUpperCase()}`,
        batchId,
        type: 'SMART_CONTRACT_SLA',
        actor: {
          name: 'MintCondition SLA Oracle Enclave',
          role: 'auditor',
          publicKey: '0x000000ORACLE_SMART_CONTRACT_VERIFIED',
        },
        payload: {
          slaViolation: true,
          violationDetails: scEval.reason,
          notes: `${scEval.action} Immutable violation logged to cold chain ledger.`,
        },
        timestamp,
        signature: `0xsmart_contract_execution_sha_${Math.random().toString(16).slice(2, 12)}`,
      };
      transactions.push(txBreach);
    }

    const newBlock = blockchain.createAndMineBlock(transactions, 'Node-Highway-Transit-IoT');

    // Update batch in state
    setBatches((prev) =>
      prev.map((b) => {
        if (b.batchId !== batchId) return b;
        const newBreaches = [...b.thermalBreaches];
        if (scEval.violation) {
          newBreaches.push({
            timestamp: new Date().toLocaleTimeString(),
            coords: telemetry.coords,
            locationName: telemetry.locationName,
            recordedTemp: telemetry.temperature,
            threshold: telemetry.temperature > b.maxSafeTemp ? b.maxSafeTemp : b.minSafeTemp,
          });
        }
        return {
          ...b,
          currentStatus: 'In Transit',
          currentCoords: telemetry.coords,
          currentTemp: telemetry.temperature,
          currentHumidity: telemetry.humidity,
          historyPoints: [...b.historyPoints, telemetry.coords],
          thermalBreaches: newBreaches,
        };
      })
    );

    setValidationResult(null);
    return { blockIndex: newBlock.index, violation: scEval.violation };
  };

  const retailerReceiveBatch = (
    batchId: string,
    data: {
      retailerName: string;
      locationName: string;
      coords: [number, number];
      receivedTemp: number;
      grade: 'A+' | 'A' | 'B' | 'REJECTED';
      notes?: string;
    }
  ) => {
    const timestamp = new Date().toISOString();
    const batch = batches.find((b) => b.batchId === batchId);
    if (!batch) throw new Error('Batch not found');

    const tx: BlockchainTransaction = {
      id: `TX-RET-${Date.now().toString(36).toUpperCase()}`,
      batchId,
      type: 'STORE_DELIVERY',
      actor: {
        name: data.retailerName,
        role: 'retailer',
        publicKey: `0x${Math.random().toString(16).slice(2, 18)}`,
      },
      payload: {
        itemName: batch.itemName,
        status: 'At Store',
        locationName: data.locationName,
        coordinates: data.coords,
        temperature: data.receivedTemp,
        inspectionGrade: data.grade,
        notes: data.notes || `Batch accepted and inspected by ${data.retailerName}. Quality Grade: ${data.grade}.`,
      },
      timestamp,
      signature: `0xecdsa_retail_store_confirmed_${Math.random().toString(16).slice(2, 10)}`,
    };

    const newBlock = blockchain.createAndMineBlock([tx], `Node-${data.retailerName.replace(/\s+/g, '')}`);

    setBatches((prev) =>
      prev.map((b) => {
        if (b.batchId !== batchId) return b;
        return {
          ...b,
          currentStatus: 'At Store',
          currentCoords: data.coords,
          currentTemp: data.receivedTemp,
          historyPoints: [...b.historyPoints, data.coords],
        };
      })
    );

    setValidationResult(null);
    return { blockIndex: newBlock.index };
  };

  const tamperBlockPayload = (blockIndex: number, fakeData: Record<string, any>) => {
    const success = blockchain.tamperBlockData(blockIndex, fakeData);
    if (success) {
      // Force trigger validation to reveal the tamper
      const result = blockchain.verifyIntegrity();
      setValidationResult(result);
      // Trigger re-render
      setBlockchain(Object.assign(Object.create(Object.getPrototypeOf(blockchain)), blockchain));
    }
    return success;
  };

  const resetChainToClean = () => {
    const newChain = createPreloadedBlockchain();
    setBlockchain(newChain);
    setBatches(INITIAL_BATCHES);
    setValidationResult(null);
  };

  const triggerThermalBreachOnBatch = (batchId: string, spikeTemp: number) => {
    const target = batches.find((b) => b.batchId === batchId);
    if (!target) return;
    appendIoTTelemetry(batchId, {
      locationName: `${target.routeWaypoints.find((w) => !w.reached)?.name || 'Highway Checkpost'} [Simulated Spike]`,
      coords: target.currentCoords,
      temperature: spikeTemp,
      humidity: target.currentHumidity,
      speedKmH: 58,
      notes: `CRITICAL ALERT: Ambient reefer temperature spiked to ${spikeTemp}°C. Cooling compressor failure simulated.`,
    });
  };

  // Compute aggregate stats
  const totalBlocks = blockchain.chain.length;
  const totalBatches = batches.length;
  const inTransitBatches = batches.filter((b) => b.currentStatus === 'In Transit').length;
  const deliveredBatches = batches.filter((b) => b.currentStatus === 'At Store' || b.currentStatus === 'Sold/Consumed').length;
  const thermalBreachesCount = batches.reduce((acc, b) => acc + b.thermalBreaches.length, 0);
  const chainValid = validationResult ? validationResult.isValid : true;

  return (
    <BlockchainContext.Provider
      value={{
        blockchain,
        batches,
        currentRole,
        setCurrentRole,
        selectedBatchId,
        setSelectedBatchId,
        isSimulating,
        setIsSimulating,
        simulationSpeed,
        setSimulationSpeed,
        validationResult,
        isValidating,
        runChainValidation,
        registerNewBatch,
        appendIoTTelemetry,
        retailerReceiveBatch,
        tamperBlockPayload,
        resetChainToClean,
        triggerThermalBreachOnBatch,
        stats: {
          totalBlocks,
          totalBatches,
          inTransitBatches,
          deliveredBatches,
          thermalBreachesCount,
          chainValid,
        },
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};
