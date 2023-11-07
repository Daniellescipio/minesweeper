const easyBoard = document.getElementById("easyGameBoard")
const mediumBoard = document.getElementById("mediumGameBoard")
const hardBoard = document.getElementById("hardGameBoard")
const easyButton = document.getElementById("easy")
const mediumButton = document.getElementById("medium")
const hardButton = document.getElementById("hard")
const restartButton = document.getElementById("restart")
//an array of pbjects that will tell each cell it's surrounding cells
const cellPositionArray = []
//an array to hold all of the indexes where we want a bomb placed
const bombIndexes = []
//to populate the board
const levels ={
    easy: {
        cells:80,
        bombs:10,
        level:"easy"
    },
    medium: {
        cells:256,
        bombs:40, 
        level:"medium"
    },
    hard: {
        cells:480,
        bombs:99, 
        level:"hard"
    }
}
let level = "easy"
let populated = false;
let active = false

const setCalculations = ()=>{
    //difference between cell indexes above and below  cell
    let vertCalc
    //difference between cell indexes next to cell
    let horizCalc = 1
    //difference between cell indexes that form a positive slope with cell (bottom left and top right)
    let posSlopeCalc
    //difference between cell indexes that form a negative slope with cell (top left and bottom right)
    let negSlopeCalc
    if(level ==="easy"){
        vertCalc = 10
        posSlopeCalc = 9
        negSlopeCalc = 11
    } else if(level ==="medium"){
        vertCalc = 16
        posSlopeCalc = 15
        negSlopeCalc = 17
    }else if(level ==="hard"){
        vertCalc = 24
        posSlopeCalc = 23
        negSlopeCalc = 25
    }
    return {vertCalc, horizCalc, posSlopeCalc, negSlopeCalc}
}

//the board will be populated when a user clicks on a cell
//we wait for the user to click to make sure the area they are clicking is clear ie it is not a bomb nor is it have a bomb around it
//this functions accepts the cell the user clicked as a parameter
const populateBoard = (target)=>{
    //array methods can't be applied to html list, so we spread the list into another array
    const cells = level === "easy"? [...easyBoard.children] : level === "medium" ?  [...mediumBoard.children] : [...hardBoard.children]
    //we keep track of this cell so we know the area that will need to be cleared as we populate the board with bombs
    const targetIndex = target.getAttribute("id")-1 //minus one to account for addition of one in board creation
    const calculations = setCalculations()
    //this object is all of the cells indexes that must be clear of bombs, all of the cells surrounding where the user clicked.
    const targetObj = {
        top : targetIndex - calculations.vertCalc,
        bottom : targetIndex + calculations.vertCalc,
        left : targetIndex - calculations.horizCalc,
        right : targetIndex + calculations.horizCalc,
        topLeft : targetIndex - calculations.negSlopeCalc,
        topRight : targetIndex - calculations.posSlopeCalc,
        bottomLeft : targetIndex + calculations.posSlopeCalc,
        bottomRight : targetIndex + calculations.negSlopeCalc,
    }
    //we get how many bombs we should have from the level
    for(let i =0; i<levels[level].bombs; i++){
        //we randomly choose an index in our cells to place a bomb
        let bombIndex = Math.floor(Math.random()*levels[level].cells)
        //if our bomb Index is already in the array(so a bomb will already be placed in that spot) or the bomb is in the forbidden area(where the user clicked or the surrounding sqaures) we will get a new bomb Index, this is in a while loop so the bomb Index will not be set until those conditions are met.
        while(
        bombIndexes.indexOf(bombIndex) >= 0 || 
        bombIndex === targetIndex ||
        bombIndex === targetObj.top ||
        bombIndex === targetObj.bottom ||
        bombIndex === targetObj.left ||
        bombIndex === targetObj.right ||
        bombIndex === targetObj.topRight ||
        bombIndex === targetObj.topLeft ||
        bombIndex === targetObj.bottomLeft ||
        bombIndex === targetObj.bottomRight )
        {
            bombIndex = Math.floor(Math.random()*levels[level].cells)
        }
        //push the bomb into an array so we can check for duplicates
        bombIndexes.push(bombIndex)
        //create a bomb and append it to the cell of the index we just got, make sure that cell knows its a bomb
        const bomb = document.createElement("img")
        bomb.setAttribute("src","images/bomb.png" )
        bomb.classList.add("bomb")
        cells[bombIndex].append(bomb)
        cells[bombIndex].setAttribute("bomb", true)
    }
    //after we put bombs on the board, we need to let each cell know if it is near a bomb or not
    getPositionObj(cells)
    //So all the bombs are placed(away from the users click) and all the cells know if they are near a bomb or not
    //now we send the square the user clicked to the same function that will be checking for bombs, it will just clear the squares around where the user clicked.
    checkBombs(target)
    //we let our program know the board is programmmed
    populated = true
}

const depopulateBoard = (lev)=>{
    const board = lev.level === "easy"?easyBoard : lev.level === "medium" ? mediumBoard :hardBoard
    if(board.children.length>0){
        const cells = [...board.children]
        cells.forEach(cell=>board.removeChild(cell))
    }
}

const getPositionObj = (cells)=>{
    //so we map through the cells...
    const calculations = setCalculations()
    cells.forEach((cell, i)=>{
        //and create this object for each cell, which is generally ok, but...
        const cellObj = {
            top : cells[i - calculations.vertCalc] && cells[i - calculations.vertCalc],
            bottom : cells[i + calculations.vertCalc] && cells[i + calculations.vertCalc],
            left : cells[i - calculations.horizCalc] && cells[i - calculations.horizCalc],
            right : cells[i + calculations.horizCalc] && cells[i + calculations.horizCalc],
            topLeft : cells[i - calculations.negSlopeCalc] && cells[i - calculations.negSlopeCalc],
            topRight : cells[i - calculations.posSlopeCalc] && cells[i - calculations.posSlopeCalc],
            bottomLeft : cells[i + calculations.posSlopeCalc] && cells[i + calculations.posSlopeCalc],
            bottomRight : cells[i + calculations.negSlopeCalc] && cells[i + calculations.negSlopeCalc],
        }
        //we'll need to let the edges know to ignore certain cells so they doesn't jump to clear across the board or break our code(for example cells[11] on the left edge doesn't have a left square, but -1 to get it's left square will give us cells[10] which is on the right edge...that's bad.  alternatively cells[8] at the top edge -10 to get the cell above it will break this code...also bad)
        //top edge
        if(level === "easy" && i < 10 || level === "medium" && i < 16 || level === "hard" && i < 24){
            cellObj.top = undefined
            cellObj.topLeft = undefined
            cellObj.topRight = undefined
        }
        //left edge
        if(level === "easy" && i % 10 === 0 || level === "medium" && i % 16 === 0 || level === "hard" && i % 24 === 0){
            cellObj.left = undefined
            cellObj.topLeft = undefined
            cellObj.bottomLeft = undefined
        }
        //right edge
        if(level === "easy" && i % 10 === 9 || level === "medium" && i % 16 === 15 || level === "hard" && i % 24 === 23) {
            cellObj.right = undefined
            cellObj.bottomRight = undefined
            cellObj.topRight = undefined
        }
        //bottom edge
        if(level === "easy" && i >= 70 || level === "medium" && i >= 240 || level ==="hard" && i >= 456){
            cellObj.bottom = undefined
            cellObj.bottomLeft = undefined
            cellObj.bottomRight = undefined
        }
        //after the obj is created, push it into the global variable we created
        cellPositionArray.push(cellObj)
        //so we don't have to go through json, we just assing this cell the objects index in it's array.
        cell.setAttribute("positionObj", cellPositionArray.indexOf(cellObj))
        //now that we know the cells surrounding it, we can check them for bombs...
        //if let's make sure the cell itself is not a bomb...
        if(!cell.getAttribute("bomb")){
            //let's assume there are 0 bombs surrounding each cell to start
            let bombNum =0
            for(const key in cellObj){
                //everytime we find one, we raise that number by 1
                if(cellObj[key]&&cellObj[key].getAttribute("bomb")){
                    bombNum++
                }
            }
            //if there are no bombs, the cell will be clear if not we create a image node with a picture of a bomb and append that number to it and it to the dom
            bombNum = bombNum===0 ? "" : bombNum
            const numHolder = document.createElement("p")
            numHolder.textContent = bombNum
            cell.append(numHolder)
        }
    })
}

const checkBombs=(cell)=>{
    //array methods can't be applied to html list, so we spread the list into another array
    const cells = level === "easy"? [...easyBoard.children] : level === "medium" ?  [...mediumBoard.children] : [...hardBoard.children]
    //find all the bombs...
    const bombs = cells.filter(cell=>cell.getAttribute("bomb"))
    //and all the cells that are not bombs
    const notBombs = cells.filter(cell=>!cell.getAttribute("bomb"))
    //if the cell we clicked is a bomb...
    if(bombs.indexOf(cell)>=0){
        //show all the bombs, show the restart button, turn the board off
        bombs.forEach(bomb=>{
            bomb.querySelector(".overlay").style.display = "none"
            restartButton.style.display = "block"
            active = false
        })
    }else{
        //the way this works in my head is when a user clicks a square, This ONLY takes the overlay off
        //if the clicked cell is blank, so it is nowhere near a bomb, that sqaure will be revealed and this function will run recursively on every sqaure surrounding it that is also blank, it will stop when it reachs a block with a number in it. the block with the number will be next to at least one bomb. 
        //if the clicked cell has a number in it, only that cell will be revealed.
        //ok...now in code
        //get it's text, position object and take off it's overlay
        let text = cell.querySelector("p")
        const positionObj = cellPositionArray[cell.getAttribute("positionObj")]
        let overLay = cell.querySelector(".overlay")
        overLay.style.display = "none"
        //if it is a blank square
        if(text.textContent === ""){
            //check it's position object
            for(const key in positionObj){
                //remember at the edges some of these will be undefined, so first check to make sure it exists...
                if(positionObj[key]){
                    //if the square a user is click was blank, that means there are no bombs surrounding it/a user can't get clues from it, so we want to take off the over lay of all it's surrounding squares in hopes of giving the user some more clues...
                    overLay = positionObj[key].querySelector(".overlay")
                    //if the overlay is still there (the square clicked will be in the position object for the all it's surrounding cells, so we only look at the cell that haven't been uncovered to avoid an endless loop
                    if(overLay.style.display !== "none"){
                        //get it's text...
                         text = positionObj[key].querySelector("p")
                        if(text && text.textContent === ""){
                            checkBombs(positionObj[key])
                        }
                        //the actually point of the function lol
                        overLay.style.display = "none"
                    }    
                }  
            }
        }
        //check to see what cells still need to be uncovered
        const remainingCells = notBombs.filter(cell=>!(cell.querySelector(".overlay").style.display==="none"))
        //if there are no more cells to be uncovered
        if(remainingCells.length<=0){
            //turn the board green, show the restart button, turn the board off
            notBombs.map(cell=>cell.style.backgroundColor = "green")
            restartButton.style.display = "block"
            active = false
        }
        
    }
}
//this is the function that will be called when the user clicks
const bombs = (e)=>{
    //there are no bombs until the user clicks, if it's their first click, we populate the board
    if(!populated){
        populateBoard(e.target.parentElement)
        active = true
    //otherwise we check that cell for bombs
    }else if(active){
        checkBombs(e.target.parentElement)
    }
}
//create he board based on the level we are given
const createBoard = (lev)=>{
    depopulateBoard(lev)
    for(let i = 0; i <lev.cells; i++){
        const square = document.createElement("div")
        //just so when we do math later we don't have to start at 0
        square.setAttribute("id", i+1)
        //cell that holds bomb or number
        square.classList.add("square")
        //overlay covering cell
        const squareOverlay = document.createElement("div")
        squareOverlay.classList.add("overlay")
        square.append(squareOverlay)
        squareOverlay.addEventListener("click", bombs)
        //append to the correct board
        if(lev.level === "easy"){
            easyBoard.append(square)
            easyBoard.style.display = "grid"
            mediumBoard.style.display = "none"
            hardBoard.style.display = "none"
        }else if(lev.level === "medium"){
            mediumBoard.append(square)
            mediumBoard.style.display = "grid"
            easyBoard.style.display = "none"
            hardBoard.style.display = "none"
        }else if(lev.level === "hard"){
            hardBoard.append(square)
            hardBoard.style.display = "grid"
            mediumBoard.style.display = "none"
            easyBoard.style.display = "none"
        }
    }
    populated=false
    active = false
}
//set's the level based on level buttons
const setLevel = (newLevel)=>{
    //shows the correct board, hides the others
    level = newLevel
    createBoard(levels[newLevel])

}
easyButton.addEventListener("click", ()=>setLevel("easy") )
mediumButton.addEventListener("click", ()=>setLevel("medium") )
hardButton.addEventListener("click", ()=>setLevel("hard") )

createBoard(levels.easy)