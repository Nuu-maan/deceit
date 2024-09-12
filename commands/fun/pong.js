module.exports = {
  name: 'pong',
  description: 'Replies with Pong and an embed!',
  async execute(message, args) {
    await message.channel.send({ content: `pong pong` });
  },
};
