# 🌾 AgriLedger DLT — Smart Food Supply Chain Monitoring System

A responsive full-stack web application designed for cold-chain logistics and agricultural provenance monitoring across India using **Distributed Ledger Technology (DLT)**, **Proof-of-Work consensus**, **cryptographic SHA-256 hashing**, and **real-time IoT telematics**.

---

## 🌟 Key Capabilities & Architecture

### 1. ⛓️ Blockchain & DLT Engine (`/src/blockchain/`)
- **Cryptographic Hashing:** Pure synchronous SHA-256 (FIPS PUB 180-4 standard) calculating immutable block hashes and transaction Merkle roots.
- **Proof-of-Work (PoW):** Dynamic difficulty targeting leading zero hash prefixes with nonce incrementing.
- **Merkle Tree Verification:** Tree-structured transaction hashing allowing quick mathematical proofs of transaction validity.
- **Automated Smart Contract SLAs:** Evaluates temperature bounds in real-time. If perishable goods spike above $8^\circ\text{C}$ (or outside configured batch thresholds), smart contracts autonomously execute penalties and log permanent breach alerts to the ledger.
- **Tamper Detection & Verification:** Re-computes cryptographic hashes and chain pointers across all blocks. If any historical block data is modified or faked, the algorithm immediately isolates the corrupted block and flags the chain breach.

### 2. 🗺️ Live GPS Tracker Page (Interactive India Map)
- **Leaflet.js Map:** Centered on India with CartoDB Voyager styling.
- **Real-Time Simulation Engine:** Dynamically moves delivery trucks along predefined Indian logistics corridors:
  - **Himachal Pradesh → Delhi → Ahmedabad → Mumbai:** *Kinnaur Royal Apples (Cold Chain)*
  - **Anand (Gujarat) → Nashik → Solapur → Hyderabad:** *Organic A2 Milk (Cryogenic Reefer with simulated breach)*
  - **Kochi (Kerala) → Coimbatore → Bengaluru → Chennai:** *Malabar Deep-Sea Prawns (Deep Freeze)*
  - **Nagpur → Raipur → Sambalpur → Bhubaneswar → Kolkata:** *Mandarin Oranges (Store Delivered)*
  - **Sikkim → Siliguri → Patna → Lucknow:** *Organic Cardamom (Farm Registered)*
- **Geofenced Condition Alerts:**
  - Traversed GPS routes drawn in vibrant blue.
  - Pulsing red geofence circles highlight thermal violation zones (e.g., compressor trip at Nashik).
  - Truck marker click opens a responsive detail drawer displaying live coordinates, ambient temperature gauge, humidity, speed, and linked blockchain records.
  - Interactive "Simulate Compressor Failure (+11.8°C Spike)" button inside the map drawer.

### 3. 👥 Stakeholder Roles & Portals
- **🌱 Farmer / Producer Portal:**
  - Register fresh food batches with metadata: Commodity Name, Category, Origin GPS coordinates, Target Market, Harvest Date, Expiry Date, and Safe Temperature Envelope.
  - Mining creates a new verified block with digital signature and certificate.
  - Built-in one-click presets (Kinnaur Apples, Gir Vedic Ghee, Nashik Grapes).
- **🚚 Distributor / Transporter Portal:**
  - Telematics broadcast simulator: Current GPS latitude/longitude, temperature ($^\circ\text{C}$), humidity ($\% \text{RH}$), and highway speed ($\text{km/h}$).
  - Live warning banner if entered temperatures will trigger an automated smart contract SLA penalty.
  - Mines verified IoT telemetry blocks to the chain.
- **🏬 Retailer Portal:**
  - Store receiving inspection: Log arrival unloading temperature, inspect cold-chain compliance history, and assign freshness grade ($A+$, $A$, $B$, or $REJECTED$).
  - Appends delivery confirmation block, transitioning batch status to "At Store".
- **🔍 End Consumer Public Verification Page:**
  - Batch ID lookup and **Simulated Packaging QR Code Scanner** with camera viewfinder animation.
  - Complete, tamper-proof, block-by-block journey timeline from soil to supermarket shelf.
  - Authenticated blockchain provenance certificate with cryptographic signatures and cold-chain compliance report.

### 4. 🔬 Dedicated Ledger Explorer
- Inspect raw blocks, previous hashes, Merkle roots, nonces, difficulty targets, and transaction payloads.
- **"Verify Chain Integrity"** button re-computes all hashes live.
- **"Simulate Tamper"** interactive tool: Intentionally inject falsified sensor readings into any historical block and witness how cryptographic chain linking catches the unauthorized alteration.
- **"Reset Chain"** button to restore ledger to pristine genesis state.

---

## 🚀 Running the Project

The application dev server is running on:
**[http://localhost:3000/](http://localhost:3000/)**

To run manually or rebuild:

```powershell
# Prepend local portable Node if running in clean environment:
$env:PATH = "$pwd\.node;$env:PATH"

# Run development server
npm run dev

# Run production build
npm run build
```

---

## 🛠️ Tech Stack
- **Framework:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, Lucide Icons
- **Mapping:** Leaflet.js, CartoDB Voyager Basemap Tiles
- **Cryptography:** Native SHA-256 implementation, Merkle Root Engine
- **Visuals:** Canvas Confetti, Animated Radar & Geofence Rings
