<script setup lang="ts">
import type { IPlayer } from "~/models/playerInfo";

const { player } = defineProps<{
  player: IPlayer;
}>();

const emits = defineEmits<{
  (e: "removePlayer", playerId: string): void;
}>();
</script>

<template>
  <div class="w-full flex justify-between">
    <h3>{{ player.name }}</h3>
    <button class="cursor-pointer" @click="emits('removePlayer', player.id)">
      <SharedUiIcon icon="cross"></SharedUiIcon>
    </button>
  </div>
</template>
