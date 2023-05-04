const {serverName} = require('../../config.json')

module.exports = (client) => {
    client.user.setActivity(serverName);
}