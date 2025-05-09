// 定义常量
const DIFFICULTY_RATES = {
    easy: 0.3,
    medium: 0.35,
    hard: 0.4
};
const MAX_REMOVAL_RATE = 0.5;

export function generateCrossword(words, size, difficulty) {
    words = words
        .filter(word => word.trim() !== '')
        .map(word => word.toUpperCase());
    const grid = Array(size).fill().map(() => Array(size).fill(''));
    const usedWords = [];

    // 计算单词之间的交叉可能性
    const crossPotential = calculateCrossPotential(words);

    // 按交叉可能性和长度排序
    words.sort((a, b) => {
        const potentialDiff = crossPotential[b] - crossPotential[a];
        return potentialDiff !== 0 ? potentialDiff : b.length - a.length;
    });
    
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    // 放置第一个单词在中央范围
    if (words.length > 0) {
        const firstWord = words[0];
        const isHorizontal = Math.random() < 0.5; // 随机决定方向

        let startX, startY, dx, dy;

        if (isHorizontal) {
            const centralX = Math.floor((size - firstWord.length) / 2);
            const centralY = Math.floor(size / 2);
            const offsetX = getRandomInt(-2, 2);
            const offsetY = getRandomInt(-2, 2);
            startX = clamp(centralX + offsetX, 0, size - firstWord.length);
            startY = clamp(centralY + offsetY, 0, size - 1);
            dx = 1;
            dy = 0;
        } else {
            const centralX = Math.floor(size / 2);
            const centralY = Math.floor((size - firstWord.length) / 2);
            const offsetX = getRandomInt(-2, 2);
            const offsetY = getRandomInt(-2, 2);
            startX = clamp(centralX + offsetX, 0, size - 1);
            startY = clamp(centralY + offsetY, 0, size - firstWord.length);
            dx = 0;
            dy = 1;
        }

        placeWordOnGrid(firstWord, startX, startY, dx, dy, grid);
        usedWords.push(firstWord);
        words = words.slice(1);
    }

    // 尝试放置剩余的单词
    for (const word of words) {
        if (placeWord(word, grid)) {
            usedWords.push(word);
        }
    }

    // 生成完整的填字游戏后，随机移除一些字母
    const minRemovalRate = DIFFICULTY_RATES[difficulty];
    removeRandomLetters(grid, usedWords, minRemovalRate);

    // 处理孤立的空白格和无效块
    cleanupGrid(grid);

    return { grid, used: usedWords };
}

function calculateCrossPotential(words) {
    const potential = {};
    for (const word of words) {
        potential[word] = 0;
        for (const otherWord of words) {
            if (word !== otherWord) {
                potential[word] += countCommonLetters(word, otherWord);
            }
        }
    }
    return potential;
}

function countCommonLetters(word1, word2) {
    let count = 0;
    const word2Letters = new Set(word2); // 将 word2 转换为 Set
    for (const letter of new Set(word1)) { // 确保 word1 中的字母也是唯一的
        if (word2Letters.has(letter)) {
            count++;
        }
    }
    return count;
}

function placeWord(word, grid) {
    const size = grid.length;
    const positions = [];

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (canPlaceWordVertical(word, x, y, grid)) {
                positions.push({x, y, dx: 0, dy: 1});
            }
            if (canPlaceWordHorizontal(word, x, y, grid)) {
                positions.push({x, y, dx: 1, dy: 0});
            }
        }
    }

    // 按交叉数量排序位置
    positions.sort((a, b) => countIntersections(word, b.x, b.y, b.dx, b.dy, grid) - 
                             countIntersections(word, a.x, a.y, a.dx, a.dy, grid));

    // 选择最佳位置放置单词
    if (positions.length > 0) {
        const {x, y, dx, dy} = positions[0];
        placeWordOnGrid(word, x, y, dx, dy, grid);
        return true;
    }

    return false;
}

function countIntersections(word, x, y, dx, dy, grid) {
    let count = 0;
    for (let i = 0; i < word.length; i++) {
        if (grid[y + dy * i][x + dx * i] === word[i]) {
            count++;
        }
    }
    return count;
}

function canPlaceWordVertical(word, x, y, grid) {
    const size = grid.length;
    if (y + word.length > size) return false;
    
    let hasIntersection = false;
    for (let i = 0; i < word.length; i++) {
        if (grid[y + i][x] !== '' && grid[y + i][x] !== word[i]) return false;
        if (grid[y + i][x] === word[i]) hasIntersection = true;
        
        // 检查左右是否有其他字母（除了交叉点）
        if (grid[y + i][x] === '') {
            if (x > 0 && grid[y + i][x - 1] !== '') return false;
            if (x < size - 1 && grid[y + i][x + 1] !== '') return false;
        }
    }

    // 检查单词的上下是否有其他字母
    if (y > 0 && grid[y - 1][x] !== '') return false;
    if (y + word.length < size && grid[y + word.length][x] !== '') return false;

    // 如果是第一个单词，或者有交叉点，则允许放置
    return hasIntersection || isGridEmpty(grid);
}

function canPlaceWordHorizontal(word, x, y, grid) {
    const size = grid.length;
    if (x + word.length > size) return false;
    
    let hasIntersection = false;
    for (let i = 0; i < word.length; i++) {
        if (grid[y][x + i] !== '' && grid[y][x + i] !== word[i]) return false;
        if (grid[y][x + i] === word[i]) hasIntersection = true;
        
        // 检查上下是否有其他字母（除了交叉点）
        if (grid[y][x + i] === '') {
            if (y > 0 && grid[y - 1][x + i] !== '') return false;
            if (y < size - 1 && grid[y + 1][x + i] !== '') return false;
        }
    }

    // 检查单词的左右是否有其他字母
    if (x > 0 && grid[y][x - 1] !== '') return false;
    if (x + word.length < size && grid[y][x + word.length] !== '') return false;

    // 如果是第一个单词，或者有交叉点，则允许放置
    return hasIntersection || isGridEmpty(grid);
}

function isGridEmpty(grid) {
    return grid.every(row => row.every(cell => cell === ''));
}

function placeWordOnGrid(word, x, y, dx, dy, grid) {
    for (let i = 0; i < word.length; i++) {
        grid[y + dy * i][x + dx * i] = word[i];
    }
}

function removeRandomLetters(grid, usedWords, minRemovalRate) {
    //const size = grid.length;
    
    for (const word of usedWords) {
        const wordLength = word.length;
        // 使用传入的 minRemovalRate
        const wordRemovalRate = Math.min(MAX_REMOVAL_RATE, Math.max(minRemovalRate, 1 / wordLength));
        
        // 找到单词在网格中的位置
        const [x, y, dx, dy] = findWordPosition(word, grid);
        if (x !== -1) {
            // 移动单词中的字母
            // console.log(`Removing letters from ${word} at (${x}, ${y}) with direction (${dx}, ${dy})`);
            removeLettersFromWord(word, x, y, dx, dy, grid, wordRemovalRate);
        } else {
            // console.log(`Word ${word} not found in grid, skipping`);
        }
    }
}

function findWordPosition(word, grid) {
    const size = grid.length;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            // 检查水平方向
            if (x + word.length <= size) {
                let match = true;
                for (let i = 0; i < word.length; i++) {
                    if (grid[y][x + i] !== word[i]) {
                        match = false;
                        break;
                    }
                }
                if (match) {
                    // console.log(`Found ${word} horizontally at (${x}, ${y})`);
                    return [x, y, 1, 0];
                }
            }
            
            // 检查垂直方向
            if (y + word.length <= size) {
                let match = true;
                for (let i = 0; i < word.length; i++) {
                    if (grid[y + i][x] !== word[i]) {
                        match = false;
                        break;
                    }
                }
                if (match) {
                    // console.log(`Found ${word} vertically at (${x}, ${y})`);
                    return [x, y, 0, 1];
                }
            }
        }
    }
    // console.log(`Word ${word} not found in grid`);
    return [-1, -1, 0, 0]; // 未找到单词
}

function removeLettersFromWord(word, x, y, dx, dy, grid, removalRate) {
    //const size = grid.length;
    const letterIndices = [];
    const crossPoints = [];

    // console.log(`Analyzing word: ${word} at position (${x}, ${y}) with direction (${dx}, ${dy})`);

    // 识别单词中的字母和交叉点
    for (let i = 0; i < word.length; i++) {
        const cx = x + dx * i;
        const cy = y + dy * i;
        
        // 添加调试信息
        // console.log(`Checking letter ${word[i]} at (${cx}, ${cy}). Grid value: ${grid[cy][cx]}`);
        
        if (grid[cy][cx] === word[i]) {
            const isCross = isCrossPoint(cx, cy, grid);
            // console.log(`Letter ${word[i]} at (${cx}, ${cy}): ${isCross ? 'Cross point' : 'Not cross point'}`);
            if (isCross) {
                crossPoints.push(i);
            } else {
                letterIndices.push(i);
            }
        } else {
            // console.log(`Mismatch at (${cx}, ${cy}): Expected ${word[i]}, found ${grid[cy][cx]}`);
        }
    }

    // console.log(`Word: ${word}, Cross points: ${crossPoints.length}, Removable letters: ${letterIndices.length}`);

    let lettersToRemove = Math.floor(letterIndices.length * removalRate);
    lettersToRemove = Math.max(1, Math.min(lettersToRemove, letterIndices.length - 1));

    // 确保移除至少一个字母，除非单词只有交叉点
    if (lettersToRemove === 0 && letterIndices.length > 0) {
        lettersToRemove = 1;
    }

    // console.log(`Letters to remove: ${lettersToRemove}`);

    //随机选择要移除的字母
    const removedIndices = new Set();
    while (lettersToRemove > 0 && letterIndices.length > removedIndices.size) {
        const randomIndex = Math.floor(Math.random() * letterIndices.length);
        const letterIndex = letterIndices[randomIndex];
        if (!removedIndices.has(letterIndex)) {
            grid[y + dy * letterIndex][x + dx * letterIndex] = ' ';
            removedIndices.add(letterIndex);
            lettersToRemove--;
        }
    }

    // console.log(`Removed letters: ${Array.from(removedIndices).join(', ')}`);

    // 检查并修复连续字母的情况
    const maxConsecutiveLetters = 3;
    let consecutiveCount = 0;
    let start = -1;

    for (let i = 0; i < word.length; i++) {
        if (grid[y + dy * i][x + dx * i] !== ' ') {
            if (start === -1) start = i;
            consecutiveCount++;
            if (consecutiveCount > maxConsecutiveLetters) {
                // 在连续字母中间随机选择一个非交叉点移除
                const removeOptions = [];
                for (let j = start; j < i; j++) {
                    if (!crossPoints.includes(j) && grid[y + dy * j][x + dx * j] !== ' ') {
                        removeOptions.push(j);
                    }
                }
                if (removeOptions.length > 0) {
                    const removeIndex = removeOptions[Math.floor(Math.random() * removeOptions.length)];
                    grid[y + dy * removeIndex][x + dx * removeIndex] = ' ';
                    consecutiveCount = i - removeIndex;
                    start = removeIndex + 1;
                }
            }
        } else {
            consecutiveCount = 0;
            start = -1;
        }
    }
}

function isCrossPoint(x, y, grid) {
    const size = grid.length;
    let verticalNeighbor = false;
    let horizontalNeighbor = false;

    // 检查垂直方向
    if (y > 0 && grid[y-1][x] !== '' && grid[y-1][x] !== ' ') verticalNeighbor = true;
    if (y < size-1 && grid[y+1][x] !== '' && grid[y+1][x] !== ' ') verticalNeighbor = true;

    // 检查水平方向
    if (x > 0 && grid[y][x-1] !== '' && grid[y][x-1] !== ' ') horizontalNeighbor = true;
    if (x < size-1 && grid[y][x+1] !== '' && grid[y][x+1] !== ' ') horizontalNeighbor = true;

    // 如果字母同时在垂直和水平方向有邻居，则为交叉点
    return verticalNeighbor && horizontalNeighbor;
}
/*
function displayGrid(grid) {
    const gridElement = document.getElementById('crosswordGrid');
    gridElement.innerHTML = '';
    gridElement.style.gridTemplateColumns = `repeat(${grid.length}, 30px)`;

    grid.forEach((row, y) => {
        row.forEach((cell, x) => {
            const cellElement = document.createElement('div');
            cellElement.classList.add('cell');
            if (cell === '' || cell === '#') {
                cellElement.classList.add('black');
            } else if (cell === ' ') {
                cellElement.classList.add('empty');
                cellElement.contentEditable = true;
            } else {
                cellElement.textContent = cell;
            }
            gridElement.appendChild(cellElement);
        });
    });
}

function displayUsedWords(usedWords) {
    const wordListElement = document.createElement('div');
    wordListElement.innerHTML = '<h2>已使用的单词：</h2>' + usedWords.join(', ');
    document.body.appendChild(wordListElement);
}
*/
function cleanupGrid(grid) {
    const size = grid.length;
    let changed;
    do {
        changed = false;
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (grid[y][x] === ' ' || grid[y][x] === '#') {
                    if (!isPartOfWord(grid, x, y)) {
                        grid[y][x] = '';
                        changed = true;
                    }
                }
            }
        }
    } while (changed);
}

function isPartOfWord(grid, x, y) {
    //const size = grid.length;
    // 检查水平方向
    if (isValidWordSegment(grid, x, y, 1, 0) || isValidWordSegment(grid, x, y, -1, 0)) {
        return true;
    }
    // 检查垂直方向
    if (isValidWordSegment(grid, x, y, 0, 1) || isValidWordSegment(grid, x, y, 0, -1)) {
        return true;
    }
    return false;
}

function isValidWordSegment(grid, x, y, dx, dy) {
    const size = grid.length;
    let length = 0;
    let hasLetter = false;

    while (x >= 0 && x < size && y >= 0 && y < size) {
        if (grid[y][x] === '') break;
        if (grid[y][x] !== ' ' && grid[y][x] !== '#') hasLetter = true;
        length++;
        x += dx;
        y += dy;
    }

    return length > 1 && hasLetter;
} 