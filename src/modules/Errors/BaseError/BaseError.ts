import { Message, MessageEmbed } from "discord.js";

class BaseError {
  embed: MessageEmbed;
  delete: (message: Message) => void;

  constructor(description: string, footer?: string) {
    this.embed = new MessageEmbed()
      .setDescription(description)
      .setFooter({ text: footer ?? "" })
      .setColor([239, 68, 68]);

    this.delete = (message: Message) => {
      setTimeout(() => {
        message.delete().catch((error) => console.log(error));
      }, 3000);
    };
  }
}

export default BaseError;
