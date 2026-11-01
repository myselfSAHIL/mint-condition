import { BlockData, BlockchainTransaction } from './types';
import { sha256, calculateMerkleRoot } from './sha256';

export class Block implements BlockData {
  public index: number;
  public timestamp: string;
  public transactions: BlockchainTransaction[];
  public previousHash: string;
  public hash: string;
  public nonce: number;
  public difficulty: number;
  public merkleRoot: string;
  public miner: string;
  public isTampered?: boolean;
  public originalHash?: string;

  constructor(
    index: number,
    timestamp: string,
    transactions: BlockchainTransaction[],
    previousHash: string = '',
    difficulty: number = 2,
    miner: string = 'AgriLedger-Node-01'
  ) {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.difficulty = difficulty;
    this.nonce = 0;
    this.miner = miner;
    this.merkleRoot = calculateMerkleRoot(transactions);
    this.hash = this.calculateHash();
  }

  public calculateHash(): string {
    const rawData =
      this.index.toString() +
      this.previousHash +
      this.timestamp +
      this.merkleRoot +
      this.nonce.toString() +
      this.difficulty.toString();
    return sha256(rawData);
  }

  /**
   * Proof of Work algorithm: increment nonce until hash starts with target leading zeros
   */
  public mineBlock(difficulty: number): void {
    this.difficulty = difficulty;
    const target = Array(difficulty + 1).join('0');
    
    // Safety break after 200,000 cycles to avoid blocking UI thread
    let iterations = 0;
    const maxIterations = 300000;

    while (this.hash.substring(0, difficulty) !== target && iterations < maxIterations) {
      this.nonce++;
      this.hash = this.calculateHash();
      iterations++;
    }
  }

  /**
   * Corrupts the block's transaction payload or hash to demonstrate tamper detection
   */
  public simulateTamper(corruptedData: Partial<BlockchainTransaction>): void {
    if (this.transactions.length > 0) {
      if (!this.originalHash) {
        this.originalHash = this.hash;
      }
      this.isTampered = true;
      // Mutate payload without recalculating nonce or hash
      this.transactions[0].payload = {
        ...this.transactions[0].payload,
        ...corruptedData.payload,
      };
      // Merkle root changes if transactions change!
      this.merkleRoot = calculateMerkleRoot(this.transactions);
      // Notice: we do NOT update this.hash, simulating an attacker modifying data inside a block!
    }
  }

  /**
   * Restore tampered block back to original valid state
   */
  public restoreOriginal(): void {
    if (this.originalHash) {
      this.hash = this.originalHash;
      this.isTampered = false;
      this.merkleRoot = calculateMerkleRoot(this.transactions);
    }
  }

  /**
   * Checks if this block contains any IoT temperature violation (> 8°C or out-of-safe range)
   */
  public hasThermalBreach(): boolean {
    return this.transactions.some(
      (tx) =>
        tx.type === 'THERMAL_BREACH_ALERT' ||
        tx.payload?.slaViolation === true ||
        (tx.payload?.temperature !== undefined && tx.payload.temperature > 8)
    );
  }
}
