// WORDS is loaded from words.js

const NUMBER_OF_GUESSES = 6;
const WORD_LENGTH = 5;
let guessesRemaining = NUMBER_OF_GUESSES;
let rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)];
console.log(rightGuessString);

function initBoard() {
    let board = document.getElementById("board");

    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let row = document.createElement("div");
        row.className = "row";

        for (let j = 0; j < WORD_LENGTH; j++) {
            let box = document.createElement("input");
            box.className = "tile";
            box.type = "text";
            box.maxLength = 1;
            box.dataset.row = i;
            box.dataset.col = j;

            // Disable all rows except the first one initially
            if (i !== 0) {
                box.disabled = true;
            }

            box.addEventListener('input', handleInput);
            box.addEventListener('keydown', handleKeydown);
            box.addEventListener('click', handleClick);
            box.addEventListener('focus', handleFocus);

            row.appendChild(box);
        }

        board.appendChild(row);
    }

    // Focus the first box
    setTimeout(() => {
        let firstBox = document.querySelector('.row:first-child .tile:first-child');
        if (firstBox) firstBox.focus();
    }, 100);
}

function handleFocus(e) {
    // Ensure we are in the correct row
    let currentRowIndex = 6 - guessesRemaining;
    let targetRowIndex = parseInt(e.target.dataset.row);

    if (targetRowIndex !== currentRowIndex) {
        // If user tries to focus a wrong row, refocus the first empty in current row or last filled
        // This might be annoying, so maybe just let them focus but they can't type?
        // For now, we rely on 'disabled' attribute to prevent focus on other rows.
    } else {
        // Select text on focus to make overwriting easier if clicked
        e.target.select();
    }
}

function handleClick(e) {
    // Just allow default focus behavior
}

function handleInput(e) {
    let box = e.target;
    let val = box.value;

    // Ensure uppercase
    if (val.match(/[a-zäöüß]/i)) {
        box.value = val.toUpperCase();

        // Move to next box if available
        let nextBox = box.nextElementSibling;
        if (nextBox) {
            nextBox.focus();
        }
    } else {
        // Clear invalid input
        box.value = '';
    }
}

function handleKeydown(e) {
    let box = e.target;
    let key = e.key;

    if (key === 'Backspace') {
        if (box.value === '') {
            // Move to previous box
            let prevBox = box.previousElementSibling;
            if (prevBox) {
                prevBox.focus();
            }
        } else {
            box.value = '';
        }
    } else if (key === 'ArrowLeft') {
        let prevBox = box.previousElementSibling;
        if (prevBox) prevBox.focus();
    } else if (key === 'ArrowRight') {
        let nextBox = box.nextElementSibling;
        if (nextBox) nextBox.focus();
    } else if (key === 'Enter') {
        checkGuess();
    } else if (key.length === 1 && key.match(/[a-zäöüß]/i)) {
        // Allow overwriting
        e.preventDefault();
        box.value = key.toUpperCase();
        let nextBox = box.nextElementSibling;
        if (nextBox) {
            nextBox.focus();
        }
    }
}

function shadeKeyBoard(letter, color) {
    for (const elem of document.getElementsByClassName("key")) {
        if (elem.textContent === letter) {
            let oldColor = elem.getAttribute("data-state");
            if (oldColor === 'correct') {
                return;
            }

            if (oldColor === 'present' && color !== 'correct') {
                return;
            }

            elem.setAttribute("data-state", color);
            break;
        }
    }
}

function checkGuess() {
    let row = document.getElementsByClassName("row")[6 - guessesRemaining];
    let guessString = '';
    let inputs = row.querySelectorAll('.tile');

    inputs.forEach(input => {
        guessString += input.value;
    });

    if (guessString.length != WORD_LENGTH) {
        showMessage("Nicht genug Buchstaben");
        return;
    }

    if (!WORDS.includes(guessString)) {
        showMessage("Wort nicht in der Liste");
        row.classList.add('shake');
        setTimeout(() => {
            row.classList.remove('shake');
        }, 500);
        return;
    }

    let rightGuess = Array.from(rightGuessString);
    let guess = Array.from(guessString);
    let currentGuess = guess; // For consistency with old logic naming

    // First pass: check for correct letters
    for (let i = 0; i < WORD_LENGTH; i++) {
        let letterColor = '';
        let box = inputs[i];
        let letter = currentGuess[i];

        let letterPosition = rightGuess.indexOf(currentGuess[i]);
        // is letter in the correct guess
        if (letterPosition === -1) {
            letterColor = 'absent';
        } else {
            if (currentGuess[i] === rightGuess[i]) {
                letterColor = 'correct';
                rightGuess[i] = '#';
                guess[i] = '#';
            } else {
                continue;
            }
        }
    }

    // Second pass: check for present letters (yellow)
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guess[i] === '#') continue;

        let letterColor = 'absent';
        let box = inputs[i];
        let letter = currentGuess[i];

        let letterPosition = rightGuess.indexOf(currentGuess[i]);

        if (letterPosition !== -1) {
            letterColor = 'present';
            rightGuess[letterPosition] = '#';
        } else {
            letterColor = 'absent';
        }

        setTimeout(() => {
            box.classList.add('flip');
            box.setAttribute("data-state", letterColor);
            shadeKeyBoard(letter, letterColor);
            // Keep value but disable interaction
            box.disabled = true;
        }, i * 250);
    }

    // Apply delay for correct letters from first pass
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (currentGuess[i] === rightGuessString[i]) {
            let box = inputs[i];
            setTimeout(() => {
                box.classList.add('flip');
                box.setAttribute("data-state", 'correct');
                shadeKeyBoard(currentGuess[i], 'correct');
                box.disabled = true;
            }, i * 250);
        }
    }

    guessesRemaining -= 1;

    if (guessString === rightGuessString) {
        setTimeout(() => {
            showMessage("Gewonnen!");
        }, 1500);
        guessesRemaining = 0;
        return;
    } else {
        if (guessesRemaining === 0) {
            setTimeout(() => {
                showMessage("Verloren! Das Wort war: " + rightGuessString);
            }, 1500);
        } else {
            // Enable next row
            let nextRow = document.getElementsByClassName("row")[6 - guessesRemaining];
            let nextInputs = nextRow.querySelectorAll('.tile');
            nextInputs.forEach(input => input.disabled = false);
            // Focus first input of next row
            setTimeout(() => {
                nextInputs[0].focus();
            }, 1500); // Wait for animation
        }
    }
}

// Virtual Keyboard handling
function insertLetter(pressedKey) {
    let row = document.getElementsByClassName("row")[6 - guessesRemaining];
    let inputs = Array.from(row.querySelectorAll('.tile'));

    // Find first empty input or the currently focused one if it's in this row
    let activeElement = document.activeElement;
    let targetInput = null;

    if (activeElement && activeElement.classList.contains('tile') && activeElement.parentElement === row) {
        targetInput = activeElement;
        // If it has a value, we might want to move to next? 
        // Or just overwrite? Let's overwrite and move next.
    } else {
        // Find first empty
        targetInput = inputs.find(input => input.value === '');
    }

    if (targetInput) {
        targetInput.value = pressedKey;
        targetInput.focus();
        // Trigger input event logic manually to move focus
        handleInput({ target: targetInput });
    }
}

function deleteLetter() {
    let row = document.getElementsByClassName("row")[6 - guessesRemaining];
    let inputs = Array.from(row.querySelectorAll('.tile'));

    let activeElement = document.activeElement;

    if (activeElement && activeElement.classList.contains('tile') && activeElement.parentElement === row) {
        if (activeElement.value !== '') {
            activeElement.value = '';
        } else {
            let prev = activeElement.previousElementSibling;
            if (prev) {
                prev.focus();
                prev.value = '';
            }
        }
    } else {
        // Find last filled
        let lastFilled = [...inputs].reverse().find(input => input.value !== '');
        if (lastFilled) {
            lastFilled.value = '';
            lastFilled.focus();
        } else {
            // If all empty, focus first
            inputs[0].focus();
        }
    }
}

function showMessage(message) {
    const messageContainer = document.getElementById('message-container');
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.className = 'message';
    messageContainer.prepend(messageElement);

    setTimeout(() => {
        messageElement.classList.add('fade-out');
        messageElement.addEventListener('transitionend', () => {
            messageElement.remove();
        });
    }, 2000);
}

// Global key listener for non-input keys (like from virtual keyboard or if focus is lost)
// But since we have inputs, we mostly rely on input focus. 
// However, we still need to catch keys if user clicks outside.
document.addEventListener("keyup", (e) => {
    if (guessesRemaining === 0) return;

    // If focus is already in an input, let the input handler handle it (except Enter maybe?)
    // Actually input 'keydown' handles most. 
    // But if focus is NOT in an input (e.g. clicked background), we should still support typing.

    if (e.target.tagName === 'INPUT') return;

    let pressedKey = String(e.key);
    if (pressedKey === "Backspace") {
        deleteLetter();
        return;
    }

    if (pressedKey === "Enter") {
        checkGuess();
        return;
    }

    let found = pressedKey.match(/[a-zäöüß]/gi)
    if (!found || found.length > 1) {
        return;
    } else {
        insertLetter(pressedKey.toUpperCase());
    }
});

document.getElementById("keyboard-container").addEventListener("click", (e) => {
    const target = e.target;

    if (!target.classList.contains("key")) {
        return;
    }
    let key = target.textContent;

    if (key === "Del") {
        deleteLetter();
    } else if (key === "Enter") {
        checkGuess();
    } else {
        insertLetter(key);
    }
});

initBoard();
