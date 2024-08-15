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
        .setDescription(
          "The user to purge messages for (must be in the server)"
        )
    )
    .addStringOption((option) =>
      option
        .setName("user_id")
        .setDescription(
          "The user ID of the user to purge messages for (for users no longer in the server)"
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    // Get the target user from the command option
    const targetUser = interaction.options.getUser("target");
    const targetUserId = interaction.options.getString("user_id");

    // Verify either a user or user ID is provided
    if (!targetUser && !targetUserId) {
      return await interaction.reply({
        content:
          "You must provide either a user or a user ID to purge messages.",
        ephemeral: true,
      });
    }

    const userIdToPurge = targetUser ? targetUser.id : targetUserId;
    const userTag = targetUser ? targetUser.tag : `ID: ${userIdToPurge}`;

    // Notify the user that the purge has started
    await interaction.reply({
      content: `Starting to delete messages from ${userTag}.`,
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

          // Filter messages by the target user ID
          const userMessages = fetchedMessages.filter(
            (msg) => msg.author.id === userIdToPurge
          );

          // Attempt bulk deletion first
          if (userMessages.size > 0) {
            try {
              const deletedMessages = await channel.bulkDelete(
                userMessages,
                true
              );
              totalDeleted += deletedMessages.size;
            } catch (bulkError) {
              // Bulk delete failed (likely because messages are older than 14 days), fallback to individual deletion
              for (const msg of userMessages.values()) {
                try {
                  await msg.delete();
                  totalDeleted++;
                } catch (deleteError) {
                  console.error(
                    `Failed to delete message in ${channel.name}:`,
                    deleteError
                  );
                }
              }
            }
          }
        } while (fetchedMessages.size === 100); // Continue fetching more messages until less than 100 are returned
      } catch (error) {
        console.error(`Error in channel ${channel.name}:`, error);
      }
    }

    // Final message after the purge completes
    await interaction.editReply({
      content: `Deleted ${totalDeleted} messages from ${userTag}.`,
      ephemeral: true,
    });
  },
};
