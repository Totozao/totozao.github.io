import {
  type INight,
  type INightAction,
  type IPlayer,
  type IRole,
} from "~/models/playerInfo";
import roles from "@/assets/data/roles.json";

export const usePlayersInfo = defineStore(
  "playersInfo",
  () => {
    const activePlayers = ref<IPlayer[]>([]);
    const lastCirclePlayers = ref<IPlayer[]>([]);
    const maxSectarians = ref<string>("2");
    const inactiveRoles = ref<{ [key: string]: boolean }>({});
    const players = ref<IPlayer[]>([]);
    const nightsLogs = ref<INight[]>([]);
    const amountOfMafia = ref<string>("1");
    const currentGameStep = ref<"voting" | "night" | "day">("voting");
    const currentRestrictedMembersCount = ref<{
      mafia: number;
      sectarian: number;
    }>({
      mafia: 0,
      sectarian: 0,
    });

    const activeRoles = ref<string[]>([]);

    const currentRole = ref<string | undefined>(undefined);

    const setActiveRoles = () => {
      let roleNames = Object.keys(roles);
      let excludingRoles = ["lucky-guy", "civilian"];
      activeRoles.value = roleNames.filter((role) => {
        return !excludingRoles.includes(role);
      });
    };

    const handleNextRole = (roleList: (keyof typeof roles)[]) => {
      const roleIndex = roleList.findIndex(
        (role) => role === currentRole.value,
      );
      if (roleIndex === roleList.length - 1) {
        currentRole.value = undefined;
      } else {
        const playerWithNextRole = activePlayers.value.filter((player) => {
          return player.role === roleList[roleIndex + 1];
        });
        if (playerWithNextRole.length > 0) {
          currentRole.value = roleList[roleIndex + 1];
        } else {
          handleNextRole(roleList);
        }
      }
    };

    const getPlayersWithRole = (role: string) => {
      return activePlayers.value.filter((player) => {
        return player.role === role;
      });
    };

    const addPlayer = (playerName: string) => {
      if (players.value.some((player) => player.name === playerName)) {
        throw new Error("Игрок с таким именем уже существует");
      }
      players.value.push({
        name: playerName,
        role: "",
        lives: 1,
      });
    };

    const updatePlayerData = (player: IPlayer) => {
      const playerIndex = activePlayers.value.findIndex(
        (p) => p.name === player.name,
      );
      if (playerIndex !== -1) {
        activePlayers.value[playerIndex] = player;
      }
    };

    const isRoleInactive = (changingRole: IRole) => {
      return inactiveRoles.value[changingRole.value];
    };

    const resetActivePlayers = () => {
      activePlayers.value = players.value;
    };

    const createNightAction = (action: INightAction, nightIndex: number) => {
      if (nightsLogs.value[nightIndex]) {
        nightsLogs.value[nightIndex].actions.push(action);
      } else {
        nightsLogs.value.push({
          indexOfNight: nightIndex,
          actions: [action],
        });
      }
    };

    const mutateInactiveRoles = (changingRole: string) => {
      inactiveRoles.value[changingRole] = !inactiveRoles.value[changingRole];
    };

    const setPlayerRole = (
      playerName: string,
      role: keyof typeof roles,
      lives?: number,
    ) => {
      activePlayers.value.find((player) => player.name === playerName)!.role =
        role;
      if (lives) {
        activePlayers.value.find(
          (player) => player.name === playerName,
        )!.lives = lives;
      }
    };

    const removePlayer = (playerName: string) => {
      players.value = players.value.filter(
        (player) => player.name !== playerName,
      );
    };

    const clearDeadPlayers = () => {
      activePlayers.value = activePlayers.value.filter(
        (player) => player.lives > 0,
      );
    };

    const saveLastCirclePlayers = () => {
      lastCirclePlayers.value = players.value;
    };

    const resetStore = () => {
      activePlayers.value = [];
    };

    const getPlayerRole = (playerName: string) => {
      return activePlayers.value.find((player) => player.name === playerName)!
        .role;
    };

    return {
      activePlayers,
      lastCirclePlayers,
      maxSectarians,
      amountOfMafia,
      nightsLogs,
      inactiveRoles,
      currentGameStep,
      players,
      currentRestrictedMembersCount,
      activeRoles,
      getPlayersWithRole,
      setActiveRoles,
      clearDeadPlayers,
      resetActivePlayers,
      updatePlayerData,
      createNightAction,
      isRoleInactive,
      mutateInactiveRoles,
      setPlayerRole,
      addPlayer,
      removePlayer,
      saveLastCirclePlayers,
      resetStore,
      getPlayerRole,
    };
  },
  {
    persist: {
      storage: piniaPluginPersistedstate.localStorage(),
    },
  },
);
