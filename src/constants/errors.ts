import { MessageEmbed } from "discord.js";
import { prefix } from ".";

const isLobbyEror = new MessageEmbed()
  .setDescription("Error! There is already a lobby in this channel!")
  .setColor([239, 68, 68]);

const noLobbyError = new MessageEmbed()
  .setDescription("Error! There is no lobby in this channel!")
  .setColor([239, 68, 68])
  .setFooter({ text: `Type ${prefix}create to make a lobby` });

const commandError = new MessageEmbed()
  .setDescription("Error! Command not found")
  .setColor([239, 68, 68])
  .setFooter({ text: `Type ${prefix}help to get a list of all the commands` });

const notImplementedError = new MessageEmbed()
  .setDescription("Sorry, this feature has not yet been implemented yet!")
  .setColor([239, 68, 68]);

export { isLobbyEror, noLobbyError, commandError, notImplementedError };
