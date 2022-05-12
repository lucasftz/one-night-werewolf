import { MessageEmbed } from "discord.js";

const isLobbyEror = new MessageEmbed()
  .setDescription("There is already a lobby in this channel!")
  .setColor([239, 68, 68]);

export { isLobbyEror };
