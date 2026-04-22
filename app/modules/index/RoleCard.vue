<script setup lang="ts">
import type { IRole } from "~/models/playerInfo";

const { role } = defineProps<{
  role: IRole;
}>();

const playersInfo = usePlayersInfo();
</script>

<template>
  <div class="flex w-full justify-between">
    <span class="font-medium">{{ role.name }}</span>
    <SharedUiButton
      :text="playersInfo.isRoleInactive(role) ? 'Включить' : 'Выключить'"
      @click="playersInfo.mutateInactiveRoles(role.value)"
    ></SharedUiButton>
  </div>
</template>
