const metricModel = tf.sequential();
metricModel.add(tf.layers.dense({ units: 32, activation: "relu", inputShape: [1] }));
metricModel.add(tf.layers.dense({ units: 16, activation: "relu", kernelRegularizer: tf.regularizers.l2({ l2: 0.1 }) }));
metricModel.add(tf.layers.dense({ units: 1, activation: "relu", kernelRegularizer: tf.regularizers.l2({ l2: 0.1 }) }));
metricModel.compile({ optimizer: "adam", loss: "binaryCrossentropy", metrics: ["accuracy"] });

const positions = [[logicOfGame.generateInitialState(), "player1"]];
let branchingPosition = 0;
const numberOfPositions = 10000;
const positionsBar = new cliProgress.SingleBar(
    {
        format: "Positions generating | {bar} | {value}",
    },
    cliProgress.Presets.shades_classic
);
positionsBar.start(numberOfPositions, 0);
while (positions.length < numberOfPositions) {
    let len = positions.length;
    for (let i = branchingPosition; i < len; ++i) {
        const moves = logicOfGame.generateMoves(positions[i][0], positions[i][1]);
        for (let move of moves) {
            positions.push([
                logicOfGame.generateStateAfterMove(positions[i][0], positions[i][1], move),
                positions[i][1] === "player1" ? "player2" : "player1",
            ]);
        }
    }
    branchingPosition = len - 1;
    positionsBar.update(positions.length);
}
positionsBar.stop();

const metrics = [];
const winning = [];

for (let [state, player] of positions) {
    const score = logicOfGame.evaluateState(state, player);
    metrics.push([score]);
    metrics.push([score]);
}
