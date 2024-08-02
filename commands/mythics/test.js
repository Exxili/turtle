const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lfgtest")
    .setDescription("Create a Looking For Group post."),
  async execute(interaction) {
    // Define the options for the select menu (list of dungeons)
    const dungeonOptions = [
      { label: "Dungeon 1", value: "dungeon1" },
      { label: "Dungeon 2", value: "dungeon2" },
      { label: "Dungeon 3", value: "dungeon3" },
      // Add more dungeons as needed
    ];

    // Create a select menu component
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("select-dungeon")
      .setPlaceholder("Select a dungeon...")
      .addOptions(dungeonOptions);

    // Create an action row to hold the select menu
    const row = new ActionRowBuilder().addComponents(selectMenu);

    // Send the initial interaction response with the select menu, visible only to the user
    await interaction.reply({
      content: "Please select the dungeon you will be doing:",
      components: [row],
      ephemeral: true,
    });

    // Create a collector to handle the user's selection
    const collector = interaction.channel.createMessageComponentCollector({
      componentType: "SELECT_MENU",
      time: 60000, // 1 minute to respond
    });

    collector.on("collect", async (i) => {
      if (i.user.id === interaction.user.id) {
        // Handle the user's selection
        const selectedDungeon = i.values[0]; // Get the selected dungeon value
        await i.update({
          content: `You have selected ${dungeonOptions.find((opt) => opt.value === selectedDungeon).label}. What next?`,
          components: [], // Remove the select menu
          ephemeral: true,
        });

        // Continue with the next question or action here
      } else {
        // If another user tries to interact, send a message indicating they can't
        await i.reply({
          content: "This selection is not for you!",
          ephemeral: true,
        });
      }
    });

    collector.on("end", async (collected) => {
      if (collected.size === 0) {
        await interaction.editReply({
          content: "You did not select a dungeon in time.",
          components: [],
          ephemeral: true,
        });
      }
    });
  },
};
