<script setup lang="ts">
const { isModalVisible } = defineProps<{
  isModalVisible: boolean;
}>();

const emits = defineEmits<{
  (e: "closeModal"): void;
  (e: "addPlayer", playerName: string): void;
}>();

const playerName = ref<string>("");
</script>

<template>
  <SharedUiModal :isModalVisible="isModalVisible">
    <div
      class="rounded-[24px] relative flex flex-col gap-[12px] bg-white select-none p-[24px]"
    >
      <button
        class="absolute bg-[#7996FC] rounded-[12px] w-[32px] h-[32px] flex items-center justify-center top-0 right-[-48px] cursor-pointer"
        @click="emits('closeModal')"
      >
        <SharedUiIcon icon="cross"></SharedUiIcon>
      </button>
      <SharedUiInput label="Имя" v-model="playerName"></SharedUiInput>
      <SharedUiButton
        :disabled="!playerName"
        text="Добавить"
        @click="emits('addPlayer', playerName)"
      ></SharedUiButton>
    </div>
  </SharedUiModal>
</template>
