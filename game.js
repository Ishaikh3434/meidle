// Game state
let gameData = null; // Will contain { columns, products }
let currentRandomTea = null;
let revealState = {}; // Tracks matched words per field
let attempts = 0;
let gameWon = false;
let guessesHistory = []; // Track all guesses

// Load data on page load
document.addEventListener('DOMContentLoaded', async () => {
    loadSettings();
    await loadGameData();
    await startNewGame();
});

/**
 * Load tea products data from JSON file
 */
async function loadGameData() {
    try {
        const response = await fetch('data.json');
        gameData = await response.json();
        console.log(`✓ Loaded ${gameData.products.length} teas with ${gameData.columns.length} columns`);
        initializeTableHeaders();
    } catch (error) {
        showError('Failed to load game data. Make sure data.json is in the same folder as index.html.');
        console.error(error);
        throw error;
    }
}

/**
 * Initialize table headers based on game data columns
 */
function initializeTableHeaders() {
    const thead = document.querySelector('#guessesTable thead tr');
    if (!thead) return;
    
    // Clear existing detail headers (keep first 2)
    let existingHeaders = thead.querySelectorAll('th');
    while (existingHeaders.length > 2) {
        existingHeaders[existingHeaders.length - 1].remove();
        existingHeaders = thead.querySelectorAll('th');
    }
    
    // Add headers for each visible field
    for (const col of getVisibleColumns()) {
        const th = document.createElement('th');
        th.className = 'detail-col';
        th.textContent = getColumnDisplayName(col);
        thead.appendChild(th);
    }
}

/**
 * Columns to exclude from the display comparison
 */
const EXCLUDED_COLUMNS = ['url', 'western_water_temp_c', 'western_water_temp_f'];
const DEFAULT_TEMP_UNIT = 'C';
const DEFAULT_THEME_MODE = 'light';
let tempUnit = DEFAULT_TEMP_UNIT;
let themeMode = DEFAULT_THEME_MODE;

function isGongFuTempColumn(col) {
    return col === 'gong_fu_water_temp_c' || col === 'gong_fu_water_temp_f';
}

function getVisibleColumns() {
    if (!gameData) {
        return [];
    }

    return gameData.columns.filter(col => {
        if (EXCLUDED_COLUMNS.includes(col)) {
            return false;
        }
        if (isGongFuTempColumn(col)) {
            return col === (tempUnit === 'C' ? 'gong_fu_water_temp_c' : 'gong_fu_water_temp_f');
        }
        return true;
    });
}

function getColumnDisplayName(col) {
    if (isGongFuTempColumn(col)) {
        return 'Gong Fu Water Temp';
    }
    return beautifyColumnName(col);
}

/**
 * Convert snake_case column names to Title Case for display
 * e.g., "tea_type" → "Tea Type", "gong_fu_1st_steep" → "Gong Fu 1st Steep"
 */
function beautifyColumnName(col) {
    return col
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Build the reveal table with blurred words for the random tea
 */
function buildRevealTable() {
    const comparisonContainer = document.getElementById('comparisonContainer');
    if (!comparisonContainer) return;
    comparisonContainer.innerHTML = '<div class="reveal-title">Random Tea Info</div>';
    comparisonContainer.classList.remove('hidden');

    const table = document.createElement('table');
    table.className = 'reveal-table';

    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Field</th>
            <th>Info</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    for (const col of getVisibleColumns()) {
        const randomVal = currentRandomTea[col] || '';
        if (!randomVal) {
            continue;
        }

        const row = document.createElement('tr');
        const labelCell = document.createElement('td');
        labelCell.className = 'field-name';
        labelCell.textContent = getColumnDisplayName(col);

        const valueCell = document.createElement('td');
        valueCell.className = 'field-value';
        valueCell.innerHTML = renderRevealValue(randomVal, col);

        row.appendChild(labelCell);
        row.appendChild(valueCell);
        tbody.appendChild(row);
    }

    table.appendChild(tbody);
    comparisonContainer.appendChild(table);
}

function applyTheme() {
    const root = document.documentElement;
    root.classList.toggle('dark-mode', themeMode === 'dark');
    root.classList.toggle('light-mode', themeMode === 'light');
}

function saveSettings() {
    localStorage.setItem('MEIDLE_TEMP_UNIT', tempUnit);
    localStorage.setItem('MEIDLE_THEME_MODE', themeMode);
}

function loadSettings() {
    const savedTempUnit = localStorage.getItem('MEIDLE_TEMP_UNIT');
    const savedThemeMode = localStorage.getItem('MEIDLE_THEME_MODE');

    if (savedTempUnit === 'C' || savedTempUnit === 'F') {
        tempUnit = savedTempUnit;
    }

    if (savedThemeMode === 'light' || savedThemeMode === 'dark') {
        themeMode = savedThemeMode;
    }

    const tempUnitSelect = document.getElementById('tempUnitSelect');
    const themeSelect = document.getElementById('themeSelect');

    if (tempUnitSelect) {
        tempUnitSelect.value = tempUnit;
    }
    if (themeSelect) {
        themeSelect.value = themeMode;
    }

    applyTheme();
}

function handleSettingsChange() {
    const tempUnitSelect = document.getElementById('tempUnitSelect');
    const themeSelect = document.getElementById('themeSelect');

    if (tempUnitSelect) {
        tempUnit = tempUnitSelect.value;
    }
    if (themeSelect) {
        themeMode = themeSelect.value;
    }

    saveSettings();
    applyTheme();
    initializeTableHeaders();
    buildRevealTable();
    rebuildGuessHistoryTable();
}

function rebuildGuessHistoryTable() {
    const tbody = document.getElementById('guessesTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    for (const guess of guessesHistory) {
        addGuessToTable(guess.attemptNum, guess.guessedTitle, guess.isCorrect, guess.comparisonData);
    }
}

/**
 * Render a field value with blurred words and revealed matches
 */
function renderRevealValue(randomVal, col) {
    const revealedWords = revealState[col] || new Set();
    const tokens = String(randomVal).split(/(\s+)/);

    return tokens.map(token => {
        if (!token.trim()) {
            return escapeHtml(token);
        }

        const normalized = token.toLowerCase();
        const isRevealed = revealedWords.has(normalized);
        const className = isRevealed ? 'revealed-word' : 'blurred-word';

        return `<span class="${className}" data-col="${escapeHtml(col)}" data-word="${escapeHtml(normalized)}">${escapeHtml(token)}</span>`;
    }).join('');
}

/**
 * Update the reveal state based on the latest guessed tea
 */
function updateRevealState(guessTea) {
    for (const col of gameData.columns) {
        if (EXCLUDED_COLUMNS.includes(col)) {
            continue;
        }

        const randomVal = currentRandomTea[col] || '';
        const guessVal = guessTea[col] || '';
        const matchedWords = getMatchingWords(randomVal, guessVal);

        if (!matchedWords.length) {
            continue;
        }

        if (!revealState[col]) {
            revealState[col] = new Set();
        }

        matchedWords.forEach(word => revealState[col].add(word));
    }
}

/**
 * Find matching words between random tea value and guess value
 */
function getMatchingWords(randomVal, guessVal) {
    if (!randomVal || !guessVal) {
        return [];
    }

    const randomWords = new Set(String(randomVal).toLowerCase().split(/\s+/).filter(Boolean));
    const guessWords = String(guessVal).toLowerCase().split(/\s+/).filter(Boolean);

    return guessWords.filter(word =>
        randomWords.has(word) || Array.from(randomWords).some(rw => rw.includes(word))
    );
}

/**
 * Get a random tea from the products list
 */
function getRandomProduct() {
    const randomIndex = Math.floor(Math.random() * gameData.products.length);
    return gameData.products[randomIndex];
}

/**
 * Fuzzy search for a tea by title
 * First tries exact match, then partial case-insensitive match
 * Returns { product, matchedTitle } or { product: null, error: message }
 */
function getProductByTitleFuzzy(guess) {
    const guessLower = guess.toLowerCase();
    
    // Try exact match first
    for (const product of gameData.products) {
        if (product.title.toLowerCase() === guessLower) {
            return { product, matchedTitle: product.title };
        }
    }
    
    // Try partial match (case-insensitive)
    const matches = gameData.products.filter(product =>
        product.title.toLowerCase().includes(guessLower)
    );
    
    if (matches.length === 1) {
        return { product: matches[0], matchedTitle: matches[0].title };
    } else if (matches.length > 1) {
        return { product: null, error: `Multiple matches found (${matches.length}). Be more specific.` };
    } else {
        return { product: null, error: 'Tea not found!' };
    }
}

/**
 * Compare two field values and return HTML with color coding
 * Green for matches, red for mismatches
 * Handles partial word matching
 */
function compareValues(randomVal, guessVal) {
    if (!randomVal || !guessVal) {
        return guessVal ? `<span class="red">${escapeHtml(guessVal)}</span>` : '<span class="red">(empty)</span>';
    }
    
    randomVal = String(randomVal).toLowerCase();
    guessVal = String(guessVal).toLowerCase();
    
    if (randomVal === guessVal) {
        return `<span class="green">${escapeHtml(guessVal)}</span>`;
    }
    
    // Check for partial word matches
    const randomWords = new Set(randomVal.split(/\s+/));
    const guessWords = guessVal.split(/\s+/);
    
    const coloredWords = guessWords.map(word => {
        // Check if word is in random words or partially matches any random word
        if (randomWords.has(word) || Array.from(randomWords).some(rw => rw.includes(word))) {
            return `<span class="green">${escapeHtml(word)}</span>`;
        } else {
            return `<span class="red">${escapeHtml(word)}</span>`;
        }
    });
    
    return coloredWords.join(' ');
}

/**
 * Escape HTML to prevent injection
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

/**
 * Start a new game
 */
async function startNewGame() {
    attempts = 0;
    gameWon = false;
    guessesHistory = [];
    
    document.getElementById('messageContainer').innerHTML = '';
    document.getElementById('comparisonContainer').innerHTML = '';
    document.getElementById('comparisonContainer').classList.add('hidden');
    document.getElementById('guessTitleContainer').classList.add('hidden');
    document.getElementById('attemptCounter').classList.add('hidden');
    document.getElementById('guessInput').value = '';
    document.getElementById('guessButton').style.display = 'inline-block';
    document.getElementById('newGameButton').style.display = 'none';
    document.getElementById('guessInput').disabled = false;
    document.getElementById('guessButton').disabled = false;
    document.getElementById('guessInput').focus();
    
    // Clear guesses table
    const tbody = document.getElementById('guessesTableBody');
    if (tbody) {
        tbody.innerHTML = '';
    }
    
    currentRandomTea = getRandomProduct();
    revealState = {};
    buildRevealTable();
    showInfo('A random tea has been chosen. Can you guess which one?');
}

/**
 * Handle guess submission
 */
function makeGuess() {
    const guessInput = document.getElementById('guessInput').value.trim();
    
    if (!guessInput) {
        showError('Please enter a tea name.');
        return;
    }
    
    const result = getProductByTitleFuzzy(guessInput);
    
    if (!result.product) {
        showError(result.error);
        return;
    }
    
    attempts++;
    const guessTea = result.product;
    const matchedTitle = result.matchedTitle;
    
    updateRevealState(guessTea);
    displayComparison(matchedTitle, guessTea);
    buildRevealTable();
    
    // Check if guessed correctly (compare all fields)
    if (JSON.stringify(currentRandomTea) === JSON.stringify(guessTea)) {
        gameWon = true;
        showSuccess(`✓ CORRECT! You guessed it in ${attempts} attempt(s)!`);
        document.getElementById('guessInput').disabled = true;
        document.getElementById('guessButton').disabled = true;
        document.getElementById('guessButton').style.display = 'none';
        document.getElementById('newGameButton').style.display = 'inline-block';
    } else {
        showError('✗ Not quite! Try again.');
        document.getElementById('guessInput').value = '';
        document.getElementById('guessInput').focus();
    }
}

/**
 * Display the comparison grid for current attempt
 */
function displayComparison(matchedTitle, guessTea) {
    document.getElementById('attemptCounter').classList.remove('hidden');
    document.getElementById('attemptNumber').textContent = attempts;
    
    document.getElementById('guessTitleContainer').classList.remove('hidden');
    document.getElementById('guessTitle').textContent = `Your Guess: ${escapeHtml(matchedTitle)}`;
    
    const comparisonData = {};
    
    for (const col of getVisibleColumns()) {
        const randomVal = currentRandomTea[col] || '';
        const guessVal = guessTea[col] || '';
        
        if (randomVal) {
            const coloredValue = compareValues(randomVal, guessVal);
            comparisonData[col] = coloredValue;
        }
    }
    
    const isCorrect = JSON.stringify(currentRandomTea) === JSON.stringify(guessTea);
    guessesHistory.push({ attemptNum: attempts, guessedTitle: matchedTitle, isCorrect, comparisonData });
    addGuessToTable(attempts, matchedTitle, isCorrect, comparisonData);
}

/**
 * Add a guess to the history table
 */
function addGuessToTable(attemptNum, guessedTitle, isCorrect, comparisonData) {
    const tbody = document.getElementById('guessesTableBody');
    if (!tbody) return;
    
    const row = document.createElement('tr');
    row.className = isCorrect ? 'guess-row correct' : 'guess-row';
    
    let rowHTML = `
        <td class="attempt-col">${attemptNum}</td>
        <td class="tea-name-col">${escapeHtml(guessedTitle)}</td>
    `;
    
    for (const col of getVisibleColumns()) {
        const value = comparisonData[col] || '';
        const title = getColumnDisplayName(col);
        rowHTML += `<td class="detail-col" title="${escapeHtml(title)}">${value}</td>`;
    }
    
    row.innerHTML = rowHTML;
    tbody.appendChild(row);
    
    const tableContainer = document.getElementById('guessesTableContainer');
    if (tableContainer) {
        setTimeout(() => {
            tableContainer.scrollTop = tableContainer.scrollHeight;
        }, 0);
    }
}

/**
 * Show error message
 */
function showError(message) {
    const container = document.getElementById('messageContainer');
    container.innerHTML = `<div class="message error">${escapeHtml(message)}</div>`;
}

/**
 * Show success message
 */
function showSuccess(message) {
    const container = document.getElementById('messageContainer');
    container.innerHTML = `<div class="message success">${escapeHtml(message)}</div>`;
}

/**
 * Show info message
 */
function showInfo(message) {
    const container = document.getElementById('messageContainer');
    container.innerHTML = `<div class="message info">${escapeHtml(message)}</div>`;
}

/**
 * Handle Enter key in input field
 */
document.addEventListener('DOMContentLoaded', () => {
    const guessInput = document.getElementById('guessInput');
    if (guessInput) {
        guessInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !gameWon) {
                makeGuess();
            }
        });
    }
});
