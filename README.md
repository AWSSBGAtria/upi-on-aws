# UPI on AWS

> **Architectural Digital Twin: India's Unified Payments Interface Reimagined on Amazon Web Services**

[![AWS Architecture](https://img.shields.io/badge/AWS-Cloud_Architecture-232F3E?style=flat-square&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL_3D-000000?style=flat-square&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Region](https://img.shields.io/badge/Region-ap--south--1_(Mumbai)-FF9900?style=flat-square&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/)

---

## Executive Summary

**UPI on AWS** is an interactive, cinematic 3D digital twin of a nationwide, high-throughput instant payment network modeled on AWS cloud-native primitives.

India's Unified Payments Interface (UPI) handles billions of transactions monthly, demanding ultra-low latency, strict zero-trust security, resilient multi-Availability Zone (Multi-AZ) durability, and near-infinite scalability. This project visualizes what that distributed payment infrastructure looks like when expressed through AWS managed services—spanning edge routing, cryptographic verification, serverless execution, asynchronous queuing, distributed ledgers, and real-time observability.

---

## Key Architecture & Design Principles

```
                                          +---------------------------------------------+
                                          |            AWS ap-south-1 (Mumbai)          |
+-------------------+                     |                                             |
|   Payer / Payee   |  HTTPS / TLS 1.3    |  +------------------+   +----------------+  |
|    Mobile App     | ------------------->|  | Amazon CloudFront|-->| Amazon Route 53|  |
+-------------------+                     |  +------------------+   +----------------+  |
                                          |           |                     |           |
                                          |           v                     v           |
                                          |  +---------------------------------------+  |
                                          |  |                AWS WAF                |  |
                                          |  +---------------------------------------+  |
                                          |                      |                      |
                                          |                      v                      |
                                          |  +---------------------------------------+  |
                                          |  |          Amazon API Gateway           |  |
                                          |  +---------------------------------------+  |
                                          |           |              |       |          |
                                          |           v              |       |          |
                                          |  +------------------+    |       |          |
                                          |  |  Amazon Cognito  |<---+       |          |
                                          |  +------------------+            |          |
                                          |           |                      |          |
                                          |           v                      v          |
                                          |  +------------------+   +----------------+  |
                                          |  |     AWS KMS      |   |   AWS Lambda   |  |
                                          |  +------------------+   +----------------+  |
                                          |           ^                      |          |
                                          |           |                      v          |
                                          |           |             +----------------+  |
                                          |           |             |   Amazon SQS   |  |
                                          |           |             +----------------+  |
                                          |           |                      |          |
                                          |           |                      v          |
                                          |  +---------------------------------------+  |
                                          |  |            Amazon DynamoDB            |  |
                                          |  +---------------------------------------+  |
                                          |                      |                      |
                                          |                      v                      |
                                          |  +---------------------------------------+  |
                                          |  |        Settlement Core Engine         |  |
                                          |  |      (AWS Step Functions + DDB)       |  |
                                          |  +---------------------------------------+  |
                                          |                      |                      |
                                          |  +---------------------------------------+  |
                                          |  | Observability: CloudWatch · X-Ray     |  |
                                          |  +---------------------------------------+  |
                                          +---------------------------------------------+
```

### 1. Zero-Trust Security & Perimeter Defense
- **Perimeter Filtering**: **AWS WAF** blocks volumetric attacks, suspicious IP CIDRs, and protocol anomalies before requests reach private VPC boundaries.
- **Identity & Authentication**: **Amazon Cognito** handles actor authentication, token issuance, device fingerprinting, and certificate-backed 2FA challenges.
- **Cryptographic Boundary**: **AWS KMS** manages Customer Managed Keys (CMKs) in FIPS 140-3 validated hardware security modules (HSMs) for envelope encryption of payment payloads.

### 2. Elastic Edge & API Routing
- **Global Ingress**: **Amazon CloudFront** terminates TLS close to end-users via low-latency Anycast Points of Presence (PoPs).
- **DNS & Failover**: **Amazon Route 53** provides latency-based DNS resolution and automated health-check failover across redundant gateway endpoints.
- **API Management**: **Amazon API Gateway** orchestrates regional throttling, request validation, mutual TLS (mTLS), and decoupled microservice routing.

### 3. Asynchronous, Resilient Processing
- **Serverless Compute**: **AWS Lambda** executes isolated payment validation, routing rules, and fee computation with sub-second auto-scaling.
- **Backpressure & Decoupling**: **Amazon SQS** absorbs traffic surges, guarantees FIFO delivery where needed, and protects downstream ledger writes from brownouts.

### 4. Distributed Ledger & Orchestration
- **Single-Digit Millisecond Ledger**: **Amazon DynamoDB** with multi-AZ replication records payment intents, state transitions, and audit logs.
- **Settlement Finality**: Orchestrated through **AWS Step Functions** and DynamoDB transactional writes (`TransactWriteItems`) ensuring atomic debit/credit settlement with automated rollback.

### 5. Unified Telemetry & Tracing
- **Metrics & Alarms**: **Amazon CloudWatch** provides real-time visibility into TPS, p99 latencies, throttle events, and error budgets.
- **Distributed Tracing**: **AWS X-Ray** correlates requests end-to-end with distributed trace IDs from edge ingestion to settlement.
- **Operational Intelligence**: **Amazon QuickSight** delivers aggregate analytical insights and volume trends.

---

## AWS Service Mapping Matrix

| Layer | Functional Component | AWS Service | Architectural Role | Latency Profile |
| :--- | :--- | :--- | :--- | :--- |
| **Edge** | CDN / PoP Ingress | **Amazon CloudFront** | Anycast edge TLS termination, origin shielding, read caching | 8–18 ms |
| **Edge** | Global DNS & Failover | **Amazon Route 53** | Latency routing and multi-AZ health-check redirection | 4–12 ms |
| **Security** | Perimeter Firewall | **AWS WAF** | Layer 7 request inspection, rate limiting, and bot control | 1–3 ms |
| **API** | Regional API Front Door | **Amazon API Gateway** | Endpoint routing, request validation, authentication hook | 6–15 ms |
| **Security** | Identity & Credentials | **Amazon Cognito** | PSP authentication, device tokens, and 2FA verification | 12–28 ms |
| **Security** | Key Management & Crypto | **AWS KMS** | Envelope encryption, payload signing, and HSM protection | 3–8 ms |
| **Compute** | Business Logic Compute | **AWS Lambda** | Stateless transaction authorization, validation, and posting | 8–22 ms |
| **Messaging**| Ingestion & Buffer Queue | **Amazon SQS** | Elastic decoupling, surge absorption, dead-letter queuing | Managed Buffer |
| **Ledger** | Distributed Storage | **Amazon DynamoDB** | Partitioned transaction state, balances, and idempotency store | 4–12 ms |
| **Settlement**| Transaction Orchestration | **AWS Step Functions** | Multi-party debit/credit workflows and compensating transactions | 15–40 ms |
| **Telemetry**| Metrics & Logging | **Amazon CloudWatch** | Centralized time-series metrics, access logs, and alarm triggers | Real-time / 1s |
| **Telemetry**| Request Tracing | **AWS X-Ray** | Cross-service distributed trace stitching and flame graphs | Continuous |
| **Analytics**| Business Intelligence | **Amazon QuickSight** | Transaction volume analytics and financial dashboarding | Batch / SPICE |

---

## Interactive Capabilities

The platform delivers a 3D digital twin with hardware-accelerated WebGL rendering:

- **Spatial Architecture Exploration**: Free-orbit, pan, and zoom camera navigation around the cloud topology.
- **Component Deep Dive**: Interactive selection of individual AWS nodes displaying operational metrics, connection topologies, and latency specifications.
- **Simulations**:
  - **Single Payment Flow**: Trace an end-to-end transaction through client, edge, security, compute, queue, ledger, and settlement.
  - **High-Traffic Surge**: Simulates traffic spikes and visualizes how SQS and auto-scaling compute absorb concurrency.
  - **Multi-AZ Failover**: Demonstrates regional resilience across `ap-south-1a`, `ap-south-1b`, and `ap-south-1c` during availability zone degradation.
  - **Distributed Trace Mode**: Inspects the hop-by-hop latency and tracing paths through AWS X-Ray.
- **Real-Time Telemetry HUD**: Live metrics dashboard tracking simulated RPS, active transactions, p99 latency, success rate, and queue depth.
- **Guided Architectural Story**: Structured multi-part narrative walking through the design decisions of a national-scale payment system.

---

## Technology Stack

- **Core Framework**: [React 19](https://react.dev/) + [TanStack Start](https://tanstack.com/start) / [TanStack Router](https://tanstack.com/router)
- **3D & Graphics Engine**: [Three.js](https://threejs.org/) + [@react-three/fiber](https://r3f.docs.pmnd.rs/) + [@react-three/drei](https://github.com/pmndrs/drei)
- **Post-Processing & Shaders**: [@react-three/postprocessing](https://github.com/pmndrs/react-postprocessing) (Bloom, Depth of Field, Vignette)
- **Animation & Transitions**: [GSAP](https://greensock.com/gsap/) + WebGL custom render loop
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Styling & UI**: [Tailwind CSS v4](https://tailwindcss.com/) + [Radix UI Primitives](https://www.radix-ui.com/) + [Lucide Icons](https://lucide.dev/)
- **Build System**: [Vite](https://vite.dev/)

---

## Getting Started

### Prerequisites

- **Node.js**: `v20.x` or `v22.x` (recommended)
- **Package Manager**: `npm` (v10+) or `bun`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AWSSBGAtria/upi-on-aws.git
   cd upi-on-aws
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   Open [http://localhost:8080](http://localhost:8080) in a WebGL-compatible modern browser (Chrome, Firefox, Edge, or Safari).

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server on `0.0.0.0:8080` with application environment wrappers |
| `npm run build` | Compiles the production bundle with TypeScript validation and asset optimization |
| `npm run preview` | Starts a local server previewing the production build |
| `npm run preview:restart` | Restarts the background preview process on port `8081` |
| `npm run typecheck` | Runs the TypeScript compiler (`tsc --noEmit`) to verify type safety |
| `npm run lint` | Analyzes code for issues using ESLint |
| `npm run format` | Enforces uniform code formatting across the repository with Prettier |
| `npm test` | Executes unit tests covering scripts, auth invariants, and helpers |

---

## Repository Structure

```
upi-on-aws/
├── public/                     # Static assets, icons, and OpenGraph metadata
├── scripts/                    # Automation scripts (build, environment, smoke tests)
├── server/                     # Server middleware and handlers
├── src/
│   ├── components/
│   │   ├── experience/         # 3D canvas, Three.js scene, camera rig, shaders, nodes
│   │   └── overlay/            # 2D HUD, metrics display, navigation, telemetry panels
│   ├── lib/
│   │   ├── experience/         # Architecture definitions, simulation engines, state store
│   │   ├── auth/               # Authentication helpers & configuration
│   │   └── utils.ts            # Utility functions
│   ├── routes/
│   │   ├── __root.tsx          # Root layout shell
│   │   └── index.tsx           # Primary application route
│   ├── router.tsx              # Router configuration
│   └── styles.css              # Global styles & Tailwind CSS setup
├── startup.sh                  # Container startup script
├── tsconfig.json               # TypeScript compiler configuration
├── vite.config.ts              # Vite bundler configuration
└── package.json                # Project dependencies and script definitions
```

---

## Deployment

The application is structured for production deployment across modern hosting environments:

- **Vercel**: Pre-configured for deployment with TanStack Start nitro presets.
- **AWS Amplify / AWS ECS**: Can be packaged as a containerized Node service or hosted static bundle with an Application Load Balancer (ALB) or CloudFront distribution.

To create an optimized production build:
```bash
npm run build
```

---

## Architectural Disclaimer

This repository is an **educational architectural model and digital twin**. It provides an engineering reference pattern for designing high-volume, mission-critical distributed systems using AWS services. It is not affiliated with, endorsed by, or operated by the National Payments Corporation of India (NPCI).

---

## Organization & Acknowledgments

Developed by **AWS Student Building Group / AWS Cloud Club Atria** ([Atria Institute of Technology](https://atria.edu/)).

- GitHub: [@AWSSBGAtria](https://github.com/AWSSBGAtria)
- Repository: [AWSSBGAtria/upi-on-aws](https://github.com/AWSSBGAtria/upi-on-aws)

---

## License

This project is licensed under the [MIT License](LICENSE).
