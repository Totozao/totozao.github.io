<script setup lang="ts">
const playersInfo = usePlayersInfo();
</script>

<template>
  <div class="flex flex-col">
    <GameNightLogCard
      v-for="action of playersInfo.getCurrentNightActions() || []"
      :action="action"
    ></GameNightLogCard>
  </div>
</template>
