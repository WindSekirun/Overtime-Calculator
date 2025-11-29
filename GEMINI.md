# Overtime Calculator

## Project Overview
**Overtime Calculator** is a web-based application designed to help users calculate their overtime pay, specifically tailored for the Korean working environment (considering the abolition of the comprehensive wage system). It allows users to input their basic pay and working hours (regular, overtime, night, holiday) to estimate their extra earnings.

**Key Features:**
*   **Overtime Calculation:** Calculates pay based on standard working hours (40h/week) and legal limits (52h/week).
*   **Data Persistence:** Saves monthly data locally using `localStorage`.
*   **Data Migration:** Supports migration from older data formats.
*   **Release Notes:** Fetches and displays the latest release notes from GitHub.

## Tech Stack
*   **Framework:** Vue.js 2 (using Class-based API)
*   **UI Library:** Vuetify 2
*   **Language:** TypeScript
*   **State Management:** Pinia (with `PiniaVuePlugin` for Vue 2)
*   **Build Tool:** Vue CLI
*   **Date Handling:** Luxon
*   **Markdown:** Marked (for rendering release notes)

## Getting Started

### Prerequisites
*   Node.js
*   npm or yarn

### Installation
```bash
# Install dependencies
yarn install
# or
npm install
```

### Development
Start the local development server:
```bash
# Run on localhost:8080
yarn serve
# or
npm run serve
```

### Build
Build the project for production:
```bash
yarn build
# or
npm run build
```

### Linting
Lint and fix files:
```bash
yarn lint
# or
npm run lint
```

## Architecture & Conventions

### component Style
This project uses **Vue Class Component** and **Vue Property Decorator**. Components are defined as classes extending `Vue`.

**Example:**
```typescript
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: { ... },
})
export default class MyComponent extends Vue {
  // Data properties
  myValue = 0;

  // Computed properties
  get myComputed() { ... }

  // Methods
  myMethod() { ... }
}
```

### State Management (Pinia)
State is managed using Pinia. The store is defined in `src/store/store.ts`.
*   **Access:** `useStore()` provides access to the store instance.
*   **Persistence:** The store manually handles saving/loading data to `localStorage` (`OVERTIME_CALCULATOR_DATA_2`).

### Project Structure
*   `src/components/`: Vue components (Main logic is in `Calculator.vue`).
*   `src/model/`: TypeScript classes/interfaces defining the data domain (e.g., `Overtime`, `YearMonth`, `ReleaseInfo`).
*   `src/store/`: Pinia store definitions and localStorage logic.
*   `src/util/`: Utility functions for dates and number formatting.
*   `src/plugins/`: Vuetify configuration.

### Key Files
*   **`src/components/Calculator.vue`**: The primary component containing the UI and calculation display logic.
*   **`src/store/store.ts`**: Central store handling business logic for data retrieval, modification, and storage.
*   **`src/main.ts`**: Entry point, initializes Vue, Vuetify, and Pinia.
