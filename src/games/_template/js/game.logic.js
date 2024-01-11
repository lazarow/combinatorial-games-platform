/**
 * Nazwa katalogu gry, potrzebne do wczytywanie skryptów.
 */
const gameId = "template";

const logicOfGame = {
    /**
     * Generuje stan początkowy gry.
     */
    generateInitialState() {},
    /**
     * Funkcja oceny, która ocenia z punktu widzenia wskazanego gracza.
     */
    evaluateState(state, player) {},
    /**
     * Funkcja generująca możliwe ruchy z wskazanego stanu dla gracza.
     */
    generateMoves(state, player) {},
    /**
     * Funkcja generuje stan po wykonaniu wskazanego ruchu.
     */
    generateStateAfterMove(previousState, player, move) {},
    /**
     * Funkcja sprawdza czy stan jest terminalny, tzn. koniec gry.
     */
    isStateTerminal(state, player) {},
    /**
     * Funkcja generująca unikalny klucz dla wskazanego stanu.
     */
    generateUniqueKey: undefined,
    /**
     * Funkcja oblicza wartość wskazanego węzła gry (np. UCB1). Na podstawie tej wartości MCTS dokona selekcji.
     */
    computeMCTSNodeValue(node) {},
    /**
     * Funkcja rozgrywa losową symulację startując od zadanego stanu i gracza (state i player) i zwraca 1 jeżeli
     * symulacja zostaje ostatecznie wygrana przez gracza, -1 jeżeli przez jego przeciwnika, 0 dla remisów.
     * Proszę zwrócić uwagę na kolejność węzłów!
     */
    MCTSPlayOut(node) {},
    /**
     * Funkcja przyjmuje na wejście węzeł drzewa MCTS i wybiera najlepszy ruch (kolejny węzeł) wg obranej strategii (np. najwięcej wizyt).
     */
    getBestMCTSNode(node) {},
};

const players = [];
