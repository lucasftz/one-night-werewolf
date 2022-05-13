import { MessageEmbed, User } from "discord.js";
import { enoughPlayers } from "../../constants";

class Lobby {
  // ATTRIBUTES
  embed;
  setID;
  getID;
  addPlayer;
  removePlayer;
  getPlayers: () => string[];
  roles: string[];
  addRole: (role: string, quantity: number) => MessageEmbed;
  removeRole: (role: string, quantity: number) => MessageEmbed;
  isReady: () => boolean;
  private _players: string[];
  private _id?: string;
  private _updateEmbed;

  constructor(creator: User) {
    this._id;
    this._players = [];
    this.roles = [];
    this.embed = new MessageEmbed()
      .setDescription("One Night Werewolf")
      .setColor([255, 255, 255]);

    this.setID = (id: string) => {
      this._id = id;
    };
    this.getID = () => this._id;

    this.addRole = (role: string, quantity: number) => {
      for (let i = 1; i <= quantity; i++) {
        if (this.roles.length < this._players.length + 3) this.roles.push(role);
      }
      this.embed = this._updateEmbed();
      return this.embed;
    };

    this.removeRole = (role: string, quantity: number) => {
      if (this.roles.includes(role)) {
        for (let i = 1; i <= quantity; i++) {
          const index = this.roles.lastIndexOf(role);
          this.roles = [
            ...this.roles.slice(0, index),
            ...this.roles.slice(index + 1),
          ];
        }
      } else if (role === "all") this.roles = [];
      this.embed = this._updateEmbed();
      return this.embed;
    };

    this.addPlayer = (newPlayer: string) => {
      if (!this._players.includes(newPlayer)) {
        this._players.push(newPlayer);
        this.embed = this._updateEmbed();
      }
      return this.embed;
    };

    this.removePlayer = (player: string) => {
      this._players = this._players.filter((oldPlayer) => oldPlayer !== player);
      this.embed = this._updateEmbed();
      return this.embed;
    };

    this._updateEmbed = () => {
      return new MessageEmbed()
        .setDescription("One Night Werewolf")
        .setFields([
          {
            name: `Current Players: ${this._players.length}`,
            value: this._players.join("\n") || "No players in the lobby",
          },
          {
            name: `${this.roles.length} out of ${
              this._players.length + 3
            } roles selected`,
            value: this.roles.join("\n") || "No roles selected",
          },
        ])
        .setColor([255, 255, 255]);
    };

    this.getPlayers = () => this._players;

    this.isReady = () => {
      const isEnoughPlayers = this._players.length >= enoughPlayers;
      const isEnoughRoles = this.roles.length === this._players.length + 3;

      return isEnoughPlayers && isEnoughRoles;
    };

    this.addPlayer(creator.username);
  }
}

export default Lobby;
