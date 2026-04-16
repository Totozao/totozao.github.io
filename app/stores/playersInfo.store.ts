import type { IPlayer, IRole } from "~/models/playerInfo";
import roles from "@/assets/data/roles.json";

export const usePlayersInfo = defineStore(
  "playersInfo",
  () => {
    const activePlayers = ref<IPlayer[]>([]);
    const lastCirclePlayers = ref<IPlayer[]>([]);
    const maxSectarians = ref<string>("0");
    const inactiveRoles = ref<IRole[]>([]);
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

    const isRoleInactive = (changingRole: IRole) => {
      return inactiveRoles.value.some(
        (role) => role.name === changingRole.name,
      );
    };

    const mutateInactiveRoles = (role: IRole) => {
      if (inactiveRoles.value.some((role) => role.name === role.name)) {
        inactiveRoles.value = inactiveRoles.value.filter(
          (role) => role.name !== role.name,
        );
      } else {
        inactiveRoles.value.push(role);
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
