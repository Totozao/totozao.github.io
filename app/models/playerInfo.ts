export interface IPlayer {
  name: string;
  role: string;
  isAlive: boolean;
  lives: number;
}

export interface IRole {
  name: string;
  description: string;
  count: number;
}
