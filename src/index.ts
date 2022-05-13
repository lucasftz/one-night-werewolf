import "dotenv/config";
import Discord from "discord.js";
import { edit } from "./utils";
// handlers
import LobbyHandler from "./modules/LobbyHandler";
import GameHandler from "./modules/GameHandler";
// errors
import IsLobbyError from "./modules/Errors/IsLobbyError";
import NoLobbyError from "./modules/Errors/NoLobbyError";
import IsGameError from "./modules/Errors/IsGameError";
import CommandError from "./modules/Errors/CommandError";
import NotImplementedError from "./modules/Errors/NotImplementedError";
import NotEnoughError from "./modules/Errors/NotEnoughError";
// constants
import { prefix, emojis, roles, enoughPlayers } from "./constants";

const lobbyHandler = new LobbyHandler();
const gameHandler = new GameHandler();
const { joinEmoji } = emojis;
const commands = ["create", "join", "leave", "add", "remove", "start", "help"];

const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS"],
});

/* === HANDLE UNKNOWN COMMANDS ============================================= */

client.on("messageCreate", (message) => {
  const isBot = message.author === client.user;
  const isTooShort = message.content.length === 1;
  const isPossibleCommand =
    !isBot && !isTooShort && message.content.at(1) !== " ";

  if (isPossibleCommand && message.content.startsWith(prefix)) {
    const commandName = message.content.split(" ")[0].slice(1);
    if (!commands.includes(commandName)) {
      // if not a valid command, send an error
      const error = new CommandError();
      message.channel
        .send({ embeds: [error.embed] })
        .then((msg) => error.delete(msg));
    }

    const isLobby = lobbyHandler.hasLobbyByID(message.channelId);
    const isGame = gameHandler.hasGameByID(message.channelId);
    // delete messages beginning with a prefix if there is a lobby or game going on
    if (isLobby || isGame) {
      message.delete().catch((error) => console.log(error));
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
    const isLobby = lobbyHandler.hasLobbyByID(message.channelId);
    const isGame = gameHandler.hasGameByID(message.channelId);
    if (isLobby || isGame) {
      // if there already is a lobby or a game in the channel, send an error
      const error = isLobby ? new IsLobbyError() : new IsGameError();
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

/* === JOIN COMMAND ======================================================== */

client.on("messageCreate", async (message) => {
  if (message.content === prefix + "join") {
    if (lobbyHandler.hasLobbyByID(message.channelId)) {
      // if there is a lobby
      const user = message.author.username;
      const lobby = lobbyHandler.getLobbyByID(message.channelId);
      const inLobby = lobby?.getPlayers().includes(user);
      const lobbyMessage = await message.channel.messages.fetch(
        lobby?.getID()!
      );
      // leave the lobby if the user is not already in the lobby
      if (!inLobby) edit(lobbyMessage, lobby?.addPlayer(user)!);
    } else {
      // if there is no lobby, send an error
      const error = new NoLobbyError();
      message.channel
        .send({ embeds: [error.embed] })
        .then((msg) => error.delete(msg));
    }
  }
});

/* === LEAVE COMMAND ======================================================= */

client.on("messageCreate", async (message) => {
  if (message.content === prefix + "leave") {
    if (lobbyHandler.hasLobbyByID(message.channelId)) {
      // if there is a lobby
      const user = message.author.username;
      const lobby = lobbyHandler.getLobbyByID(message.channelId);
      const lobbyMessage = await message.channel.messages.fetch(
        lobby?.getID()!
      );
      // leave the lobby
      edit(lobbyMessage, lobby?.removePlayer(user)!);
    } else {
      // if there is no lobby, send an error
      const error = new NoLobbyError();
      message.channel
        .send({ embeds: [error.embed] })
        .then((msg) => error.delete(msg));
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

    edit(lobbyMessage, lobby?.addRole(role as string, quantity as number)!);
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

    edit(lobbyMessage, lobby?.removeRole(role as string, quantity as number)!);
  } else {
    const error = new NoLobbyError();
    message.channel
      .send({ embeds: [error.embed] })
      .then((msg) => error.delete(msg));
  }
});

/* === START COMMAND ======================================================= */

client.on("messageCreate", async (message) => {
  if (message.content === prefix + "start") {
    if (lobbyHandler.hasLobbyByID(message.channelId)) {
      // if there is a lobby
      const lobby = lobbyHandler.getLobbyByID(message.channelId);
      const isReady = lobby?.isReady();
      if (isReady) {
        // if the lobby is ready, start a game
        const newGame = gameHandler.createGameAt(
          message.channelId,
          lobby?.getPlayers()!,
          lobby?.roles!
        );
        message.channel
          .send({ embeds: [newGame.embed] })
          .then((embedMessage) => newGame.setID(embedMessage.id));
        // delete the lobby
        const lobbyMessage = await message.channel.messages.fetch(
          lobby?.getID()!
        );
        lobbyMessage.delete().catch((error) => console.log(error));
        lobbyHandler.removeLobbyByID(message.channelId);
      } else if (lobby?.getPlayers().length! < enoughPlayers) {
        // if there aren't enough players, send an error
        const error = new NotEnoughError("players");
        message.channel
          .send({ embeds: [error.embed] })
          .then((msg) => error.delete(msg));
      } else {
        // if there aren't enough roles, send an error
        const error = new NotEnoughError("roles");
        message.channel
          .send({ embeds: [error.embed] })
          .then((msg) => error.delete(msg));
      }
    } else {
      // if there is no lobby, send an error
      const error = new NoLobbyError();
      message.channel
        .send({ embeds: [error.embed] })
        .then((msg) => error.delete(msg));
    }
  }
});

client.login(process.env.TOKEN);
