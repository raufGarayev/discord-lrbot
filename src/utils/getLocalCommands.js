const path = require('path')
const getallFiles = require('./getallFiles')

module.exports = (exceptions = []) => {
    let localCommands = []

    const commandCategories = getallFiles(path.join(__dirname, '..', 'commands'), true)

    for(const commandCategory of commandCategories) {
        const commandFiles = getallFiles(commandCategory)
        
        for(const commandFile of commandFiles) {
            const commandObject = require(commandFile)
            
            if(exceptions.includes(commandObject.name)) {
                continue;
            }
            
            localCommands.push(commandObject)
        }
    }

    return localCommands
}