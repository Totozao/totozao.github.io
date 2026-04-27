<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isModalVisible"
        class="fixed inset-0 z-[49] overflow-hidden flex h-screen w-screen items-center justify-center bg-black/60 backdrop-blur-md p-4"
      >
        <div
          class="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[90vh]"
        >
          <div
            class="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-purple-600/5 pointer-events-none rounded-2xl"
          ></div>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { watch } from "vue";

const { isModalVisible } = defineProps<{
  isModalVisible: boolean;
}>();

watch(
  () => isModalVisible,
  (newValue) => {
    if (newValue) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  },
);
</script>

<style>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95) translateY(10px);
}
</style>
