let initialState = logicOfGame.generateInitialState();
let inputFromInitialState = logicOfGame.getBoardAsNeuralNetworkInput(initialState);

const neat = new Neataptic.Neat(inputFromInitialState.length, 1, null, {
    mutation: Neataptic.methods.mutation.ALL,
    popsize: 30,
    mutationRate: 0.1,
    elitism: 3,
    network: new Neataptic.architect.Random(inputFromInitialState.length, 4, 1),
});

const fitnessFunctionNofGames = logicOfGame.getFitnessFunctionNofGames();
const nofGenerations = 1000;

console.log("[NEAT vs Random]");
for (let generation = 0; generation < nofGenerations; generation++) {
    for (let genome of neat.population) {
        let genomePlayerWins = 0;
        const rng = seedrandom(4338193);
        for (let i = 0; i < fitnessFunctionNofGames; i++) {
            const genomePlayer = i % 2 === 0 ? "player1" : "player2";
            let state = logicOfGame.generateInitialState();
            let player = "player1";
            while (logicOfGame.isStateTerminal(state, player) === false) {
                const moves = logicOfGame.generateMoves(state, player);
                if (player === genomePlayer) {
                    let bestMove = moves[0];
                    let stateAfterMove = logicOfGame.generateStateAfterMove(state, player, moves[0]);
                    let score = genome.activate(logicOfGame.getBoardAsNeuralNetworkInput(stateAfterMove));
                    let bestScore = score;
                    for (let j = 0; j < moves.length; j++) {
                        stateAfterMove = logicOfGame.generateStateAfterMove(state, player, moves[j]);
                        score =
                            (genomePlayer === "player2" ? -1 : 1) *
                            genome.activate(logicOfGame.getBoardAsNeuralNetworkInput(stateAfterMove));
                        if (score > bestScore) {
                            bestMove = moves[j];
                            bestScore = score;
                        }
                    }
                    state = logicOfGame.generateStateAfterMove(state, player, bestMove);
                } else {
                    let move = moves[Math.floor(rng() * moves.length)];
                    state = logicOfGame.generateStateAfterMove(state, player, move);
                }
                player = player === "player1" ? "player2" : "player1";
            }
            if (player !== genomePlayer) {
                genomePlayerWins++;
            }
        }
        genome.score = genomePlayerWins / fitnessFunctionNofGames;
    }
    let nextPopulation = [];
    neat.sort();
    console.log(`Generation #${generation + 1}, the best score is: ${(neat.population[0].score * 100).toFixed(2)}%.`);
    for (let i = 0; i < neat.elitism; i++) {
        nextPopulation.push(neat.population[i]);
    }
    for (let i = 0; i < neat.popsize - neat.elitism; i++) {
        nextPopulation.push(neat.getOffspring());
    }
    neat.population = nextPopulation;
    neat.mutate();
    neat.generation++;
}

/*
let output = neat.population[0].activate([...Array(64).fill(0)]);
console.log(output);

while (logicOfGame.isStateTerminal(state, player) === false) {
    const moves = logicOfGame.generateMoves(state, player);
    const move = moves[Math.floor(Math.random() * moves.length)];
    state = logicOfGame.generateStateAfterMove(state, player, move);
    player = player === "player1" ? "player2" : "player1";
}
*/
