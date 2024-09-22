const { EMBED_COLOR, EMOJIS, PREFIX } = require('../../constants');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const ms = require('ms');
const { createEmbed } = require('../../helpers/commandInfoEmbed');

const userReminders = new Map(); // To keep track of reminders for each user

module.exports = {
  name: 'remindme',
  aliases: ['alarm'],
  description: 'Set a reminder with a specific time (supports seconds, minutes, hours, days) and reason',
  async execute(message, args) {
    if (!args.length) {
      const infoEmbed = createEmbed(
        'remindme',
        'Set a reminder for yourself with a specific duration and reason. Supports seconds (s), minutes (m), hours (h), and days (d).',
        'alarm',
        'None',
        `${PREFIX}remindme <time> <reason>\n${PREFIX}alarm <time> <reason>`
      );
      return message.channel.send({ embeds: [infoEmbed] });
    }

    const time = args[0];
    const reason = args.slice(1).join(' ') || 'No reason provided';
    const reminderDuration = ms(time);

    // Check for valid time
    if (!reminderDuration || reminderDuration < 10000 || reminderDuration > 604800000) { // 10s to 7d
      return message.channel.send({
        content: `${EMOJIS.ERROR} Invalid time format! Please use a format like '10s', '10m', '1h', '1d' etc. Minimum duration is 10 seconds and maximum is 7 days.`,
        deleteAfter: 5000,
      });
    }

    // Manage user reminders
    if (!userReminders.has(message.author.id)) {
      userReminders.set(message.author.id, []);
    }
    const userReminderList = userReminders.get(message.author.id);

    if (userReminderList.length >= 5) {
      return message.channel.send({
        content: `${EMOJIS.ERROR} You can only have up to 5 active reminders at a time.`,
        deleteAfter: 5000,
      });
    }

    // Create the reminder embed
    const reminderEmbed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle(`${EMOJIS.BELL} Reminder Set`)
      .setDescription(`I will remind you in **${time}**.`)
      .addFields({ name: 'Reason', value: reason })
      .setFooter({ text: `You can cancel the reminder with the button below.` })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('cancelReminder')
          .setLabel('Cancel Reminder')
          .setEmoji(EMOJIS.TRASH)
          .setStyle(ButtonStyle.Danger)
      );

    const reminderMessage = await message.channel.send({
      embeds: [reminderEmbed],
      components: [row],
    });

    // Store the reminder for cancellation
    userReminderList.push({ reminderMessage, timeout: null, reason });

    // Setup the reminder
    const timeout = setTimeout(async () => {
      const dmEmbed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle(`${EMOJIS.BELL} Reminder`)
        .setDescription(`It's time!`)
        .addFields({ name: 'Reason', value: reason })
        .setTimestamp();

      try {
        await message.author.send({ embeds: [dmEmbed] });
        reminderMessage.edit({
          content: `${EMOJIS.SUCCESS} Reminder complete! You have been notified via DM.`,
          components: [],
        });
      } catch (err) {
        message.channel.send(`${EMOJIS.ERROR} I was unable to send you a DM. Please check your privacy settings.`);
      }
      
      // Remove the reminder from the user's list after it's done
      userReminderList.splice(userReminderList.indexOf({ reminderMessage, timeout }), 1);
    }, reminderDuration);

    // Handle the button interaction for canceling the reminder
    const filter = (i) => i.customId === 'cancelReminder' && i.user.id === message.author.id;
    const collector = reminderMessage.createMessageComponentCollector({ filter, time: reminderDuration });

    collector.on('collect', async (i) => {
      clearTimeout(timeout);
      reminderMessage.edit({
        content: `${EMOJIS.TRASH} Reminder has been canceled.`,
        components: [],
      });
      userReminderList.splice(userReminderList.indexOf({ reminderMessage, timeout }), 1);
    });

    collector.on('end', (collected, reason) => {
      if (reason === 'time') {
        reminderMessage.edit({ components: [] });
      }
    });
  },
};
