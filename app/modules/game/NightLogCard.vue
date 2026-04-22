<script setup lang="ts">
import type { INightAction } from "~/models/playerInfo";

const { action } = defineProps<{
  action: INightAction;
}>();

const actionTypeDict = {
  kill: (playerName: string, causedBy: string) => {
    return `Была попытка убийства ${playerName} игроком - ${causedBy}`;
  },
  check: (playerName: string, causedBy: string) => {
    return `Была проведена проверка ${playerName} игроком - ${causedBy}`;
  },
};
</script>

<template>
  <div class="flex">
    <span>{{
      actionTypeDict[action.action as keyof typeof actionTypeDict](
        action.actionPlayer,
        action.affectedPlayer,
      )
    }}</span>
  </div>
</template>
