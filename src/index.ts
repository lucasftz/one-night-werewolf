import "dotenv/config";
import Discord from "discord.js";

const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES"],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

client.login(process.env.TOKEN);
