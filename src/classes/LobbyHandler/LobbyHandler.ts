import { User } from "discord.js";
import Lobby from "../Lobby";

class LobbyHandler {
  private _lobbies: { [channelID: string]: Lobby };
  createLobbyAt: (channelID: string, creator: User) => Lobby;
  removeLobbyByID: (channelID: string) => void;
  getLobbyByID: (channelID: string) => Lobby | undefined;
  hasLobbyByID: (channelID: string) => boolean;

  constructor() {
    this._lobbies = {};

    this.createLobbyAt = (channelID: string, creator: User) => {
      const newLobby = new Lobby(creator);
      this._lobbies[channelID] = newLobby;
      return newLobby;
    };

    this.removeLobbyByID = (channelID: string) => {
      delete this._lobbies[channelID];
    };

    this.getLobbyByID = (channelID: string) => {
      return this._lobbies[channelID];
    };

    this.hasLobbyByID = (channelID: string): boolean => {
      return this._lobbies.hasOwnProperty(channelID);
    };
  }
}

export default LobbyHandler;
