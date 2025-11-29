<template>
  <div>
    <div class="d-flex align-center w-100" style="gap: 8px">
      <v-text-field
        v-model.number="hours"
        type="number"
        class="time-input-field text-white"
        hide-details
        variant="underlined"
        suffix="시간"
        color="white"
        base-color="white"
        hide-spin-buttons
        @update:model-value="updateValue"
      />
      <v-text-field
        v-model.number="minutes"
        type="number"
        hide-details
        class="time-input-field text-white"
        variant="underlined"
        base-color="white"
        color="white"
        suffix="분"
        hide-spin-buttons
        @update:model-value="updateValue"
      />
    </div>
    <div class="d-flex mt-2 w-100" style="gap: 8px">
      <v-chip
        v-for="btn in shortcutButtons"
        :key="btn.label"
        size="small"
        color="white"
        variant="outlined"
        class="flex-grow-1 justify-center"
        @click="addTime(btn.value)"
      >
        {{ btn.label }}
      </v-chip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from "vue";

const props = defineProps<{
  modelValue: number;
  label: string;
  shortcuts?: { label: string; value: number }[];
}>();

const emit = defineEmits(["update:modelValue"]);

const hours = ref(0);
const minutes = ref(0);

const defaultShortcuts = [
  { label: "+10분", value: 10 },
  { label: "+30분", value: 30 },
  { label: "+1시간", value: 60 },
  { label: "+2시간", value: 120 },
];

const shortcutButtons = props.shortcuts || defaultShortcuts;

watch(
  () => props.modelValue,
  (val) => {
    hours.value = Math.floor(val / 60);
    minutes.value = val % 60;
  },
  { immediate: true }
);

function updateValue() {
  let h = Number(hours.value);
  let m = Number(minutes.value);
  if (isNaN(h)) h = 0;
  if (isNaN(m)) m = 0;
  emit("update:modelValue", h * 60 + m);
}

function addTime(addMinutes: number) {
  let currentTotal = (Number(hours.value) || 0) * 60 + (Number(minutes.value) || 0);
  let newTotal = currentTotal + addMinutes;
  emit("update:modelValue", newTotal);
}
</script>

<style scoped>
:deep(.time-input-field) .v-field__suffix,
:deep(.time-input-field) .v-text-field__suffix {
  color: white !important;
  opacity: 1 !important;
}
:deep(.time-input-field) input {
  color: white !important;
}
</style>
