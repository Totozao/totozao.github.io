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
    const inactiveRoles = ref<IRole[]>([]);
    const nightsLogs = ref<INight[]>([]);
    const amountOfMafia = ref<string>("1");
    const addPlayer = (playerName: string) => {
      if (activePlayers.value.some((player) => player.name === playerName)) {
        throw new Error("Игрок с таким именем уже существует");
      }
      activePlayers.value.push({
        name: playerName,
        role: "",
        lives: 1,
        isAlive: true,
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
      return inactiveRoles.value.some(
        (role) => role.name === changingRole.name,
      );
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

    const mutateInactiveRoles = (changingRole: IRole) => {
      if (inactiveRoles.value.some((role) => role.name === changingRole.name)) {
        inactiveRoles.value = inactiveRoles.value.filter(
          (role) => role.name !== changingRole.name,
        );
      } else {
        inactiveRoles.value.push(changingRole);
      }
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
      activePlayers.value = activePlayers.value.filter(
        (player) => player.name !== playerName,
      );
    };

    const saveLastCirclePlayers = () => {
      lastCirclePlayers.value = activePlayers.value.filter(
        (player) => player.isAlive,
      );
    };

    const resetStore = () => {
      activePlayers.value = [];
    };

    return {
      activePlayers,
      lastCirclePlayers,
      maxSectarians,
      amountOfMafia,
      nightsLogs,
      updatePlayerData,
      createNightAction,
      isRoleInactive,
      mutateInactiveRoles,
      setPlayerRole,
      addPlayer,
      removePlayer,
      saveLastCirclePlayers,
      resetStore,
    };
  },
  {
    persist: {
      storage: piniaPluginPersistedstate.localStorage(),
    },
  },
);
