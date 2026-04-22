<script setup lang="ts">
import roles from "@/assets/data/roles.json";
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
const inactiveRoles = computed(() => {
  return playersInfo.inactiveRoles.map((role) => role.name);
});

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
      if (playersInfo.isRoleInactive(roles.journalist)) {
        currentRole.value = "luckyGuyZero";
      } else if (playersInfo.isRoleInactive(roles["lucky-guy"])) {
        currentRole.value = "mafia";
      } else {
        currentRole.value = "journalistZero";
      }
    },
  },
  journalistZero: {
    text: "Выберите игрока на роли журналиста",
    action: (playerName: string) => {
      playersInfo.setPlayerRole(playerName, "journalist");
      if (playersInfo.isRoleInactive(roles["lucky-guy"])) {
        currentRole.value = "mafia";
      } else {
        currentRole.value = "luckyGuyZero";
      }
    },
  },
  luckyGuyZero: {
    text: "Выберите игрока на роли счастливчика",
    action: (playerName: string) => {
      playersInfo.setPlayerRole(playerName, "lucky-guy");
      currentRole.value = "mafia";
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
    action(playerName: string, targetPlayerName: string) {
      playersInfo.setPlayerRole(playerName, "don");
      const affectedPlayerRole = playersInfo.getPlayerRole(targetPlayerName);
      if (
        affectedPlayerRole === "detective" ||
        affectedPlayerRole === "patrol"
      ) {
        playersInfo.createNightAction(
          {
            affectedPlayer: targetPlayerName,
            actionPlayer: playerName,
            action: "check",
          },
          0,
        );
        alert(`${targetPlayerName} - ментура`);
      } else {
        playersInfo.createNightAction(
          {
            affectedPlayer: targetPlayerName,
            actionPlayer: playerName,
            action: "check",
          },
          0,
        );
        alert(`${targetPlayerName} - не ментура`);
      }
      playersInfo.createNightAction(
        {
          affectedPlayer: targetPlayerName,
          actionPlayer: playerName,
          action: "check",
        },
        0,
      );
    },
  },
  sectarian: {
    text: "Выберите игрока на роли маньяка и его цель",
    action(playerName: string) {
      console.log(playerName);
    },
  },
  detective: {
    text: "Выберите игрока на роли детектива и его цель",
    action(playerName: string) {
      console.log(playerName);
    },
  },
  patrol: {
    text: "Выберите игрока на роли Патрульного и его цель",
    action(playerName: string) {
      console.log(playerName);
    },
  },
  doctor: {
    text: "Выберите игрока на роли доктора и его цель",
    action(playerName: string) {
      console.log(playerName);
    },
  },
};
</script>

<template>
  <NuxtLayout>
    <div class="flex flex-col items-center gap-[24px]">
      <h1 class="font-bold">Первый круг игры</h1>
      <ClientOnly>
        <div class="flex flex-col items-center gap-[12px]">
          <p>{{ roleAction[currentRole].text }}</p>
          <div
            class="flex flex-col gap-[12px]"
            v-if="roleAction[currentRole].action.length === 2"
          >
            <div class="flex gap-[12px]">
              <SharedUiDropDown
                :label="`Выберите игрока на роли ${currentRole}`"
                :options="
                  playersInfo.activePlayers.map((player) => {
                    return {
                      label: player.name,
                      value: player.name,
                    };
                  })
                "
              ></SharedUiDropDown>
            </div>
            <div class="flex flex-col gap-[12px]">
              <SharedUiDropDown
                label="Выберите цель для игрока"
                :options="
                  playersInfo.activePlayers.map((player) => {
                    return {
                      label: player.name,
                      value: player.name,
                    };
                  })
                "
              ></SharedUiDropDown>
            </div>
          </div>
          <template v-if="roleAction[currentRole].action.length === 1">
            <SharedUiButton
              v-for="player in playersInfo.activePlayers"
              :key="player.name"
              :text="player.name"
              @click="roleAction[currentRole].action(player.name, '')"
            ></SharedUiButton>
          </template>
        </div>
      </ClientOnly>
    </div>
  </NuxtLayout>
</template>
