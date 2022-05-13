import { MessageEmbed } from "discord.js";

const isLobbyEror = new MessageEmbed()
  .setDescription("There is already a lobby in this channel!")
  .setColor([239, 68, 68]);

const commandError = new MessageEmbed()
  .setDescription("Error! Command not found")
  .setColor([239, 68, 68]);

export { isLobbyEror, commandError };
