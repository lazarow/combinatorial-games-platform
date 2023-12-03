//plansza
const boardWidth = 9 * 2;
const boardHeight = 9 * 2;
//ruchy     
const mOffsets = [
    [ 0, 2],
    [ 0,-2],
    [ 2, 0],
    [-2, 0],
];
//stworzenie tablicy płotków
const fences = createFences();
//klasa z danymi do BFS
class queueNode{
    constructor(x,y, dist){
        this.x = x // The coordinates of the cell
        this.y = y 
        this.dist = dist // Cell's distance from the source
    }
}
//tworzenie koordy
function createFences() {
    let r = [];

    for (let y = boardHeight - 2; y >= 1; y--) {
        if (y % 2 === 0) {
            //wiersz parzysty 
            for (let x = 1; x <= boardHeight - 3; x += 2) {

                r.push([x, y]);
            }
        } else {
            //wiersz nieparzysty
            for (let x = 0; x <= boardHeight - 3; x += 2)

                r.push([x, y]);
        }
    }
    return r
};

const logicOfGame = {
    /**
     * Generuje stan początkowy gry.
     */
    generateInitialState() {

        return {
            player1: [8, 0], // Pozycja startowa gracza 1
            player2: [8, 16], // Pozycja startowa gracza 2
            player1fences: 10, // Ilość płotków jaką może postawić gracz 1
            player2fences: 10, // Ilość płotków jaką może postawić gracz 2
            player1WinRow:16,
            player2WinRow:0,
            occupied: [], // Tablica na postawione już płotki
        };
    },
    /**
     * Funkcja oceny, która ocenia z punktu widzenia wskazanego gracza.
     */
    evaluateState(state, player) {
        return 1;
    },

    /**
     * Funkcja generująca możliwe ruchy z wskazanego stanu dla gracza.
     */
    generateMoves(state, player) {


        const placebleFences = []; //  stawialne na płotki
        const moves = []; // Tablica na ruchy graczy


        //wiersze parzyste posiadają 8 płotków pionowych natomiast wiersze nie parzyste posiadają 9 płotków poziomych

        //sprawdzenie ilości płotków
        if (state[player + "fences"] > 0) {
            for (i = 0; i < fences.length; i++)
                //odrzucenie już zajętych i nachodzących płotków
                if (this.checkFecneCollision(state, fences[i][0], fences[i][1])) {
                    //sprawdzenie czy płotek nie zablokuje kompletnie gracza
                    //symulacja postawienia
                    state.occupied.push(fences[i]);

                    if(!(this.getDistanceToEndGoal(state["player1"][0],state["player1"][1],state["player1WinRow"],state.occupied)===-1))
                        if(!(this.getDistanceToEndGoal(state["player2"][0],state["player2"][1],state["player2WinRow"],state.occupied)===-1))
                            placebleFences.push(fences[i]);
                    
                    state.occupied.pop(fences[i])
                }

        }

        //pozycja przeciwnika
        const enemy = player === "player1" ? "player2" : "player1";

        for (let i = 0; i < mOffsets.length; ++i) {
            const x = state[player][0] + mOffsets[i][0];
            const y = state[player][1] + mOffsets[i][1];

            // Dodanie tylko możliwych 
            if (x >= 0 && x < boardWidth && y >= 0 && y < boardHeight) 
                //sprawdzenie czy przeciwnik sąsiaduje
                if (!(x === state[enemy][0] && y === state[enemy][1])){
                    if (!this.checkFencesOnTheWay(state[player][0],state[player][1],x, y, state.occupied)) 
                        moves.push([x, y]);
                  
                }else if (!this.checkFencesOnTheWay(state[player][0],state[player][1],state[enemy][0],state[enemy][1], state.occupied)) {
                    // Tworzenie przeskoku nad przeciwnikiem
                    for (let i = 0; i < mOffsets.length; ++i) {
                        const x = state[enemy][0] + mOffsets[i][0];
                        const y = state[enemy][1] + mOffsets[i][1];
                        // Dodanie tylko możliwych
                        
                            if (x >= 0 && x < boardWidth && y >= 0 && y < boardHeight) 
                                if (!(x === state[player][0] && y === state[player][1])) 
                                        if (!this.checkFencesOnTheWay(state[enemy][0],state[enemy][1],x, y, state.occupied)) 
                                            moves.push([x, y]);
                        }
                    }
        }
        //złączenie możliwych ruchów
        if (state[player + "fences"] > 0)
            return moves.concat(placebleFences);

        return moves;
    },
    /*
     * funckja sprawdzająca czy inny płotek 
     */
    checkFecneCollision(state, x, y) {
        //odsunięcia płotków które mogą kolidować
        const offsets= [
            [ 0,-2],
            [ 0, 2],
            [-1,-1],
            [ 0, 0]
        ];
        //sprawdzenie kolizji innych płotków
        if (y % 2 === 0) {
            for(let i=0;i<offsets.length;++i)
                if (state.occupied.some(([invalidX, invalidY]) => x+offsets[i][0] === invalidX && y+offsets[i][1] === invalidY))
                    return false;
        } else {
            for(let i=offsets.length-1;i>=0;--i)
                if (state.occupied.some(([invalidX, invalidY]) => x-offsets[i][1] === invalidX && y-offsets[i][0] === invalidY))
                    return false;
        }

        return true;
    },


    // Funkcja sprawdzająca czy na drodze danego pionka znajduje się płotek
    checkFencesOnTheWay(x,y,nextMoveX, nextMoveY, occupied) {
 
        //odsunięcia drugiego płotka
        const fenceOffsets = [
            [-2,-1],
            [-2, 1],
            [-1, 2],
            [+1, 2],
        ];
        //sprawdzanie czy jest płotek pomiędzy polami
        for(let i=0;i<mOffsets.length;i++)
            if (x + mOffsets[i][0] == nextMoveX && y + mOffsets[i][1] == nextMoveY)
                if(!occupied.some(([fencePosX, fencePosY]) => 
                    ((fencePosX === nextMoveX -(mOffsets[i][0]/2) && fencePosY === nextMoveY - (mOffsets[i][1]/2)) ||
                    (fencePosX === nextMoveX + fenceOffsets[i][0] && fencePosY === nextMoveY + fenceOffsets[i][1]))))
                return false;
        
        return true;


    },
    /**
     * Funkcja zwraca dystans od x,y do celowanego wiersza za pomocą algorytmu BFS 
     * zwraca -1 gdy nie może znaleźć drogi do celu
     */
    getDistanceToEndGoal(currentX,currentY,targetRow,occupied){

     
        //odwiedzone już miejsca
        const explored=[];
        explored.push([currentX,currentY]);

        //kolejka ruchów
        let que= [];
        let start = new queueNode(currentX,currentY,0);
        que.push(start);
        //dopóki są 
        while(que.length!==0){

            let current = que.shift();
            //sprawdzenie czy jest na miejscu jak tak to znaleziono najkrótszą
            if(current.y===targetRow)
                return current.dist
            //dodanie do kolejki kojenych możliwych ruchów
            for(let i=0;i<mOffsets.length;i++){
                const x = current.x + mOffsets[i][0];
                const y = current.y + mOffsets[i][1];
                if(x>=0&&x<=16&&y>=0&&y<=16)
                    if(!this.checkFencesOnTheWay(current.x,current.y,x,y,occupied))
                        if(!(explored.some(([invalidX, invalidY]) => x === invalidX && y === invalidY))){
                            explored.push([x,y])
                            let newcell = new queueNode(x,y,current.dist+1)
                            que.push(newcell)
                        }
        
            }
        }
        //nie znaleziono miejsca
        return -1

    },
    /**
     * Funkcja generuje stan po wykonaniu wskazanego ruchu.
     */
    generateStateAfterMove(previousState, player, move) {
        //nowy stan gry
        const state = {
            player1: [...previousState.player1],
            player2: [...previousState.player2],
            player1fences: previousState.player1fences,
            player2fences: previousState.player2fences,
            player1WinRow: previousState.player1WinRow,
            player2WinRow: previousState.player2WinRow,
            occupied: [...previousState.occupied],

        };
        //czy to jest położenie płotka
        if (move[0] % 2 === 1 || move[1] % 2 === 1) {
            //dodanie zajętych płotków DO DOKOŃCZENIA
            state.occupied.push(move);
            state[player + "fences"]--
        } else {
            //aktualizacja pozycji gracza
            state[player] = move;
        }

        return state;
    },
    /**
     * Funkcja sprawdza czy stan jest terminalny, tzn. koniec gry.
     */
    isStateTerminal(state, player) {
        // Sprawdzenie czy pionek jest po drugiej stronie
        return state[player === "player2" ? "player1" : "player2"][1] === state[player === "player2" ? "player1" : "player2"+"WinRow"];
    },
    /**
     * Funkcja generująca unikalny klucz dla wskazanego stanu.
     */
    generateUniqueKey: undefined,
};

const players = [];