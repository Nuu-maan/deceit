const { ChannelType } = require('discord.js');

module.exports = {
  name: 'echo',
  description: 'Creates 10 webhooks in the specified channel and spams a message.',
  async execute(message, args) {
    console.log('Executing echo command...');

    // Check if a channel is specified
    if (!args.length) {
      console.log('No channel specified.');
      return message.reply('Please specify a channel.');
    }

    // Get the channel from the arguments
    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);

    // Validate the channel
    if (!channel || channel.type !== ChannelType.GuildText) {
      console.log('Invalid channel provided.');
      return message.reply('Please provide a valid text channel.');
    }

    try {
      // Fetch existing webhooks in the channel
      const existingWebhooks = await channel.fetchWebhooks();
      console.log(`Existing webhooks count: ${existingWebhooks.size}`);

      // Delete existing webhooks if there are more than 5
      if (existingWebhooks.size > 5) {
        const deletePromises = [];
        for (const webhook of existingWebhooks.values()) {
          deletePromises.push(webhook.delete().catch(error => {
            console.error(`Failed to delete webhook ${webhook.name}:`, error);
          }));
        }
        await Promise.all(deletePromises);
        console.log('Deleted excess webhooks.');
      }

      // Create 10 webhooks named "LoL" in parallel
      const webhookPromises = [];
      for (let i = 0; i < 10; i++) {
        console.log(`Creating webhook ${i + 1}`);
        webhookPromises.push(channel.createWebhook({ name: 'LoL' }).catch(error => {
          console.error(`Failed to create webhook ${i + 1}:`, error);
        }));
      }
      const webhooks = await Promise.all(webhookPromises);
      console.log(`Total webhooks created: ${webhooks.length}`);

      // Filter out any failed webhook creations
      const successfulWebhooks = webhooks.filter(webhook => webhook !== undefined);
      console.log(`Successfully created webhooks: ${successfulWebhooks.length}`);

      // Prepare message content
      const messageContent = {
        content: '<@1247843122160074782>',
        embeds: null,
        attachments: [],
      };

      // Spam messages through all webhooks very fast
      const sendPromises = [];
      for (const webhook of successfulWebhooks) {
        for (let i = 0; i < 10; i++) { // Adjust the number of messages as needed
          sendPromises.push(webhook.send(messageContent).catch(error => {
            console.error('Error sending message through webhook:', error);
          }));
        }
      }
      await Promise.all(sendPromises);
      console.log('Sent messages through all webhooks.');

      message.reply('Successfully created 10 webhooks and spammed the message.');
    } catch (error) {
      console.error('An error occurred:', error);
      message.reply('An error occurred while executing the command.');
    }
  },
};
