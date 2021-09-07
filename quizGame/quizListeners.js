const { makeid } = require('./utils');
const { initGame,createUser,gameLoop,startGame,checkIfAllGuessed,restartGame,GUESS_TIME} = require('./game');

const MAX_IN_RANDOM = 5;
const gameState = {};
const clientRooms = {};
let publicRooms = {
    "CZ 3002":[],
    "CZ 2001":[],
    "CZ 1001":[],
    "CZ 1002":[],
    "CZ 1003":[],
};

module.exports = function (io) {
    
io.on("connection", (socket) => { 
    socket.emit('initialConnect');
    socket.on('newGame', handleNewGame);
    socket.on('leaveGame',handleLeaveGame);
    socket.on('joinGame', handleJoinGame);
    socket.on('randomGame', handleRandomGame);
    
    socket.on('startGame',handleStartGame);
    socket.on('disconnect', handleLeaveGame);
    socket.on('chat',(msg)=>{handleChat(msg)});
    socket.on('guess',(guess)=>{handleGuess(guess)});
    socket.on('getGameState',handleGetGameState);

    function handleNewGame(username,courseCode) {
        console.log("NEW GAME username: " + username + " courseCode: " + courseCode);
        handleLeaveGame();
        let roomName = makeid(6);
        clientRooms[socket.id] = roomName;
        socket.emit('gameCode', roomName);
        gameState[roomName] = initGame(true); //private game
        gameState[roomName].users[socket.id]= createUser(username);
        gameState[roomName].courseCode = courseCode;
        socket.join(roomName);
        io.to(roomName).emit('gameStateUpdate',gameState[roomName]);
      }

    function handleLeaveGame()
    {
        if(clientRooms.hasOwnProperty(socket.id))
        {
            let roomName = clientRooms[socket.id];
            socket.leave(roomName);
            delete gameState[roomName].users[socket.id];
            let numUsers = Object.keys(gameState[roomName].users).length;
            if(numUsers == 0)
            {
            if(!gameState[roomName].private)
            {
                publicRooms[gameState[roomName].courseCode] = publicRooms[gameState[roomName].courseCode].filter(e => e !== roomName);
            }

            delete gameState[roomName];
            
            }
            else{
            if(!gameState[roomName].private && gameState[roomName].round ==0 && numUsers == MAX_IN_RANDOM-1)
            {
                publicRooms[gameState[roomName].courseCode].push(roomName);
            }
            io.to(roomName).emit('gameStateUpdate',gameState[roomName]);
            }
            delete clientRooms[socket.id];
        }
    }

    function handleJoinGame(username,courseCode,roomName)
    {
      handleLeaveGame();
      clientRooms[socket.id] = roomName;
      if(!gameState.hasOwnProperty(roomName))
      {
        gameState[roomName] = initGame(true);
        gameState[roomName].courseCode = courseCode;
      }
      if(gameState[roomName].courseCode != courseCode)
      {
        return;
      }
      socket.emit('gameCode', roomName);
      gameState[roomName].users[socket.id]= createUser(username);
      socket.join(roomName);
      io.to(roomName).emit('gameStateUpdate',gameState[roomName]);
    }

    function handleRandomGame(username,courseCode)
    {
      handleLeaveGame();
      if(publicRooms[courseCode].length >0)
      {
        let roomName = publicRooms[courseCode][0];
        handleJoinGame(username,courseCode,roomName);
        if(Object.keys(gameState[roomName].users).length >=MAX_IN_RANDOM)
        {
            publicRooms[courseCode].shift();
        }
      }
      else{
          //create new random room
          let roomName = makeid(6);
          clientRooms[socket.id] = roomName;
          socket.emit('gameCode', roomName);
          gameState[roomName] = initGame(false);
          gameState[roomName].users[socket.id]= createUser(username);
          gameState[roomName].courseCode = courseCode;
          socket.join(roomName);
          io.to(roomName).emit('gameStateUpdate',gameState[roomName]);
          publicRooms[courseCode].push(roomName);
      }
    }

    function handleStartGame()
    {
        if(clientRooms.hasOwnProperty(socket.id))
        {
            let roomName = clientRooms[socket.id];
            if(gameState[roomName].round ==0) //TODO add check if all ready first before starting
            {
              if(!gameState[roomName].private) // if public room, remove it from public room list
              {
                publicRooms[gameState[roomName].courseCode].filter(e => e !== roomName);
              }
              startGame(gameState[roomName]);
              startGameInterval(roomName);
            }
            
            io.to(roomName).emit('gameStateUpdate',gameState[roomName]);
        }
    }

    function startGameInterval(roomName) {
        const intervalId = setInterval(() => {
          if(!gameState.hasOwnProperty(roomName)) //if gamestate does not have that room , clear interval
          {
            clearInterval(intervalId);
            return;
          }
          const isFinished = gameLoop(gameState[roomName]);
          io.to(roomName).emit('gameStateUpdate',gameState[roomName]);
          if (isFinished) {
            clearInterval(intervalId);
            restartGame(gameState[roomName]);
          }
        }, 1000);
      }

      function handleChat(msg)
      {
          try {
            let user = gameState[clientRooms[socket.id]].users[socket.id];
            io.to(clientRooms[socket.id]).emit('chat',{username:user.username,msg:msg,color:user.color});
          } catch (error) {
            handleLeaveGame();
          }
        
      }

      function handleGuess(guess)
    {
      if(clientRooms.hasOwnProperty(socket.id))
      {
        let roomName = clientRooms[socket.id];
        //if player has guessed already, dont do anything
        if(gameState[roomName].users[socket.id].guessed)
        {
          return;
        }
        if(gameState[roomName].qn.ans == guess)
        {
          let responseTime = GUESS_TIME- gameState[roomName].timer;
          let pointsToAdd = parseInt((1-((responseTime/GUESS_TIME)/2)) * 1000);
          gameState[roomName].users[socket.id].points += pointsToAdd;
          sendCorrectGuessMsg(pointsToAdd);          
        }
        else
        {
            sendWrongGuessMsg();
        }
        gameState[roomName].users[socket.id].guessed = true;
        checkIfAllGuessed(gameState[roomName]);
      }
    }

    function sendCorrectGuessMsg(points)
    {
        try {
            let user = gameState[clientRooms[socket.id]].users[socket.id];
            let msg = `${user.username} answered correctly! +${points} points`;
            io.to(clientRooms[socket.id]).emit('chat',{username:"",msg:msg,color:"success.main"});
            playSound("correct");
        } catch (error) {
            handleLeaveGame();
        }
    }

    function sendWrongGuessMsg()
    {
        try {
            socket.emit('chat',{username:"",msg:"Wrong Answer!",color:"error.main"});
            playSound("wrong");
        } catch (error) {
            handleLeaveGame();
        }
    }

    function playSound(sound)
    {
      socket.emit('sound',sound);
    }

    function handleGetGameState()
    {
        if(clientRooms.hasOwnProperty(socket.id))
        {
            let roomName = clientRooms[socket.id];
            io.to(roomName).emit('gameStateUpdate',gameState[roomName]);
        }
    }


});

}