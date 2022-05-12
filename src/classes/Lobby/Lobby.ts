import { MessageEmbed, User } from "discord.js";

class Lobby {
  // ATTRIBUTES
  embed;
  setID;
  getID;
  addPlayer;
  removePlayer;
  getPlayers: () => string[];
  roles: string[];
  addRole: (role: string) => MessageEmbed;
  private _players: string[];
  private _id?: string;

  constructor(creator: User) {
    this._id;
    this._players = [];
    this.roles = [];
    this.embed = new MessageEmbed()
      .setDescription("")
      .setColor([255, 255, 255]);

    this.setID = (id: string) => {
      this._id = id;
    };
    this.getID = () => this._id;

    this.addRole = (role: string) => {
      if (this.roles.length !== this._players.length + 3) this.roles.push(role);
      const newEmbed = new MessageEmbed()
        .setTitle(this.embed.title!)
        .setDescription(this.embed.description!)
        .setFields([
          {
            name: `${this.roles.length} out of ${
              this._players.length + 3
            } roles selected`,
            value: this.roles.join("\n" + "\n") || "No roles selected",
          },
        ])
        .setColor([255, 255, 255]);
      return newEmbed;
    };

    this.addPlayer = (newPlayer: string) => {
      if (!this._players.includes(newPlayer)) {
        this._players.push(newPlayer);
        const newEmbed = new MessageEmbed()
          .setTitle(`Current Players: ${this._players.length}`)
          .setDescription(this.embed.description + `${newPlayer}\n`)
          .setFields([
            {
              name: `${this.roles.length} out of ${
                this._players.length + 3
              } roles selected`,
              value: this.roles.join("\n" + "\n") || "No roles selected",
            },
          ])
          .setColor([255, 255, 255]);
        this.embed = newEmbed;
      }
      return this.embed;
    };

    this.removePlayer = (player: string) => {
      this._players = this._players.filter((oldPlayer) => oldPlayer !== player);
      const newEmbed = new MessageEmbed()
        .setTitle(`Current Players: ${this._players.length}`)
        .setDescription(this._players.join("\n") + "\n")
        .setFields([
          {
            name: `${this.roles.length} out of ${
              this._players.length + 3
            } roles selected`,
            value: this.roles.join("\n" + "\n") || "No roles selected",
          },
        ])
        .setColor([255, 255, 255]);
      this.embed = newEmbed;
      return this.embed;
    };

    this.getPlayers = () => this._players;

    this.addPlayer(creator.username);
  }
}

export default Lobby;
