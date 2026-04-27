<script setup lang="ts">
const { options, label } = defineProps<{
  options: {
    label: string;
    value: string;
  }[];
  label?: string;
}>();

const DropDownId = `dropdown-${Math.random().toString(36).substring(2, 9)}`;
const model = defineModel<string>();
</script>

<template>
  <div class="flex flex-col gap-2 w-full">
    <ClientOnly>
      <label v-if="label" :for="DropDownId" class="text-sm font-medium text-neutral-400 ml-1">{{ label }}</label>
      <div class="relative">
        <select 
          :id="DropDownId" 
          :name="DropDownId" 
          v-model="model"
          class="w-full appearance-none outline-none bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all cursor-pointer hover:border-neutral-700 shadow-inner"
        >
          <option
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            class="bg-neutral-900 text-neutral-200"
          >
            {{ option.label }}
          </option>
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>
