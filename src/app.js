const keys = [
  "Q",
  "W",
  "E",
  "R",
  "T",
  "Y",
  "U",
  "I",
  "O",
  "P",
  "A",
  "S",
  "D",
  "F",
  "G",
  "H",
  "J",
  "K",
  "L",
  "Ñ",
  "ENTER",
  "Z",
  "X",
  "C",
  "V",
  "B",
  "N",
  "M",
  "«",
];

const guessRows = [
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
];

let guessWord = "";
let currentRow = 0;
let currentTile = 0;
let isGameOver = false;

const getGuessWord = async () => {
  await fetch(
    "https://random-word-api.herokuapp.com/word?number=1&lang=en&length=5"
  )
    .then((res) => res.json())
    .then((data) => {
      guessWord = data[0].toUpperCase();
    })
    .catch(console.log);
};

const handleClick = (key) => () => {
  if (!isGameOver) {
    if (key === "«") {
      deleteLetter();
      return;
    }
    if (key === "ENTER") {
      checkRow();
      return;
    }

    addLetter(key);
  }
};

const addLetter = (letter) => {
  if (currentTile < 5 && currentRow < 6) {
    const tile = document.getElementById(
      `guessRow-${currentRow}-tile-${currentTile}`
    );

    tile.textContent = letter;
    tile.setAttribute("data", letter);
    guessRows[currentRow][currentTile] = letter;

    currentTile++;
  }
};

const deleteLetter = () => {
  currentTile--;
  const tile = document.getElementById(
    `guessRow-${currentRow}-tile-${currentTile}`
  );
  tile.textContent = "";
  tile.removeAttribute("data");
  guessRows[currentRow][currentTile] = "";
};

const checkRow = () => {
  const guess = guessRows[currentRow].join("").toUpperCase();
  if (currentTile === 5) {
    fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${guess.toLowerCase()}`
    ).then((res) => {
      if (res.status === 200) {
        flipTile();
        if (guess === guessWord) {
          showMessage("Excelent!");
          isGameOver = true;
          return;
        } else {
          if (currentRow >= 5) {
            isGameOver = false;
            showMessage("Game Over");
            return;
          }
          if (currentRow < 5) {
            currentRow++;
            currentTile = 0;
          }
        }
      } else {
        showMessage("Word not in the list");
      }
    });
  }
};

const showMessage = (message) => {
  const messageDisplay = document.querySelector(".message-container");
  messageDisplay.innerHTML = `
  <p>${message}</p>`;

  setTimeout(() => {
    messageDisplay.innerHTML = "";
  }, 2000);
};

const addColorToKey = (keyLetter, color) => {
  const key = document.getElementById(keyLetter);
  key.classList.add(color);
};

const flipTile = () => {
  const rowTiles = document.querySelector(`#guessRow-${currentRow}`).childNodes;
  let checkWord = guessWord;
  const guess = [];

  rowTiles.forEach((tile) => {
    guess.push({ letter: tile.getAttribute("data"), color: "grey-overlay" });
  });

  guess.forEach((guess, guessIndex) => {
    if (guess.letter === guessWord[guessIndex]) {
      guess.color = "green-overlay";
      checkWord = checkWord.replace(guess.letter, "");
    }
  });

  guess.forEach((guess) => {
    if (checkWord.includes(guess.letter)) {
      guess.color = "yellow-overlay";
      checkWord = checkWord.replace(guess.letter, "");
    }
  });

  rowTiles.forEach((tile, indexTile) => {
    setTimeout(() => {
      tile.classList.add(guess[indexTile].color);
      tile.classList.add("flip");
      addColorToKey(guess[indexTile].letter, guess[indexTile].color);
    }, 500 * indexTile);
  });
};

const App = () => {
  getGuessWord();

  const tileDisplay = document.querySelector(".tile-container");
  const keyboard = document.querySelector(".key-container");

  guessRows.forEach((guessRow, rowIndex) => {
    const rowContainer = document.createElement("div");

    rowContainer.setAttribute("id", `guessRow-${rowIndex}`);

    guessRow.forEach((_, guessIndex) => {
      const tile = document.createElement("div");

      tile.setAttribute("id", `guessRow-${rowIndex}-tile-${guessIndex}`);
      tile.classList.add("tile");

      rowContainer.append(tile);
    });

    tileDisplay.append(rowContainer);
  });

  keys.forEach((key) => {
    const keyButton = document.createElement("button");

    keyButton.setAttribute("id", key);
    keyButton.addEventListener("click", handleClick(key));
    keyButton.textContent = key;

    keyboard.append(keyButton);
  });
};

document.addEventListener("DOMContentLoaded", () => App());
