const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("group")
    .setDescription("Form a Looking For Group post."),
  async execute(interaction) {
    // Create a message for users to react to with their roles
    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("Sign up for a Dungeon")
      .setDescription(
        "React to this message with your role:\n\n" +
          "🛡️ - Tank (Main)\n" +
          "⚔️ - Tank (Alt)\n" +
          "🎯 - DPS\n" +
          "❤️ - Healer (Main)\n" +
          "💊 - Healer (Alt)"
      );

    const signUpMessage = await interaction.reply({
      embeds: [embed],
      fetchReply: true,
    });

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
      // Ensure the reaction is from a user and not a bot
      if (user.bot) return;

      // Check the emoji and assign the user to the respective role
      switch (reaction.emoji.name) {
        case "🛡️": // Tank Main
          if (!roles.tankMain.includes(user.displayName)) {
            roles.tankMain.push(user.displayName);
          }
          break;
        case "⚔️": // Tank Alt
          if (!roles.tankAlt.includes(user.displayName)) {
            roles.tankAlt.push(user.displayName);
          }
          break;
        case "🎯": // DPS
          if (!roles.dps.includes(user.displayName)) {
            roles.dps.push(user.displayName);
          }
          break;
        case "❤️": // Healer Main
          if (!roles.healerMain.includes(user.displayName)) {
            roles.healerMain.push(user.displayName);
          }
          break;
        case "💊": // Healer Alt
          if (!roles.healerAlt.includes(user.displayName)) {
            roles.healerAlt.push(user.displayName);
          }
          break;
      }
    });

    reactionCollector.on("end", async () => {
      // Randomly select one user from an array if it contains multiple users
      const getRandomUser = (users) => {
        return users.length > 0
          ? users[Math.floor(Math.random() * users.length)]
          : undefined;
      };

      // Determine final group members
      const tank =
        roles.tankMain.length > 0
          ? getRandomUser(roles.tankMain)
          : roles.tankAlt.length > 0
            ? getRandomUser(roles.tankAlt)
            : undefined;
      const healer =
        roles.healerMain.length > 0
          ? getRandomUser(roles.healerMain)
          : roles.healerAlt.length > 0
            ? getRandomUser(roles.healerAlt)
            : undefined;
      const dps = roles.dps.length >= 3 ? roles.dps.slice(0, 3) : undefined;

      // Check if all required roles are filled
      if (!tank || !healer || !dps || dps.length < 3) {
        await interaction.followUp(
          "Error: Not enough members to form a full group (1 Tank, 1 Healer, 3 DPS)."
        );
        return;
      }

      // Create an embed to show the final group
      const groupEmbed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("Dungeon Group Formed")
        .setDescription(
          `**Tank:** ${tank}\n` +
            `**Healer:** ${healer}\n` +
            `**DPS:** ${dps.join(", ")}`
        );

      await interaction.followUp({ embeds: [groupEmbed] });
    });
  },
};
