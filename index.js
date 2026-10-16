
require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

const channelId = process.env.CHANNEL_ID;
let counterMessage;

async function updateCounter(guild) {
  if (!counterMessage) {
    const channel = await client.channels.fetch(channelId);
    if (!channel?.isTextBased()) {
      throw new Error("CHANNEL_ID must be a text channel.");
    }

    if (process.env.MESSAGE_ID) {
      counterMessage = await channel.messages.fetch(
        process.env.MESSAGE_ID
      );
    } else {
      counterMessage = await channel.send("Loading member count...");
      console.log(
        "Add this message ID to .env:",
        counterMessage.id
      );
    }
  }

  await counterMessage.edit(
    `📊 **Server Statistics**\n\n` +
    `👥 Total Members: **${guild.memberCount}**`
  );
}

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const guild = client.guilds.cache.first();
  if (!guild) {
    console.error("The bot is not in a server.");
    return;
  }

  try {
    await updateCounter(guild);
  } catch (error) {
    console.error("Counter setup failed:", error);
  }
});

async function refresh(guild) {
  try {
    await updateCounter(guild);
  } catch (error) {
    console.error("Could not update counter:", error);
  }
}

client.on("guildMemberAdd", member => refresh(member.guild));
client.on("guildMemberRemove", member => refresh(member.guild));

client.login(process.env.DISCORD_TOKEN);
