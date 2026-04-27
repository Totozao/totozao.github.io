<script setup lang="ts">
import { type ToastMessage } from "~/composables/useToast";

const props = defineProps<{
  toast: ToastMessage;
}>();

const emit = defineEmits(["close"]);

const typeClasses = computed(() => {
  switch (props.toast.type) {
    case "success":
      return "bg-green-500/10 border-green-500/50 text-green-400";
    case "error":
      return "bg-red-500/10 border-red-500/50 text-red-400";
    case "warning":
      return "bg-amber-500/10 border-amber-500/50 text-amber-400";
    case "info":
    default:
      return "bg-blue-500/10 border-blue-500/50 text-blue-400";
  }
});
</script>

<template>
  <div
    class="flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg transition-all"
    :class="typeClasses"
  >
    <div class="flex-1 min-w-0">
      <h4
        v-if="toast.title"
        class="font-semibold text-sm text-wrap mb-1 text-white"
      >
        {{ toast.title }}
      </h4>
      <p class="text-sm font-medium">{{ toast.message }}</p>
    </div>
    <button
      @click="emit('close')"
      class="text-gray-400 hover:text-white transition-colors"
      aria-label="Close"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  </div>
</template>
