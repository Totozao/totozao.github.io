import { usePlayersInfo } from '~/stores/playersInfo.store';
import { useToast } from '~/composables/useToast';
import { useRouter } from 'vue-router';

type FirstCircleStep = {
  name: string;
  role: string;
};

export const useGameEngine = () => {
  const playersInfo = usePlayersInfo();
  const toast = useToast();
  const router = useRouter();

  const sidesOfJournalistCheck = {
    teamOne: ['detective', 'patrol', 'journalist', 'lucky-guy', 'doctor', 'civilian'],
    teamTwo: ['mafia', 'don', 'sectarian', 'maniac'],
  };

  const handleNextRole = (currentRoleName: string, filteredFirstCircleOrder: FirstCircleStep[]) => {
    const currentRoleIndex = filteredFirstCircleOrder.findIndex(
      (role) => role.name === currentRoleName
    );
    const nextRole = filteredFirstCircleOrder[currentRoleIndex + 1];

    if (nextRole) {
      router.replace({ path: '/first-circle', query: { role: nextRole.name } });
      return nextRole.name;
    } else {
      playersInfo.currentNight = 1;
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
    maniacZero: (playerName: string) => {
      playersInfo.setPlayerRole(playerName, 'maniac');
    },
    assignMafiaPlayers: (playerNames: string[]) => {
      playerNames.forEach((playerName) => {
        playersInfo.setPlayerRole(playerName, 'mafia');
      });
    },
    maniacKill: (playerName: string, targetPlayerName: string) => {
      const targetPlayer = playersInfo.activePlayers.find((player) => player.name === targetPlayerName);
      if (targetPlayer) targetPlayer.lives = 0;

      playersInfo.createNightAction(
        { affectedPlayer: targetPlayerName, actionPlayer: playerName, action: 'kill' },
        playersInfo.currentNight
      );
    },
    mafiaTeamKill: (targetPlayerName: string) => {
      const targetPlayer = playersInfo.activePlayers.find((player) => player.name === targetPlayerName);
      if (targetPlayer) targetPlayer.lives = 0;

      playersInfo.createNightAction(
        { affectedPlayer: targetPlayerName, actionPlayer: 'Мафия', action: 'kill' },
        playersInfo.currentNight
      );
    },
    mafia: (playerName: string, targetPlayerName: string) => {
      playersInfo.setPlayerRole(playerName, 'mafia');
      const targetPlayer = playersInfo.activePlayers.find((player) => player.name === targetPlayerName);
      if (targetPlayer) targetPlayer.lives = 0;
      
      playersInfo.createNightAction(
        { affectedPlayer: targetPlayerName, actionPlayer: playerName, action: 'kill' },
        playersInfo.currentNight
      );
    },
    don: (playerName: string, targetPlayerName: string) => {
      playersInfo.setPlayerRole(playerName, 'don');
      const affectedPlayerRole = playersInfo.getPlayerRole(targetPlayerName);
      
      playersInfo.createNightAction(
        { affectedPlayer: targetPlayerName, actionPlayer: playerName, action: 'check' },
        playersInfo.currentNight
      );
      
      if (affectedPlayerRole === 'detective' || affectedPlayerRole === 'patrol') {
        toast.error(`${targetPlayerName} - ментура`, 'Проверка Дона', 5000);
      } else {
        toast.info(`${targetPlayerName} - не ментура`, 'Проверка Дона', 5000);
      }
    },
    sectarian: (playerName: string, targetPlayerName?: string) => {
      const maxSec = parseInt(playersInfo.maxSectarians.toString()) || 0;
      let targetAdded = false;

      if (playersInfo.getPlayerRole(playerName) !== 'sectarian' && playersInfo.totalSectariansCreated < maxSec) {
        playersInfo.setPlayerRole(playerName, 'sectarian');
        playersInfo.totalSectariansCreated++;
      }
      
      if (targetPlayerName) {
        if (playersInfo.getPlayerRole(targetPlayerName) !== 'sectarian' && playersInfo.totalSectariansCreated < maxSec) {
          playersInfo.setPlayerRole(targetPlayerName, 'sectarian');
          playersInfo.totalSectariansCreated++;
          targetAdded = true;
          toast.success(`${targetPlayerName} завербован в секту`, 'Сектанты', 5000);
        } else if (playersInfo.getPlayerRole(targetPlayerName) !== 'sectarian') {
          toast.error(`Лимит сектантов исчерпан. ${targetPlayerName} не завербован`, 'Сектанты', 5000);
        }
      }

      playersInfo.createNightAction(
        {
          affectedPlayer: targetPlayerName || '',
          actionPlayer: playerName,
          action: targetPlayerName ? (targetAdded ? 'recruit' : 'check') : 'skip',
        },
        playersInfo.currentNight
      );
    },
    detective: (targetPlayerName: string) => {
      const affectedPlayerRole = playersInfo.getPlayerRole(targetPlayerName);
      const positiveRoles = ['sectarian', 'don', 'mafia', 'maniac'];
      const detectivePlayer = playersInfo.activePlayers.find((player) => player.role === 'detective')?.name || 'Неизвестно';
      
      playersInfo.createNightAction(
        { affectedPlayer: targetPlayerName, actionPlayer: detectivePlayer, action: 'check' },
        playersInfo.currentNight
      );

      if (positiveRoles.includes(affectedPlayerRole!)) {
        toast.error(`${targetPlayerName} - мафия/сектант/маньяк`, 'Проверка Детектива', 5000);
      } else {
        toast.success(`${targetPlayerName} - мирный`, 'Проверка Детектива', 5000);
      }
    },
    journalist: (targetOneName: string, targetTwoName: string) => {
      const targetOneRole = playersInfo.getPlayerRole(targetOneName);
      const targetTwoRole = playersInfo.getPlayerRole(targetTwoName);

      const journalistPlayer = playersInfo.activePlayers.find((player) => player.role === 'journalist')?.name || 'Журналист';
      playersInfo.createNightAction(
        { affectedPlayer: `${targetOneName} и ${targetTwoName}`, actionPlayer: journalistPlayer, action: 'compare' },
        playersInfo.currentNight
      );
      
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
      const positiveRoles = ['sectarian', 'don', 'mafia', 'maniac'];

      playersInfo.createNightAction(
        { affectedPlayer: targetPlayerName, actionPlayer: playerName, action: 'check' },
        playersInfo.currentNight
      );

      if (positiveRoles.includes(affectedPlayerRole!)) {
        toast.error(`${targetPlayerName} проверен: мафия/сектант/маньяк`, 'Патрульный', 5000);
      } else {
        toast.success(`${targetPlayerName} проверен: мирный`, 'Патрульный', 5000);
      }
    },
    doctor: (playerName: string, targetPlayerName: string) => {
      playersInfo.setPlayerRole(playerName, 'doctor');
      const targetPlayer = playersInfo.activePlayers.find((player) => player.name === targetPlayerName);
      if (targetPlayer) targetPlayer.lives += 1;

      playersInfo.createNightAction(
        { affectedPlayer: targetPlayerName, actionPlayer: playerName, action: 'heal' },
        playersInfo.currentNight
      );
      toast.success(`${targetPlayerName} вылечен`, 'Доктор', 4000);
    },
  };

  return {
    handleNextRole,
    roleActions,
  };
};
