# 22 Boutique Hotel — Splash Screen & Dedicated Home Landing Plan

Adding a luxury initial splash screen and an editorial boutique hotel Home Landing page (`/home`), fully integrated into 22 Boutique Hotel with quick jump to the operations dashboard.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following directions were confirmed from your answers:
> - **Navigation Architecture**: Dedicated Home Landing page (`/home`) with prominent quick-jump action to the Front Desk Operations Dashboard (`/`). The App Sidebar and Top Bar will include direct navigation to Home.
> - **Splash Screen Timing**: Appears on initial app load (first session load) with an elegant auto-transition and an immediate "Skip to Hotel" / "Enter Dashboard" affordance, stored in `sessionStorage` so it doesn't interrupt routine navigation. A manual "Preview Splash Screen" trigger will also be available in the Top Bar and Home page.
> - **Content & Aesthetic Focus**: Boutique luxury hotel welcome, cinematic imagery (hotel facade/lobby, signature suites, amenities), live occupancy snapshot badge, curated suite showcase with rates and capacity, luxury amenities preview, and one-click quick actions (e.g. "Open Front Desk", "Create Reservation", "View Room Rack").

---

### 1. Overview & Core Concept

- **What It Does**:
  1. **Luxury Splash Screen**: A high-end opening sequence featuring the gilded 22 Boutique Hotel crest, delicate glowing halo, hotel title typography, and a progress indicator that fades smoothly into the app, with an instant skip button for busy front-desk operators.
  2. **Dedicated Home Page (`/home`)**: An editorial showcase of 22 Boutique Hotel. It merges aesthetic hospitality storytelling (hero showcase, signature suites, amenities, concierge highlights) with immediate operator utility (live occupancy summary card, quick action buttons to create bookings, view calendar, or jump straight to daily operations).
- **Target Audience / Persona**: Hotel managers, front desk staff, VIP concierges, and guests/investors experiencing the hotel's digital portal.
- **Key Value**: Replaces the abrupt jump straight into data tables with a warm, prestigious entrance while preserving instant access to operational tools.

---

### 2. User Experience & Visual Design

#### A. Key User Flows
1. **First Arrival**:
   - Operator or visitor opens the application.
   - The **Luxury Splash Screen** displays on an obsidian backdrop with the 22 gold crest, subtle fade-in animation, subtitle *"Timeless Hospitality · Curated Luxury"*, and a gold progress bar.
   - User can either let it auto-advance (~2.2s) or tap **"Enter Hotel" / "Skip"** immediately.
2. **Home Landing Experience (`/home`)**:
   - **Hero Section**: Full-width cinematic banner featuring the hotel's grand facade/atrium, editorial serif headline *"Where Classic Grandeur Meets Contemporary Serenity"*, live hotel status snippet (e.g. *"18 of 22 Rooms Available · Front Desk Active"*), and primary CTAs: *"Go to Front Desk Dashboard"* and *"New Reservation"*.
   - **Quick Action Command Strip**: 4 clean, single-line cards for rapid workflow execution (Create Booking, Room Rack / Calendar, Guest Directory, Hotel Settings).
   - **Signature Suites Spotlight**: Highlighting the hotel's curated room tiers (Presidential Grand Suite, Royal Penthouse, Deluxe Garden Suite, Heritage Suite) with capacity, amenities, nightly rates, and instant *"Book This Suite"* action that pre-selects the room type in the reservation modal.
   - **Curated Boutique Amenities**: Architectural bento grid detailing Fine Dining & Wine Cellar, Private Spa & Wellness, Chauffeur & Valet, and Bespoke Concierge.
   - **Hotel Story & Operator Quote**: Quote from General Manager Celine Laurent on boutique hospitality standards.
   - **Direct Jump to Operations Banner**: Sleek footer banner encouraging staff to switch to front-desk mode anytime.

#### B. Visual Identity & Theme
- **Aesthetic Direction**: Warm obsidian, brushed champagne gold (`#C99B3D`), deep forest/charcoal undertones, and warm parchment surfaces.
- **Color Palette & Mood**:
  - Dominant Neutral: Clean card surfaces with dark mode optical compensation and crisp hairline borders (`border-border/70`).
  - Accent: Gilded gold tokens and primary accent defined in `settings.accentColor`.
  - Contrast: WCAG AA compliant typography (white/cream text over dark overlays with measured gradient scrims).
- **Typography & Hierarchy**:
  - Display/Hero: Luxurious serif styling for titles (`font-serif`, tracking-tight) paired with `Instrument Sans` / `Plus Jakarta Sans` for body copy.
  - Tabular Numbers: All room rates, occupancy percentages, and inventory counts formatted with `tabular-nums`.
- **Anti-Slop Discipline**:
  - Zero pill enclosures for static metadata (amenities separated by quiet `·` dots).
  - No fake AI scores or arbitrary innovation bars.
  - No broken images — all photography generated via `generate_image` with resilient fallback containers.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Session-Based Splash Display vs Persistent Interruption**:
  - *Chosen Approach*: Track splash display in `sessionStorage` (`hotel_splash_shown`). When the user first visits the app, the splash runs once. Refreshing or switching tabs maintains seamless work unless the user clicks "Replay Splash Screen" in the TopBar or Home page.
  - *Why*: Balances luxury brand ambiance with front-desk operational efficiency so staff aren't delayed during rapid check-ins.
- **Decision 2: Route Placement (`/home` vs `/`)**:
  - *Chosen Approach*: Add `/home` as a dedicated landing page route, keeping `/` as the primary operational dashboard, with a prominent "Home" item at the top of the sidebar navigation and a banner in both views for effortless one-click switching.
  - *Why*: Preserves all existing bookmarks, tests, and operational workflows while fulfilling the exact request of a dedicated Home Landing page.

---

### 4. Technical Architecture & Component Mapping

```
┌────────────────────────────────────────────────────────┐
│                   __root.tsx / Shell                   │
│  - Mounts SplashScreen overlay (controlled by state)   │
│  - TopBar with "Replay Splash" & Home breadcrumb       │
│  - AppSidebar with new "Home" navigation item          │
└──────────────────────────┬─────────────────────────────┘
                           │
       ┌───────────────────┴───────────────────┐
       ▼                                       ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│        /routes/home.tsx      │ │        /routes/index.tsx     │
│   (Dedicated Home Landing)   │ │    (Front Desk Operations)   │
├──────────────────────────────┤ ├──────────────────────────────┤
│ • HeroBanner + Live Status   │ │ • Live KPI Stat Bar          │
│ • Quick Actions Command Strip│ │ • Analytics & Data Visuals   │
│ • Signature Suites Showcase  │ │ • Front Desk Arrivals/Depart │
│ • Boutique Amenities Bento   │ │ • Recent Activity Stream     │
│ • "Open Dashboard" Action    │ │ • Quick Reservation Triggers │
└──────────────────────────────┘ └──────────────────────────────┘
```

#### Detailed File & Component Plan:
1. **Asset Generation (`generate_image`)**:
   - `home_hotel_hero`: Panoramic luxury boutique hotel entrance and architectural lobby with warm ambient chandeliers (`16:9`).
   - `suite_presidential`: Sumptuous presidential boutique suite with king bed, marble fireplace, and floor-to-ceiling balcony view (`4:3`).
   - `suite_deluxe`: Elegant deluxe room with velvet armchairs and warm boutique lighting (`4:3`).
   - `amenities_dining_spa`: Boutique fine-dining restaurant and luxury cellar lounge (`4:3`).
2. **Components**:
   - `src/components/brand/SplashScreen.tsx`: Reusable splash screen component with gold monogram crest, progress animation, auto-dismiss, and Skip button.
   - `src/routes/home.tsx`: TanStack route for `/home` with complete hero, suites showcase, amenities bento, quick action bar, and guest review highlights.
   - Update `src/routes/__root.tsx`: Mount the splash screen check and overlay.
   - Update `src/components/layout/AppSidebar.tsx`: Add "Home" to navigation with icon `Sparkles` or `Home`.
   - Update `src/components/layout/TopBar.tsx`: Add quick link / splash preview button in dropdown.
   - Update `src/i18n/en.ts` and `tr.ts`: Add localized strings for `"nav.home"`, splash captions, and home section titles.

---

### 5. Verification Plan

1. **Compilation Check**: Run `compile_applet` to confirm TanStack Router type safety, clean imports, and zero TypeScript errors.
2. **Splash Screen Verification**:
   - Initial load presents the splash screen with smooth exit animation.
   - "Skip" immediately advances to the app.
   - Replay trigger from the TopBar allows viewing it on demand.
3. **Home Page (`/home`) Verification**:
   - Route loads cleanly with high-resolution imagery and fallback containers.
   - "Go to Operations Dashboard" switches seamlessly to `/`.
   - "New Reservation" opens the existing modal with working form validation.
   - Suite showcase allows clicking to view room details or reserve.
