# Implementation Plan: Rebuilding ResrvLab — Smart Equipment Reservation & Tracking

We will build the **ResrvLab** web application from the ground up inside the existing React + Vite + TypeScript + Tailwind workspace. The project currently has all setup configurations, lockfiles, and dependencies (including shadcn, Radix, Lucide-React, Recharts, and QR library) ready, but the source files (`src/`) are missing.

We will create a premium, visually stunning, fully functional reservation, tracking, and analytics hub for modern laboratories.

---

## Design System & Aesthetics (Premium & Modern)

To ensure a "Wow" factor and premium feel, we will use a **futuristic dark mode theme** by default (with elegant purple, cyan, and emerald accents):
*   **Color Palette**:
    *   *Background*: Deep charcoal and obsidian (`#0b0f19`, `#111827`)
    *   *Primary Accents*: Electric Cyan (`#06b6d4`), Neon Emerald (`#10b981`), and High-Energy Magenta (`#d946ef`)
    *   *Card / Panels*: Glassmorphism panels (`backdrop-blur-md bg-white/5 border border-white/10`)
*   **Typography**: Using Google Fonts *Inter* and *Space Grotesk* (preconfigured in `index.html`).
*   **Animations**: Continuous QR scanning beams, smooth hover transitions, pulse indicators for active machines, and clean tab transitions.

---

## Core Application Modules

### 1. Dashboard (Real-Time Tracking & Analytics)
*   **KPI Cards**: Equipment utilization rate, active bookings today, maintenance alerts, and active lab hours.
*   **Utilization Analytics**: Recharts Bar and Line charts displaying equipment usage over the week and bookings by equipment categories (Imaging, Analytical, Preparation, etc.).
*   **Live Equipment Feed**: A sidebar showing which equipment is currently "In Use", who is using it, and the remaining time.

### 2. Equipment Catalog (Interactive & Detailed)
*   **Live Catalog**: Visual grid of lab machines with category filtering, search, and availability states (`Available`, `In Use`, `Reserved`, `Maintenance`).
*   **Equipment Details Modal**: Deep details about specs, manuals, safety guidelines, and active bookings list.
*   **Actions**: "Reserve Now" or "Check In/Out via QR Code".

### 3. Smart Booking Calendar (Interactive Scheduling)
*   **Visual Planner**: Interactive slot booking calendar avoiding double-bookings.
*   **Form**: Reservation title/project name, slot selection, user profile (Admin, Researcher, Student).
*   **Conflict Prevention**: Instant validation checks to ensure no two researchers reserve the same time-frame.

### 4. QR Code Check-In & Check-Out (Simulated/Interactive Scanner)
*   **QR Generator**: Each equipment detail card provides a downloadable and viewable QR code.
*   **Interactive Scanner**: A simulated scanner that utilizes an input camera mockup (or standard device webcam, falling back to an elegant file/mock scanner) to read the equipment QR code.
*   **Actions**: Instantly transitions equipment state (e.g., marks `Available` -> `In Use` or `In Use` -> `Available` with a celebratory check-in micro-animation).

### 5. Admin & Management View
*   **Activity Logs**: Audit trail of who booked what and when.
*   **Equipment CRUD**: Ability to add new equipment, toggle maintenance mode, or edit parameters.

---

## Proposed Changes

We will create a structured source tree within `d:\DHAWAL\Projects\smart-booking-hub-main\smart-booking-hub-main`:

```
smart-booking-hub-main/
└── src/
    ├── main.tsx             <- React entry point
    ├── index.css            <- CSS styling and Tailwind setup
    ├── App.tsx              <- App Router, Theme Provider, and State
    ├── lib/
    │   └── utils.ts         <- Standard shadcn styling utility
    ├── components/
    │   ├── ui/              <- Premium custom reusable components
    │   │   ├── button.tsx
    │   │   ├── dialog.tsx
    │   │   ├── tabs.tsx
    │   │   └── select.tsx
    │   ├── Dashboard.tsx    <- KPI metrics & Recharts graphs
    │   ├── Catalog.tsx      <- Grid view of equipment + filtering
    │   ├── Calendar.tsx     <- Booking slot manager
    │   ├── Scanner.tsx      <- Live camera mockup & QR check-in
    │   └── Admin.tsx        <- Maintenance controls & audit logs
    └── data/
        └── initialData.ts   <- Seed data for lab equipment & mock users
```

### File Details

#### [NEW] [index.css](file:///d:/DHAWAL/Projects/smart-booking-hub-main/smart-booking-hub-main/src/index.css)
Sets up Tailwind base directives and defines the custom neon colors, variables for glassmorphism panels, and the glowing animations.

#### [NEW] [main.tsx](file:///d:/DHAWAL/Projects/smart-booking-hub-main/smart-booking-hub-main/src/main.tsx)
Launches the React application and binds it to `#root`.

#### [NEW] [utils.ts](file:///d:/DHAWAL/Projects/smart-booking-hub-main/smart-booking-hub-main/src/lib/utils.ts)
Vite shadcn/ui custom CSS class combiner.

#### [NEW] [initialData.ts](file:///d:/DHAWAL/Projects/smart-booking-hub-main/smart-booking-hub-main/src/data/initialData.ts)
Pre-populated mock laboratory equipment (e.g., NMR Spectrometer, Ultracentrifuge) and existing reservations to give the application realistic activity on first run.

#### [NEW] [App.tsx](file:///d:/DHAWAL/Projects/smart-booking-hub-main/smart-booking-hub-main/src/App.tsx)
Handles global application state (active user session, full lists of bookings, and equipment states) persisted gracefully to `localStorage` so check-ins and new bookings survive page refreshes.

#### [NEW] [Dashboard.tsx](file:///d:/DHAWAL/Projects/smart-booking-hub-main/smart-booking-hub-main/src/components/Dashboard.tsx)
Houses the analytical views, utilization rates, Recharts time-graphs, and a live tracking drawer for ongoing sessions.

#### [NEW] [Catalog.tsx](file:///d:/DHAWAL/Projects/smart-booking-hub-main/smart-booking-hub-main/src/components/Catalog.tsx)
Displays equipment items, details, and handles the direct transition to QR scanner or booking form.

#### [NEW] [Calendar.tsx](file:///d:/DHAWAL/Projects/smart-booking-hub-main/smart-booking-hub-main/src/components/Calendar.tsx)
Interactive timeline scheduler with built-in conflict checking.

#### [NEW] [Scanner.tsx](file:///d:/DHAWAL/Projects/smart-booking-hub-main/smart-booking-hub-main/src/components/Scanner.tsx)
Mock camera and real camera scanning engine that links QR readouts to lab check-in/out workflows.

---

## Verification Plan

### Automated Build Verification
1.  **Vite Bundle Build**:
    We will trigger `npm run build` in the workspace to verify there are no TypeScript errors or bundler incompatibilities.

### Manual Verification
1.  **Start Development Server**:
    We will launch the dev server with `npm run dev` and ensure it runs flawlessly on port 8080.
2.  **App Interface Review**:
    *   Verify dark mode aesthetics, glow accents, and responsive typography.
    *   Perform a test booking to verify it prevents overlays and updates the state successfully.
    *   Simulate a QR Code Scan on the "Ultra-Centrifuge" and ensure the catalog and live session updates automatically.
