import { MessageEmbed, User } from "discord.js";
import { enoughPlayers } from "../../constants";

class Game {
  // ATTRIBUTES
  embed;
  setID;
  getID;
  private _id?: string;

  constructor(players: string[], roles: string[]) {
    this._id;
    this.embed = new MessageEmbed()
      .setDescription("One Night Werewolf")
      .setColor([255, 255, 255]);

    this.setID = (id: string) => {
      this._id = id;
    };
    this.getID = () => this._id;
  }
}

export default Game;
