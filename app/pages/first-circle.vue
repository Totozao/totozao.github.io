<script setup lang="ts">
import roles from "@/assets/data/roles.json";
import affectedRoles from "@/assets/data/affectedRoles.json";

const firstCircleOrder = [
  { name: "detectiveZero", role: "detective" },
  { name: "patrolZero", role: "patrol" },
  { name: "journalistZero", role: "journalist" },
  { name: "lucky-guyZero", role: "lucky-guy" },
  { name: "mafia", role: "mafia" },
  { name: "don", role: "don" },
  { name: "sectarian", role: "sectarian" },
  { name: "detective", role: "patrol" },
  { name: "patrol", role: "doctor" },
  { name: "doctor", role: "detectiveZero" },
];

const route = useRoute();
const router = useRouter();

const currentRole = ref<keyof typeof roleAction>(
  route.query.role as keyof typeof roleAction,
);
const playersInfo = usePlayersInfo();
const multiPlayersSelection = ref<{
  firstSelection: string;
  secondSelection: string;
}>({
  firstSelection: "",
  secondSelection: "",
});

const inactiveRoles = computed(() => {
  return Object.keys(playersInfo.inactiveRoles).filter(
    (role) => playersInfo.inactiveRoles[role],
  );
});

const filteredFirstCircleOrder = computed(() => {
  return firstCircleOrder.filter(
    (role) => !inactiveRoles.value.includes(role.role),
  );
});

const handleNextRole = () => {
  const currentRoleIndex = filteredFirstCircleOrder.value.findIndex(
    (role) => role.name === (currentRole.value as keyof typeof roleAction),
  );
  const nextRole = filteredFirstCircleOrder.value[currentRoleIndex + 1];
  if (nextRole) {
    if (affectedRoles[nextRole.name as keyof typeof affectedRoles]) {
      const corePlayer = playersInfo.activePlayers.filter((player) => {
        player.role ===
          affectedRoles[nextRole.name as keyof typeof affectedRoles];
      });
      if (corePlayer) {
        router.replace({
          path: "/first-circle",
          query: {
            role: nextRole.name,
          },
        });
        currentRole.value = nextRole.name as keyof typeof affectedRoles;
        handleNextRole();
      } else {
        router.replace({
          path: "/first-circle",
          query: {
            role: nextRole.name,
          },
        });
        currentRole.value = nextRole.name as keyof typeof affectedRoles;
      }
    } else {
      router.replace({
        path: "/first-circle",
        query: {
          role: nextRole.name,
        },
      });
      currentRole.value = nextRole.name as keyof typeof affectedRoles;
    }
  } else {
    playersInfo.currentGameStep = "day";
    playersInfo.clearDeadPlayers();
    playersInfo.fillMissingRoles();
    navigateTo("/game");
  }
};

const sidesOfJournalistCheck = {
  teamOne: [
    "detective",
    "patrol",
    "journalist",
    "lucky-guy",
    "doctor",
    "civilian",
  ],
  teamTwo: ["mafia", "don", "sectarian"],
};

const roleAction = {
  detectiveZero: {
    text: "Выберите игрока на роли детектива",
    action: (playerName: string) => {
      playersInfo.setPlayerRole(playerName, "detective");
      handleNextRole();
    },
  },
  patrolZero: {
    text: "Выберите игрока на роли Патрульного",
    action: (playerName: string) => {
      playersInfo.setPlayerRole(playerName, "patrol");
      handleNextRole();
    },
  },
  journalistZero: {
    text: "Выберите игрока на роли журналиста",
    action: (playerName: string) => {
      playersInfo.setPlayerRole(playerName, "journalist");
      handleNextRole();
    },
  },
  "lucky-guyZero": {
    text: "Выберите игрока на роли счастливчика",
    action: (playerName: string) => {
      playersInfo.setPlayerRole(playerName, "lucky-guy");
      handleNextRole();
    },
  },
  mafia: {
    text: "Выберите игрока на роли мафии и его цель",
    action: (playerName: string, targetPlayerName: string) => {
      playersInfo.setPlayerRole(playerName, "mafia");
      playersInfo.players.find(
        (player) => player.name === targetPlayerName,
      )!.lives = 0;
      playersInfo.createNightAction(
        {
          affectedPlayer: targetPlayerName,
          actionPlayer: playerName,
          action: "kill",
        },
        0,
      );
      handleNextRole();
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
      handleNextRole();
    },
  },
  sectarian: {
    text: "Выберите игрока на роли сектанта и его цель",
    action(playerName: string, targetPlayerName: string) {
      playersInfo.setPlayerRole(playerName, "sectarian");
      playersInfo.setPlayerRole(targetPlayerName, "sectarian");
      playersInfo.currentRestrictedMembersCount.sectarian = 2;
      playersInfo.createNightAction(
        {
          affectedPlayer: targetPlayerName,
          actionPlayer: playerName,
          action: "check",
        },
        0,
      );
      handleNextRole();
    },
  },
  detective: {
    text: "Выберите цель для проверки детектива",
    action(targetPlayerName: string) {
      const affectedPlayerRole = playersInfo.getPlayerRole(targetPlayerName);
      const positiveRoles = ["sectarian", "don", "mafia"];
      let detectivePlayer =
        playersInfo.activePlayers.find((player) => player.role === "detective")
          ?.name || "Неизвестно";
      if (positiveRoles.includes(affectedPlayerRole!)) {
        playersInfo.createNightAction(
          {
            affectedPlayer: targetPlayerName,
            actionPlayer: detectivePlayer,
            action: "check",
          },
          0,
        );
        alert(`${targetPlayerName} - хуевый`);
      } else {
        playersInfo.createNightAction(
          {
            affectedPlayer: targetPlayerName,
            actionPlayer: detectivePlayer,
            action: "check",
          },
          0,
        );
        alert(`${targetPlayerName} - не хуевый`);
      }
      handleNextRole();
    },
  },
  journalist: {
    text: "Выберите цели игрока на роли журналиста для проверки",
    action(targetOneName: string, targetTwoName: string) {
      const targetOneRole = playersInfo.getPlayerRole(targetOneName);
      const targetTwoRole = playersInfo.getPlayerRole(targetTwoName);
      if (sidesOfJournalistCheck.teamOne.includes(targetOneRole!)) {
        if (sidesOfJournalistCheck.teamOne.includes(targetTwoRole!)) {
          alert(`${targetOneName} и ${targetTwoName} - с одной стороны`);
        } else {
          alert(
            `${targetOneName} - с одной стороны, а ${targetTwoName} - с другой стороны`,
          );
        }
      } else {
        if (sidesOfJournalistCheck.teamTwo.includes(targetTwoRole!)) {
          alert(`${targetOneName} и ${targetTwoName} - с другой стороны`);
        } else {
          alert(
            `${targetOneName} - с другой стороны, а ${targetTwoName} - с одной стороны`,
          );
        }
      }
      handleNextRole();
    },
  },
  patrol: {
    text: "Выберите цели игрока на роли патрульного",
    action(playerName: string, targetPlayerName: string) {
      playersInfo.setPlayerRole(playerName, "patrol");
      const affectedPlayerRole = playersInfo.getPlayerRole(targetPlayerName);
      const positiveRoles = ["sectarian", "don", "mafia"];
      if (positiveRoles.includes(affectedPlayerRole!)) {
        playersInfo.createNightAction(
          {
            affectedPlayer: playerName,
            actionPlayer: "detective",
            action: "check",
          },
          0,
        );
        alert(`${playerName} - хуевый`);
      } else {
        playersInfo.createNightAction(
          {
            affectedPlayer: playerName,
            actionPlayer: "detective",
            action: "check",
          },
          0,
        );
        alert(`${playerName} - не хуевый`);
      }
      handleNextRole();
    },
  },
  doctor: {
    text: "Выберите игрока на роли доктора и его цель",
    action(playerName: string, targetPlayerName: string) {
      playersInfo.setPlayerRole(playerName, "doctor");
      const targetPlayer = playersInfo.players.find(
        (player) => player.name === targetPlayerName,
      )!;
      targetPlayer.lives += 1;
      handleNextRole();
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
            <SharedUiDropDown
              v-model="multiPlayersSelection.firstSelection"
              :label="`Выберите игрока на роли ${roles[currentRole as keyof typeof roles].name}`"
              :options="
                playersInfo.activePlayers.map((player) => {
                  return {
                    label: player.name,
                    value: player.name,
                  };
                })
              "
            ></SharedUiDropDown>
            <SharedUiDropDown
              v-model="multiPlayersSelection.secondSelection"
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
            <SharedUiButton
              text="Продолжить"
              @click="
                roleAction[currentRole as keyof typeof roleAction].action(
                  multiPlayersSelection.firstSelection,
                  multiPlayersSelection.secondSelection,
                )
              "
            ></SharedUiButton>
            <div
              class="flex flex-col items-center gap-[12px]"
              v-if="
                playersInfo.activeRoles.includes(currentRole) &&
                !currentRole.toLowerCase().includes('zero')
              "
            >
              <h3 class="font-medium">Экстренная функция</h3>
              <SharedUiButton
                class="min-w-[150px]"
                text="В секте"
                @click="handleNextRole()"
              ></SharedUiButton>
            </div>
          </div>
          <template v-if="roleAction[currentRole].action.length === 1">
            <SharedUiButton
              class="min-w-[150px]"
              v-for="player in playersInfo.activePlayers"
              :key="player.name"
              :text="player.name"
              @click="roleAction[currentRole].action(player.name, '')"
            ></SharedUiButton>
            <div
              class="flex flex-col gap-[12px]"
              v-if="
                playersInfo.activeRoles.includes(currentRole) &&
                !currentRole.toLowerCase().includes('zero')
              "
            >
              <h3 class="font-medium">Экстренная функция</h3>
              <SharedUiButton
                class="min-w-[150px]"
                text="В секте"
                @click="handleNextRole()"
              ></SharedUiButton>
            </div>
          </template>
        </div>
      </ClientOnly>
    </div>
  </NuxtLayout>
</template>
