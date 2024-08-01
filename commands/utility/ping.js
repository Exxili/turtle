import { SlashCommandBuilder } from "discord.js";

/**
 * Ping Command
 */
export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  async execute(interaction) {
    await interaction.reply("Pong!");
  },
};
