import { Message, MessageEmbed } from "discord.js";

const edit = (message: Message, embed: MessageEmbed) => {
  message.edit({ embeds: [embed] });
};

export default edit;
