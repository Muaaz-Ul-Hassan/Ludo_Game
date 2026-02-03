// Premium Ludo Game - Complete Game Logic
document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Game State Variables
    let currentPlayer = 1;
    let diceValue = 0;
    let diceRolled = false;
    let gameActive = true;
    let turnCount = 0;
    let soundEnabled = true;
    let theme = 'dark';
    
    // Players Data Structure
    const players = {
        1: { 
            name: "PLAYER 1", 
            color: "red", 
            tokens: [0, 0, 0, 0], // 0 = home, 1-52 = path, 53-58 = home stretch
            homeCount: 0,
            moves: 0,
            kills: 0,
            canMove: false
        },
        2: { 
            name: "PLAYER 2", 
            color: "green", 
            tokens: [0, 0, 0, 0],
            homeCount: 0,
            moves: 0,
            kills: 0,
            canMove: false
        },
        3: { 
            name: "PLAYER 3", 
            color: "yellow", 
            tokens: [0, 0, 0, 0],
            homeCount: 0,
            moves: 0,
            kills: 0,
            canMove: false
        },
        4: { 
            name: "PLAYER 4", 
            color: "blue", 
            tokens: [0, 0, 0, 0],
            homeCount: 0,
            moves: 0,
            kills: 0,
            canMove: false
        }
    };
    
    // Board Configuration
    const boardSize = 15;
    const totalCells = boardSize * boardSize;
    const pathCells = 52;
    const safePositions = [1, 9, 14, 22, 27, 35, 40, 48];
    const startPositions = {
        1: { row: 2, col: 2 },  // Red start
        2: { row: 2, col: 12 }, // Green start
        3: { row: 12, col: 2 }, // Yellow start
        4: { row: 12, col: 12 } // Blue start
    };
    
    // Token positions on board
    let tokenElements = {};
    
    // Initialize Game
    function initGame() {
        console.log("Initializing Premium Ludo Game...");
        
        // Reset game state
        currentPlayer = 1;
        diceValue = 0;
        diceRolled = false;
        gameActive = true;
        turnCount = 0;
        
        // Reset players
        for (let playerId in players) {
            players[playerId].tokens = [0, 0, 0, 0];
            players[playerId].homeCount = 0;
            players[playerId].moves = 0;
            players[playerId].kills = 0;
            players[playerId].canMove = false;
        }
        
        // Update UI
        updatePlayerTurn();
        updateGameStats();
        updatePlayerCards();
        updateMessage("🎮 Game Started! Player 1's turn. Roll the dice to begin!");
        addGameLog("Game started! Player 1 begins.", "welcome");
        
        // Reset dice display
        document.getElementById('dice-value').textContent = "0";
        document.getElementById('winner').textContent = "-";
        document.getElementById('turn-count').textContent = "0";
        
        // Reset board
        clearBoard();
        generateBoard();
        placeTokens();
        
        // Enable dice button
        document.getElementById('roll-dice').disabled = false;
        
        // Play start sound
        playSound('start');
    }
    
    // Generate the Ludo Board
    function generateBoard() {
        const board = document.getElementById('board');
        board.innerHTML = '';
        
        // Create 15x15 grid
        for (let row = 1; row <= boardSize; row++) {
            for (let col = 1; col <= boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Determine cell type based on position
                if (row >= 7 && row <= 9 && col >= 7 && col <= 9) {
                    // Center area
                    cell.classList.add('center');
                } else if (row <= 6 && col <= 6) {
                    // Red area (top-left)
                    cell.classList.add('red-area');
                    if (row === 1 && col === 1) cell.classList.add('red-home');
                    if ((row === 2 && col === 2) || (row === 2 && col === 3) || 
                        (row === 3 && col === 2) || (row === 3 && col === 3)) {
                        cell.classList.add('red-safe');
                    }
                } else if (row <= 6 && col >= 10) {
                    // Green area (top-right)
                    cell.classList.add('green-area');
                    if (row === 1 && col === 15) cell.classList.add('green-home');
                    if ((row === 2 && col === 13) || (row === 2 && col === 14) || 
                        (row === 3 && col === 13) || (row === 3 && col === 14)) {
                        cell.classList.add('green-safe');
                    }
                } else if (row >= 10 && col <= 6) {
                    // Yellow area (bottom-left)
                    cell.classList.add('yellow-area');
                    if (row === 15 && col === 1) cell.classList.add('yellow-home');
                    if ((row === 13 && col === 2) || (row === 13 && col === 3) || 
                        (row === 14 && col === 2) || (row === 14 && col === 3)) {
                        cell.classList.add('yellow-safe');
                    }
                } else if (row >= 10 && col >= 10) {
                    // Blue area (bottom-right)
                    cell.classList.add('blue-area');
                    if (row === 15 && col === 15) cell.classList.add('blue-home');
                    if ((row === 13 && col === 13) || (row === 13 && col === 14) || 
                        (row === 14 && col === 13) || (row === 14 && col === 14)) {
                        cell.classList.add('blue-safe');
                    }
                } else {
                    // Path area
                    cell.classList.add('path');
                }
                
                board.appendChild(cell);
            }
        }
    }
    
    // Clear board tokens
    function clearBoard() {
        const tokens = document.querySelectorAll('.token-board');
        tokens.forEach(token => token.remove());
        tokenElements = {};
    }
    
    // Place all tokens in starting positions
    function placeTokens() {
        for (let playerId = 1; playerId <= 4; playerId++) {
            for (let tokenId = 1; tokenId <= 4; tokenId++) {
                placeToken(playerId, tokenId, 'home');
            }
        }
    }
    
    // Place a token on the board
    function placeToken(playerId, tokenId, positionType, position = null) {
        const tokenKey = `p${playerId}t${tokenId}`;
        
        // Remove existing token if present
        if (tokenElements[tokenKey]) {
            tokenElements[tokenKey].remove();
        }
        
        const player = players[playerId];
        const token = document.createElement('div');
        token.className = `token-board ${player.color}`;
        token.dataset.player = playerId;
        token.dataset.token = tokenId;
        token.textContent = tokenId;
        token.id = tokenKey;
        
        // Position the token
        let cell;
        if (positionType === 'home') {
            // Place in home area
            const startPos = startPositions[playerId];
            cell = document.querySelector(`.cell[data-row="${startPos.row}"][data-col="${startPos.col}"]`);
            
            // Offset for multiple tokens in same cell
            const offset = getTokenOffset(tokenId);
            token.style.top = `calc(50% + ${offset.y}px)`;
            token.style.left = `calc(50% + ${offset.x}px)`;
        } else if (positionType === 'path') {
            // Place on path
            const cellCoords = positionToCoordinates(position, playerId);
            cell = document.querySelector(`.cell[data-row="${cellCoords.row}"][data-col="${cellCoords.col}"]`);
        } else if (positionType === 'home-stretch') {
            // Place in home stretch
            const stretchPos = position - 52; // 1-6
            const cellCoords = getHomeStretchCoords(playerId, stretchPos);
            cell = document.querySelector(`.cell[data-row="${cellCoords.row}"][data-col="${cellCoords.col}"]`);
        } else if (positionType === 'center') {
            // Place in center
            cell = document.querySelector('.cell.center');
            token.style.boxShadow = '0 0 30px gold';
            token.style.border = '3px solid gold';
        }
        
        if (cell) {
            token.style.position = 'absolute';
            token.style.transform = 'translate(-50%, -50%)';
            token.style.zIndex = '10';
            cell.appendChild(token);
            tokenElements[tokenKey] = token;
            
            // Add click event for token movement
            token.addEventListener('click', function() {
                if (gameActive && diceRolled && currentPlayer == playerId && player.canMove) {
                    moveToken(playerId, tokenId);
                }
            });
        }
    }
    
    // Get offset for multiple tokens in same cell
    function getTokenOffset(tokenId) {
        const offsets = {
            1: { x: -10, y: -10 },
            2: { x: 10, y: -10 },
            3: { x: -10, y: 10 },
            4: { x: 10, y: 10 }
        };
        return offsets[tokenId] || { x: 0, y: 0 };
    }
    
    // Convert path position to board coordinates
    function positionToCoordinates(position, playerId) {
        // Simplified path mapping for visualization
        // In a real implementation, this would map all 52 positions
        
        // This is a simplified version for demo
        const baseRow = 7;
        const baseCol = 7;
        
        if (position <= 13) {
            return { row: baseRow, col: baseCol - position };
        } else if (position <= 26) {
            return { row: baseRow + (position - 13), col: baseCol - 13 };
        } else if (position <= 39) {
            return { row: baseRow + 13, col: baseCol - 13 + (position - 26) };
        } else {
            return { row: baseRow + 13 - (position - 39), col: baseCol };
        }
    }
    
    // Get coordinates for home stretch positions
    function getHomeStretchCoords(playerId, stretchPos) {
        // Simplified home stretch positions
        if (playerId === 1) { // Red
            return { row: 7 - stretchPos, col: 7 };
        } else if (playerId === 2) { // Green
            return { row: 7, col: 7 + stretchPos };
        } else if (playerId === 3) { // Yellow
            return { row: 7 + stretchPos, col: 7 };
        } else { // Blue
            return { row: 7, col: 7 - stretchPos };
        }
    }
    
    // Update player turn display
    function updatePlayerTurn() {
        const player = players[currentPlayer];
        document.getElementById('current-player').textContent = player.name;
        document.getElementById('current-player-color').style.backgroundColor = player.color;
        document.getElementById('current-player-color').style.boxShadow = `0 0 20px ${player.color}`;
        
        // Update player cards
        document.querySelectorAll('.player-card').forEach(card => {
            card.classList.remove('active');
        });
        document.querySelector(`.player-card[data-player="${currentPlayer}"]`).classList.add('active');
    }
    
    // Update game statistics
    function updateGameStats() {
        document.getElementById('turn-count').textContent = turnCount;
        
        // Update each player's stats
        for (let i = 1; i <= 4; i++) {
            const player = players[i];
            document.getElementById(`p${i}-tokens`).textContent = player.homeCount;
            document.getElementById(`p${i}-moves`).textContent = player.moves;
            document.getElementById(`p${i}-kills`).textContent = player.kills;
            
            // Update token miniatures status
            for (let t = 1; t <= 4; t++) {
                const tokenPos = player.tokens[t-1];
                const tokenMini = document.querySelector(`.player-${i} .token-mini[data-token="${t}"]`);
                
                if (tokenMini) {
                    if (tokenPos === 0) {
                        tokenMini.dataset.pos = "home";
                    } else if (tokenPos > 0 && tokenPos <= 52) {
                        tokenMini.dataset.pos = "out";
                    } else if (tokenPos > 52 && tokenPos < 58) {
                        tokenMini.dataset.pos = "home-stretch";
                    } else if (tokenPos === 58) {
                        tokenMini.dataset.pos = "center";
                    }
                    
                    // Highlight active token if it can move
                    if (currentPlayer === i && diceRolled && player.canMove) {
                        tokenMini.classList.add('active');
                    } else {
                        tokenMini.classList.remove('active');
                    }
                }
            }
        }
    }
    
    // Update player cards
    function updatePlayerCards() {
        for (let i = 1; i <= 4; i++) {
            const card = document.querySelector(`.player-card[data-player="${i}"]`);
            const status = card.querySelector('.player-status span');
            
            if (i === currentPlayer && gameActive) {
                status.textContent = "TURN";
                card.querySelector('.status-dot').style.background = "#2ed573";
            } else {
                status.textContent = "WAITING";
                card.querySelector('.status-dot').style.background = "#94a3b8";
            }
        }
    }
    
    // Update message display
    function updateMessage(message) {
        document.getElementById('message-text').textContent = message;
        
        // Add animation
        const messageBox = document.getElementById('action-message');
        messageBox.style.animation = 'none';
        void messageBox.offsetWidth; // Trigger reflow
        messageBox.style.animation = 'messageSlide 0.5s ease-out';
    }
    
    // Add entry to game log
    function addGameLog(text, type = 'info') {
        const log = document.getElementById('game-log');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        
        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        entry.innerHTML = `
            <span class="log-time">[${time}]</span>
            <span class="log-text">${text}</span>
        `;
        
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
        
        // Limit log entries
        if (log.children.length > 20) {
            log.removeChild(log.firstChild);
        }
    }
    
    // Roll the dice
    function rollDice() {
        if (!gameActive || diceRolled) return;
        
        // Play dice roll sound
        playSound('dice');
        
        // Generate random dice value (1-6)
        diceValue = Math.floor(Math.random() * 6) + 1;
        
        // Animate dice
        const diceElement = document.getElementById('dice');
        diceElement.classList.add('rolling');
        
        // Update dice display after animation
        setTimeout(() => {
            diceElement.classList.remove('rolling');
            document.getElementById('dice-value').textContent = diceValue;
            
            // Show dice face based on value
            showDiceFace(diceValue);
            
            // Update game state
            diceRolled = true;
            turnCount++;
            
            const player = players[currentPlayer];
            updateMessage(`🎲 ${player.name} rolled a ${diceValue}!`);
            addGameLog(`${player.name} rolled a ${diceValue}`, diceValue === 6 ? 'six' : 'move');
            
            // Check if player can move
            player.canMove = canPlayerMove(currentPlayer);
            
            if (player.canMove) {
                updateMessage(`${player.name}, select a token to move!`);
                highlightMovableTokens();
            } else {
                updateMessage(`${player.name} cannot move. Next player's turn.`);
                setTimeout(nextTurn, 1500);
            }
            
            updateGameStats();
        }, 800);
    }
    
    // Show correct dice face
    function showDiceFace(value) {
        const dice = document.getElementById('dice');
        const rotation = {
            1: 'rotateX(0deg) rotateY(0deg)',
            2: 'rotateX(0deg) rotateY(90deg)',
            3: 'rotateX(-90deg) rotateY(0deg)',
            4: 'rotateX(90deg) rotateY(0deg)',
            5: 'rotateX(0deg) rotateY(-90deg)',
            6: 'rotateX(180deg) rotateY(0deg)'
        };
        
        dice.style.transform = rotation[value] || 'rotateX(25deg) rotateY(-25deg)';
    }
    
    // Check if player can move any token
    function canPlayerMove(playerId) {
        const player = players[playerId];
        
        // If player rolled a 6, check for tokens at home
        if (diceValue === 6) {
            for (let i = 0; i < 4; i++) {
                if (player.tokens[i] === 0) {
                    return true; // Can move token out of home
                }
            }
        }
        
        // Check tokens on board
        for (let i = 0; i < 4; i++) {
            const pos = player.tokens[i];
            if (pos > 0 && pos < 58) { // Token is on board
                if (pos <= 52) {
                    // On main path
                    if (pos + diceValue <= 52) return true;
                    // Can enter home stretch
                    if (pos + diceValue <= 58) return true;
                } else {
                    // In home stretch
                    const stretchPos = pos - 52;
                    if (stretchPos + diceValue <= 6) return true;
                }
            }
        }
        
        return false;
    }
    
    // Highlight tokens that can move
    function highlightMovableTokens() {
        const player = players[currentPlayer];
        
        // Reset all tokens
        document.querySelectorAll('.token-board').forEach(token => {
            token.classList.remove('active');
        });
        
        // Highlight movable tokens
        for (let i = 0; i < 4; i++) {
            if (canTokenMove(currentPlayer, i + 1)) {
                const token = document.getElementById(`p${currentPlayer}t${i + 1}`);
                if (token) {
                    token.classList.add('active');
                }
            }
        }
    }
    
    // Check if specific token can move
    function canTokenMove(playerId, tokenId) {
        const player = players[playerId];
        const tokenIndex = tokenId - 1;
        const pos = player.tokens[tokenIndex];
        
        if (diceValue === 6 && pos === 0) {
            return true; // Can move out of home
        }
        
        if (pos === 0 || pos === 58) return false; // At home or already in center
        
        if (pos <= 52) {
            // On main path
            if (pos + diceValue <= 52) return true;
            // Can enter home stretch
            if (pos + diceValue <= 58) return true;
        } else {
            // In home stretch
            const stretchPos = pos - 52;
            return stretchPos + diceValue <= 6;
        }
        
        return false;
    }
    
    // Move a token
    function moveToken(playerId, tokenId) {
        if (!gameActive || !diceRolled || playerId !== currentPlayer) return;
        
        const player = players[playerId];
        const tokenIndex = tokenId - 1;
        let currentPos = player.tokens[tokenIndex];
        
        // Play move sound
        playSound('move');
        
        // Check if token is at home (position 0)
        if (currentPos === 0) {
            // Token is at home, can only move out with a 6
            if (diceValue === 6) {
                player.tokens[tokenIndex] = 1; // Start at position 1
                updateMessage(`🚀 ${player.name} moved token ${tokenId} out of home!`);
                addGameLog(`${player.name} moved token ${tokenId} out of home`, 'move');
                
                // Visual update
                placeToken(playerId, tokenId, 'path', 1);
                player.moves++;
                
                // Check for extra turn
                if (diceValue === 6) {
                    updateMessage(`🎉 ${player.name} gets another turn for rolling a 6!`);
                    diceRolled = false;
                    player.canMove = false;
                    updateGameStats();
                    return;
                }
            }
        } else {
            // Token is on the board
            let newPos = currentPos + diceValue;
            
            // Check if token can move to home stretch or center
            if (currentPos <= 52 && newPos > 52) {
                // Entering home stretch
                if (newPos <= 58) {
                    player.tokens[tokenIndex] = newPos;
                    
                    if (newPos === 58) {
                        // Reached center
                        player.homeCount++;
                        updateMessage(`🏆 ${player.name}'s token ${tokenId} reached home center!`);
                        addGameLog(`${player.name}'s token ${tokenId} reached home center!`, 'move');
                        
                        // Place token in center
                        placeToken(playerId, tokenId, 'center');
                        
                        // Check if player won
                        if (player.homeCount === 4) {
                            endGame(playerId);
                            return;
                        }
                    } else {
                        // In home stretch
                        updateMessage(`🎯 ${player.name} moved token ${tokenId} to home stretch!`);
                        addGameLog(`${player.name} moved token ${tokenId} to home stretch`, 'move');
                        placeToken(playerId, tokenId, 'home-stretch', newPos);
                    }
                    
                    player.moves++;
                }
            } else if (currentPos > 52) {
                // Already in home stretch
                const stretchPos = currentPos - 52;
                if (stretchPos + diceValue <= 6) {
                    newPos = currentPos + diceValue;
                    player.tokens[tokenIndex] = newPos;
                    
                    if (newPos === 58) {
                        // Reached center
                        player.homeCount++;
                        updateMessage(`🏆 ${player.name}'s token ${tokenId} reached home center!`);
                        addGameLog(`${player.name}'s token ${tokenId} reached home center!`, 'move');
                        placeToken(playerId, tokenId, 'center');
                        
                        // Check if player won
                        if (player.homeCount === 4) {
                            endGame(playerId);
                            return;
                        }
                    } else {
                        updateMessage(`🎯 ${player.name} moved token ${tokenId} in home stretch!`);
                        placeToken(playerId, tokenId, 'home-stretch', newPos);
                    }
                    
                    player.moves++;
                }
            } else {
                // Moving on main path
                if (newPos <= 52) {
                    player.tokens[tokenIndex] = newPos;
                    updateMessage(`➡️ ${player.name} moved token ${tokenId} to position ${newPos}!`);
                    addGameLog(`${player.name} moved token ${tokenId} to position ${newPos}`, 'move');
                    
                    // Check for capture
                    const captured = checkCapture(playerId, tokenId, newPos);
                    
                    placeToken(playerId, tokenId, 'path', newPos);
                    player.moves++;
                    
                    if (captured) {
                        player.kills++;
                    }
                }
            }
        }
        
        // Update game state
        updateGameStats();
        
        // Check for extra turn
        if (diceValue === 6 && gameActive) {
            updateMessage(`🎉 ${player.name} gets another turn for rolling a 6!`);
            diceRolled = false;
            player.canMove = false;
        } else {
            nextTurn();
        }
    }
    
    // Check if token captured an opponent
    function checkCapture(playerId, tokenId, position) {
        if (safePositions.includes(position)) return false;
        
        for (let otherId in players) {
            if (otherId == playerId) continue;
            
            const otherPlayer = players[otherId];
            for (let i = 0; i < 4; i++) {
                if (otherPlayer.tokens[i] === position) {
                    // Capture!
                    otherPlayer.tokens[i] = 0;
                    
                    // Play capture sound
                    playSound('capture');
                    
                    updateMessage(`⚔️ ${players[playerId].name} captured ${players[otherId].name}'s token!`);
                    addGameLog(`${players[playerId].name} captured ${players[otherId].name}'s token ${i + 1}`, 'capture');
                    
                    // Move captured token back to home
                    placeToken(otherId, i + 1, 'home');
                    
                    return true;
                }
            }
        }
        
        return false;
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
            
            // Prevent infinite loop
            if (attempts > 4) {
                updateMessage("No players can move! Game over.");
                gameActive = false;
                return;
            }
        } while (!gameActive);
        
        currentPlayer = nextPlayer;
        updatePlayerTurn();
        updatePlayerCards();
        updateMessage(`${players[currentPlayer].name}'s turn. Roll the dice!`);
        
        // Reset token highlights
        document.querySelectorAll('.token-board').forEach(token => {
            token.classList.remove('active');
        });
    }
    
    // End the game
    function endGame(winnerId) {
        gameActive = false;
        const winner = players[winnerId];
        
        // Play victory sound
        playSound('victory');
        
        // Update winner display
        document.getElementById('winner').textContent = winner.name;
        
        // Update winner modal
        document.getElementById('winner-name').textContent = winner.name;
        document.getElementById('winner-tokens').textContent = "4/4";
        document.getElementById('winner-moves').textContent = winner.moves;
        document.getElementById('winner-kills').textContent = winner.kills;
        
        // Set winner avatar color
        const winnerAvatar = document.getElementById('winner-avatar').querySelector('.avatar-circle');
        winnerAvatar.className = `avatar-circle winner-${winner.color}`;
        
        // Show winner modal
        setTimeout(() => {
            showModal('winner-modal');
        }, 1000);
        
        updateMessage(`🎉 ${winner.name} WINS THE GAME! 🎉`);
        addGameLog(`${winner.name} WINS THE GAME! 🏆`, 'welcome');
    }
    
    // Play sound effect
    function playSound(type) {
        if (!soundEnabled) return;
        
        // Create audio context for sound effects
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            if (type === 'dice') {
                // Dice roll sound
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.8);
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
                
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.8);
                
            } else if (type === 'move') {
                // Token move sound
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.2);
                
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.2);
                
            } else if (type === 'capture') {
                // Capture sound
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        
                        oscillator.frequency.setValueAtTime(400 + i * 100, audioContext.currentTime);
                        
                        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                        
                        oscillator.start();
                        oscillator.stop(audioContext.currentTime + 0.1);
                    }, i * 50);
                }
                
            } else if (type === 'victory') {
                // Victory fanfare
                const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
                
                notes.forEach((freq, i) => {
                    setTimeout(() => {
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        
                        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                        
                        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                        
                        oscillator.start();
                        oscillator.stop(audioContext.currentTime + 0.3);
                    }, i * 200);
                });
            }
        } catch (e) {
            console.log("Audio not supported:", e);
        }
    }
    
    // Show modal
    function showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = 'block';
    }
    
    // Hide modal
    function hideModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = 'none';
    }
    
    // Toggle sound
    function toggleSound() {
        soundEnabled = !soundEnabled;
        const soundBtn = document.getElementById('sound-toggle');
        soundBtn.innerHTML = soundEnabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
        soundBtn.title = soundEnabled ? 'Sound On' : 'Sound Off';
    }
    
    // Toggle theme
    function toggleTheme() {
        theme = theme === 'dark' ? 'light' : 'dark';
        const themeBtn = document.getElementById('theme-toggle');
        
        if (theme === 'light') {
            document.documentElement.style.setProperty('--dark-bg', '#f0f2f5');
            document.documentElement.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.9)');
            document.documentElement.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.7)');
            document.documentElement.style.setProperty('--text-light', '#333333');
            document.documentElement.style.setProperty('--text-dim', '#666666');
            themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
            themeBtn.title = 'Light Theme';
        } else {
            document.documentElement.style.setProperty('--dark-bg', '#0a0e17');
            document.documentElement.style.setProperty('--card-bg', 'rgba(16, 22, 36, 0.9)');
            document.documentElement.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.1)');
            document.documentElement.style.setProperty('--text-light', '#ffffff');
            document.documentElement.style.setProperty('--text-dim', '#94a3b8');
            themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
            themeBtn.title = 'Dark Theme';
        }
    }
    
    // Event Listeners
    document.getElementById('roll-dice').addEventListener('click', rollDice);
    
    document.getElementById('new-game').addEventListener('click', initGame);
    
    document.getElementById('rules-btn').addEventListener('click', function() {
        showModal('rules-modal');
    });
    
    document.getElementById('play-again').addEventListener('click', function() {
        hideModal('winner-modal');
        initGame();
    });
    
    document.getElementById('sound-toggle').addEventListener('click', toggleSound);
    
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    // Close modal buttons
    document.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
        });
    });
    
    // Close modal when clicking overlay
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
        });
    });
    
    // Keyboard shortcuts
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
        
        // Number keys 1-4 to select tokens
        if (diceRolled && gameActive && players[currentPlayer].canMove) {
            const key = parseInt(event.key);
            if (key >= 1 && key <= 4) {
                moveToken(currentPlayer, key);
            }
        }
        
        // Escape to close modals
        if (event.code === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });
    
    // Touch support for mobile
    let touchStartTime;
    
    document.getElementById('dice').addEventListener('touchstart', function() {
        touchStartTime = Date.now();
    }, { passive: true });
    
    document.getElementById('dice').addEventListener('touchend', function(event) {
        const touchDuration = Date.now() - touchStartTime;
        if (touchDuration < 500 && !diceRolled && gameActive) {
            event.preventDefault();
            rollDice();
        }
    }, { passive: false });
    
    // Token click for mobile
    document.querySelectorAll('.token-board').forEach(token => {
        token.addEventListener('touchend', function(event) {
            if (!gameActive || !diceRolled) return;
            
            const playerId = parseInt(this.dataset.player);
            const tokenId = parseInt(this.dataset.token);
            
            if (playerId === currentPlayer && players[playerId].canMove) {
                moveToken(playerId, tokenId);
                event.preventDefault();
            }
        }, { passive: false });
    });
    
    // Token miniatures click
    document.querySelectorAll('.token-mini').forEach(tokenMini => {
        tokenMini.addEventListener('click', function() {
            if (!gameActive || !diceRolled) return;
            
            const playerCard = this.closest('.player-card');
            const playerId = parseInt(playerCard.dataset.player);
            const tokenId = parseInt(this.dataset.token);
            
            if (playerId === currentPlayer && players[playerId].canMove) {
                moveToken(playerId, tokenId);
            }
        });
    });
    
    // Initialize the game
    console.log("Premium Ludo Game loaded successfully!");
    initGame();
    
    // Show welcome message
    setTimeout(() => {
        updateMessage("🎮 Welcome to Premium Ludo! Player 1 starts the game. Roll the dice to begin!");
    }, 1000);
});
