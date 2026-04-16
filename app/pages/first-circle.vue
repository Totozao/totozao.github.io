<script setup lang="ts">
const firstCircleOrder = [
  "detectiveZero",
  "patrolZero",
  "journalistZero",
  "lucky-guyZero",
  "mafia",
  "don",
  "sectarian",
  "detective",
  "patrol",
  "doctor",
];

const currentRole = ref<keyof typeof roleAction>("detectiveZero");
const playersInfo = usePlayersInfo();

const roleAction = {
  detectiveZero: {
    text: "Выберите игрока на роли детектива",
    action: (playerName: string) => {
      playersInfo.setPlayerRole(playerName, "detective");
    },
  },
  patrolZero: {
    text: "Выберите игрока на роли комиссара",
    action: (playerName: string) => {
      playersInfo.setPlayerRole(playerName, "patrol");
    },
  },
  journalistZero: {
    text: "Выберите игрока на роли журналиста",
    action: (playerName: string) => {
      playersInfo.setPlayerRole(playerName, "journalist");
    },
  },
  luckyGuyZero: {
    text: "Выберите игрока на роли счастливчика",
    action: (playerName: string) => {
      playersInfo.setPlayerRole(playerName, "lucky-guy");
    },
  },
  mafia: {
    text: "Выберите игрока на роли мафии и его цель",
    action: (playerName: string, targetPlayerName: string) => {
      playersInfo.setPlayerRole(playerName, "mafia");
      playersInfo.createNightAction(
        {
          affectedPlayer: targetPlayerName,
          actionPlayer: playerName,
          action: "kill",
        },
        0,
      );
    },
  },
  don: {
    text: "Выберите игрока на роли дона и его цель",
  },
  sectarian: {
    text: "Выберите игрока на роли маньяка и его цель",
  },
  detective: {
    text: "Выберите игрока на роли детектива и его цель",
  },
  patrol: {
    text: "Выберите игрока на роли Патрульного и его цель",
  },
  doctor: {
    text: "Выберите игрока на роли доктора и его цель",
  },
};
</script>

<template>
  <NuxtLayout>
    <div class="">{{ currentRole }}</div>
  </NuxtLayout>
</template>
