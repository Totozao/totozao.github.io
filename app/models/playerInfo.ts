export interface IPlayer {
  name: string;
  role: string;
  lives: number;
}

export interface IRole {
  name: string;
  description: string;
  count: number;
  value: string;
}

export interface INight {
  indexOfNight: number;
  actions: INightAction[];
}

export interface INightAction {
  affectedPlayer: string;
  actionPlayer: string;
  action: string;
}
