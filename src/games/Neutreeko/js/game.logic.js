const boardWidth = 5;
const boardHeight = 5;

const gameId = "Neutreeko";

let totalMoves = 0;

const logicOfGame = {
    generateInitialState() {
        totalMoves = 0;
        return {
            player1: [ 1, 0, 2, 3, 3, 0],
            player2: [ 1, 4, 2, 1, 3, 4],
            highlighted: []
        };
    },
    evaluateState() {
        
    },
    generateMoves(state, player) {
        const offsets = [
            [0, 1], [0, -1], [1, 0], [-1, 0],
            [1, 1], [1, -1], [-1, 1], [-1, -1]
        ];
        const pawns = [
            state[player].slice(0, 2),
            state[player].slice(2, 4),
           
            state[player].slice(4),
        ]
        const opponent = player === "player1" ? "player2" : "player1";
        const opponentPawns = [
            state[opponent].slice(0, 2),
            state[opponent].slice(2, 4),
           
            state[opponent].slice(4)
        ];
        let moves = [];
        
        for (let [pawn, position] of pawns.entries()) {
            for (let [offsetX, offsetY] of offsets) {
                let [x, y] = position;
                let [prevX, prevY] = [x, y];
                while (true) {
                    x += offsetX;
                    y += offsetY;
                    if (
                        x < 0 || y < 0 || x >= boardWidth || y >= boardHeight
                        || pawns.some(([_x, _y]) => x === _x && y === _y)
                        || opponentPawns.some(([_x, _y]) => x === _x && y === _y)
                    ) {
                        break;
                    }
                    prevX = x;
                    prevY = y;
                }
                if (prevX === position[0] && prevY === position[1]) continue;
                
                moves.push([pawn, prevX, prevY]);
            }
        }
        return moves;
    },
    generateStateAfterMove(previousState, player, move) {
        const state = {
            player1: [...previousState.player1],
            player2: [...previousState.player2],
            highlighted: [...previousState.highlighted],
        };
        state.highlighted = [];
        const index = move[0] * 2;
        state.highlighted.push(state[player][index], state[player][index + 1]);
        state[player][index] = move[1];
        state[player][index + 1] = move[2];
        state.highlighted.push(state[player][index], state[player][index + 1]);
        totalMoves++;
        return state;
    },
    isStateTerminal(state, player) {
        
        const availableMoves = this.generateMoves(state, player);
        availableMoves.forEach(move => {})
        let zmienna=state.player1
    
        //sprawdzanie poziomo
  
        for(let i=0, j=0;i<5;i++,j++){
            for(let z=0;z<3;z++){
                
            
    
            if(zmienna[0] === z && zmienna[1] === i && (zmienna[2] === z+1 &&zmienna[3] === i)&&(zmienna[4] === z+2 && zmienna[5]===i))
            return true
            if(zmienna[0] === z && zmienna[1] === i && (zmienna[4] === z+1 && zmienna[5] === i)&&(zmienna[2] === z+2 && zmienna[3]===i))
            return true
            if(zmienna[2] === z && zmienna[3] === i && (zmienna[0] === z+1 && zmienna[1] === i)&&(zmienna[4] === z+2 && zmienna[5]===i))
            return true
            if(zmienna[2] === z && zmienna[3] === i && (zmienna[4] === z+1 && zmienna[5] === i)&&(zmienna[0] === z+2 && zmienna[1]===i))
            return true
            if(zmienna[4] === z && zmienna[5] === i && (zmienna[0] === z+1 && zmienna[1] === i)&&(zmienna[2] === z+2 && zmienna[3]===i))
            return true
            if(zmienna[4] === z && zmienna[5] === i && (zmienna[2] === z+1 && zmienna[3] === i)&&(zmienna[0] === z+2 && zmienna[1]===i))
            return true

            }
    if(j==4){
        i=-1
        zmienna=state.player2
    }
        }
        // pionowo
        zmienna=state.player1
        for(let i=0, j=0;i<5;i++,j++){
            for(let z=0;z<3;z++){
           
                if(zmienna[0] === i && zmienna[1] === z && (zmienna[2] === i && zmienna[3] === z+1)&&(zmienna[4] === i && zmienna[5]===z+2))
                return true
                if(zmienna[0] === i && zmienna[1] === z && (zmienna[4] === i && zmienna[5] === z+1)&&(zmienna[2] === i && zmienna[3]===z+2))
                return true
                if(zmienna[4] === i && zmienna[5] === z && (zmienna[2] === i && zmienna[3] === z+1)&&(zmienna[0] === i && zmienna[1]===z+2))
                return true
                if(zmienna[4] === i && zmienna[5] === z && (zmienna[0] === i && zmienna[1] === z+1)&&(zmienna[2] === i && zmienna[3]===z+2))
                return true
                if(zmienna[2] === i && zmienna[3] === z && (zmienna[0] === i && zmienna[1] === z+1)&&(zmienna[4] === i && zmienna[5]===z+2))
                return true
                if(zmienna[2] === i && zmienna[3] === z && (zmienna[4] === i && zmienna[5] === z+1)&&(zmienna[0] === i && zmienna[1]===z+2))
                return true
            }
    
        if(j==4){
            i=-1
            zmienna=state.player2
        }
            }
            //ukos
            //ukos prawo srodek
            zmienna=state.player1
            for(let i=0, j=0;i<3;i++,j++){
                if(zmienna[0] === i && zmienna[1] === i && (zmienna[2] === i+1 && zmienna[3] === i+1)&&(zmienna[4] === i+2 && zmienna[5]===i+2))
                return true
                if(zmienna[0] === i && zmienna[1] === i && (zmienna[4] === i+1 && zmienna[5] === i+1)&&(zmienna[2] === i+2 && zmienna[3]===i+2))
                return true
                if(zmienna[2] === i && zmienna[3] === i && (zmienna[0] === i+1 && zmienna[1] === i+1)&&(zmienna[4] === i+2 && zmienna[5]===i+2))
                return true
                if(zmienna[2] === i && zmienna[3] === i && (zmienna[4] === i+1 && zmienna[5] === i+1)&&(zmienna[0] === i+2 && zmienna[1]===i+2))
                return true
                if(zmienna[4] === i && zmienna[5] === i && (zmienna[0] === i+1 && zmienna[1] === i+1)&&(zmienna[2] === i+2 && zmienna[3]===i+2))
                return true
                if(zmienna[4] === i && zmienna[5] === i && (zmienna[2] === i+1 && zmienna[3] === i+1)&&(zmienna[0] === i+2 && zmienna[1]===i+2))
            return true
            if(j==2){
                i=-1
                zmienna=state.player2
            }
            }
            //ukos lewo srodek
            zmienna=state.player1
            for(let i=0, j=0, z=4;i<3;i++,j++,z--){
                
                if(zmienna[0] === i && zmienna[1] === z && (zmienna[2] === i+1 && zmienna[3] === z-1)&&(zmienna[4] === i+2 && zmienna[5]===z-2))
                return true
                if(zmienna[0] === i && zmienna[1] === z && (zmienna[4] === i+1 && zmienna[5] === z-1)&&(zmienna[2] === i+2 && zmienna[3]===z-2))
                return true
                if(zmienna[2] === i && zmienna[3] === z && (zmienna[0] === i+1 && zmienna[1] === z-1)&&(zmienna[4] === i+2 && zmienna[5]===z-2))
                return true
                if(zmienna[2] === i && zmienna[3] === z && (zmienna[4] === i+1 && zmienna[5] === z-1)&&(zmienna[0] === i+2 && zmienna[1]===z-2))
                return true
                if(zmienna[4] === i && zmienna[5] === z && (zmienna[0] === i+1 && zmienna[1] === z-1)&&(zmienna[2] === i+2 && zmienna[3]===z-2))
                return true
                if(zmienna[4] === i && zmienna[5] === z && (zmienna[2] === i+1 && zmienna[3] === z-1)&&(zmienna[0] === i+2 && zmienna[1]===z-2))
            return true
            if(j==2){
                i=-1
                z=5
                zmienna=state.player2
            }
            }
            //ukos ukos prawo lewo 4 miejsca gora
            zmienna=state.player1
            for(let i=0, j=0;i<2;i++,j++){
                
                if(zmienna[0] === i && zmienna[1] === i+1 && (zmienna[2] === i+1 && zmienna[3] === i+2)&&(zmienna[4] === i+2 && zmienna[5]===i+3))
                return true
                if(zmienna[0] === i && zmienna[1] === i+1 && (zmienna[4] === i+1 && zmienna[5] === i+2)&&(zmienna[2] === i+2 && zmienna[3]===i+3))
                return true
                if(zmienna[2] === i && zmienna[3] === i+1 && (zmienna[0] === i+1 && zmienna[1] === i+2)&&(zmienna[4] === i+2 && zmienna[5]===i+3))
                return true
                if(zmienna[2] === i && zmienna[3] === i+1 && (zmienna[4] === i+1 && zmienna[5] === i+2)&&(zmienna[0] === i+2 && zmienna[1]===i+3))
                return true
                if(zmienna[4] === i && zmienna[5] === i+1 && (zmienna[0] === i+1 && zmienna[1] === i+2)&&(zmienna[2] === i+2 && zmienna[3]===i+3))
                return true
                if(zmienna[4] === i && zmienna[5] === i+1 && (zmienna[2] === i+1 && zmienna[3] === i+2)&&(zmienna[0] === i+2 && zmienna[1]===i+3))
            return true
            if(j==1){
                i=-1
                
                zmienna=state.player2
            }
            }
            //ukos ukos prawo lewo 4 miejsca dol
            zmienna=state.player1
            for(let i=0, j=0;i<2;i++,j++){
                
                if(zmienna[0] === i+1 && zmienna[1] === i && (zmienna[2] === i+2 && zmienna[3] === i+1)&&(zmienna[4] === i+3 && zmienna[5]===i+2))
                return true
                if(zmienna[0] === i+1 && zmienna[1] === i && (zmienna[4] === i+2 && zmienna[5] === i+1)&&(zmienna[2] === i+3 && zmienna[3]===i+2))
                return true
                if(zmienna[2] === i+1 && zmienna[3] === i && (zmienna[0] === i+2 && zmienna[1] === i+1)&&(zmienna[4] === i+3 && zmienna[5]===i+2))
                return true
                if(zmienna[2] === i+1 && zmienna[3] === i && (zmienna[4] === i+2 && zmienna[5] === i+1)&&(zmienna[0] === i+3 && zmienna[1]===i+2))
                return true
                if(zmienna[4] === i+1 && zmienna[5] === i && (zmienna[0] === i+2 && zmienna[1] === i+1)&&(zmienna[2] === i+3 && zmienna[3]===i+2))
                return true
                if(zmienna[4] === i+1 && zmienna[5] === i && (zmienna[2] === i+2 && zmienna[3] === i+1)&&(zmienna[0] === i+3 && zmienna[1]===i+2))
            return true
            if(j==1){
                i=-1
                
                zmienna=state.player2
            }
            }
            //ukos ukos lewo prawo 4 miejsca dol
            zmienna=state.player1
            for(let i=0, j=0, z=3;i<2;i++,j++,z--){
                
                if(zmienna[0] === i && zmienna[1] === z && (zmienna[2] === i+1 && zmienna[3] === z-1)&&(zmienna[4] === i+2 && zmienna[5]===z-2))
                return true
                if(zmienna[0] === i && zmienna[1] === z && (zmienna[4] === i+1 && zmienna[5] === z-1)&&(zmienna[2] === i+2 && zmienna[3]===z-2))
                return true
                if(zmienna[2] === i && zmienna[3] === z && (zmienna[0] === i+1 && zmienna[1] === z-1)&&(zmienna[4] === i+2 && zmienna[5]===z-2))
                return true
                if(zmienna[2] === i && zmienna[3] === z && (zmienna[4] === i+1 && zmienna[5] === z-1)&&(zmienna[0] === i+2 && zmienna[1]===z-2))
                return true
                if(zmienna[4] === i && zmienna[5] === z && (zmienna[0] === i+1 && zmienna[1] === z-1)&&(zmienna[2] === i+2 && zmienna[3]===z-2))
                return true
                if(zmienna[4] === i && zmienna[5] === z && (zmienna[2] === i+1 && zmienna[3] === z-1)&&(zmienna[0] === i+2 && zmienna[1]===z-2))
            return true
            if(j==1){
                i=-1
                z=4
                zmienna=state.player2
            }
            }
            //ukos ukos lewo prawo 4 miejsca gora
            zmienna=state.player1
            for(let i=1, j=0, z=4;i<3;i++,j++,z--){
                
                if(zmienna[0] === i && zmienna[1] === z && (zmienna[2] === i+1 && zmienna[3] === z-1)&&(zmienna[4] === i+2 && zmienna[5]===z-2))
                return true
                if(zmienna[0] === i && zmienna[1] === z && (zmienna[4] === i+1 && zmienna[5] === z-1)&&(zmienna[2] === i+2 && zmienna[3]===z-2))
                return true
                if(zmienna[2] === i && zmienna[3] === z && (zmienna[0] === i+1 && zmienna[1] === z-1)&&(zmienna[4] === i+2 && zmienna[5]===z-2))
                return true
                if(zmienna[2] === i && zmienna[3] === z && (zmienna[4] === i+1 && zmienna[5] === z-1)&&(zmienna[0] === i+2 && zmienna[1]===z-2))
                return true
                if(zmienna[4] === i && zmienna[5] === z && (zmienna[0] === i+1 && zmienna[1] === z-1)&&(zmienna[2] === i+2 && zmienna[3]===z-2))
                return true
                if(zmienna[4] === i && zmienna[5] === z && (zmienna[2] === i+1 && zmienna[3] === z-1)&&(zmienna[0] === i+2 && zmienna[1]===z-2))
            return true
            if(j==1){
                i=0
                z=5
                zmienna=state.player2
            }
            }
             //ukos ukos lewo prawo 3 miejsca 
             zmienna=state.player1
             for(let i=0, j=0, z=2;i<4;i=i+2,j++,z=z+2){
                
                 if(zmienna[0] === i && zmienna[1] === z && (zmienna[2] === i+1 && zmienna[3] === z-1)&&(zmienna[4] === i+2 && zmienna[5]===z-2))
                 return true
                 if(zmienna[0] === i && zmienna[1] === z && (zmienna[4] === i+1 && zmienna[5] === z-1)&&(zmienna[2] === i+2 && zmienna[3]===z-2))
                 return true
                 if(zmienna[2] === i && zmienna[3] === z && (zmienna[0] === i+1 && zmienna[1] === z-1)&&(zmienna[4] === i+2 && zmienna[5]===z-2))
                 return true
                 if(zmienna[2] === i && zmienna[3] === z && (zmienna[4] === i+1 && zmienna[5] === z-1)&&(zmienna[0] === i+2 && zmienna[1]===z-2))
                 return true
                 if(zmienna[4] === i && zmienna[5] === z && (zmienna[0] === i+1 && zmienna[1] === z-1)&&(zmienna[2] === i+2 && zmienna[3]===z-2))
                 return true
                 if(zmienna[4] === i && zmienna[5] === z && (zmienna[2] === i+1 && zmienna[3] === z-1)&&(zmienna[0] === i+2 && zmienna[1]===z-2))
             return true
             if(j==1){
                 i=-2
                 z=0
                 zmienna=state.player2
             }
             }
              //ukos ukos  prawo lewo 3 miejsca 
              zmienna=state.player1
              for(let i=0, j=0, z=2;i<4;i=i+2,j++,z=z-2){
                  
                  if(zmienna[0] === i && zmienna[1] === z && (zmienna[2] === i+1 && zmienna[3] === z+1)&&(zmienna[4] === i+2 && zmienna[5]===z+2))
                  return true
                  if(zmienna[0] === i && zmienna[1] === z && (zmienna[4] === i+1 && zmienna[5] === z+1)&&(zmienna[2] === i+2 && zmienna[3]===z+2))
                  return true
                  if(zmienna[2] === i && zmienna[3] === z && (zmienna[0] === i+1 && zmienna[1] === z+1)&&(zmienna[4] === i+2 && zmienna[5]===z+2))
                  return true
                  if(zmienna[2] === i && zmienna[3] === z && (zmienna[4] === i+1 && zmienna[5] === z+1)&&(zmienna[0] === i+2 && zmienna[1]===z+2))
                  return true
                  if(zmienna[4] === i && zmienna[5] === z && (zmienna[0] === i+1 && zmienna[1] === z+1)&&(zmienna[2] === i+2 && zmienna[3]===z+2))
                  return true
                  if(zmienna[4] === i && zmienna[5] === z && (zmienna[2] === i+1 && zmienna[3] === z+1)&&(zmienna[0] === i+2 && zmienna[1]===z+2))
              return true
              if(j==1){
                  i=-2
                  z=4
                  zmienna=state.player2
              }
              }
    },
    generateUniqueKey: undefined,
};
const players = [
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (łatwy)", maxDepth: 3 }
];