import "dotenv/config";
import Discord from "discord.js";
import Lobby from "./classes/Lobby";
import LobbyHandler from "./classes/LobbyHandler";
import Game from "./classes/Game";
import GameHandler from "./classes/GameHandler";
import { prefix, emojis } from "./constants";

const lobbyHandler = new LobbyHandler();
const gameHandler = new GameHandler();
const { joinEmoji, playEmoji } = emojis;

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
        embedMessage.react(joinEmoji);
      })
      .catch((error) => console.log(error));
    lobbyHandler.addLobby(lobby);
  }
});

client.on("messageReactionAdd", async (reaction, user) => {
  const isLobby = lobbyHandler.hasLobbyByID(reaction.message.id);
  const notBot = user !== client.user;
  const isJoinEmoji = reaction.emoji.name === joinEmoji;
  const isPlayEmoji = reaction.emoji.name === playEmoji;

  // add players to the lobby who react with joinEmoji
  if (isLobby && notBot && isJoinEmoji) {
    const lobby = lobbyHandler.getLobbyByID(reaction.message.id);
    reaction.message.edit({ embeds: [lobby!.addPlayer(user.username!)] });

    // if there are enough people to start a game, send playEmoji
    if (lobby?.getPlayers().length === 2) reaction.message.react(playEmoji);
  }

  // remove emojis from players that are not joinEmoji
  if (isLobby && notBot && !isJoinEmoji) {
    const lobby = lobbyHandler.getLobbyByID(reaction.message.id);
    // if the message was playEmoji and there are enough players to join, start a game
    if (playEmoji && lobby!.getPlayers().length >= 2) {
      reaction.message.delete().catch((error) => console.log(error));
      const game = new Game(lobby?.getPlayers()!);
      gameHandler.addGame(game);
      lobbyHandler.removeLobby(lobby!);
      reaction.message.channel.send({ embeds: [game.embed] });
    } else {
      reaction.remove().catch((error) => console.log(error));
      // but if the emoji was playEmoji, add it back
      if (isPlayEmoji) reaction.message.react(playEmoji);
    }
  }
});

client.on("messageReactionRemove", (reaction, user) => {
  const isLobby = lobbyHandler.hasLobbyByID(reaction.message.id);
  const notBot = user !== client.user;
  const isJoinEmoji = reaction.emoji.name === joinEmoji;

  // remove players from the lobby who unreact with joinEmoji
  if (isLobby && notBot && isJoinEmoji) {
    const lobby = lobbyHandler.getLobbyByID(reaction.message.id);
    reaction.message.edit({ embeds: [lobby!.removePlayer(user.username!)] });

    // if there are not not enough players to start a game, remove the playEmoji
    if (lobby?.getPlayers().length ?? 0 < 2) {
      reaction.message.reactions.cache.get(playEmoji)?.remove();
    }
  }
});

client.login(process.env.TOKEN);
