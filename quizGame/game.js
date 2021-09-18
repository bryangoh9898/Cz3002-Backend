

const qns = require('./questions');
const colors = ["primary.main","secondary.main","error.main","warning.main","info.main","success.main"];
const GUESS_TIME = 30;
  function initGame(private) {
    const state = 
    {
      users:{/* socket.id:{username:XXX,points:XX,guessed:false,ready:false} */},
      round:0,
      timer:0,
      qns:[],
      qn:{question:"",answers:[],ans:0},
      private:private,//private room or public room
      courseCode:"CZ 3002"
    };
    return state;
  }
  function restartGame(state) {
    for (const userID in state.users) {
      state.users[userID].guessed = false;
      state.users[userID].points = 0;
    }
    state.round = 0;
    state.timer = 0;
    state.qn = {question:"",answers:[],ans:0};
  }

  function gameLoop(state)
  {
    let isFinished = false;
    if(state.timer >0)
    {
      --state.timer;
    }
    else
    {
        startNewRound(state);
        if(state.round > 5)
        {
            isFinished = true;
        }
    }
    return isFinished;
  }

  function startGame(state)
  {
    state.round = 1;
    state.timer = GUESS_TIME;
    state.qn = getRandomQn(state);
    state.qns.push(state.qn);
  }

  function startNewRound(state)
  {
    state.round++;
    state.timer = GUESS_TIME;
    state.qn = getRandomQn(state);
    state.qns.push(state.qn);
    //make every user can guess once again
    for (const userID in state.users) {
        state.users[userID].guessed = false;
      }
  }

  function getRandomQn(state)
  {
    const qnIndex = Math.floor(Math.random() * qns[state.courseCode].length);
    const qn=  qns[state.courseCode][qnIndex];
    return qn;
  }
  function createUser(username)
  {
    let randomColor = colors[Math.floor(Math.random() * colors.length)];
    return {username:username,points:0,guessed:false,color:randomColor,ready:false};
  }

  //call this when someone guessed
  function checkIfAllGuessed(state)
  {
      for (const userID in state.users) {
        if(state.users[userID].guessed == false){
          //end function if someone haven guess
          return;
        }
      }
      //all have guessed
      state.timer=0;
  }

  module.exports = {
    initGame,
    createUser,
    gameLoop,
    startGame,
    checkIfAllGuessed,
    restartGame,
    GUESS_TIME,
  }