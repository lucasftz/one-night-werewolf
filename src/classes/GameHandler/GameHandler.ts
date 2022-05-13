import { User } from "discord.js";
import Game from "../Game";

class GameHandler {
  private _games: { [channelID: string]: Game };
  createGameAt: (channelID: string, players: string[], roles: string[]) => Game;
  removeGameByID: (channelID: string) => void;
  getGameByID: (channelID: string) => Game | undefined;
  hasGameByID: (channelID: string) => boolean;

  constructor() {
    this._games = {};

    this.createGameAt = (
      channelID: string,
      players: string[],
      roles: string[]
    ) => {
      const newGame = new Game(players, roles);
      this._games[channelID] = newGame;
      return newGame;
    };

    this.removeGameByID = (channelID: string) => {
      delete this._games[channelID];
    };

    this.getGameByID = (channelID: string) => {
      return this._games[channelID];
    };

    this.hasGameByID = (channelID: string): boolean => {
      return this._games.hasOwnProperty(channelID);
    };
  }
}

export default GameHandler;
