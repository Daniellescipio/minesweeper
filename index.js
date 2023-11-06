const gameBoard = document.getElementById("gameBoard")
//an array of pbjects that will tell each cells surrounding cells
const cellPositionArray = []
//80 squares, ten bombs 
let level = {
    cells:80,
    bombs:10
}
let active = false;
test =0 

const populateBoard = (target)=>{
    const cells = [...gameBoard.children]
    const forbiddenCell = target
    const targetIndex = target.getAttribute("id")-1 //minus one to account for addition of one in board creation
    const bombIndexes = []
    const targetObj = {
        top : cells[targetIndex-10]&&cells[targetIndex-10].getAttribute("id")-1,
        bottom : cells[targetIndex+10]&&cells[targetIndex+10].getAttribute("id")-1,
        left : cells[targetIndex-1]&&cells[targetIndex-1].getAttribute("id")-1,
        right : cells[targetIndex+1]&&cells[targetIndex+1].getAttribute("id")-1,
        topLeft : cells[targetIndex-11]&&cells[targetIndex-11].getAttribute("id")-1,
        topRight : cells[targetIndex-9]&&cells[targetIndex-9].getAttribute("id")-1,
        bottomLeft : cells[targetIndex+9]&&cells[targetIndex+9].getAttribute("id")-1,
        bottomRight : cells[targetIndex+11]&&cells[targetIndex+11].getAttribute("id")-1,
    }
    for(let i =0; i<10; i++){
        let randomNum = Math.floor(Math.random()*level.cells)
        if(bombIndexes.length>0){
            while(
            bombIndexes.indexOf(randomNum)>=0 || 
            randomNum === targetIndex ||
            randomNum === targetObj.top ||
            randomNum === targetObj.bottom ||
            randomNum === targetObj.left ||
            randomNum === targetObj.right ||
            randomNum === targetObj.topRight ||
            randomNum === targetObj.topLeft ||
            randomNum === targetObj.bottomLeft ||
            randomNum === targetObj.bottomRight ){
                randomNum = Math.floor(Math.random()*level.cells)
               }
        }
            bombIndexes.push(randomNum)
    }
    bombIndexes.forEach((index, i)=>{
        const bomb = document.createElement("img")
        bomb.setAttribute("src","images/bomb.png" )
        bomb.classList.add("bomb")
        cells[index].append(bomb)
        cells[index].setAttribute("bomb", true)

    })
    cells.forEach((cell, i)=>{
        const cellObj = {
            top : cells[i-10]&&cells[i-10],
            bottom : cells[i+10]&&cells[i+10],
            left : cells[i-1]&&cells[i-1],
            right : cells[i+1]&&cells[i+1],
            topLeft : cells[i-11]&&cells[i-11],
            topRight : cells[i-9]&&cells[i-9],
            bottomLeft : cells[i+9]&&cells[i+9],
            bottomRight : cells[i+11]&&cells[i+11],
        }
        //top edge
        if(i<10){
            cellObj.top = undefined
            cellObj.topLeft = undefined
            cellObj.topRight = undefined
        }
        //left edge
        if(i%10 ===0){
            cellObj.left = undefined
            cellObj.topLeft = undefined
            cellObj.bottomLeft = undefined
        }
        //right edge
        if(i%10 ===9) {
            cellObj.right = undefined
            cellObj.bottomRight = undefined
            cellObj.topRight = undefined
        }
        //bottom edge
        if(i>=70){
            cellObj.bottom = undefined
            cellObj.bottomLeft = undefined
            cellObj.bottomRight = undefined
        }
        cellPositionArray.push(cellObj)
        cell.setAttribute("positionObj", cellPositionArray.indexOf(cellObj))
        let bombNum =0
        for(const key in cellObj){
            if(cellObj[key]&&cellObj[key].getAttribute("bomb")){
                bombNum++
            }
        }
        bombNum = bombNum===0 ? "" : bombNum
        if(!cell.getAttribute("bomb")){
            const numHolder = document.createElement("p")
            numHolder.textContent = bombNum
            cell.append(numHolder)
        }
    })
   checkBombs(target)
    active = true
}
const checkBombs=(cell)=>{
    const cells = [...gameBoard.children]
    const bombs = cells.filter(cell=>cell.getAttribute("bomb"))
    const notBombs = cells.filter(cell=>!cell.getAttribute("bomb"))
    if(bombs.indexOf(cell)>=0){
        bombs.forEach(bomb=>{
            bomb.querySelector(".overlay").style.display = "none"
            console.log("game over")
        })
    }else{
        let text = cell.querySelector("p")
        const positionObj = cellPositionArray[cell.getAttribute("positionObj")]
        let overLay = cell.querySelector(".overlay")
        overLay.style.display = "none"
        if(text.textContent === ""){
            for(const key in positionObj){
                if(positionObj[key]){
                    overLay = positionObj[key].querySelector(".overlay")
                    if(overLay.style.display !== "none"){
                         text = positionObj[key].querySelector("p")
                        console.log(text, text.textContent, )
                        if(text&&text.textContent === ""){
                            checkBombs(positionObj[key])
                        }
                        overLay.style.display = "none"
                    }    
                }  
            }
        }
        const remainingCells = notBombs.filter(cell=>!(cell.querySelector(".overlay").style.display==="none"))
        if(remainingCells.length<=0){
            notBombs.map(cell=>cell.style.backgroundColor = "green")
            console.log("won")
        }
        
    }
}

const bombs = (e)=>{
    if(!active){
        populateBoard(e.target.parentElement)
    }else{
        checkBombs(e.target.parentElement)
    }
}

const createBoard = (cell)=>{
    for(let i = 0; i <level.cells; i++){
        const square = document.createElement("div")
        square.setAttribute("id", i+1)
        square.classList.add("square")
        const squareOverlay = document.createElement("div")
        squareOverlay.classList.add("overlay")
        square.append(squareOverlay)
        squareOverlay.addEventListener("click", bombs)
        gameBoard.append(square)
    }
}
createBoard()