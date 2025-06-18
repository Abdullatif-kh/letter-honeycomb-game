/**
 * Letter Honeycomb Game - Interactive Educational Game
 * Author: Abdullatif Alkhanbashi
 * Year: 2025
 * 
 * A bilingual (Arabic/English) interactive game that combines letter learning
 * with strategic thinking through a honeycomb-style board game.
 */

// Global game state variables
let currentColor = null;
let greenCellsCount = 0;
let redCellsCount = 0;
let highlightedCell = null;
let highlightTimeout = null;
let currentZoom = 1;
let currentLanguage = localStorage.getItem('language') || 'ar';
let darkMode = localStorage.getItem('darkMode') === 'enabled';
let currentAction = null;

// Game configuration constants
const LETTERS = {
    ar: ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن'],
    en: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y']
};

const STATUS_MESSAGES = {
    'default': {
        'ar': 'اختر لوناً ثم انقر على الخلايا لتغيير لونها',
        'en': 'Select a color then click on cells to change their color'
    },
    'color-green': {
        'ar': 'اختر الخلايا لتلوينها بالأخضر',
        'en': 'Select cells to color them green'
    },
    'color-red': {
        'ar': 'اختر الخلايا لتلوينها بالأحمر',
        'en': 'Select cells to color them red'
    },
    'color-cream': {
        'ar': 'اختر الخلايا لإعادتها للون الأصلي',
        'en': 'Select cells to reset them to original color'
    },
    'select-color-first': {
        'ar': 'الرجاء اختيار لون أولاً',
        'en': 'Please select a color first'
    },
    'cell-fixed': {
        'ar': 'لا يمكن تغيير لون الخلايا الثابتة',
        'en': 'Fixed cells cannot be changed'
    },
    'random-letter': {
        'ar': 'تم اختيار حرف عشوائي! سيختفي بعد 3 ثوان',
        'en': 'Random letter selected! Will disappear in 3 seconds'
    },
    'reset-success': {
        'ar': 'تم مسح جميع الألوان!',
        'en': 'All colors have been reset!'
    },
    'shuffle-success': {
        'ar': 'تم تبديل الحروف بنجاح!',
        'en': 'Letters have been shuffled successfully!'
    }
};

// DOM element references
let hexCells, letterCells, statusText, greenCount, redCount;
let greenBtn, redBtn, creamBtn, resetBtn, randomBtn, shuffleBtn;
let langToggle, themeToggle, zoomInBtn, zoomOutBtn, helpBtn, closeHelpBtn;
let confirmDialog, confirmYes, confirmNo, confirmTitle, confirmMessage;
let helpDialog, helpTitle, helpContent;
let gameTitle, footer, honeycomb, honeycombContainer;

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDOMElements();
    setupEventListeners();
    initializeUI();
    loadSavedProgress();
    handleResponsiveDesign();
    
    console.log("Letter Honeycomb Game initialized successfully!");
});

// Initialize DOM element references
function initializeDOMElements() {
    hexCells = document.querySelectorAll('.hex');
    letterCells = document.querySelectorAll('.hex.letter');
    statusText = document.getElementById('statusText');
    greenCount = document.getElementById('greenCount');
    redCount = document.getElementById('redCount');
    
    // Log for debugging
    if (letterCells.length === 0) {
        console.error("No letter cells found! Check HTML structure.");
    } else {
        console.log(`Game initialized: ${hexCells.length} hex cells, ${letterCells.length} letter cells`);
    }
    
    greenBtn = document.getElementById('greenBtn');
    redBtn = document.getElementById('redBtn');
    creamBtn = document.getElementById('creamBtn');
    resetBtn = document.getElementById('resetBtn');
    randomBtn = document.getElementById('randomBtn');
    shuffleBtn = document.getElementById('shuffleBtn');
    
    langToggle = document.getElementById('langToggle');
    themeToggle = document.getElementById('themeToggle');
    zoomInBtn = document.getElementById('zoomInBtn');
    zoomOutBtn = document.getElementById('zoomOutBtn');
    helpBtn = document.getElementById('helpBtn');
    closeHelpBtn = document.getElementById('closeHelpBtn');
    
    confirmDialog = document.getElementById('confirmDialog');
    confirmYes = document.getElementById('confirmYes');
    confirmNo = document.getElementById('confirmNo');
    confirmTitle = document.getElementById('confirmTitle');
    confirmMessage = document.getElementById('confirmMessage');
    
    helpDialog = document.getElementById('helpDialog');
    helpTitle = document.getElementById('helpTitle');
    helpContent = document.getElementById('helpContent');
    
    gameTitle = document.getElementById('game-title');
    footer = document.querySelector('.footer');
    honeycomb = document.querySelector('.honeycomb');
    honeycombContainer = document.querySelector('.honeycomb-container');
}

// Setup all event listeners
function setupEventListeners() {
    // Color selection buttons
    if (greenBtn) greenBtn.addEventListener('click', () => setCurrentColor('green'));
    if (redBtn) redBtn.addEventListener('click', () => setCurrentColor('red'));
    if (creamBtn) creamBtn.addEventListener('click', () => setCurrentColor('cream'));

    // Action buttons
    if (resetBtn) resetBtn.addEventListener('click', () => showConfirmDialog('reset'));
    if (randomBtn) randomBtn.addEventListener('click', highlightRandomLetter);
    if (shuffleBtn) shuffleBtn.addEventListener('click', () => showConfirmDialog('shuffle'));

    // Control buttons
    if (langToggle) langToggle.addEventListener('click', toggleLanguage);
    if (themeToggle) themeToggle.addEventListener('click', toggleDarkMode);
    if (zoomInBtn) zoomInBtn.addEventListener('click', zoomIn);
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', zoomOut);
    if (helpBtn) helpBtn.addEventListener('click', showHelpDialog);
    if (closeHelpBtn) closeHelpBtn.addEventListener('click', hideHelpDialog);

    // Dialog buttons
    if (confirmYes) confirmYes.addEventListener('click', handleConfirmAction);
    if (confirmNo) confirmNo.addEventListener('click', hideConfirmDialog);

    // Cell click events
    hexCells.forEach(cell => {
        cell.addEventListener('click', () => handleCellClick(cell));
    });

    // Window resize event
    window.addEventListener('resize', handleResponsiveDesign);
}

// Initialize UI with saved settings
function initializeUI() {
    setLanguage(currentLanguage);
    setDarkMode(darkMode);
    updateCounters();
    handleResponsiveDesign();
}

// Set current color and update UI
function setCurrentColor(color) {
    currentColor = color;
    updateColorButtonSelection(color);
    updateStatusText(`color-${color}`);
}

// Update color button visual selection
function updateColorButtonSelection(color) {
    const buttons = [greenBtn, redBtn, creamBtn];
    
    buttons.forEach(btn => {
        if (btn) {
            btn.style.boxShadow = 'var(--shadow-sm)';
            btn.style.transform = 'translateY(0px)';
        }
    });
    
    let selectedButton;
    let shadowColor;
    
    if (color === 'green') {
        selectedButton = greenBtn;
        shadowColor = 'var(--primary-dark)';
    } else if (color === 'red') {
        selectedButton = redBtn;
        shadowColor = 'var(--secondary-dark)';
    } else if (color === 'cream') {
        selectedButton = creamBtn;
        shadowColor = '#e0e0e0';
    }
    
    if (selectedButton) {
        selectedButton.style.transform = 'translateY(-3px)';
        selectedButton.style.boxShadow = `0 0 0 3px ${shadowColor}`;
    }
}

// Handle cell click interaction
function handleCellClick(cell) {
    if (!currentColor) {
        updateStatusText('select-color-first');
        return;
    }

    if (!canCellBeModified(cell)) {
        updateStatusText('cell-fixed');
        return;
    }

    applyCellColor(cell);
}

// Check if cell can be modified
function canCellBeModified(cell) {
    return !(
        (cell.classList.contains('pink') || cell.classList.contains('green')) && 
        !cell.classList.contains('selected-green') && 
        !cell.classList.contains('selected-red')
    );
}

// Apply color to cell with animation
function applyCellColor(cell) {
    const oldGreen = cell.classList.contains('selected-green') ? 1 : 0;
    const oldRed = cell.classList.contains('selected-red') ? 1 : 0;
    const newGreen = currentColor === 'green' ? 1 : 0;
    const newRed = currentColor === 'red' ? 1 : 0;

    cell.classList.add('color-changing');

    setTimeout(() => {
        cell.classList.remove('selected-green', 'selected-red');
        
        if (currentColor === 'green' && !cell.classList.contains('green')) {
            cell.classList.add('selected-green');
        } else if (currentColor === 'red' && !cell.classList.contains('pink')) {
            cell.classList.add('selected-red');
        }
        
        cell.classList.remove('color-changing');
        
        greenCellsCount = greenCellsCount - oldGreen + newGreen;
        redCellsCount = redCellsCount - oldRed + newRed;
        
        updateCounters();
        saveProgress();
    }, 150);
}

// Update status text with current language
function updateStatusText(status) {
    if (!statusText) return;
    
    const message = STATUS_MESSAGES[status]?.[currentLanguage];
    if (message) {
        statusText.textContent = message;
        statusText.classList.add('status-text-update');
        
        setTimeout(() => {
            statusText.classList.remove('status-text-update');
        }, 500);
    }
}

// Update cell counters display
function updateCounters() {
    if (greenCount) {
        greenCount.textContent = greenCellsCount;
    }
    if (redCount) {
        redCount.textContent = redCellsCount;
    }
}

// Highlight random letter with animation
function highlightRandomLetter() {
    clearHighlight();
    
    if (letterCells.length > 0) {
        const randomIndex = Math.floor(Math.random() * letterCells.length);
        highlightedCell = letterCells[randomIndex];
        
        highlightedCell.classList.add('highlight', 'purple');
        updateStatusText('random-letter');
        
        highlightTimeout = setTimeout(() => {
            clearHighlight();
            updateStatusText('default');
        }, 3000);
    }
}

// Clear highlight effect
function clearHighlight() {
    if (highlightTimeout) {
        clearTimeout(highlightTimeout);
        highlightTimeout = null;
    }
    
    if (highlightedCell) {
        highlightedCell.classList.remove('highlight', 'purple');
        highlightedCell = null;
    }
}

// Reset all cells to original state
function resetAllCells() {
    hexCells.forEach(cell => {
        cell.classList.remove('selected-green', 'selected-red', 'highlight', 'purple', 'color-changing');
    });

    greenCellsCount = 0;
    redCellsCount = 0;
    updateCounters();
    clearHighlight();
    saveProgress();
}

// Shuffle letters on the board
function shuffleLetters() {
    if (letterCells.length === 0) {
        console.error("No letter cells found!");
        letterCells = document.querySelectorAll('.hex.letter');
    }
    
    // Get current letters from the board
    const currentLetters = [];
    letterCells.forEach((cell) => {
        currentLetters.push(cell.textContent);
    });
    
    // Simple shuffle - Fisher-Yates algorithm
    const shuffledLetters = [...currentLetters];
    for (let i = shuffledLetters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        // Swap
        const temp = shuffledLetters[i];
        shuffledLetters[i] = shuffledLetters[j];
        shuffledLetters[j] = temp;
    }

    // Apply new letters with animation
    letterCells.forEach((cell, index) => {
        if (index < shuffledLetters.length) {
            cell.classList.add('shuffling');
            
            setTimeout(() => {
                cell.textContent = shuffledLetters[index];
                setTimeout(() => {
                    cell.classList.remove('shuffling');
                }, 500);
            }, 100 + (index * 30)); // Stagger animation
        }
    });
    
    console.log("Letters shuffled successfully");
}

// Utility function to shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        // Swap elements
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

// Toggle between languages
function toggleLanguage() {
    currentLanguage = currentLanguage === 'ar' ? 'en' : 'ar';
    localStorage.setItem('language', currentLanguage);
    setLanguage(currentLanguage);
}

// Set language and update UI
function setLanguage(lang) {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    
    updateUILanguage();
    updateLetters();
}

// Update all UI text based on current language
function updateUILanguage() {
    const isArabic = currentLanguage === 'ar';
    
    // Update language toggle button
    if (langToggle) {
        langToggle.innerHTML = `<i class="fas fa-language"></i> <span class="btn-text">${isArabic ? 'English' : 'العربية'}</span>`;
    }
    
    // Update theme toggle button
    updateThemeToggleText();
    
    // Update game title
    if (gameTitle) {
        gameTitle.innerHTML = isArabic ? 
            '<i class="fas fa-chess-board"></i> <span>لعبة</span> خلية الحروف' : 
            '<i class="fas fa-chess-board"></i> <span>Letter</span> Honeycomb';
    }
    
    // Update button texts
    const buttonTexts = {
        greenBtn: isArabic ? '<i class="fas fa-paint-brush"></i> الأخضر' : '<i class="fas fa-paint-brush"></i> Green',
        redBtn: isArabic ? '<i class="fas fa-paint-brush"></i> الأحمر' : '<i class="fas fa-paint-brush"></i> Red',
        creamBtn: isArabic ? '<i class="fas fa-paint-brush"></i> الأصلي' : '<i class="fas fa-paint-brush"></i> Original',
        resetBtn: isArabic ? '<i class="fas fa-eraser"></i> مسح الكل' : '<i class="fas fa-eraser"></i> Reset All',
        randomBtn: isArabic ? '<i class="fas fa-random"></i> حرف عشوائي' : '<i class="fas fa-random"></i> Random Letter',
        shuffleBtn: isArabic ? '<i class="fas fa-sync-alt"></i> تبديل الحروف' : '<i class="fas fa-sync-alt"></i> Shuffle Letters',
        closeHelpBtn: isArabic ? 'إغلاق' : 'Close',
        confirmYes: isArabic ? 'موافق' : 'Yes',
        confirmNo: isArabic ? 'إلغاء' : 'Cancel'
    };
    
    Object.entries(buttonTexts).forEach(([id, text]) => {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = text;
        }
    });
    
    // Update counters
    updateCounterLabels();
    
    // Update footer
    if (footer) {
        footer.innerHTML = isArabic ? 
            '© جميع الحقوق محفوظة - لعبة خلية الحروف بواسطة عبداللطيف الخنبشي 2025' : 
            '© All Rights Reserved - Letter Honeycomb Game by Abdullatif Alkhanbashi 2025';
    }
    
    // Update help content
    updateHelpContent();
    
    // Update status text
    updateStatusText('default');
}

// Update counter labels with current language
function updateCounterLabels() {
    const isArabic = currentLanguage === 'ar';
    const greenLabel = document.querySelector('.stat-box:first-child span');
    const redLabel = document.querySelector('.stat-box:last-child span');
    
    if (greenLabel) {
        const text = isArabic ? 'الخلايا الخضراء: ' : 'Green Cells: ';
        greenLabel.innerHTML = text + '<span id="greenCount">' + greenCellsCount + '</span>';
        // Re-assign greenCount reference after innerHTML update
        greenCount = document.getElementById('greenCount');
    }
    
    if (redLabel) {
        const text = isArabic ? 'الخلايا الحمراء: ' : 'Red Cells: ';
        redLabel.innerHTML = text + '<span id="redCount">' + redCellsCount + '</span>';
        // Re-assign redCount reference after innerHTML update
        redCount = document.getElementById('redCount');
    }
}

// Update letters on the board
function updateLetters() {
    const letters = LETTERS[currentLanguage];
    letterCells.forEach((cell, index) => {
        if (index < letters.length) {
            cell.textContent = letters[index];
        }
    });
}

// Update help dialog content
function updateHelpContent() {
    if (!helpContent) return;
    
    const isArabic = currentLanguage === 'ar';
    
    // Set text direction for Arabic content
    if (isArabic) {
        helpContent.style.direction = 'rtl';
        helpContent.style.textAlign = 'right';
    } else {
        helpContent.style.direction = 'ltr';
        helpContent.style.textAlign = 'left';
    }
    
    if (isArabic) {
        helpContent.innerHTML = `
            <h4>تعليمات اللعبة</h4>
            <p><strong>كيفية اللعب:</strong></p>
            <p><strong>الحرف الأول:</strong> يقوم مدير المسابقة باختيار حرف أول عشوائي، ثم يطرح سؤالًا يجب أن تبدأ إجابته بذلك الحرف.</p>
            
            <p><strong>هدف كل فريق:</strong></p>
            <ul style="text-align: right; direction: rtl;">
                <li>🟥 الفريق الأحمر يسعى لتكوين خط عمودي باللون الأحمر يفوز بالجولة عند اكمال الخط.</li>
                <li>🟩 الفريق الأخضر يسعى لتكوين خط أفقي باللون الأخضر يفوز بالجولة عند اكمال الخط.</li>
            </ul>
            
            <p><strong>تحديد الفائز بالسؤال:</strong></p>
            <ul style="text-align: right; direction: rtl;">
                <li>الفريق الذي يضغط الجرس أولًًا ⏳ لديه 3 ثوانٍ للإجابة.</li>
                <li>✅ إجابة صحيحة → تتلون الخلية بلون الفريق.</li>
                <li>❌ إجابة خاطئة → ينتقل السؤال للفريق الآخر لمدة 10 ثوانٍ ⏳، ثم يصبح متاحًا للجميع، وعلى من يريد الإجابة الضغط على الجرس أولًا.</li>
                <li>الفريق الفائز بالحرف يختار الحرف التالي.</li>
            </ul>
            
            <p><strong>تحديد الفائز بالمسابقة:</strong></p>
            <ul style="text-align: right; direction: rtl;">
                <li>يتم لعب 3 جولات، والفريق الذي يفوز بجولتين هو الفائز بالمسابقة! 🏆</li>
            </ul>
            
            <h4>ميزات إضافية</h4>
            <ul style="text-align: right; direction: rtl;">
                <li><strong>مسح الكل:</strong> يعيد تعيين جميع الخلايا إلى حالتها الأصلية.</li>
                <li><strong>حرف عشوائي:</strong> يبرز حرفًا عشوائيًا في اللوحة لمدة 3 ثوانٍ.</li>
                <li><strong>تبديل الحروف:</strong> يخلط مواضع الحروف في اللوحة.</li>
                <li><strong>الوضع الليلي:</strong> يبدل بين الواجهة الفاتحة والداكنة لراحة العينين.</li>
                <li><strong>تغيير اللغة:</strong> يبدل بين الحروف العربية والإنجليزية.</li>
                <li><strong>تكبير/تصغير:</strong> يتحكم في حجم خلية الحروف.</li>
            </ul>
            
            <h4>حول اللعبة</h4>
            <p>تم تصميم لعبة خلية الحروف لتكون تجربة تفاعلية ممتعة للصغار والكبار. تساعد اللعبة على تعزيز الثقافة العامة وروح الفريق بطريقة تنافسية ممتعة.</p>
        `;
    } else {
        helpContent.innerHTML = `
            <h4>Game Instructions</h4>
            <p><strong>How to Play:</strong></p>
            <p><strong>First Letter:</strong> The competition manager randomly selects a starting letter, then asks a question that must be answered starting with that letter.</p>
            
            <p><strong>Objective of Each Team:</strong></p>
            <ul>
                <li>🟥 The Red team aims to form a vertical line in red color and wins the round upon completing the line.</li>
                <li>🟩 The Green team aims to form a horizontal line in green color and wins the round upon completing the line.</li>
            </ul>
            
            <p><strong>Determining the Question Winner:</strong></p>
            <ul>
                <li>The team that rings the bell first ⏳ has 3 seconds to answer.</li>
                <li>✅ Correct Answer → The cell is colored with the team's color.</li>
                <li>❌ Wrong Answer → The question is passed to the other team for 10 seconds ⏳, then becomes available to everyone. Whoever wants to answer must ring the bell first.</li>
                <li>The team that wins the letter chooses the next letter.</li>
            </ul>
            
            <p><strong>Determining the Competition Winner:</strong></p>
            <ul>
                <li>3 rounds are played, and the team that wins two rounds is the winner of the competition! 🏆</li>
            </ul>
            
            <h4>Additional Features</h4>
            <ul>
                <li><strong>Reset All:</strong> Resets all cells to their original state.</li>
                <li><strong>Random Letter:</strong> Highlights a random letter on the board for 3 seconds.</li>
                <li><strong>Shuffle Letters:</strong> Mixes the positions of the letters on the board.</li>
                <li><strong>Dark Mode:</strong> Toggles between light and dark interface for eye comfort.</li>
                <li><strong>Change Language:</strong> Switches between Arabic and English letters.</li>
                <li><strong>Zoom In/Out:</strong> Controls the size of the letter cells.</li>
            </ul>
            
            <h4>About the Game</h4>
            <p>Letter Honeycomb Game is designed to be an interactive and fun experience for young and old. The game helps enhance general knowledge and team spirit in an enjoyable competitive way.</p>
        `;
    }
}

// Toggle dark mode
function toggleDarkMode() {
    darkMode = !darkMode;
    setDarkMode(darkMode);
    localStorage.setItem('darkMode', darkMode ? 'enabled' : null);
}

// Set dark mode state
function setDarkMode(enabled) {
    if (enabled) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    updateThemeToggleText();
}

// Update theme toggle button text
function updateThemeToggleText() {
    if (!themeToggle) return;
    
    const isArabic = currentLanguage === 'ar';
    const isDark = darkMode;
    
    let text;
    if (isDark) {
        text = isArabic ? 'الوضع العادي' : 'Light Mode';
    } else {
        text = isArabic ? 'الوضع الليلي' : 'Dark Mode';
    }
    
    themeToggle.innerHTML = `<i class="fas fa-${isDark ? 'sun' : 'moon'}"></i> <span class="btn-text">${text}</span>`;
}

// Zoom in functionality
function zoomIn() {
    if (currentZoom < 1.5) {
        currentZoom += 0.1;
        applyZoom();
    }
}

// Zoom out functionality
function zoomOut() {
    if (currentZoom > 0.5) {
        currentZoom -= 0.1;
        applyZoom();
    }
}

// Apply zoom transformation
function applyZoom() {
    if (honeycomb) {
        honeycomb.style.transform = `scale(${currentZoom})`;
        
        if (honeycombContainer) {
            const baseHeight = 540;
            honeycombContainer.style.height = `${baseHeight * currentZoom}px`;
        }
        
        saveProgress();
    }
}

// Handle responsive design for different screen sizes
function handleResponsiveDesign() {
    const windowWidth = window.innerWidth;
    let scale = 1;
    let height = 540;
    
    if (windowWidth <= 400) {
        scale = 0.45;
        height = 340;
    } else if (windowWidth <= 500) {
        scale = 0.55;
        height = 380;
    } else if (windowWidth <= 700) {
        scale = 0.7;
        height = 420;
    }
    
    if (honeycomb && honeycombContainer) {
        honeycomb.style.transform = `scale(${scale * currentZoom})`;
        honeycombContainer.style.height = `${height * currentZoom}px`;
    }
}

// Show confirmation dialog
function showConfirmDialog(action) {
    currentAction = action;
    
    if (!confirmDialog || !confirmTitle || !confirmMessage) return;
    
    const isArabic = currentLanguage === 'ar';
    
    if (action === 'reset') {
        confirmTitle.textContent = isArabic ? 'تأكيد عملية المسح' : 'Confirm Reset';
        confirmMessage.textContent = isArabic ? 
            'سيتم مسح جميع التقدم الحالي. هل أنت متأكد؟' : 
            'All current progress will be erased. Are you sure?';
    } else if (action === 'shuffle') {
        confirmTitle.textContent = isArabic ? 'تأكيد العملية' : 'Confirm Action';
        confirmMessage.textContent = isArabic ? 
            'سيتم حذف جميع التقدم الحالي وتبديل الحروف. هل أنت متأكد؟' : 
            'All current progress will be erased and letters will be shuffled. Are you sure?';
    }
    
    confirmDialog.style.display = 'flex';
}

// Hide confirmation dialog
function hideConfirmDialog() {
    if (confirmDialog) {
        confirmDialog.style.display = 'none';
    }
}

// Handle confirmation action
function handleConfirmAction() {
    console.log("Confirm action:", currentAction);
    hideConfirmDialog();
    
    if (currentAction === 'reset') {
        resetAllCells();
        updateStatusText('reset-success');
    } else if (currentAction === 'shuffle') {
        shuffleLetters();
        // Reset colors after animation completes
        setTimeout(() => {
            resetAllCells();
            updateStatusText('shuffle-success');
        }, 1500); // Wait for shuffle animation to complete
    }
}

// Show help dialog
function showHelpDialog() {
    if (helpDialog) {
        helpDialog.style.display = 'flex';
    }
}

// Hide help dialog
function hideHelpDialog() {
    if (helpDialog) {
        helpDialog.style.display = 'none';
    }
}

// Save game progress to localStorage
function saveProgress() {
    const gameState = {
        greenCells: [],
        redCells: [],
        currentZoom: currentZoom,
        language: currentLanguage,
        darkMode: darkMode
    };
    
    hexCells.forEach((cell, index) => {
        if (cell.classList.contains('selected-green')) {
            gameState.greenCells.push(index);
        } else if (cell.classList.contains('selected-red')) {
            gameState.redCells.push(index);
        }
    });
    
    try {
        localStorage.setItem('honeycombGameState', JSON.stringify(gameState));
    } catch (error) {
        console.error('Error saving game state:', error);
    }
}

// Load saved progress from localStorage
function loadSavedProgress() {
    try {
        const savedState = localStorage.getItem('honeycombGameState');
        if (!savedState) return;
        
        const gameState = JSON.parse(savedState);
        
        // Restore cell colors
        if (gameState.greenCells && Array.isArray(gameState.greenCells)) {
            gameState.greenCells.forEach(index => {
                if (index < hexCells.length) {
                    hexCells[index].classList.add('selected-green');
                    greenCellsCount++;
                }
            });
        }
        
        if (gameState.redCells && Array.isArray(gameState.redCells)) {
            gameState.redCells.forEach(index => {
                if (index < hexCells.length) {
                    hexCells[index].classList.add('selected-red');
                    redCellsCount++;
                }
            });
        }
        
        // Restore zoom level
        if (gameState.currentZoom) {
            currentZoom = gameState.currentZoom;
            applyZoom();
        }
        
        // Restore language
        if (gameState.language) {
            currentLanguage = gameState.language;
            setLanguage(gameState.language);
        }
        
        // Restore dark mode
        if (gameState.darkMode !== undefined) {
            darkMode = gameState.darkMode;
            setDarkMode(gameState.darkMode);
        }
        
        updateCounters();
        
    } catch (error) {
        console.error('Error loading saved game state:', error);
    }
}
