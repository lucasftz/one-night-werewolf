import { MessageEmbed } from "discord.js";

class Game {
  // ATTRIBUTES
  embed;
  setID;
  getID;
  private _players: string[];
  private _id?: string;

  constructor(players: string[]) {
    this._id;
    this._players = players;
    this.embed = new MessageEmbed()
      .setDescription("this is a blank description")
      .setColor([255, 255, 255]);

    this.setID = (id: string) => {
      this._id = id;
    };
    this.getID = () => this._id;
  }
}

export default Game;
