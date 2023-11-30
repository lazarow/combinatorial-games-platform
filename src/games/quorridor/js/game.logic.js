const boardWidth = 9 * 2;
const boardHeight = 9 * 2;
//stworzenie tablicy płotków
const fences = createFences();

function createFences(){
    let r = [];

    for (let y = boardHeight; y >=0; y--) {
        if(y%2===0){
            //wiersz parzysty 
            for (let x =1; x <= boardHeight-2; x+=2) {
                
                    r.push([x,y]);
            }
        }else{
            //wiersz nieparzysty
            for (let x =0; x <= boardHeight-2; x+=2) 
                
                    r.push([x,y]);
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
        // Podstawowe ruchy
        const offsets = [
            [0, 2],
            [0, -2],
            [2, 0],
            [-2, 0],
        ];

        const placebleFences = []; //  stawialne na płotki
        const moves = []; // Tablica na ruchy graczy

        //wiersze parzyste posiadają 8 płotków pionowych natomiast wiersze nie parzyste posiadają 9 płotków poziomych

        //sprawdzenie ilości płotków
        if(!(state[player+"fences"]==0)){
            //odrzucenie już zajętych płotków
            for(i=0;i<fences.length;i++)
                if(state.occupied.some(([invalidX, invalidY]) => fences[i][0] === invalidX && fences[i][1]  === invalidY) === false){
                    placebleFences.push(fences[i]);
                }

            }
        
        //pozycja przeciwnika
        const enemy = player === "player1" ? "player2" : "player1";

        for (let i = 0; i < offsets.length; ++i) {
            const x = state[player][0] + offsets[i][0];
            const y = state[player][1] + offsets[i][1];
            // Dodanie tylko możliwych 
            if (x >= 0 && x < boardWidth && y >= 0 && y < boardHeight) {
                //sprawdzenie czy przeciwnik sąsiaduje
                if (!(x === state[enemy][0] && y === state[enemy][1])) {
                    moves.push([x, y]);
                } else {
                    // Tworzenie przeskoku nad przeciwnikiem
                    for (let i = 0; i < offsets.length; ++i) {
                        const x = state[enemy][0] + offsets[i][0];
                        const y = state[enemy][1] + offsets[i][1];
                        // Dodanie tylko możliwych 
                        if (x >= 0 && x < boardWidth && y >= 0 && y < boardHeight)
                            if (!(x === state[player][0] && y === state[player][1]))
                                moves.push([x, y]);
                    }
                }
            }
        }
        //złączenie możliwych ruchów
        if(placebleFences.length>0)
            return moves.concat(placebleFences);
        return moves;
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
            occupied: [...previousState.occupied],
        };
        //czy to jest położenie płotka
        if(move[0]%2===1||move[1]%2===1){
            //dodanie zajętych płotków DO DOKOŃCZENIA
            state.occupied.push(move);
            state[player+"fences"]--
        }else{
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
        let end = player === "player1" ? 16 : 0;
        return state[player][1] === end;
    },
    /**
     * Funkcja generująca unikalny klucz dla wskazanego stanu.
     */
    generateUniqueKey: undefined,
};

const players = [];
