# TransitOps

TransitOps is a comprehensive, end-to-end Smart Transport Operations Platform built to digitize and streamline fleet operations. It is designed to replace manual logbooks and spreadsheets, addressing common logistics challenges such as scheduling conflicts, underutilized vehicles, missed maintenance, and inaccurate expense tracking.

## Overview

The platform provides a centralized system to manage the complete lifecycle of transport operations, featuring a robust Role-Based Access Control (RBAC) architecture, automated workflow state transitions, and real-time operational insights.

### Key Stakeholders Supported

- **Fleet Manager:** Oversees fleet assets, maintenance, vehicle lifecycles, and operational efficiency.
- **Driver:** Manages active deliveries and trip lifecycles.
- **Safety Officer:** Ensures driver compliance, tracks license validity, and monitors safety scores.
- **Financial Analyst:** Reviews operational expenses, fuel consumption, maintenance costs, and profitability metrics.

## Core Features

### 1. Authentication & Security

- Secure login with email and hashed passwords (using bcrypt).
- Role-Based Access Control (RBAC) to ensure users only access authorized modules.
- Protected API routes and middleware-level session validation.

### 2. Dashboard & Analytics

- High-level KPI tracking including Active Vehicles, Available Vehicles, Vehicles in Maintenance, and Fleet Utilization.
- Visual analytics using interactive charts.
- Advanced reporting metrics: Fuel Efficiency, Operational Cost per Vehicle, and Vehicle ROI.
- Export capabilities for financial and operational reports (CSV and PDF).

### 3. Vehicle Registry

- Master registry of fleet assets including unique registration numbers, max load capacities, and odometer readings.
- Document management for storing links to insurance and registration documents.
- Automated status management (Available, On Trip, In Shop, Retired).

### 4. Driver Management

- Comprehensive driver profiles including license categorization and contact information.
- Automated license tracking with automated system alerts for licenses expiring within 30 days.
- Safety score monitoring and driver status management (Available, On Trip, Off Duty, Suspended).

### 5. Trip Management & Dispatch

- Intelligent dispatching that enforces strict business rules:
  - Prevents dispatch of retired or in-shop vehicles.
  - Prevents dispatch of suspended drivers or drivers with expired licenses.
  - Validates cargo weight against the assigned vehicle's maximum load capacity.
- Automated state transitions: Dispatching a trip automatically marks the driver and vehicle as "On Trip"; completing or cancelling the trip automatically restores them to "Available".

### 6. Maintenance & Expense Tracking

- Integrated maintenance logging that automatically shifts vehicle status to "In Shop" and removes them from the available dispatch pool.
- Fuel logging and general expense tracking (tolls, repairs, etc.).
- Automated computation of total operational costs per vehicle.

## Technology Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Database:** Prisma ORM with SQLite (Development)
- **Styling:** Tailwind CSS
- **Authentication:** Custom Session Management with bcrypt
- **Validation:** Zod
- **Data Visualization:** Recharts
- **Exports:** jsPDF and jsPDF-AutoTable

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the environment variables:
   Copy `.env.example` to `.env` and configure your database connection string and session secrets.
4. Run database migrations and generate the Prisma client:
   ```bash
   npx prisma db push
   npx prisma generate
   ```
5. Seed the database with initial dummy data and roles:
   ```bash
   npx prisma db seed
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## License

This project is licensed under the MIT License.
