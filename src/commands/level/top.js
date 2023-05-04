const db = require('../../db')

const {ApplicationCommandOptionType, EmbedBuilder, AttachmentBuilder} = require('discord.js')
const {servers, serverName} = require('../../config.json')
const fs = require('fs')

module.exports = {
  name: 'top',
  description: 'Top',
  options: [
    {
      name: 'server',
      description: 'The input to top',
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],
  callback: (client, interaction) => {
    const input = interaction.options.getString('server');
    const theServer = servers.filter(server => server.name.toLowerCase() === input.toLowerCase())
    if(theServer) {
        q = `SELECT name, value FROM ${theServer[0].table} ORDER BY value DESC LIMIT 10`;

            db.query(q, (err, result) => {
                if (err) {
                  console.log(err.sql);
                } else {
                    const fieldNames = result.map((r, i) => {
                        return `${i+1}. ${r.name}`
                    })
                    const fieldValues = result.map(r => {
                        return r.value.toString()
                    })
                    const logoData = fs.readFileSync(`./images/logo.png`)
                    const attachment = new AttachmentBuilder(logoData, {name: 'logo.png'})
                    const embed = new EmbedBuilder()
                    .setTitle(theServer[0].name)
                    .addFields(
                        {
                            name: "Name",
                            value: fieldNames.join('\n'),
                            inline: true
                        },
                        {
                            name: "Points",
                            value: fieldValues.join('\n'),
                            inline: true
                        }
                    )
                    .setColor("Random")
                    .setThumbnail(`attachment://logo.png`)
                    .setFooter({text: serverName, iconURL: `attachment://logo.png` })
                    .setTimestamp()
                    interaction.reply({
                        embeds: [embed],
                        files: [attachment]
                    })

                }
            })
    } else {
        interaction.reply("Server not found")
    }
  },
};