import os
from dotenv import load_dotenv

load_dotenv()

# Bot settings
DISCORD_TOKEN = os.getenv('DISCORD_TOKEN')
PREFIXES = ['?']

# Database settings
DATABASE_URL = 'database.db'

# Additional settings can be added here
