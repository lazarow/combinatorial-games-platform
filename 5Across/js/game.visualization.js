const visualizationOfGame = {
    drawState(state, player, move, container, cb) {
        const gameBoard = document.createElement('div');
        gameBoard.id = 'game-board';

        for (let row = 0; row < state.length; row++) {
            for (let col = 0; col < state[row].length; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                const playerTile = state[row][col];
                if (playerTile !== null) {
                    cell.textContent = playerTile === 'player1' ? 'X' : 'O';
                    cell.style.backgroundColor = playerTile === 'player1' ? '#ffcccb' : '#add8e6';
                }

                cell.addEventListener('click', () => {
                    const clickedCell = event.target;
                    const row = parseInt(clickedCell.dataset.row, 10);
                    const col = parseInt(clickedCell.dataset.col, 10);
                    cb({ row, col });
                });

                gameBoard.appendChild(cell);
            }
        }

        container.innerHTML = '';
        container.appendChild(gameBoard);
        cb();
    },

    handleHumanTurn(state, player, cb) {
        // Check if buttons row already exists
        let buttonRow = document.getElementById('column-buttons');

        if (!buttonRow) {
            // Create buttons for each column
            buttonRow = document.createElement('div');
            buttonRow.id = 'column-buttons';
            buttonRow.className = 'column-buttons';

            for (let col = 0; col < state[0].length; col++) {
                const button = document.createElement('button');
                button.textContent = `${col + 1}`;
                button.addEventListener('click', () => {
                    // Check if the selected column is not full
                    if (state[0][col] === null) {
                        cb(col);
                    } else {
                        alert('Column is full. Please choose another column.');
                    }
                });

                buttonRow.appendChild(button);
            }

            // Append buttons below the game board
            const gameBoard = document.getElementById('game-board');
            gameBoard.insertAdjacentElement('afterend', buttonRow);
        }
    },

    getTruePlayerName(player) {
        return player === 'player1' ? 'X' : 'O';
    },

    getReadableMoveDescription(state, player, move) {
        return `${this.getTruePlayerName(player)} dropped a piece in column ${move + 1}`;
    },

    getReadableWinnerName(state, player) {
        const winnerScore = logicOfGame.evaluateState(state, player);

        if (winnerScore === 100) {
            return `Player ${player === 'player1' ? 'X' : 'O'} wins!`;
        } else if (winnerScore === -100) {
            return `Player ${player === 'player1' ? 'O' : 'X'} wins!`;
        } else {
            return 'It\'s a draw!';
        }
    },
};

