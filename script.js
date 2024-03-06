//maybe say who is x and who is y
//change it from pausing before starting game and if you double click it goes bad
//make responsive

const minMax = (function(){
    function findEmptyInArr(arr){
        let count = 0;
        for(let ele of arr){
            if(!ele) count++;
        };
        return count;
    }
    function buildGameTree(symbol1, symbol2, board, currentSymbol){
        let symbol = currentSymbol;
        function createNode(arr){
            let value = arr;
            let children = [];
            return {value, children}
        };
        let initialNode = createNode(board);
        function populate(node, height, symbol){
            
            if(height == 0 || gameBoard.findWin(symbol1, node.value) || gameBoard.findWin(symbol2, node.value)){
                return;
            };
            let arr = node.value;
        
            for(let i = 0; i < getFreeIndexArr(arr).length; i++){
                let newArr = arr.slice(0);
                newArr[getFreeIndexArr(arr)[i]] = symbol;
                let newSymbol = (symbol == symbol1)? symbol2:symbol1;
                if(!node.children[i]){
                    node.children.push(createNode(newArr));
                    populate(node.children[i], height - 1, newSymbol);
                }  
            };
            
            return initialNode; 
        };

        function getFreeIndexArr(arr){
            let indices = [];
            for(let i = 0; i < arr.length; i++){
                if(!arr[i]){
                    indices.push(i);
                }
            };
            return indices;
        }
        return populate(initialNode, findEmptyInArr(board) + 1, symbol);
    };
    let maxEvaArr = [];

    
    function minimax(node, depth, maximizingPlayer, board){
        if(depth === 0 || node.children.length == 0){
           return node;
        }
        if(maximizingPlayer){
            let maxEva;
            for(let child of node.children){
                let eva = minimax(child, depth - 1, false, board);
                if(depth === findEmptyInArr(board)){
                    child.outcome = eva;
                    maxEvaArr.push(child);
                }
                maxEva = findMaxNode(eva, maxEva);       
            };
            return maxEva;  
        }
        else{
            let minEva;
            for(let child of node.children){
                let eva = minimax(child, depth - 1, true, board);
                minEva = findMinNode(eva, minEva);  
            };
            
            return minEva;
        }
    };
    function evaluateNode(node){
        if(gameBoard.findWin(game.getCurrentPlayer().getSymbol(), node.value)){
            return 1;
        }
        else if(gameBoard.findWin(game.getOtherPlayer().getSymbol(), node.value)){
            return -1;
        }
        return 0; 
    }
    function findMaxNode(a,b){
        if(!a) return b;
        if(!b) return a;
        let aValue = evaluateNode(a);
        let bValue = evaluateNode(b);
        if(aValue === bValue){
            return (Math.floor(Math.random() * 2))? a:b;
        }
        if(aValue > bValue) return a;
        return b ;
    };
    function findMinNode(a,b){
        if(!a) {
            return b;
        }
        if(!b){
            return a;
        }
        let aValue = evaluateNode(a);
        let bValue = evaluateNode(b);
        if(aValue === bValue){
            return (Math.floor(Math.random() * 2))? a:b;
        }
        
        if(aValue > bValue) return b;
        return a ;
    };
    function findSmartAIMove(gameArr,symbol){
        let board = gameArr;
        console.log(board);
        let maxEva = minimax(buildGameTree("x", "o", board, symbol), findEmptyInArr(board), true, board);
       
        let optimalNode;
        for(let i = 0; i < maxEvaArr.length; i++){
            if(maxEvaArr[i].outcome == maxEva){
                optimalNode = maxEvaArr[i];
            }
        };
       
        for(let i = 0; i < board.length; i++){
            if(optimalNode.value[i] && !board[i]){
                return i;
            }
        }
    }
    return {findSmartAIMove}
   
})()
const gameBoard = (function(){
    let gameboard = ["","","",
                     "","","",
                     "","","",];

    let winArr = [[0,1,2], [3,4,5],[6,7,8],
    [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];

    const getWinArr = () => winArr;
   
    function findComputerIndex(symbol,type){
        if(type === "easy"){
            let index = Math.floor(Math.random() * 9);
            if(gameboard[index]) return findComputerIndex(symbol, type);
            console.log(index)
            return index;
        }
        else{
        return minMax.findSmartAIMove(gameboard,symbol);
        }
        
    };

    function resetGameBoard(){
        gameboard = ["","","","","","","","","",];    
    }
    function addToBoard(index, symbol){
        gameboard[index] = symbol;
    };
    function getBoard(){
        return gameboard;
    }
    function checkTie(arr){
        for(let elem of gameboard){
            if(elem === "") return false
        }
        return true;
        
    }
    
    function findWin(symbol, gameArr){
        for(let arr of winArr){
            let [a,b,c] = arr;
            if(gameArr[a] === symbol && gameArr[b] === symbol 
                && gameArr[c] === symbol){
                    return [a,b,c];
                }
        }
        return false;
    }
    function getSpotTaken(index){
        return (gameboard[index])? true: false ;
    };

    return {addToBoard, findComputerIndex, getBoard, findWin, checkTie, 
        getSpotTaken, getWinArr, resetGameBoard};

})();

function createPlayer(name, symbol, type){

 
    const getSymbol = () => symbol;
    const getName = () => name;
    function updateName(newName){
        if(newName) name = newName;
    }
    const getType = () => type;
    const updateType = (newType) => type = newType;

    function takeTurn(index){
        if(game.canTakeTurn(index, symbol)){
            game.playRound(index);

        };

    };

    return {takeTurn, getName, getSymbol, getType, updateName, updateType};
};

const game = (function(){
    const Player1 = createPlayer("Player 1", 'x', "player");
    const Player2 = createPlayer("Player 2", "o", "player"); 

    let gameOver = false;
    let currentPlayer;
    let firstPlayer;

    function updateFirstPlayer(){
        firstPlayer = (firstPlayer === Player1)? Player2: Player1;
    }
    function initializeGame(name1, name2, type1,type2){
        Player1.updateName(name1);
        Player1.updateType(type1);
        Player2.updateName(name2);
        Player2.updateType(type2);
        currentPlayer = Player1;
        firstPlayer = Player1;
        if(getCurrentPlayer().getType() !== "player"){
            takeComputerTurn();
        }
    }


    function resetGame(){
        gameBoard.resetGameBoard();
        displayControls.resetGameBoard();
        updateFirstPlayer();
        currentPlayer = firstPlayer;
        gameOver = false;
        if(getCurrentPlayer().getType() !== "player"){
            takeComputerTurn();
        }
    };
    function takeComputerTurn(){
        getCurrentPlayer().takeTurn(gameBoard.findComputerIndex(getCurrentPlayer().getSymbol(), 
        getCurrentPlayer().getType()));
    }

    const getCurrentPlayer = () => currentPlayer;
    const getOtherPlayer = () => (getCurrentPlayer() == Player1)? Player2: Player1;
    function updateCurrentPlayer(){
        currentPlayer = ( currentPlayer == Player1)? Player2: Player1;
    }
    function playRound(index){
        displayControls.addSymbol(currentPlayer.getSymbol(), index);
        gameBoard.addToBoard(index, currentPlayer.getSymbol());
        if(gameBoard.findWin(currentPlayer.getSymbol(),gameBoard.getBoard())){
            gameOver = true;
            displayControls.displayGameOver(gameBoard.findWin(currentPlayer.getSymbol(), gameBoard.getBoard()), currentPlayer);
            
        } 
        else if(gameBoard.checkTie(gameBoard.getBoard())){
            displayControls.displayGameOver();
            gameOver = true;   
        
        }
        updateCurrentPlayer();
        if(getCurrentPlayer().getType() !== "player" && !gameOver){
            setTimeout(takeComputerTurn, 1000); 
            
        }
    
    };
    const getGameOver = () => gameOver;

    function canTakeTurn(index){
        if(gameOver || gameBoard.getSpotTaken(index)) return false;
        return true;
    }

    return {playRound, canTakeTurn, getCurrentPlayer, resetGame, initializeGame, getOtherPlayer};

})();

const displayControls = (function(){
    const introContainer = document.querySelector(".intro-container");
    const startGameBtn = document.querySelector(".start-game-btn");
    const gameContainer = document.querySelector(".game-container");
    const squares = document.querySelectorAll("[class^='square']");
    const newGameBtn = document.querySelector(".new-game-btn");
    const backBtn = document.querySelector(".back-btn");
    const mainContainer = document.querySelector(".main-container");

    mainContainer.classList.add("no-display");

    startGameBtn.addEventListener(("click"), () => {
        mainContainer.classList.remove("no-display");
        introContainer.classList.add("no-display");
        let name1 = introContainer.querySelector("div.player-one input").value;
        let name2 = introContainer.querySelector("div.player-two input").value;
        let type1 = introContainer.querySelector("select.player-one option:checked").value;
        let type2 = introContainer.querySelector("select.player-two option:checked").value;
        game.initializeGame(name1, name2, type1, type2);
        resetValues(name1, name2, type1, type2);
    });
    function resetValues(...args){
        for(let element of args){
            element = "";
        }
    }
    
    
    squares.forEach((square) => {
        square.addEventListener("click", () => {
            let squareNum = square.className.charAt(square.className.length - 1);
            game.getCurrentPlayer().takeTurn(squareNum);   
        })
    });
    function addSymbol(symbol,index){
        const square = document.querySelector(`[class$="${index}"]`);
        const symbolContainer = document.createElement("p");
        symbolContainer.textContent = symbol;
        let symbolClass = (symbol === "x")? "x-square": "o-square";
        symbolContainer.classList.add(symbolClass);
        square.appendChild(symbolContainer);
    };
    function displayGameOver(arr, winner){
        displayRoundResults(winner)
        if(winner) drawLine(arr);
    }

    function displayRoundResults(winner){
        const endMessage = document.createElement("h1");
        if(winner){
            endMessage.textContent = `${winner.getName()} got tic-tac-toe!`;
        }
        else{
            endMessage.textContent = `It's a cat's game`;
        }
        endMessage.classList.add("end-message");
        mainContainer.appendChild(endMessage);
        //players color as their name color in end message

    }

    function drawLine(arr){
        let winningLine = findWinningLine(arr);
        let lineNode = document.createElement("img");
        lineNode.setAttribute("src", `./lines/${winningLine}`);
        lineNode.classList.add("winning-line");
        gameContainer.appendChild(lineNode);
    }
    function findWinningLine(arr){
       let stringWinArr = gameBoard.getWinArr().map((ele) => ele.join(""));
       let index = stringWinArr.findIndex((ele) => ele == arr.join(""));
       let lineArr = ["top-across.svg", "center-across.svg", "bottom-across.svg",
                      "left-down.svg", "center-down.svg", "right-down.svg",
                    "tlbr-line.svg", "bltr-line.svg"] ;
        return lineArr[index];
    }

    newGameBtn.addEventListener("click", () =>{
        game.resetGame();
    })
    backBtn.addEventListener("click", () => {
        game.resetGame();
        mainContainer.classList.add("no-display");
        introContainer.classList.remove("no-display");
    })
    function resetGameBoard(){
        squares.forEach((square) => {
            while(square.firstChild){
                console.log(square.firstChild);
                square.removeChild(square.firstChild);
            }
            
           
        })
        let winningLine = document.querySelector(".winning-line");
        if(winningLine)gameContainer.removeChild(winningLine);  
        if(document.querySelector(".end-message")){
            mainContainer.removeChild(document.querySelector(".end-message"))
        };
    
    }

    return {addSymbol, displayGameOver, resetGameBoard};

})();
//console.log(gameBoard.findComputerIndex());
