import { Block } from './Block';
import {
  BlockData,
  BlockchainTransaction,
  ChainValidationResult,
  FoodBatch,
} from './types';
import { calculateMerkleRoot } from './sha256';

export class Blockchain {
  public chain: Block[];
  public difficulty: number;
  public pendingTransactions: BlockchainTransaction[];
  public miningReward: number = 0;
  public nodeIdentifier: string;

  constructor(difficulty: number = 2, nodeName: string = 'MintCondition-Genesis-India') {
    this.chain = [];
    this.difficulty = difficulty;
    this.pendingTransactions = [];
    this.nodeIdentifier = nodeName;
    this.createGenesisBlock();
  }

  private createGenesisBlock(): void {
    const genesisTx: BlockchainTransaction = {
      id: 'TX-GENESIS-00000000',
      batchId: 'GENESIS-ROOT',
      type: 'BATCH_CREATION',
      actor: {
        name: 'Ministry of Agriculture & MintCondition Network',
        role: 'auditor',
        publicKey: '0x0000000000000000000000000000000000000000',
      },
      payload: {
        notes: 'MintCondition India Smart Food Supply Chain Protocol Genesis Block initiated.',
        locationName: 'National Agri-DLT Node, New Delhi',
        coordinates: [28.6139, 77.2090],
      },
      timestamp: new Date('2026-10-01T00:00:00.000Z').toISOString(),
      signature: '0xgenesis_signature_approved_fssai_cert',
    };

    const genesisBlock = new Block(
      0,
      new Date('2026-10-01T00:00:00.000Z').toISOString(),
      [genesisTx],
      '0',
      this.difficulty,
      this.nodeIdentifier
    );
    genesisBlock.mineBlock(this.difficulty);
    this.chain.push(genesisBlock);
  }

  public getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Adds an impending transaction to memory pool
   */
  public addTransaction(transaction: BlockchainTransaction): void {
    if (!transaction.batchId || !transaction.actor) {
      throw new Error('Transaction must include batchId and valid actor metadata.');
    }
    this.pendingTransactions.push(transaction);
  }

  /**
   * Mines a new block containing pending transactions or provided transactions
   */
  public minePendingTransactions(minerAddress: string = 'MintCondition-Miner-01'): Block {
    const previousBlock = this.getLatestBlock();
    const newBlock = new Block(
      this.chain.length,
      new Date().toISOString(),
      [...this.pendingTransactions],
      previousBlock.hash,
      this.difficulty,
      minerAddress
    );

    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
    this.pendingTransactions = [];
    return newBlock;
  }

  /**
   * Direct block appending for batch registration or IoT logging
   */
  public createAndMineBlock(
    transactions: BlockchainTransaction[],
    minerAddress: string = 'MintCondition-Node-Transit'
  ): Block {
    const previousBlock = this.getLatestBlock();
    const newBlock = new Block(
      this.chain.length,
      new Date().toISOString(),
      transactions,
      previousBlock.hash,
      this.difficulty,
      minerAddress
    );

    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
    return newBlock;
  }

  /**
   * Full Ledger Integrity Verification
   * Re-computes cryptographic SHA-256 hashes, previousHash continuity, Merkle roots, and PoW
   */
  public verifyIntegrity(): ChainValidationResult {
    const now = new Date().toISOString();

    for (let i = 0; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];

      // 1. Genesis block special check
      if (i === 0) {
        if (currentBlock.previousHash !== '0') {
          return {
            isValid: false,
            brokenBlockIndex: 0,
            errorMessage: 'Genesis block previous hash is corrupted.',
            checkedBlocksCount: 1,
            verificationTimestamp: now,
          };
        }
      } else {
        const previousBlock = this.chain[i - 1];
        // 2. Validate chain link continuity
        if (currentBlock.previousHash !== previousBlock.hash) {
          return {
            isValid: false,
            brokenBlockIndex: i,
            errorMessage: `Linkage broken at Block #${i}: 'previousHash' (${currentBlock.previousHash.slice(
              0,
              10
            )}...) does not match Block #${i - 1} hash (${previousBlock.hash.slice(0, 10)}...).`,
            checkedBlocksCount: i + 1,
            verificationTimestamp: now,
          };
        }
      }

      // 3. Validate Merkle Root recalculation
      const calculatedMerkle = calculateMerkleRoot(currentBlock.transactions);
      if (currentBlock.merkleRoot !== calculatedMerkle) {
        return {
          isValid: false,
          brokenBlockIndex: i,
          errorMessage: `Data Tampering Detected in Block #${i}! Transactions were altered. Calculated Merkle root (${calculatedMerkle.slice(
            0,
            12
          )}...) does not match block header Merkle (${currentBlock.merkleRoot.slice(0, 12)}...).`,
          checkedBlocksCount: i + 1,
          verificationTimestamp: now,
        };
      }

      // 4. Validate Block Hash recalculation
      const recalculatedHash = currentBlock.calculateHash();
      if (currentBlock.hash !== recalculatedHash) {
        return {
          isValid: false,
          brokenBlockIndex: i,
          errorMessage: `Cryptographic Hash Mismatch at Block #${i}! Block data altered. Stored Hash: [${currentBlock.hash.slice(
            0,
            12
          )}...], Recalculated: [${recalculatedHash.slice(0, 12)}...].`,
          checkedBlocksCount: i + 1,
          verificationTimestamp: now,
        };
      }

      // 5. Validate Proof of Work difficulty
      const target = Array(currentBlock.difficulty + 1).join('0');
      if (currentBlock.hash.substring(0, currentBlock.difficulty) !== target) {
        return {
          isValid: false,
          brokenBlockIndex: i,
          errorMessage: `Proof-of-Work validation failed at Block #${i}! Hash does not meet difficulty target of ${currentBlock.difficulty} leading zeros.`,
          checkedBlocksCount: i + 1,
          verificationTimestamp: now,
        };
      }
    }

    return {
      isValid: true,
      brokenBlockIndex: null,
      errorMessage: null,
      checkedBlocksCount: this.chain.length,
      verificationTimestamp: now,
    };
  }

  /**
   * Tamper injection tool for demonstration & testing
   */
  public tamperBlockData(blockIndex: number, fakePayload: Record<string, any>): boolean {
    if (blockIndex < 0 || blockIndex >= this.chain.length) return false;
    const block = this.chain[blockIndex];
    if (block.transactions.length > 0) {
      block.simulateTamper({ payload: fakePayload });
      return true;
    }
    return false;
  }

  /**
   * Retrieve complete lifecycle journey for a specific Batch ID
   */
  public getBatchHistory(batchId: string): {
    block: Block;
    transaction: BlockchainTransaction;
  }[] {
    const history: { block: Block; transaction: BlockchainTransaction }[] = [];
    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.batchId.toLowerCase() === batchId.toLowerCase()) {
          history.push({ block, transaction: tx });
        }
      }
    }
    return history;
  }

  /**
   * Smart Contract validation: evaluates cold-chain temperature thresholds
   */
  public evaluateSmartContract(batch: FoodBatch, readingTemp: number): {
    violation: boolean;
    reason?: string;
    action?: string;
  } {
    if (readingTemp > batch.maxSafeTemp) {
      const diff = (readingTemp - batch.maxSafeTemp).toFixed(1);
      return {
        violation: true,
        reason: `Cold Chain SLA breached: Temperature spiked to ${readingTemp}°C (+${diff}°C above max allowed ${batch.maxSafeTemp}°C)`,
        action: 'Automated 15% SLA penalty applied to transporter escrow smart contract.',
      };
    }
    if (readingTemp < batch.minSafeTemp) {
      const diff = (batch.minSafeTemp - readingTemp).toFixed(1);
      return {
        violation: true,
        reason: `Sub-zero thermal violation: Temperature fell to ${readingTemp}°C (-${diff}°C below min safe ${batch.minSafeTemp}°C)`,
        action: 'Automated quality flag triggered; mandatory inspection required at destination.',
      };
    }
    return { violation: false };
  }
}
