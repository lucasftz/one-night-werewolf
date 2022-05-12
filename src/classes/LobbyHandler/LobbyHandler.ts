import Lobby from "../Lobby";

class LobbyHandler {
  private _lobbies: Lobby[];
  getLobbies: () => Lobby[];
  addLobby: (lobby: Lobby) => void;
  getLobbyByID: (id: string) => Lobby | undefined;
  hasLobbyByID: (id: string) => boolean;

  constructor() {
    this._lobbies = [];

    this.getLobbies = () => this._lobbies;

    this.addLobby = (lobby: Lobby) => {
      this._lobbies.push(lobby);
    };

    this.getLobbyByID = (id: string) => {
      return this._lobbies.find((lobby) => lobby.getID() === id);
    };

    this.hasLobbyByID = (id: string): boolean => {
      return this._lobbies.map((lobby) => lobby.getID()).includes(id);
    };
  }
}

export default LobbyHandler;
