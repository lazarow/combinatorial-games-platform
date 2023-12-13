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

        // Execute the callback function
        cb();
    },

    handleHumanTurn(state, player, cb) {
        const gameBoard = document.getElementById('game-board');

        if (gameBoard) {
            // Create input elements for the user to enter the move
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '1';
            input.max = state[0].length.toString();
            input.placeholder = `Enter your move (1-${state[0].length})`;

            const button = document.createElement('button');
            button.textContent = 'Make Move';
            button.addEventListener('click', () => {
                const selectedMove = parseInt(input.value, 10) - 1;

                // Check if the input is valid
                if (!isNaN(selectedMove) && selectedMove >= 0 && selectedMove < state[0].length) {
                    cb(selectedMove);
                } else {
                    alert('Invalid move. Please enter a valid column number.');
                }
            });

            // Append input elements to the game board container
            gameBoard.appendChild(input);
            gameBoard.appendChild(button);
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

