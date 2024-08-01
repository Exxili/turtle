const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lfgtest")
    .setDescription("Create a Looking For Group post."),
  async execute(interaction) {
    await interaction.reply("lfgtest");
  },
};
