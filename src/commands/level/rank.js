const db = require('../../db')

const {ApplicationCommandOptionType, EmbedBuilder, AttachmentBuilder, time} = require('discord.js')
const fs = require("fs");
const {servers, translations, serverName} = require('../../config.json');


const formatTime = (seconds) => {
  let hours = Math.floor(seconds / 3600);
  let minutes = Math.floor((seconds - (hours * 3600)) / 60);
  let remainingSeconds = seconds - (hours * 3600) - (minutes * 60);

  let formattedTime = '';
  if (hours > 0) {
    formattedTime += hours + translations.hours;
  }
  if (minutes > 0) {
    formattedTime += minutes + translations.minutes;
  }
  if (remainingSeconds > 0 && (hours > 0 || minutes > 0)) {
    formattedTime += remainingSeconds + translations.seconds;
  }
  if (formattedTime === '') {
    formattedTime = '0' + translations.seconds;
  }
  
  return formattedTime;
}

const formatDate = (value) => {
  const dateObj = new Date(value * 1000);

  const day = dateObj.getDate().toString().padStart(2, "0");
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
  const year = dateObj.getFullYear().toString();
  const hours = dateObj.getHours().toString().padStart(2, "0");
  const minutes = dateObj.getMinutes().toString().padStart(2, "0");

  const formattedDate = `${day}-${month}-${year} ${hours}:${minutes}`;
  return formattedDate
}

module.exports = {
  name: 'rank',
  description: 'Rank!',
  options: [
    {
      name: 'input',
      description: 'The input to rank',
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],
  callback: (client, interaction) => {
    const input = interaction.options.getString('input');
    
    let queryResults = [];
    
    for (let i = 0; i < servers.length; i++) {
      let q = "";
      if (input.startsWith('STEAM_')) {
        q = `SELECT * FROM ${servers[i].table} WHERE steam = ?`;
      } else {
        q = `SELECT * FROM ${servers[i].table} WHERE LOWER(name) LIKE '%${input}%'`;
      }
      db.query(q, (err, result) => {
        if (err) {
          console.log(err.sql);
        } else {
          queryResults.push(result);
          if (queryResults.length === servers.length) {
            const embeds = [];
            let attachments = []
            for (let i = 0; i < queryResults.length; i++) {
              if (queryResults[i].length > 0) {
                const fields = Object.entries(queryResults[i][0])
                  .filter(([name]) => name !== "name" && name !== "steam")
                  .map(([name, value]) => {
                    if(name === 'lastconnect') {
                      
                      return { name: name.charAt(0).toUpperCase() + name.slice(1), value: formatDate(value), inline: true };
                    } else if (name === 'playtime'){
                      return { name: name.charAt(0).toUpperCase() + name.slice(1), value: formatTime(value), inline: true };
                    }
                     else {
                      return { name: translations[name], value: value.toString(), inline: true };
                    }
                  });
                  
                  const rank = queryResults[i][0].rank;
                  const thumbnailPath = `./images/ranks/${rank}.png`;
                  const thumbnailData = fs.readFileSync(thumbnailPath);
                  const logoData = fs.readFileSync(`./images/logo.png`)
                  
                  const relative = time(new Date())
                if (fs.existsSync(thumbnailPath)) {
                  const embed = new EmbedBuilder()
                  .setTitle(servers[i].name)
                  .setThumbnail(`attachment://${rank}.png`)
                  .setFooter({text: serverName, iconURL: `attachment://logo.png` })
                  .setTimestamp()
                  .addFields(fields)
                  .setDescription(`Name: ${'`' + queryResults[i][0].name + '`'}\nSteam: ${'`' + queryResults[i][0].steam + '`'}`);
                
                  embeds.push(embed);
                  attachments.push(new AttachmentBuilder(thumbnailData, { name: `${rank}.png` }));
                  attachments.push(new AttachmentBuilder(logoData, {name: 'logo.png'}))
                } else {
                  const embed = new EmbedBuilder()
                    .addFields(fields)
                    .setFooter({text: serverName, iconURL: `attachment://logo.png` })
                    .setTimestamp()
                    embeds.push(embed);
                    attachments.push(undefined);
                }
                
              }
            }
            
            if (embeds.length > 0) {
              interaction.reply({ embeds: embeds, files: attachments });
            } else {
              interaction.reply("Player not found.");
            }
          }
        }
      });
    }
  },
};