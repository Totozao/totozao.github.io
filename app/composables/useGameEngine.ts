import { usePlayersInfo } from '~/stores/playersInfo.store';
import { useToast } from '~/composables/useToast';
import { useRouter } from 'vue-router';

export const useGameEngine = () => {
  const playersInfo = usePlayersInfo();
  const toast = useToast();
  const router = useRouter();

  const sidesOfJournalistCheck = {
    teamOne: ['detective', 'patrol', 'journalist', 'lucky-guy', 'doctor', 'civilian'],
    teamTwo: ['mafia', 'don', 'sectarian'],
  };

  const handleNextRole = (currentRoleName: string, filteredFirstCircleOrder: any[]) => {
    const currentRoleIndex = filteredFirstCircleOrder.findIndex(
      (role) => role.name === currentRoleName
    );
    const nextRole = filteredFirstCircleOrder[currentRoleIndex + 1];

    if (nextRole) {
      router.replace({ path: '/first-circle', query: { role: nextRole.name } });
      return nextRole.name;
    } else {
      playersInfo.currentGameStep = 'day';
      playersInfo.clearDeadPlayers();
      playersInfo.fillMissingRoles();
      router.push('/game');
      return null;
    }
  };

  const roleActions = {
    detectiveZero: (playerName: string) => {
      playersInfo.setPlayerRole(playerName, 'detective');
    },
    patrolZero: (playerName: string) => {
      playersInfo.setPlayerRole(playerName, 'patrol');
    },
    journalistZero: (playerName: string) => {
      playersInfo.setPlayerRole(playerName, 'journalist');
    },
    'lucky-guyZero': (playerName: string) => {
      playersInfo.setPlayerRole(playerName, 'lucky-guy');
    },
    mafia: (playerName: string, targetPlayerName: string) => {
      playersInfo.setPlayerRole(playerName, 'mafia');
      const targetPlayer = playersInfo.players.find((player) => player.name === targetPlayerName);
      if (targetPlayer) targetPlayer.lives = 0;
      
      playersInfo.createNightAction(
        { affectedPlayer: targetPlayerName, actionPlayer: playerName, action: 'kill' },
        0
      );
    },
    don: (playerName: string, targetPlayerName: string) => {
      playersInfo.setPlayerRole(playerName, 'don');
      const affectedPlayerRole = playersInfo.getPlayerRole(targetPlayerName);
      
      playersInfo.createNightAction(
        { affectedPlayer: targetPlayerName, actionPlayer: playerName, action: 'check' },
        0
      );
      
      if (affectedPlayerRole === 'detective' || affectedPlayerRole === 'patrol') {
        toast.error(`${targetPlayerName} - ментура`, 'Проверка Дона', 5000);
      } else {
        toast.info(`${targetPlayerName} - не ментура`, 'Проверка Дона', 5000);
      }
    },
    sectarian: (playerName: string, targetPlayerName: string) => {
      playersInfo.setPlayerRole(playerName, 'sectarian');
      playersInfo.setPlayerRole(targetPlayerName, 'sectarian');
      playersInfo.currentRestrictedMembersCount.sectarian = 2;
      playersInfo.createNightAction(
        { affectedPlayer: targetPlayerName, actionPlayer: playerName, action: 'check' },
        0
      );
    },
    detective: (targetPlayerName: string) => {
      const affectedPlayerRole = playersInfo.getPlayerRole(targetPlayerName);
      const positiveRoles = ['sectarian', 'don', 'mafia'];
      const detectivePlayer = playersInfo.activePlayers.find((player) => player.role === 'detective')?.name || 'Неизвестно';
      
      playersInfo.createNightAction(
        { affectedPlayer: targetPlayerName, actionPlayer: detectivePlayer, action: 'check' },
        0
      );

      if (positiveRoles.includes(affectedPlayerRole!)) {
        toast.error(`${targetPlayerName} - мафия/сектант`, 'Проверка Детектива', 5000);
      } else {
        toast.success(`${targetPlayerName} - мирный`, 'Проверка Детектива', 5000);
      }
    },
    journalist: (targetOneName: string, targetTwoName: string) => {
      const targetOneRole = playersInfo.getPlayerRole(targetOneName);
      const targetTwoRole = playersInfo.getPlayerRole(targetTwoName);
      
      if (sidesOfJournalistCheck.teamOne.includes(targetOneRole!)) {
        if (sidesOfJournalistCheck.teamOne.includes(targetTwoRole!)) {
          toast.success(`${targetOneName} и ${targetTwoName} - с одной стороны`, 'Журналист', 5000);
        } else {
          toast.warning(`${targetOneName} - с одной стороны, а ${targetTwoName} - с другой`, 'Журналист', 5000);
        }
      } else {
        if (sidesOfJournalistCheck.teamTwo.includes(targetTwoRole!)) {
          toast.error(`${targetOneName} и ${targetTwoName} - с другой стороны (мафия/секта)`, 'Журналист', 5000);
        } else {
          toast.warning(`${targetOneName} - с другой стороны, а ${targetTwoName} - с одной`, 'Журналист', 5000);
        }
      }
    },
    patrol: (playerName: string, targetPlayerName: string) => {
      playersInfo.setPlayerRole(playerName, 'patrol');
      const affectedPlayerRole = playersInfo.getPlayerRole(targetPlayerName);
      const positiveRoles = ['sectarian', 'don', 'mafia'];
      
      playersInfo.createNightAction(
        { affectedPlayer: playerName, actionPlayer: 'detective', action: 'check' },
        0
      );

      if (positiveRoles.includes(affectedPlayerRole!)) {
        toast.error(`${playerName} проверил: хуевый`, 'Патрульный', 5000);
      } else {
        toast.success(`${playerName} проверил: не хуевый`, 'Патрульный', 5000);
      }
    },
    doctor: (playerName: string, targetPlayerName: string) => {
      playersInfo.setPlayerRole(playerName, 'doctor');
      const targetPlayer = playersInfo.players.find((player) => player.name === targetPlayerName);
      if (targetPlayer) targetPlayer.lives += 1;
      toast.success(`${targetPlayerName} вылечен`, 'Доктор', 4000);
    },
  };

  return {
    handleNextRole,
    roleActions,
  };
};
