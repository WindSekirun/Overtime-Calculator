# Overtime Calculator

## Project Overview
**Overtime Calculator** is a modern web-based application designed to help users calculate their overtime pay, tailored for the Korean working environment. It helps estimate extra earnings based on basic pay and working hours (regular, overtime, night, holiday).

**Key Features:**
*   **Overtime Calculation:** Calculates pay based on standard working hours (40h/week) and legal limits (52h/week).
*   **Minute-based Precision:** All time calculations are performed in minutes (integer) to avoid floating-point errors.
*   **Real-time Counter:** Displays a "money earning" effect that increments in real-time based on the hourly wage.
*   **Smooth Animations:** Uses **GSAP** for smooth number transitions.
*   **Data Persistence:** Saves monthly data locally using `localStorage` (Migrated to V3 format).

## Tech Stack
*   **Framework:** Vue.js 3.5 (Composition API with `<script setup>`)
*   **Build Tool:** Vite 5
*   **UI Library:** Vuetify 3
*   **Language:** TypeScript 5
*   **State Management:** Pinia 2
*   **Animation:** GSAP
*   **Date Handling:** Luxon
*   **Markdown:** Marked

## Getting Started

### Prerequisites
*   Node.js (LTS recommended)
*   npm

### Installation
```bash
npm install
```

### Development
Start the local development server (Vite):
```bash
npm run dev
```
Access the app at `http://localhost:5173` (default Vite port).

### Build
Build the project for production:
```bash
npm run build
```

### Linting
Lint and fix files:
```bash
npm run lint
```

## Architecture & Conventions

### Component Style
This project uses the **Vue 3 Composition API** with `<script setup>` syntax.
*   **Reactivity:** Uses `ref`, `computed`, and `watch`.
*   **Props/Emits:** Typed using `defineProps` and `defineEmits`.

**Example:**
```typescript
<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{ value: number }>()
const count = ref(0)

const double = computed(() => count.value * 2)
</script>
```

### State Management (Pinia)
State is managed using Pinia stores (`src/store/store.ts`).
*   **Access:** `useStore()` gives access to the store.
*   **Destructuring:** Use `storeToRefs(store)` when destructuring reactive state to maintain reactivity.
*   **Persistence:** The store handles saving/loading data to `localStorage`.
*   **Migration:** Includes logic to migrate old Vue 2 data formats to the new minute-based V3 format.

### Time Calculation Standard
*   **Internal Logic:** All calculations are done in **minutes** (Integer).
    *   e.g., 1 hour 30 minutes = `90`
*   **Display:** Converted to `Xh Ym` format for UI.
*   **Input:** The `TimeInput` component handles the conversion between user input (Hours/Minutes) and internal minute values.

### Key Files
*   **`vite.config.ts`**: Vite configuration (plugins, aliases).
*   **`src/main.ts`**: App entry point (Pinia, Router, Vuetify setup).
*   **`src/components/Calculator.vue`**: Main logic and UI. Handles the real-time wage counter and GSAP animations.
*   **`src/components/TimeInput.vue`**: Reusable component for inputting time (Hours/Minutes) with white text styling.
*   **`src/store/store.ts`**: Business logic for overtime calculation and data storage.
*   **`src/model/result.ts`**: Helper classes for building the calculation breakdown text.