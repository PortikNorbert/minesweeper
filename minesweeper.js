/**
 * The minesweeper singleton contains all the functionalities of the game.
 * Several variables hold important parameters during the game:
 * - {function} timer - The time counting mechanics are kept in this variable, it is a setTimeout function
 * - {number} nrOfRows - How many rows the minefield will have.
 * - {number} nrOfMines - How many mines the minefield will have.
 * - {number} nrOfFields - How many clickable fields the minefield will have.
 * - {number} nrOfColumns - How many columns the minefield will have.
 * - {number} fieldMap - An array of arrays holding the status of each field.
 * - {number} game - Some flags regarding the game progress.
 * - {number} fieldSize - The width and height of a field used to give a dynamic size to the minesweeper.
 */
var mineSweeper = (function() {
	var timer,
		nrOfRows,
		fieldSize,
		nrOfMines,
		nrOfFields,
		nrOfColumns,
		fieldMap = [],
		game = {
			flagged: 0,
			reveals: 0,
			started: false
		};

	/**
	 * Shows a message in the board above the game, it shows mainly the game over and victory messages.
	 * @param {string} msg - The message to be displayed.
	 */
	function setMessage(msg) {
		document.getElementById('minesweeper-board').innerText = msg;
	}

	/**
	 * Transforms a simple number to a pair of coordinates, which defines a field
	 * @param {number} idx - The index of a field, this represents the field's order on the minefield.
	 * @returns {array} An array of 2 numbers defining the position of a field.
	 */
	function getFieldCoords(idx) {
		return [Math.ceil(idx/nrOfColumns), idx % nrOfColumns || nrOfColumns];
	}

	/**
	 * Transforms the array defining the field's position to a number (the order number of the field).
	 * @param {array} coords - An array defining the position of field, also the map to the field's flags.
	 * @returns {number} Returns the order number of a field.
	 */
	function getFieldIndex(coords) {
		return (coords[0] - 1) * nrOfColumns + coords[1];
	}

	/**
	 * Gets the state of a field, the state contains 3 flags.
	 * @param {array} coords - An array of 2 numbers representing the map to the field's state.
	 * @returns {object} Returns an object with 3 fields (if the field was revealed, if it is a mine and if it has a flag put on it).
	 */
	function getState(coords) {
		return fieldMap[coords[0]][coords[1]];
	}

	/**
	 * Sets the field's appearance on the page by applying a certain class. Also inserts content.
	 * @param {array} coords - An array of 2 numbers representing the position of the field.
	 * @param {string} type - The type of the field, map to a css class name.
	 * @param {string} content - The character to be shown in field.
	 */
	function setFieldState(coords, type, content) {
		var fieldCls = {
				hiden: 'c-minesweeper__field',
				empty: 'c-minesweeper__field c-minesweeper__field--empty',
				danger: 'c-minesweeper__field c-minesweeper__field--danger',
				mine: 'c-minesweeper__field c-minesweeper__field--mine',
				flag: 'c-minesweeper__field c-minesweeper__field--flag',
				flagBad: 'c-minesweeper__field c-minesweeper__field--flagBad',
				flagGood: 'c-minesweeper__field c-minesweeper__field--flagGood'
			},
			index = getFieldIndex(coords),
			field = document.getElementById('minesweeper-field'.concat(index));

		field.innerText = content;
		field.setAttribute('class', fieldCls[type]);
	}

	/**
	 * Formats the output time for the timer. I the number is smaller than 10 it adds a leading 0.
	 * @param {number} t - The quantity of minutes or seconds
	 * @returns {string} Returns the formatted number.
	 */
	function formatTime(t) {
		return t < 10 ? '0'.concat(t) : t;
	}

	/**
	 * Getter for the elapsed time. Used when the game ends.
	 * @returns {string} Returns the time spent on solving the minefield.
	 */
	function getTime() {
		return document.getElementById('minesweeper-timer').innerText;
	}

	/**
	 * Runs the timer until the game is lost or won.
	 * @param {object} timerfield - The element from the DOM, where the timer is displayed.
	 * @param {number} minutes - The minutes already spent on the current session of the game.
	 * @param {number} seconds - The additional seconds already spent on the current session of the game.
	 */
	function runTime(timerField, minutes, seconds) {
		seconds++;
		if (seconds === 60) {
			seconds = 0;
			minutes++;
		}
		timerField.innerText = formatTime(minutes).concat(':', formatTime(seconds));
		timer = setTimeout(function() {
			if (game.started) {
				runTime(timerField, minutes, seconds);
			}
		}, 1000);
	}

	/**
	 * Initializes the timer once the game is started.
	 */
	function initTimer() {
		var minutes = 0, seconds = 0,
			timerField = document.getElementById('minesweeper-timer');

		runTime(timerField, minutes, seconds);
	}

	/**
	 * Generates a random number in a given interval.
	 * @param {number} min - The minimum value from the interval.
	 * @param {number} max - The maximum value from the interval.
	 * @returns {number} Returns a random number.
	 */
	function getRandomNumberBetween(min, max) {
		return Math.round(Math.random() * (max - min) + min);
	}

	/**
	 * Generates the ordered position of the mines.
	 * @returns {Set} Returns a set of numbers, each representing a single mine.
	 */
	function getMineIndexes() {
		var minNrOfFields = 1,
			mineIndexes = new Set();

		while (mineIndexes.size < nrOfMines) {
			mineIndexes.add(getRandomNumberBetween(minNrOfFields, nrOfFields));
		}
console.log(mineIndexes)
		return mineIndexes;
	}

	/**
	 * Creates a new DOM element which serves as a field. Adds the events for the field.
	 * @param {number} i - The ordered index of the field to be created.
	 * @returns {object} Returns a new field.
	 */
	function createField(i) {
		var field = document.createElement('div');

		field.setAttribute('index', i);
		field.setAttribute('class', 'c-minesweeper__field');
		field.setAttribute('id', 'minesweeper-field'.concat(i));
		field.setAttribute('style', 'width: '.concat(fieldSize, 'px; height: ', fieldSize, 'px;'));
		field.addEventListener('click', handleLeftClick);
		field.addEventListener('contextmenu', handleRightClick);

		return field;
	}

	/**
	 * It generates the minefield by creating a map with each field's flags and appends each field to the DOM.
	 * @param {object} mineField - A DOM node where the fields will be inserted into.
	 */
	function generateMineField(mineField) {
		var i = 1,
			column,
			row = 0,
			mineIndexes = getMineIndexes();

		for(i; i <= nrOfFields; i++) {
			column = (i % nrOfColumns) || nrOfColumns;
			if (i % nrOfColumns === 1) {
				row++;
				fieldMap[row] = [];
			}

			fieldMap[row][column] = {
				flagged: false,
				revealed: false,
				mine: mineIndexes.has(i)
			};

			mineField.appendChild(createField(i));
		}
	}

	/**
	 * Reads and sets the input parameters for generating the minefield.
	 * In case there are any not recommended settings, more appropriate values will be set.
	 */
	function setGameVariables() {
		nrOfRows = Number(document.getElementById('minesweeper-height').value);
		nrOfColumns = Number(document.getElementById('minesweeper-width').value);
		nrOfFields = nrOfRows * nrOfColumns;
		nrOfMines = Number(document.getElementById('minesweeper-mines').value);
		if (nrOfMines >= nrOfFields) {
			nrOfMines = nrOfFields - 1;
			document.getElementById('minesweeper-mines').value = nrOfMines;
		}
	}

	/**
	 * Resets and resizes the minefield container.
	 * @param {object} mineField - A DOM node where the fields will be inserted into.
	 */
	function setSize(mineField) {
		var baseLength, fieldHeight, fieldWidth, fieldRatio, mineFieldSize;

		baseLength = document.body.clientWidth > document.body.clientHeight ? document.body.clientHeight - 200 : document.body.clientWidth - 400;
		fieldRatio = nrOfColumns > nrOfRows ? nrOfColumns : nrOfRows;
		fieldSize = Math.floor(baseLength / fieldRatio);
		mineFieldSize = 'opacity: 1; max-width: '.concat(nrOfColumns * (fieldSize + 2), 'px; max-height: ', nrOfRows * (fieldSize + 2),'px;');

		mineField.innerText = '';
		mineField.setAttribute('style', mineFieldSize);
	}

	/**
	 * Resets the game state. Stops the timer.
	 */
	function resetGame() {
		game.started = true;
		game.flagged = 0;
		game.reveals = 0;
		clearTimeout(timer);
	}

	/**
	 * Initializes a new game, this is the only public method from this module.
	 */
	function newGame() {
		var mineField = document.getElementById('minesweeper-mineField');

		setMessage('');
		resetGame();
		setGameVariables();
		setSize(mineField);
		generateMineField(mineField);
		initTimer();
	}

	/**
	 * Checks if on the given coordinats exists a field.
	 * @param {array} coords - A pair of numbers that should map to a field in the DOM and the field map.
	 * @returns {boolean} It is true if the fields exists. False if not.
	 */
	function isExistingNeighbor(coords) {
		return 0 < coords[0] && coords[0] <= nrOfRows && 0 < coords[1] && coords[1] <= nrOfColumns;
	}

	/**
	 * Determines the theoretical position of the sourrounding fields.
	 * @param {array} - A pair of numbers showing the position of the selected field.
	 * @returns {array} - A list of arrays, each representing a coordinate to a neighbor.
	 */
	function getNeighborIndexes(coords) {
		var indexes = [],
			neighborPositions = [
				[coords[0]-1, coords[1]-1],
				[coords[0]-1, coords[1]],
				[coords[0]-1, coords[1]+1],
				[coords[0], coords[1]+1],
				[coords[0]+1, coords[1]+1],
				[coords[0]+1, coords[1]],
				[coords[0]+1, coords[1]-1],
				[coords[0], coords[1]-1]
			];

		neighborPositions.map(function(pos) {
			if (isExistingNeighbor(pos)) {
				indexes.push(pos);
			}
		});

		return indexes;
	}

	/**
	 * Check on how many mines are in the neighboring fields.
	 * @param {array} mainCoords - Represents a coordinate for the selected field.
	 * @returns {number} Returns the number of mines in the neighboring fields.
	 */
	function getNeighborsMines(mainCoords) {
		var mines = 0,
			neighborIndexes = getNeighborIndexes(mainCoords);

		neighborIndexes.map(function(coord) {
			mines += getState(coord).mine ? 1 : 0;
		});

		return mines;
	}

	/**
	 * Reveals a field with all it's states. It changes only the looks and it does not propagate to other fields.
	 * It reveals the following statuses: 
	 * - mines: mines not found yet
	 * - flagged mines: mines that have been flagged as suspect
	 * - mistaken mines: fields that have been tagged as suspect, but were not mines
	 * - dangerous fields: fields adjacent to mines
	 * - empty fields: fields that do not contain a mine and nor their neighbors have a mine
	 * @param {array} coords - A pair of numbers representing the coordinates of the field to be revealed.
	 */
	function resolveField(coords) {
		var neighborMines,
			state = getState(coords);

		if (!state.revealed) {
			state.revealed = true;
			if (state.mine) {
				if (state.flagged) {
					setFieldState(coords, 'flagGood', ':)');
				} else {
					setFieldState(coords, 'mine', 'x');
				}
			} else {
				neighborMines = getNeighborsMines(coords);
				if (state.flagged) {
					setFieldState(coords, 'flagBad', ':(');
				} else if (neighborMines) {
					setFieldState(coords, 'danger', neighborMines);
				} else {
					setFieldState(coords, 'empty', '');
				}
			}
		}
	}

	/**
	 * Reveals all fields to the player in case the game is over.
	 */
	function revealAll() {
		for (var i = 1; i<= nrOfFields; i++) {
			resolveField(getFieldCoords(i));
		}
	}

	/**
	 * It is the event when the game ends. Interaction is stopped, all fields are evaluated and a message is shown.
	 */
	function gameOver() {
		revealAll();
		game.started = false;
		setMessage('GAME OVER');
	}

	/**
	 * Checks if victory conditions are met. If they are, victory is announced.
	 */
	function checkVictoryCondition() {
		var msg = "You've found all mines in ".concat(getTime(), ' seconds!');

		if (game.flagged + game.reveals === nrOfFields) {
			revealAll();
			setMessage(msg);
			game.started = false;
		}
	}

	/**
	 * Reveal any fields that are in the immediate neighborhood.
	 * @param {number} mainIndex - A number assigned to a field, based on this the coordinates can be get.
	 */
	function revealNeighbors(mainIndex) {
		var neighborIndexes = getNeighborIndexes(mainIndex);

		neighborIndexes.map(function(coords) {
			revealField(coords);
		});
	}

	/**
	 * Reveals a field and checks for end game conditions.
	 * @param {array} coords - The coordinates for a given field.
	 */
	function revealField(coords) {
		var neighborMines,
			state = getState(coords);

		if (!state.revealed && !state.flagged) {
			state.revealed = true;
			game.reveals++;

			if (state.mine) {
				setFieldState(coords, 'mine', 'x');
				gameOver();
			} else {
				neighborMines = getNeighborsMines(coords);
				if (neighborMines) {
					setFieldState(coords, 'danger', neighborMines);
				} else {
					setFieldState(coords, 'empty', '');
					revealNeighbors(coords);
				}
			}
			checkVictoryCondition();
		}
	}

	/**
	 * Sets or resets the flag on a field.
	 * @param {array} coords - The coordinates for a given field.
	 */
	function toggleFlag(coords) {
		var state = getState(coords);

		if (!state.revealed) {
			if (state.flagged) {
				game.flagged--;
				state.flagged = false;
				setFieldState(coords, 'hiden', '');
			} else {
				game.flagged++;
				state.flagged = true;
				setFieldState(coords, 'flag', 'O');
				checkVictoryCondition();
			}
		}
	}

	/**
	 * Handler for clicking on a field with the left mouse button.
	 */
	function handleLeftClick() {
		revealField(getFieldCoords(this.getAttribute('index')));
	}

	/**
	 * Handler for clicking on a field with the right mouse button.
	 * @param {object} event - The click event object.
	 */
	function handleRightClick(event) {
		if (game.started) {
			toggleFlag(getFieldCoords(this.getAttribute('index')));
		}

		event.preventDefault();
	}

	return {
		newGame: newGame
	}
})();