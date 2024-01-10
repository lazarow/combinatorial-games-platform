
const gameId = "quorridor";
//plansza
const boardWidth = 9 * 2;
const boardHeight = 9 * 2;
//flaga czy jest przeskok
var jumpoverAv=false;
//flaga czy jest to bezużyteczne postawienie płotka
var uselessfence=false;
const logicOfGame = {
    /**
     * Generuje stan początkowy gry.
     */
    generateInitialState() {
        let fencestmp = [];
        //stworzenie tablicy płotków

        for (let y = boardHeight - 2; y >= 1; y--) {
            if (y % 2 === 0) {
                //wiersz parzysty 
                for (let x = 1; x <= boardHeight - 3; x += 2) {
    
                    fencestmp.push([x, y]);
                }
            } else {
                //wiersz nieparzysty
                for (let x = 0; x <= boardHeight - 3; x += 2)
    
                fencestmp.push([x, y]);
            }
        }
        return {
            player1: [8, 0], // Pozycja startowa gracza x
            player2: [8, 16],
            player1fences: 10, // Ilość płotków jaką może postawić gracz x
            player2fences: 10, 
            player1WinRow:16, //cel gracza x
            player2WinRow:0,
            occupied: [], // Tablica na postawione już płotki
            fences: fencestmp //tablica możliwych płotków
        };
    },
    /**
     * Funkcja oceny, która ocenia z punktu widzenia wskazanego gracza.
     */
    evaluateState(state, player) {

        const enemy = (player === "player1" ? "player2" : "player1");
        //stan przegranej/wygranej
        if (this.isStateTerminal(state, player)) 
            return 999;
        else if (this.isStateTerminal(state, enemy)) 
            return -999;
        

        let score =this.getDistanceToEndGoal(enemy,state) - this.getDistanceToEndGoal(player,state);
        //potrojenie wagi dystansu
        score *=3
        //sprawdzenie czy przeskok jest wartościowy
        if(jumpoverAv){
            if(state[player+"WinRow"]===0){
                if(state[player][1]-state[enemy][1]>=0)
                    score+=2
            }else{
                if(state[player][1]-state[enemy][1]<=0)
                    score+=2
            }
        }
        score += state[enemy+"fences"]-state[player+"fences"];
        if(uselessfence)
            score-=20;
        //console.log(score)
        return score;
    },

    /**
     * Funkcja generująca możliwe ruchy z wskazanego stanu dla gracza.
     */
    generateMoves(state, player) {


        const placebleFences = []; //  stawialne na płotki
        
        const enemy = player === "player1" ? "player2" : "player1";
        
        //wiersze parzyste posiadają 8 płotków pionowych natomiast wiersze nie parzyste posiadają 9 płotków poziomych
        //sprawdzenie ilości płotków
        if (state[player + "fences"] > 0) {
            for (i = 0; i < state["fences"].length; i++){
                    //pominięcie sprawdzenia blokowania jeżelinie jest ich wystarczająco
                    if(state.occupied.length>2){
                        
                        //sprawdzenie czy płotek nie zablokuje kompletnie gracza
                        //symulacja postawienia
                        state.occupied.push(state["fences"][i]);
                        if(!(this.getDistanceToEndGoal(player,state)===-1))
                            if(!(this.getDistanceToEndGoal(enemy,state)===-1))
                                placebleFences.push(state["fences"][i]);
                        state.occupied.pop(state["fences"][i]);
                    }else{
                        placebleFences.push(state["fences"][i]);
                    }
                    
                }

        }

        //możliwe ruchy
        let moves =this.getPossibleMoves(state[player][0],state[player][1],player,state)
        //dodanie przeskoku nad przeciwnikiem
        if(this.doesItHasCoords(moves,[state[enemy][0],state[enemy][1]])){
            jumpoverAv = true;
            let tmp =this.getPossibleMoves(state[enemy][0],state[enemy][1],enemy,state)
            moves = moves.concat(tmp)
            moves = moves.filter(([x,y])=>!(
                (x===state[enemy][0]&&y===state[enemy][1])||
                (x===state[player][0]&&y===state[player][1])))
        }else
            jumpoverAv = false;
        
        //złączenie możliwych ruchów
        if (state[player + "fences"] > 0)
            return moves.concat(placebleFences);

        return moves;
    },
    /*
     * usuwająca niemożliwych do postawienia płotków
     */
    removeCollidingFences(state, x, y) {
        //odsunięcia płotków które mogą nachodzić
        const offsets= [
            [ 0,-2],
            [ 0, 2],
            [-1,-1],
            [ 0, 0]
        ];
        //usunięcie nachodzących
        if (y % 2 === 0) {
            for(let i=0;i<offsets.length;++i){
                state["fences"] = state["fences"].filter(([fx,fy])=>!(fx===x+offsets[i][0]&&fy===y+offsets[i][1]))
                }
        } else {
            for(let i=offsets.length-1;i>=0;--i){
                state["fences"] = state["fences"].filter(([fx,fy])=>!(fx===x-offsets[i][1]&&fy===y-offsets[i][0]))
            }
        };
    },    

    // Funkcja sprawdzająca czy na drodze danego pionka znajduje się płotek
    getPossibleMoves(x,y,player,state) {
        //odsunięcia rucu
        const Offsets = [
            [ 0, 2],
            [ 0,-2],
            [ 2, 0],
            [-2, 0],
        ];
 
        //odsunięcia drugiego płotka blokującego
        const fenceOffsets = [
            [-2,-1],
            [-2, 1],
            [-1, 2],
            [+1, 2],
        ];
        //pozycja przeciwnika
        const enemy = player === "player1" ? "player2" : "player1";

        let possible=[];
        let nextX,nextY;

        for(let i=0;i<Offsets.length;i++){
            nextX = x+Offsets[i][0];
            nextY = y+Offsets[i][1];
            if (nextX >= 0 && nextX  < boardWidth && nextY  >= 0 && nextY < boardHeight) 
                    if(
                    !(this.doesItHasCoords(state["occupied"],[nextX  -(Offsets[i][0]/2),nextY - (Offsets[i][1]/2)]) ||
                    this.doesItHasCoords(state["occupied"],[nextX  + fenceOffsets[i][0],nextY + fenceOffsets[i][1]])))
                        possible.push([nextX ,nextY]);
    
        } 
        
        return possible;


    },
    /**
     * Funkcja zwraca dystans od x,y do celowanego wiersza za pomocą algorytmu BFS 
     * zwraca -1 gdy nie może znaleźć drogi do celu
     */
    getDistanceToEndGoal(player,state){
        //console.count("lol")
        //odwiedzone już miejsca
        const explored=[];
        explored.push([state[player][0],state[player][1]]);
        let unexplored
        //kolejka ruchów
        let que= [];
        que.push([state[player][0],state[player][1],0]);
        let current
        //dopóki są 
        while(que.length!==0){

            current = que.shift();
            //sprawdzenie czy jest na miejscu jak tak to znaleziono najkrótszą
            if(current[1]===state[player+"WinRow"])
                return current[2];

            unexplored = this.getPossibleMoves(current[0],current[1],player,state)
      
            //dodanie do kolejki kojenych możliwych ruchów
            for(let i=0;i<unexplored.length;i++){
                if(!this.doesItHasCoords(explored,unexplored[i])){

                    explored.push([unexplored[i][0],unexplored[i][1]]);
                    que.push([unexplored[i][0],unexplored[i][1],current[2]+1]);
                    
                }
        
            }
        }
        
        //nie znaleziono miejsca
        return -1

    },
    
    /**
     * funkcja sprawdza czy tablica ma dane koordynaty (szybsza niż array.some)
     */
    doesItHasCoords(coordsArray,coords){
        for(let i=0;i<coordsArray.length;i++)
            if(coordsArray[i][0]===coords[0]&&coordsArray[i][1]===coords[1])
                return true;
        return false;
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
            fences: [...previousState.fences]

        };
        //czy to jest położenie płotka
        if (move[0] % 2 === 1 || move[1] % 2 === 1) {
            
            const enemy = (player === "player1" ? "player2" : "player1");
            if(this.getDistanceToEndGoal(enemy,previousState)===this.getDistanceToEndGoal(enemy,state))
                uselessfence=true;
            else
                uselessfence=false;
            //dodanie zajętych płotków DO DOKOŃCZENIA
            state.occupied.push(move);
            state[player + "fences"]--
            this.removeCollidingFences(state,move[0],move[1])
        } else {
            //aktualizacja pozycji gracza
            state[player] = move;
        }
        //console.log(state)
        return state;
    },
    /**
     * Funkcja sprawdza czy stan jest terminalny, tzn. koniec gry.
     */
    isStateTerminal(state, player) {
        // Sprawdzenie czy pionek przeciwnika jest po drugiej stronie
        return state[player][1] === state[player +"WinRow"];
    },
    /**
     * Funkcja generująca unikalny klucz dla wskazanego stanu.
     */
    generateUniqueKey: undefined,

    /**
     * Funkcja oblicza wartość wskazanego węzła gry (np. UCB1). Na podstawie tej wartości MCTS dokona selekcji.
     */
    computeMCTSNodeValue(node) {
        // WERSJA WYKORZYSTUJĄCA WZÓR UCT (WSPOMNIANY W PRZESŁANYCH MATERIAŁACH)
        return (node.reward + 2 * (1/(Math.sqrt(2))) * (Math.sqrt((2 * Math.log(node.parent.visits))/(node.visits)))); // Obliczone ze wzoru UCT = avg(Xj) + 2*Cp*SQRT[ (2*ln(n)) / nj ]  || Wartość Cp może wynosić Cp = 1/SQRT(2), lub należy sobie dostosować ją według potrzeb (musi być większa od 0)

        // WERSJA ALTERNATYWNA Z WYKORZYSTANIEM WSPOMNIANEGO W OPISIE FUNKCJI UCB1
        // return (node.reward + (Math.sqrt((2 * Math.log(node.parent.visits))/(node.visits)))); // Obliczone ze wzoru UCB1 = avg(Xj) + SQRT[ (2*ln(n)) / nj ]

        // Trzeba będzie wybrać jedną z tych opcji (i w przypadku UCT dostosować wartość C (aktualnie wynoszącą 1.5))
    },

    /**
     * Funkcja rozgrywa losową symulację startując od zadanego stanu i gracza (state i player) i zwraca 1 jeżeli
     * symulacja zostaje ostatecznie wygrana przez gracza, -1 jeżeli przez jego przeciwnika, 0 dla remisów.
     * Proszę zwrócić uwagę na kolejność węzłów!
     */
    MCTSPlayOut(node) {
        let currentState = node.state; // Zadany stan
        let currentPlayer = node.player; // Zadany gracz

        // DZIAŁANIE NA LOSOWYM RUCHU (z tym rozwiązaniem czas wynosi początkowo około 5-6sec - najpewniej trzeba będzie to zostawić bo opis funkcji mówi o losowej symulacji no i jest szybsze niż to poniżej)
        while(!this.isStateTerminal(currentState, currentPlayer)){ // Powtarzaj, dopóki stan gry nie jest terminalny
            let availableMoves = this.generateMoves(currentState, currentPlayer); // Generowanie dostępnych ruchów
            let randomMove = availableMoves[Math.floor(Math.random()*availableMoves.length)]; // Losowe wybranie jednego z wygenerowanych ruchów ()
            currentState = this.generateStateAfterMove(currentState, currentPlayer, randomMove); // Generowanie stanu po wykonaniu wcześniej wylosowanego ruchu
            currentPlayer = currentPlayer === "player1" ? "player2" : "player1"; // Zmiana gracza
        }

        // DZIAŁANIE NA NAJLEPSZYM Z MOŻLIWYCH RUCHÓW (z tym rozwiązaniem czas wynosi początkowo około 20-50sec, opis funkcji mówi o losowym ruchu, ale )
        // while(!this.isStateTerminal(currentState, currentPlayer)){ // Powtarzaj, dopóki stan gry nie jest terminalny
        //     let availableMoves = this.generateMoves(currentState, currentPlayer); // Generowanie dostępnych ruchów
        //     let bestMove = availableMoves[0]; // Ustaw najlepszy z dostępnych ruchów z dostępnych ruchów na pierwszy z wylosowanych
        //     let bestMoveScore = this.evaluateState(this.generateStateAfterMove(currentState, currentPlayer, availableMoves[0]), currentPlayer); // Wykorzystanie funkcji ewaluacji stanu do obliczenie wyniku dla najlepszego ruchu
        //     for(let i = 1; i<availableMoves.length; i++){ // Pętla przechodząca przez wszystkie dostępne ruchy
        //         let currentMoveScore = this.evaluateState(this.generateStateAfterMove(currentState, currentPlayer, availableMoves[i]), currentPlayer); // Wykorzystanie funkcji ewaluacji stanu do obliczenie wyniku dla obecnie sprawdzanego ruchu
        //         if(currentMoveScore > bestMoveScore){ // Sprawdź czy wynik obecnie sprawdzanego ruchu jest większy niż wynik najlepszego ruchu
        //             bestMove = availableMoves[i]; // Jeśli wcześniejszy warunek jest spełniony, zapisz obecny ruch jako najlepszy
        //             bestMoveScore = currentMoveScore; // Jeśli wcześniejszy warunek jest spełniony, zapisz wynik obecnie sprawdzanego ruchu jako najlepszy
        //         }
        //     }
        //     currentState = this.generateStateAfterMove(currentState, currentPlayer, bestMove); // Generowanie stanu po wykonaniu wcześniej wylosowanego ruchu
        //     currentPlayer = currentPlayer === "player1" ? "player2" : "player1"; // Zmiana gracza
        // }

        return currentPlayer === node.player ? 1 : -1; // Wynikiem będzie zawsze 1 lub -1, ponieważ w grze Quoridor nie jest możliwe osiągnięcie remisu
    },

    /**
     * Funkcja przyjmuje na wejście węzeł drzewa MCTS i wybiera najlepszy ruch (kolejny węzeł) wg obranej strategii (np. najwięcej wizyt).
     */
    getBestMCTSNode(node) {
        // Do wybrania najlepszego węzła przyjmujemy strategię Max-Robust Child (czyli kombinacja największej liczby wizyt z największą obliczoną wartością)
        let bestNode = node.children[0]; // Ustaw najlepszy węzeł na pierwszy istniejący
        let bestValue = this.computeMCTSNodeValue(bestNode); // Ustaw najlepszą wartość na wartość obliczoną z najlepszego węzła (potrzebne tylko do strategii MAX CHILD oraz MAX-ROBUST CHILD)
        
        // PONIŻEJ STRATEGIA ROBUST CHILD (największa ilość wizyt) - po zużyciu większości płotków czas na ruch oscyluje w granicach około 10-120ms
        // for (let i = 1; i < node.children.length; ++i) { // Pętla przechodząca przez każdy istniejący węzeł
        //     if (node.children[i].visits > bestNode.visits) { // Sprawdzenie czy obecnie odwiedzony węzeł miał więcej wizyt niż najlepszy węzeł
        //         bestNode = node.children[i]; // Jeśli poprzedni warunek jest prawdziwy, zmień najlepszy węzeł na obecny węzeł
        //     }
        // }

        // PONIŻEJ STRATEGIA MAX CHILD (najwyższa wartość)
        for(let i = 1; i<node.children.length; i++){ // Pętla przechodząca przez każdy istniejący węzeł
            let childValue = this.computeMCTSNodeValue(node.children[i]); // Ustaw wartość obecnie sprawdzanego węzła
            if(childValue > bestValue){ // Sprawdź czy wartość obecnego węzła jest większa niż wartość najlepszego węzła
                bestValue = childValue; // Jeśli poprzedni warunek okazał się prawdą, ustaw najlepszą wartość na wartość obecnego węzła
                bestNode = node.children[i]; // Jeśli poprzedni warunek okazał się prawdą, zmień najlepszy węzeł na obecny węzeł
            }
        }

        // PONIŻEJ STRATEGIA MAX-ROBUST CHILD (kombinacja najwyższej wartości z największą liczbą wizyt)
        // for(let i = 1; i < node.children.length; ++i){ // Pętla przechodząca przez każdy istniejący węzeł
        //     let childValue = this.computeMCTSNodeValue(node.children[i]); // Ustaw wartość obecnie sprawdzanego węzła
        //     let maxRobustValue = node.children[i].visits + childValue; // Określ sumę liczby wizyt danego węzła i jego wartości
        //     if(maxRobustValue > (bestNode.visits + this.computeMCTSNodeValue(bestNode))){ // Sprawdź, czy wcześniej obliczona suma jest większa niż suma obliczona dla najlepszego węzła
        //         bestNode = node.children[i]; // Jeśli poprzedni warunek jest spełniony, zmień najlepszy węzeł na obecny węzeł
        //     }
        // }

        // Trzeba będzie wybrać jedną z tych strategii (choć póki co żadna nie robi różnicy co do długości wykonywania obliczeń)

        return bestNode; // Zwróć najlepszy węzeł
    }, 
};

const players = [
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (łatwy)" , maxDepth: 1, printTree: true },
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (średni)", maxDepth: 2, printTree: false },
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (trudny)", maxDepth: 3, printTree: false },
    { type: PlayerTypes.MCTS, label: "MCTS (łatwy)", iterations: 50 }, // liczba iteracji = 50 = około 6-7 sekund na ruch na początku rozgrywki
    { type: PlayerTypes.MCTS, label: "MCTS (średni)", iterations: 100 }, // dwa razy dłużej niż łatwy
    { type: PlayerTypes.MCTS, label: "MCTS (trudny)", iterations: 150 }, // dwa razy dłużej niż średni
    // Ilość iteracji dla każdego poziomu również trzeba będzie dostosować
];