const {
    Client,
    IntentsBitField,
} = require('discord.js')
const eventHandler = require('./handlers/eventHandler')
require('dotenv').config()
const {token} = require('./config.json')

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
})

eventHandler(client)

client.login(token)