import { MessageEmbed, User } from "discord.js";

class Lobby {
  // ATTRIBUTES
  embed;
  setID;
  getID;
  addPlayer;
  removePlayer;
  private _players: string[];
  private _id?: string;

  constructor(creator: User) {
    this._id;
    this._players = [];
    this.embed = new MessageEmbed()
      .setDescription("")
      .setColor([255, 255, 255]);

    this.setID = (id: string) => {
      this._id = id;
    };
    this.getID = () => this._id;

    this.addPlayer = (newPlayer: string) => {
      if (!this._players.includes(newPlayer)) {
        this._players.push(newPlayer);
        const newEmbed = new MessageEmbed()
          .setTitle(`Current Players: ${this._players.length}`)
          .setDescription(this.embed.description + `${newPlayer}\n`);
        this.embed = newEmbed;
      }
      return this.embed;
    };

    this.removePlayer = (player: string) => {
      this._players = this._players.filter((oldPlayer) => oldPlayer !== player);
      const newEmbed = new MessageEmbed()
        .setTitle(`Current Players: ${this._players.length}`)
        .setDescription(this._players.join("\n") + "\n");
      this.embed = newEmbed;
      return this.embed;
    };

    this.addPlayer(creator.username);
  }
}

export default Lobby;
