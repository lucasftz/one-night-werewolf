import "dotenv/config";
import Discord from "discord.js";
import LobbyHandler from "./classes/LobbyHandler";
import Game from "./classes/Game";
import GameHandler from "./classes/GameHandler";
import { prefix, emojis } from "./constants";
import { isLobbyEror } from "./constants/errors";

const lobbyHandler = new LobbyHandler();
const gameHandler = new GameHandler();
const { joinEmoji, playEmoji } = emojis;

const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS"],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

/* === CREATE ============================================================== */

client.on("messageCreate", (message) => {
  if (message.content === `${prefix}create`) {
    // check if a lobby doesn't already exist in the channel
    if (lobbyHandler.hasLobbyByID(message.channelId)) {
      // if there already is a lobby in the channel, don't create a new lobby
      message.channel.send({ embeds: [isLobbyEror] });
    } else {
      // otherwise, do create a new lobby
      const newLobby = lobbyHandler.createLobbyAt(
        message.channelId,
        message.author
      );
      message.channel
        .send({ embeds: [newLobby.embed] })
        .then((embedMessage) => {
          newLobby.setID(embedMessage.id);
          embedMessage.react(joinEmoji);
        })
        .catch((error) => console.log(error));
    }
  }
});

/* === ADD <ROLE> ========================================================== */

client.on("messageCreate", async (message) => {
  const repliedToBot = message.mentions.repliedUser === client.user;
  const isLobby = lobbyHandler.hasLobbyByID(message.channelId);

  if (repliedToBot && isLobby) {
    // do something
  }
});

/* === LOBBY REACTION HANDLING ============================================= */

client.on("messageReactionAdd", (reaction, user) => {
  const isLobby = lobbyHandler.hasLobbyByID(reaction.message.channelId);
  const notBot = user !== client.user;
  const isJoinEmoji = reaction.emoji.name === joinEmoji;
  const isPlayEmoji = reaction.emoji.name === playEmoji;

  // add players to the lobby who react with joinEmoji
  if (isLobby && notBot && isJoinEmoji) {
    const lobby = lobbyHandler.getLobbyByID(reaction.message.channelId);
    reaction.message.edit({ embeds: [lobby!.addPlayer(user.username!)] });

    // if there are enough people to start a game, send playEmoji
    if (lobby?.getPlayers().length === 2) reaction.message.react(playEmoji);
  }

  // remove emojis from players that are not joinEmoji
  if (isLobby && notBot && !isJoinEmoji) {
    const lobby = lobbyHandler.getLobbyByID(reaction.message.id);
    // if the message was playEmoji, start a game
    if (playEmoji && lobby!.getPlayers().length >= 2) {
      reaction.message.delete().catch((error) => console.log(error));
      const game = new Game(lobby?.getPlayers()!);
      gameHandler.addGame(game);
      lobbyHandler.removeLobbyByID(reaction.message.channelId);
      reaction.message.channel.send({ embeds: [game.embed] });
    } else {
      reaction.remove().catch((error) => console.log(error));
      // but if the emoji was playEmoji, add it back
      if (isPlayEmoji) reaction.message.react(playEmoji);
    }
  }
});

client.on("messageReactionRemove", (reaction, user) => {
  const isLobby = lobbyHandler.hasLobbyByID(reaction.message.channelId);
  const notBot = user !== client.user;
  const isJoinEmoji = reaction.emoji.name === joinEmoji;

  // remove players from the lobby who unreact with joinEmoji
  if (isLobby && notBot && isJoinEmoji) {
    const lobby = lobbyHandler.getLobbyByID(reaction.message.channelId);
    reaction.message.edit({ embeds: [lobby!.removePlayer(user.username!)] });

    // if there are not not enough players to start a game, remove playEmoji
    if (lobby?.getPlayers().length ?? 0 < 2) {
      reaction.message.reactions.cache.get(playEmoji)?.remove();
    }
  }
});

client.login(process.env.TOKEN);
