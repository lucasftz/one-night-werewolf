import "dotenv/config";
import Discord from "discord.js";
import Lobby from "./classes/Lobby";
import LobbyHandler from "./classes/LobbyHandler";
import { prefix } from "./constants";

const lobbyHandler = new LobbyHandler();

const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS"],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

client.on("messageCreate", (message) => {
  if (message.content === `${prefix}create`) {
    const lobby = new Lobby(message.author);
    message.channel
      .send({ embeds: [lobby.embed] })
      .then((embedMessage) => {
        lobby.setID(embedMessage.id);
      })
      .catch((error) => console.log(error));
    lobbyHandler.addLobby(lobby);
  }
});

client.on("messageReactionAdd", async (reaction, user) => {
  const isLobby = lobbyHandler.hasLobbyByID(reaction.message.id);
  const notBot = user !== client.user;

  if (isLobby && notBot) {
    const lobby = lobbyHandler.getLobbyByID(reaction.message.id);
    reaction.message.edit({ embeds: [lobby!.addPlayer(user.username!)] });
  }
});

client.login(process.env.TOKEN);
