import discord
from discord.ext import commands
import os
from rich.console import Console
from rich.logging import RichHandler
import logging

# Setup logging with rich
console = Console()
logging.basicConfig(level=logging.INFO, format="%(message)s", handlers=[RichHandler(console=console)])
logger = logging.getLogger("discord")

DISCORD_TOKEN = os.getenv('DISCORD_TOKEN')  # Ensure this token is set in your environment

intents = discord.Intents.default()
intents.message_content = True  # To receive message content
intents.guilds = True          # To receive guild (server) updates
intents.members = True         # To receive member updates (e.g., joining/leaving)
intents.reactions = True       # To receive reaction updates
intents.presences = True       # To receive presence updates (e.g., online status)

bot = commands.Bot(command_prefix='?', intents=intents)

@bot.event
async def on_ready():
    logger.info(f'Logged in as {bot.user}')

@bot.command(name='ping')
async def ping(ctx):
    await ctx.send('Pong!')

@bot.event
async def on_message(message):
    if message.author == bot.user:
        return
    await bot.process_commands(message)



if __name__ == "__main__":
    bot.run(DISCORD_TOKEN)
