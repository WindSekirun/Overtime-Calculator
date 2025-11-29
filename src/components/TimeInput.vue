<template>
  <div class="d-flex align-center">
    <v-text-field
      v-model.number="hours"
      :label="label"
      type="number"
      class="me-2"
      hide-details
      variant="outlined"
      suffix="시간"
      @update:model-value="updateValue"
    />
    <v-text-field
      v-model.number="minutes"
      label="분"
      type="number"
      hide-details
      variant="outlined"
      suffix="분"
      @update:model-value="updateValue"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue'

const props = defineProps<{
  modelValue: number
  label: string
}>()

const emit = defineEmits(['update:modelValue'])

const hours = ref(0)
const minutes = ref(0)

watch(() => props.modelValue, (val) => {
  hours.value = Math.floor(val / 60)
  minutes.value = val % 60
}, { immediate: true })

function updateValue() {
  let h = Number(hours.value)
  let m = Number(minutes.value)
  if (isNaN(h)) h = 0
  if (isNaN(m)) m = 0
  emit('update:modelValue', (h * 60) + m)
}
</script>
