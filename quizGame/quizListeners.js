const { makeid } = require('./utils');
//const { } = require('./game');

const MAX_IN_RANDOM = 5;
const gameState = {};
const clientRooms = {};
let publicRooms = [];

module.exports = function (io) {
    
io.on("connection", (socket) => { 
    socket.emit('initialConnect');
});

}