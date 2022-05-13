import "dotenv/config";
import Discord, { MessageEmbed } from "discord.js";
// handlers
import LobbyHandler from "./classes/LobbyHandler";
import GameHandler from "./classes/GameHandler";
// errors
import IsLobbyError from "./classes/Errors/IsLobbyError";
import NoLobbyError from "./classes/Errors/NoLobbyError";
import CommandError from "./classes/Errors/CommandError";
import NotImplementedError from "./classes/Errors/NotImplementedError";
// constants
import { prefix, emojis, roles, enoughPlayers } from "./constants";

const lobbyHandler = new LobbyHandler();
const gameHandler = new GameHandler();
const { joinEmoji, playEmoji } = emojis;

const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS"],
});

/* === HANDLE UNKNOWN COMMANDS ============================================= */

client.on("messageCreate", (message) => {
  if (message.content.startsWith(prefix)) {
    const commandName = message.content.split(" ")[0].slice(1);
    if (!["create", "add", "remove", "help"].includes(commandName)) {
      const error = new CommandError();
      message.channel
        .send({ embeds: [error.embed] })
        .then((msg) => error.delete(msg));
    }
  }
});

/* === HELP COMMAND ======================================================== */
client.on("messageCreate", (message) => {
  if (message.content === prefix + "help") {
    const error = new NotImplementedError();
    message.channel
      .send({ embeds: [error.embed] })
      .then((msg) => error.delete(msg));
  }
});

/* === CREATE COMMAND ====================================================== */

client.on("messageCreate", (message) => {
  if (message.content === prefix + "create") {
    // check if a lobby doesn't already exist in the channel
    if (lobbyHandler.hasLobbyByID(message.channelId)) {
      // if there already is a lobby in the channel, send an error
      const error = new IsLobbyError();
      message.channel
        .send({ embeds: [error.embed] })
        .then((msg) => error.delete(msg));
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
        });
    }
  }
});

/* === ADD <ROLE> COMMAND ================================================== */

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith(prefix + "add")) return;
  const isLobby = lobbyHandler.hasLobbyByID(message.channelId);

  if (isLobby) {
    const command = message.content.slice(1).split(" ").slice(1);
    let role, quantity;

    switch (true) {
      case roles.includes(command[0]):
        [role, quantity] = [command[0], 1];
        break;
      case parseInt(command[0]) > 0 && roles.includes(command[1]):
        [role, quantity] = [command[1], parseInt(command[0])];
        break;
    }

    const lobby = lobbyHandler.getLobbyByID(message.channelId);
    const lobbyMessage = await message.channel.messages.fetch(lobby?.getID()!);

    lobbyMessage.edit({
      embeds: [
        lobby?.addRole(role as string, quantity as number) as MessageEmbed,
      ],
    });
  } else {
    const error = new NoLobbyError();
    message.channel
      .send({ embeds: [error.embed] })
      .then((msg) => error.delete(msg));
  }
});

/* === REMOVE <ROLE> COMMAND =============================================== */

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith(prefix + "remove")) return;
  const isLobby = lobbyHandler.hasLobbyByID(message.channelId);

  if (isLobby) {
    const command = message.content.slice(1).split(" ").slice(1);
    let role, quantity;

    switch (true) {
      case [...roles, "all"].includes(command[0]):
        [role, quantity] = [command[0], 1];
        break;
      case parseInt(command[0]) > 0 && roles.includes(command[1]):
        [role, quantity] = [command[1], parseInt(command[0])];
        break;
    }

    const lobby = lobbyHandler.getLobbyByID(message.channelId);
    const lobbyMessage = await message.channel.messages.fetch(lobby?.getID()!);

    lobbyMessage.edit({
      embeds: [
        lobby?.removeRole(role as string, quantity as number) as MessageEmbed,
      ],
    });
  } else {
    const error = new NoLobbyError();
    message.channel
      .send({ embeds: [error.embed] })
      .then((msg) => error.delete(msg));
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
    if (lobby?.getPlayers().length === enoughPlayers)
      reaction.message.react(playEmoji);
  }

  // remove emojis from players that are not joinEmoji
  if (isLobby && notBot && !isJoinEmoji) {
    const lobby = lobbyHandler.getLobbyByID(reaction.message.channelId);
    // if the message was playEmoji...
    if (isPlayEmoji && lobby?.isReady()) {
      // start a game
      const newGame = gameHandler.createGameAt(
        reaction.message.channelId,
        lobby?.getPlayers()!,
        lobby?.roles!
      );
      reaction.message.channel
        .send({ embeds: [newGame.embed] })
        .then((embedMessage) => newGame.setID(embedMessage.id));
      // delete the lobby
      reaction.message.delete().catch((error) => console.log(error));
      lobbyHandler.removeLobbyByID(reaction.message.channelId);
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

    // if there are not enough players to start a game, remove playEmoji
    if (lobby?.getPlayers().length ?? 0 < enoughPlayers) {
      reaction.message.reactions.cache.get(playEmoji)?.remove();
    }
  }
});

client.login(process.env.TOKEN);
