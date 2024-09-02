const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("group")
    .setDescription("Create a Looking For Group post for a dungeon."),
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
        const dungeonName = dungeonOptions.find(
          (opt) => opt.value === selectedDungeon
        ).label;

        // Create a message for users to react to with their roles
        const embed = new MessageEmbed()
          .setColor("#0099ff")
          .setTitle(`Sign up for ${dungeonName}`)
          .setDescription(
            "React to this message with your role:\n\n" +
              "🛡️ - Tank (Main)\n" +
              "⚔️ - Tank (Alt)\n" +
              "🎯 - DPS\n" +
              "❤️ - Healer (Main)\n" +
              "💊 - Healer (Alt)"
          );

        const signUpMessage = await i.channel.send({ embeds: [embed] });

        const emojis = ["🛡️", "⚔️", "🎯", "❤️", "💊"];
        for (const emoji of emojis) {
          await signUpMessage.react(emoji);
        }

        // Create a collector to handle the reactions
        const reactionCollector = signUpMessage.createReactionCollector({
          time: 60000, // 1 minute to react
        });

        const roles = {
          tankMain: [],
          tankAlt: [],
          dps: [],
          healerMain: [],
          healerAlt: [],
        };

        reactionCollector.on("collect", (reaction, user) => {
          if (user.bot) return;

          switch (reaction.emoji.name) {
            case "🛡️":
              roles.tankMain.push(user);
              break;
            case "⚔️":
              roles.tankAlt.push(user);
              break;
            case "🎯":
              roles.dps.push(user);
              break;
            case "❤️":
              roles.healerMain.push(user);
              break;
            case "💊":
              roles.healerAlt.push(user);
              break;
          }
        });

        reactionCollector.on("end", async () => {
          // Select the group
          let tank =
            roles.tankMain.length > 0
              ? roles.tankMain[0]
              : roles.tankAlt.length > 0
                ? roles.tankAlt[
                    Math.floor(Math.random() * roles.tankAlt.length)
                  ]
                : null;
          let healer =
            roles.healerMain.length > 0
              ? roles.healerMain[0]
              : roles.healerAlt.length > 0
                ? roles.healerAlt[
                    Math.floor(Math.random() * roles.healerAlt.length)
                  ]
                : null;
          let dps = [];

          if (roles.dps.length >= 3) {
            for (let i = 0; i < 3; i++) {
              const randomIndex = Math.floor(Math.random() * roles.dps.length);
              dps.push(roles.dps.splice(randomIndex, 1)[0]);
            }
          }

          // Check if a full group can be formed
          if (tank && healer && dps.length === 3) {
            const groupEmbed = new MessageEmbed()
              .setColor("#00ff00")
              .setTitle("Dungeon Group Formed")
              .setDescription(
                `**Dungeon:** ${dungeonName}\n` +
                  `**Tank:** ${tank.username}\n` +
                  `**Healer:** ${healer.username}\n` +
                  `**DPS:** ${dps.map((user) => user.username).join(", ")}`
              );

            await i.followUp({ embeds: [groupEmbed] });
          } else {
            await i.followUp("Not enough players to form a group.");
          }
        });

        await i.update({
          content: `You have selected ${dungeonName}. Players can now sign up for roles by reacting to the message.`,
          components: [], // Remove the select menu
          ephemeral: true,
        });
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
