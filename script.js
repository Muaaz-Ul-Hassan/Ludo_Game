document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Game variables
    let currentPlayer = 1;
    let diceValue = 0;
    let diceRolled = false;
    let gameActive = true;
    let players = {
        1: { name: "Player 1", color: "red", tokens: [0, 0, 0, 0], home: 0, active: true },
        2: { name: "Player 2", color: "green", tokens: [0, 0, 0, 0], home: 0, active: true },
        3: { name: "Player 3", color: "yellow", tokens: [0, 0, 0, 0], home: 0, active: true },
        4: { name: "Player 4", color: "blue", tokens: [0, 0, 0, 0], home: 0, active: true }
    };
    
    // Board positions (simplified for this implementation)
    let boardPositions = [];
    const totalPathCells = 52;
    const safePositions = [1, 9, 14, 22, 27, 35, 40, 48];
    
    // Initialize the game
    function initGame() {
        // Reset game state
        currentPlayer = 1;
        diceValue = 0;
        diceRolled = false;
        gameActive = true;
        
        // Reset players
        for (let playerId in players) {
            players[playerId].tokens = [0, 0, 0, 0];
            players[playerId].home = 0;
            players[playerId].active = true;
        }
        
        // Update UI
        updatePlayerTurn();
        updatePlayerStatus();
        updateMessage("New game started! Player 1's turn. Roll the dice!");
        
        // Reset dice display
        document.getElementById('dice-value').textContent = "0";
        
        // Reset tokens position on board
        resetTokensOnBoard();
        
        // Highlight current player
        highlightCurrentPlayer();
    }
    
    // Reset tokens to starting positions
    function resetTokensOnBoard() {
        // Clear all tokens from the board
        const tokens = document.querySelectorAll('.token-on-board');
        tokens.forEach(token => token.remove());
        
        // Place tokens in their starting areas
        for (let playerId = 1; playerId <= 4; playerId++) {
            for (let tokenId = 1; tokenId <= 4; tokenId++) {
                placeTokenInStart(playerId, tokenId);
            }
        }
    }
    
    // Place a token in its starting area
    function placeTokenInStart(playerId, tokenId) {
        const player = players[playerId];
        const tokenElement = document.querySelector(`.player-${playerId} .token[data-token="${tokenId}"]`);
        
        if (tokenElement) {
            // Clone the token for the board
            const boardToken = tokenElement.cloneNode(true);
            boardToken.classList.add('token-on-board');
            
            // Position token in starting area based on player and token id
            let startCell;
            
            if (playerId === 1) { // Red player
                startCell = document.querySelector(`.cell[data-row="2"][data-col="2"]`);
            } else if (playerId === 2) { // Green player
                startCell = document.querySelector(`.cell[data-row="2"][data-col="12"]`);
            } else if (playerId === 3) { // Yellow player
                startCell = document.querySelector(`.cell[data-row="12"][data-col="2"]`);
            } else if (playerId === 4) { // Blue player
                startCell = document.querySelector(`.cell[data-row="12"][data-col="12"]`);
            }
            
            if (startCell) {
                // Adjust position based on token id
                const offsetX = (tokenId === 1 || tokenId === 3) ? -10 : 10;
                const offsetY = (tokenId === 1 || tokenId === 2) ? -10 : 10;
                
                boardToken.style.position = 'absolute';
                boardToken.style.top = `calc(50% + ${offsetY}px)`;
                boardToken.style.left = `calc(50% + ${offsetX}px)`;
                boardToken.style.transform = 'translate(-50%, -50%)';
                boardToken.style.zIndex = '20';
                
                // Add click event to token
                boardToken.addEventListener('click', function() {
                    if (gameActive && diceRolled && currentPlayer == playerId) {
                        moveToken(playerId, tokenId);
                    }
                });
                
                startCell.appendChild(boardToken);
            }
        }
    }
    
    // Update player turn display
    function updatePlayerTurn() {
        const player = players[currentPlayer];
        document.getElementById('current-player').textContent = player.name;
        document.getElementById('current-player-color').style.backgroundColor = player.color;
    }
    
    // Update player status display
    function updatePlayerStatus() {
        for (let playerId = 1; playerId <= 4; playerId++) {
            const player = players[playerId];
            const playerElement = document.querySelector(`.player-${playerId}`);
            const statusElement = playerElement.querySelector('.status span');
            
            if (playerId === currentPlayer && gameActive) {
                statusElement.textContent = "Your turn";
            } else if (!gameActive) {
                statusElement.textContent = "Game over";
            } else {
                statusElement.textContent = "Waiting for turn";
            }
            
            // Update token count display
            const tokensAtHome = player.tokens.filter(pos => pos > 0).length;
            if (tokensAtHome === 4) {
                statusElement.textContent = "All tokens home!";
            }
        }
    }
    
    // Highlight current player
    function highlightCurrentPlayer() {
        // Remove active class from all players
        document.querySelectorAll('.player').forEach(player => {
            player.classList.remove('active');
        });
        
        // Add active class to current player
        document.querySelector(`.player-${currentPlayer}`).classList.add('active');
    }
    
    // Update message area
    function updateMessage(message) {
        document.getElementById('message-area').innerHTML = `<p>${message}</p>`;
    }
    
    // Roll the dice
    function rollDice() {
        if (!gameActive || diceRolled) return;
        
        // Generate random dice value (1-6)
        diceValue = Math.floor(Math.random() * 6) + 1;
        
        // Animate dice
        const diceElement = document.getElementById('dice');
        diceElement.classList.add('rolling');
        
        // Update dice display after animation
        setTimeout(() => {
            diceElement.classList.remove('rolling');
            document.getElementById('dice-value').textContent = diceValue;
            
            // Update message
            updateMessage(`${players[currentPlayer].name} rolled a ${diceValue}!`);
            
            diceRolled = true;
            
            // Check if player can move any token
            if (!canPlayerMove(currentPlayer)) {
                updateMessage(`${players[currentPlayer].name} cannot move. Next player's turn.`);
                setTimeout(nextTurn, 1500);
            } else {
                updateMessage(`${players[currentPlayer].name}, select a token to move!`);
            }
        }, 800);
    }
    
    // Check if player can move any token
    function canPlayerMove(playerId) {
        const player = players[playerId];
        
        // If player rolled a 6 and has tokens at home, they can move
        if (diceValue === 6) {
            const tokensAtHome = player.tokens.filter(pos => pos === 0).length;
            if (tokensAtHome > 0) return true;
        }
        
        // Check if any token can move
        for (let i = 0; i < 4; i++) {
            if (player.tokens[i] > 0 && player.tokens[i] + diceValue <= 57) {
                return true;
            }
        }
        
        return false;
    }
    
    // Move a token
    function moveToken(playerId, tokenId) {
        if (!gameActive || !diceRolled || playerId !== currentPlayer) return;
        
        const player = players[playerId];
        const tokenIndex = tokenId - 1;
        let currentPosition = player.tokens[tokenIndex];
        
        // Check if token is at home (position 0)
        if (currentPosition === 0) {
            // Token is at home, can only move out with a 6
            if (diceValue === 6) {
                player.tokens[tokenIndex] = 1; // Start at position 1
                updateMessage(`${player.name} moved token ${tokenId} out of home!`);
                moveTokenOnBoard(playerId, tokenId, 1);
                
                // Player gets another turn after rolling a 6
                diceRolled = false;
                updateMessage(`${player.name} gets another turn! Roll again.`);
                return;
            } else {
                updateMessage(`You need a 6 to move a token out of home!`);
                return;
            }
        }
        
        // Token is on the board, calculate new position
        let newPosition = currentPosition + diceValue;
        
        // Check if token can move to home stretch
        if (newPosition > 52) {
            // Token is in home stretch
            const homePosition = newPosition - 52;
            if (homePosition <= 6) {
                player.tokens[tokenIndex] = 52 + homePosition;
                updateMessage(`${player.name} moved token ${tokenId} closer to home!`);
                moveTokenOnBoard(playerId, tokenId, 52 + homePosition);
                
                // Check if token reached home
                if (homePosition === 6) {
                    player.home++;
                    updateMessage(`${player.name}'s token ${tokenId} reached home!`);
                    
                    // Check if player won
                    if (player.home === 4) {
                        gameActive = false;
                        updateMessage(`🎉 ${player.name} wins the game! 🎉`);
                        document.getElementById('roll-dice').disabled = true;
                        return;
                    }
                }
            } else {
                updateMessage(`Token ${tokenId} cannot move ${diceValue} spaces!`);
                return;
            }
        } else {
            // Token moves on the main path
            player.tokens[tokenIndex] = newPosition;
            updateMessage(`${player.name} moved token ${tokenId} to position ${newPosition}!`);
            moveTokenOnBoard(playerId, tokenId, newPosition);
            
            // Check if token landed on an opponent's token
            checkCapture(playerId, tokenId, newPosition);
        }
        
        // If player didn't roll a 6, move to next player
        if (diceValue !== 6) {
            nextTurn();
        } else {
            // Player gets another turn after rolling a 6
            diceRolled = false;
            updateMessage(`${player.name} gets another turn! Roll again.`);
        }
    }
    
    // Move token visually on the board
    function moveTokenOnBoard(playerId, tokenId, position) {
        // This is a simplified version for visualization
        // In a full implementation, this would calculate exact board coordinates
        
        const tokenElement = document.querySelector(`.player-${playerId} .token[data-token="${tokenId}"]`);
        if (tokenElement && tokenElement.parentNode) {
            // Add a visual effect to show movement
            tokenElement.style.transform = 'translate(-50%, -50%) scale(1.2)';
            setTimeout(() => {
                tokenElement.style.transform = 'translate(-50%, -50%) scale(1)';
            }, 300);
        }
        
        // Update token position indicator (simplified)
        const tokenIndicator = document.querySelector(`.player-${playerId} .token[data-token="${tokenId}"]`);
        if (position > 52) {
            tokenIndicator.title = `Position: Home stretch (${position-52}/6)`;
        } else if (position > 0) {
            tokenIndicator.title = `Position: ${position}`;
        } else {
           tokenIndicator.title = `Position: At Home`;
        }
    }
    
    // Check if token captured an opponent's token
    function checkCapture(playerId, tokenId, position) {
        // Skip if position is in home stretch or safe zone
        if (position > 52 || safePositions.includes(position)) return;
        
        // Check other players' tokens at this position
        for (let otherPlayerId in players) {
            if (otherPlayerId == playerId) continue;
            
            const otherPlayer = players[otherPlayerId];
            for (let i = 0; i < 4; i++) {
                if (otherPlayer.tokens[i] === position) {
                    // Capture opponent's token
                    otherPlayer.tokens[i] = 0;
                    updateMessage(`${players[playerId].name} captured ${players[otherPlayerId].name}'s token!`);
                    
                    // Move opponent's token back to start
                    const capturedToken = document.querySelector(`.player-${otherPlayerId} .token[data-token="${i+1}"]`);
                    if (capturedToken) {
                        capturedToken.style.animation = 'none';
                        capturedToken.offsetHeight; // Trigger reflow
                        capturedToken.style.animation = 'captureAnimation 0.5s ease';
                    }
                    
                    return;
                }
            }
        }
    }
    
    // Move to next player's turn
    function nextTurn() {
        diceRolled = false;
        
        // Find next active player
        let nextPlayer = currentPlayer;
        let attempts = 0;
        
        do {
            nextPlayer = (nextPlayer % 4) + 1;
            attempts++;
            
            // If we've checked all players and none are active, end game
            if (attempts > 4) {
                gameActive = false;
                updateMessage("No players can move! Game over.");
                return;
            }
        } while (!players[nextPlayer].active);
        
        currentPlayer = nextPlayer;
        updatePlayerTurn();
        updatePlayerStatus();
        highlightCurrentPlayer();
        updateMessage(`${players[currentPlayer].name}'s turn. Roll the dice!`);
    }
    
    // Generate the Ludo board
    function generateBoard() {
        const board = document.getElementById('board');
        board.innerHTML = '';
        
        // Create 15x15 grid
        for (let row = 1; row <= 15; row++) {
            for (let col = 1; col <= 15; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Center area
                if (row >= 7 && row <= 9 && col >= 7 && col <= 9) {
                    cell.classList.add('center');
                }
                // Red area (top-left)
                else if (row <= 6 && col <= 6) {
                    cell.classList.add('red-area');
                    if (row === 1 && col === 1) cell.classList.add('red-home');
                    if ((row === 2 && col === 2) || (row === 2 && col === 3) || 
                        (row === 3 && col === 2) || (row === 3 && col === 3)) {
                        cell.classList.add('red-safe');
                    }
                }
                // Green area (top-right)
                else if (row <= 6 && col >= 10) {
                    cell.classList.add('green-area');
                    if (row === 1 && col === 15) cell.classList.add('green-home');
                    if ((row === 2 && col === 13) || (row === 2 && col === 14) || 
                        (row === 3 && col === 13) || (row === 3 && col === 14)) {
                        cell.classList.add('green-safe');
                    }
                }
                // Yellow area (bottom-left)
                else if (row >= 10 && col <= 6) {
                    cell.classList.add('yellow-area');
                    if (row === 15 && col === 1) cell.classList.add('yellow-home');
                    if ((row === 13 && col === 2) || (row === 13 && col === 3) || 
                        (row === 14 && col === 2) || (row === 14 && col === 3)) {
                        cell.classList.add('yellow-safe');
                    }
                }
                // Blue area (bottom-right)
                else if (row >= 10 && col >= 10) {
                    cell.classList.add('blue-area');
                    if (row === 15 && col === 15) cell.classList.add('blue-home');
                    if ((row === 13 && col === 13) || (row === 13 && col === 14) || 
                        (row === 14 && col === 13) || (row === 14 && col === 14)) {
                        cell.classList.add('blue-safe');
                    }
                }
                // Path area
                else {
                    cell.classList.add('path');
                    
                    // Add star markers for safe positions
                    if ((row === 8 && col === 2) || (row === 2 && col === 8) || 
                        (row === 8 && col === 14) || (row === 14 && col === 8)) {
                        const star = document.createElement('div');
                        star.className = 'star';
                        star.innerHTML = '★';
                        cell.appendChild(star);
                    }
                }
                
                board.appendChild(cell);
            }
        }
    }
    
    // Event Listeners
    document.getElementById('roll-dice').addEventListener('click', rollDice);
    
    document.getElementById('new-game').addEventListener('click', initGame);
    
    document.getElementById('rules-btn').addEventListener('click', function() {
        document.getElementById('rules-modal').style.display = 'block';
    });
    
    document.querySelector('.close').addEventListener('click', function() {
        document.getElementById('rules-modal').style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('rules-modal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Add CSS for capture animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes captureAnimation {
            0% { transform: translate(-50%, -50%) scale(1); }
            50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.5; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Initialize the game
    generateBoard();
    initGame();
    
    // Add dice click event for rolling
    document.getElementById('dice').addEventListener('click', function() {
        if (!diceRolled) rollDice();
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Spacebar to roll dice
        if (event.code === 'Space' && !diceRolled && gameActive) {
            event.preventDefault();
            rollDice();
        }
        
        // R key to start new game
        if (event.code === 'KeyR' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            initGame();
        }
        
        // Number keys 1-4 to select tokens (when dice is rolled)
        if (diceRolled && gameActive && currentPlayer) {
            const key = parseInt(event.key);
            if (key >= 1 && key <= 4) {
                moveToken(currentPlayer, key);
            }
        }
    });
    
    // Add touch support for mobile devices
    let touchStartX = 0;
    let touchStartY = 0;
    
    document.addEventListener('touchstart', function(event) {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
    }, {passive: true});
    
    document.addEventListener('touchend', function(event) {
        const touchEndX = event.changedTouches[0].clientX;
        const touchEndY = event.changedTouches[0].clientY;
        
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        
        // If it's a simple tap (not a swipe)
        if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10) {
            // Check if tap was on dice
            const diceRect = document.getElementById('dice').getBoundingClientRect();
            if (
                touchEndX >= diceRect.left &&
                touchEndX <= diceRect.right &&
                touchEndY >= diceRect.top &&
                touchEndY <= diceRect.bottom
            ) {
                if (!diceRolled) rollDice();
            }
        }
    }, {passive: true});
    
    // Improve token selection for touch devices
    document.querySelectorAll('.token').forEach(token => {
        token.addEventListener('touchend', function(event) {
            if (!gameActive || !diceRolled) return;
            
            const playerId = parseInt(this.closest('.player').dataset.player);
            const tokenId = parseInt(this.dataset.token);
            
            if (playerId === currentPlayer) {
                moveToken(playerId, tokenId);
                event.preventDefault();
            }
        }, {passive: false});
    });
});
