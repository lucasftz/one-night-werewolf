import Game from "../Game/Game";

class GameHandler {
  private _games: Game[];
  getGames: () => Game[];
  addGame: (Game: Game) => void;
  removeGame: (Game: Game) => void;
  getGameByID: (id: string) => Game | undefined;
  hasGameByID: (id: string) => boolean;

  constructor() {
    this._games = [];

    this.getGames = () => this._games;

    this.addGame = (Game: Game) => {
      this._games.push(Game);
    };

    this.removeGame = (Game: Game) => {
      this._games = this._games.filter((oldGame) => oldGame !== Game);
    };

    this.getGameByID = (id: string) => {
      return this._games.find((Game) => Game.getID() === id);
    };

    this.hasGameByID = (id: string): boolean => {
      return this._games.map((Game) => Game.getID()).includes(id);
    };
  }
}

export default GameHandler;
