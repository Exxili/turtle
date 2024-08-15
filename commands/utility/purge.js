const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription(
      "Delete messages from a particular user across all channels."
    )
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user to purge messages for")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    // Get the target user from the command option
    const targetUser = interaction.options.getUser("target");

    // Notify the user that the purge has started
    await interaction.reply({
      content: `Starting to delete messages from ${targetUser.tag}.`,
      ephemeral: true,
    });

    let totalDeleted = 0;

    // Loop through all channels in the guild
    const channels = interaction.guild.channels.cache.filter((channel) =>
      channel.isTextBased()
    );
    for (const [channelId, channel] of channels) {
      try {
        let fetchedMessages;
        do {
          // Fetch a batch of messages from the channel (limit of 100 per fetch)
          fetchedMessages = await channel.messages.fetch({ limit: 100 });

          // Filter messages by the target user
          const userMessages = fetchedMessages.filter(
            (msg) => msg.author.id === targetUser.id
          );

          // Bulk delete the user's messages
          if (userMessages.size > 0) {
            const deletedMessages = await channel.bulkDelete(
              userMessages,
              true
            );
            totalDeleted += deletedMessages.size;
          }
        } while (fetchedMessages.size === 100); // Continue fetching more messages until less than 100 are returned
      } catch (error) {
        console.error(`Error in channel ${channel.name}:`, error);
      }
    }

    // Final message after the purge completes
    await interaction.editReply({
      content: `Deleted ${totalDeleted} messages from ${targetUser.tag}.`,
      ephemeral: true,
    });
  },
};
