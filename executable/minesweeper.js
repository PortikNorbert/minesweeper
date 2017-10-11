/**
 * How to play the game:
 * Launch the game from the executable folder by double clicking on the minesweeper.html.
 * Once the game is loaded you can complete the form. You can set how many columns, rows and mines do you want to have.
 * Start a new game by hitting the 'Start new game button.'
 * Play the game by clicking on the fields one by one. Your goals is to reveal each field excluding the ones that contain a mine.
 * To learn, where the mines are, check the field you have been clicked. If the field does not contain a number, there are no mines in the immediate vicinity.
 * If you see a number in a field, that means that in the immediate vicinity there are that number of mines.
 * It is possible to tag a field with the right mouse button. Do this, if you suspect that there is a mine underneath. This way you can ensure that you don't click that field by accident.
 * To un-tag a field, right click on it again. 
 *
 * The game was tested on Windows only, on the following browsers:
 * - Google Chrome Version 61
 * - Mozilla Firefox Version 56
 * - Microsoft Edge Version 40
 * - Internet Explorer Version 11.68
 * 
 * These are the signs used for the different fields:
 * - dark brown field: unrevealed field, it may contain a mine
 * - light brown field: blank field, there are no mines around it
 * - light field with a number: it indicates, how many mines are in the neighboring fields
 * - a maroon field with a &#9888; sign: indicates a tagged field
 * - a black field with a &#9762; sign: a mine
 * - an orange field with a &#9872; sign: a field tagged by you, but not containing any mines
 * - a green field with a &#9873; sign: a field tagged by you containing a mine
 * - a green field with a &#9762; sign: an untapped mine
 */
var mineSweeper = (function() {
	/**
	 * The minesweeper variable contains all the functionalities of the game.
	 * There are several key variables accesible from outside of the methods:
	 * - {function} timer - The time counting mechanics are kept in this variable, it is a setTimeout function
	 * - {number} nrOfRows - How many rows the minefield will have.
	 * - {number} nrOfMines - How many mines the minefield will have.
	 * - {number} nrOfFields - How many clickable fields the minefield will have.
	 * - {number} nrOfColumns - How many columns the minefield will have.
	 * - {number} fieldMap - An array of arrays holding the status of each field.
	 * - {number} game - Some flags regarding the game progress.
	 * - {number} fieldSize - The width and height of a field used to give a dynamic size to the minesweeper.
	 */

		
	/**
	 * Shows a message in a modal window, game over and victory messages are shown by this method.
	 * @alias showMessage
	 * @param {string} msg - The message to be displayed.
	 * @param {boolean} victory - A variables indicating if the message is a victory message.
	 */
	function showMessage(msg, victory) {
		var modalClass = victory ? 'o-modal o-modal--open o-modal--victory' : 'o-modal o-modal--open';

		document.getElementById('minesweeper-modal-content').innerText = msg;
		document.getElementById('minesweeper-modal').setAttribute('class', modalClass);
	}

	/**
	 * Hides the messages modal and empties it's content.
	 * @alias hideMessage
	 */
	function hideMessage() {
		var animationDelay = 250;

		document.getElementById('minesweeper-modal').setAttribute('class', 'o-modal');
		setTimeout(function() {
			document.getElementById('minesweeper-modal-content').innerText = '';
		}, animationDelay);
	}

	/**
	 * Transforms a simple number to a pair of coordinates, which defines a field
	 * @alias getFieldCoords
	 * @param {number} idx - The index of a field, this represents the field's order on the minefield.
	 * @returns {array} An array of 2 numbers defining the position of a field.
	 */
	function getFieldCoords(idx) {
		return [Math.ceil(idx/this.nrOfColumns), idx % this.nrOfColumns || this.nrOfColumns];
	}

	/**
	 * Transforms the array defining the field's position to a number (the order number of the field).
	 * @alias getFieldIndex
	 * @param {array} coords - An array defining the position of field, also the map to the field's flags.
	 * @returns {number} Returns the order number of a field.
	 */
	function getFieldIndex(coords) {
		return (coords[0] - 1) * this.nrOfColumns + coords[1];
	}

	/**
	 * Gets the state of a field, the state contains 3 flags.
	 * @alias getState
	 * @param {array} coords - An array of 2 numbers representing the map to the field's state.
	 * @returns {object} Returns an object with 3 fields (if the field was revealed, if it is a mine and if it has a flag put on it).
	 */
	function getState(coords) {
		return this.fieldMap[coords[0]][coords[1]];
	}

	/**
	 * Sets the field's appearance on the page by applying a certain class. Also inserts content.
	 * @alias setFieldState
	 * @param {array} coords - An array of 2 numbers representing the position of the field.
	 * @param {string} type - The type of the field, map to a css class name.
	 * @param {string} content - The character to be shown in field.
	 */
	function setFieldState(coords, type, content) {
		var fieldCls = {
				hiden: 'c-minesweeper__field',
				blank: 'c-minesweeper__field c-minesweeper__field--blank',
				danger: 'c-minesweeper__field c-minesweeper__field--danger',
				mine: 'c-minesweeper__field c-minesweeper__field--mine',
				flag: 'c-minesweeper__field c-minesweeper__field--flag',
				flagBad: 'c-minesweeper__field c-minesweeper__field--flagBad',
				flagGood: 'c-minesweeper__field c-minesweeper__field--flagGood',
				mineGood: 'c-minesweeper__field c-minesweeper__field--mineGood'
			},
			index = getFieldIndex(coords),
			field = document.getElementById('minesweeper-field'.concat(index));

		field.innerHTML = content;
		field.setAttribute('class', fieldCls[type]);
	}

	/**
	 * Formats the output time for the timer. I the number is smaller than 10 it adds a leading 0.
	 * @alias formatTime
	 * @param {number} t - The quantity of minutes or seconds
	 * @returns {string} Returns the formatted number.
	 */
	function formatTime(t) {
		return t < 10 ? '0'.concat(t) : t;
	}

	/**
	 * Getter for the elapsed time. Used when the game ends.
	 * @alias getTime
	 * @returns {string} Returns the time spent on solving the minefield.
	 */
	function getTime() {
		return document.getElementById('minesweeper-timer').innerText;
	}

	/**
	 * Runs the timer until the game is lost or won.
	 * @alias runTime
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
		this.timer = setTimeout(function() {
			if (this.game.started) {
				runTime(timerField, minutes, seconds);
			}
		}, 1000);
	}

	/**
	 * Initializes the timer once the game is started.
	 * @alias initTimer
	 */
	function initTimer() {
		var minutes = 0, seconds = 0,
			timerField = document.getElementById('minesweeper-timer');

		runTime(timerField, minutes, seconds);
	}

	/**
	 * Generates a random number in a given interval.
	 * @alias getRandomNumberBetween
	 * @param {number} min - The minimum value from the interval.
	 * @param {number} max - The maximum value from the interval.
	 * @returns {number} Returns a random number.
	 */
	function getRandomNumberBetween(min, max) {
		return Math.round(Math.random() * (max - min) + min);
	}

	/**
	 * Generates the ordered position of the mines.
	 * @alias getMineIndexes
	 * @returns {Set} Returns a set of numbers, each representing a single mine.
	 */
	function getMineIndexes() {
		var minNrOfFields = 1,
			mineIndexes = new Set();

		while (mineIndexes.size < this.nrOfMines) {
			mineIndexes.add(getRandomNumberBetween(minNrOfFields, this.nrOfFields));
		}

		return mineIndexes;
	}

	/**
	 * Creates a new DOM element which serves as a field. Adds the events for the field.
	 * @alias createField
	 * @param {number} i - The ordered index of the field to be created.
	 * @returns {object} Returns a new field.
	 */
	function createField(i) {
		var field = document.createElement('div');

		field.setAttribute('index', i);
		field.setAttribute('class', 'c-minesweeper__field');
		field.setAttribute('id', 'minesweeper-field'.concat(i));
		field.setAttribute('style', 'width: '.concat(this.fieldSize, 'px; height: ', this.fieldSize, 'px;'));
		field.addEventListener('click', handleLeftClick);
		field.addEventListener('contextmenu', handleRightClick.bind(this));

		return field;
	}

	/**
	 * It generates the minefield by creating a map with each field's flags and appends each field to the DOM.
	 * @alias generateMineField
	 * @param {object} mineField - A DOM node where the fields will be inserted into.
	 */
	function generateMineField(mineField) {
		var i = 1,
			column,
			row = 0,
			mineIndexes = getMineIndexes();

		this.fieldMap = [];

		for(i; i <= this.nrOfFields; i++) {
			column = (i % this.nrOfColumns) || this.nrOfColumns;
			if (i % this.nrOfColumns === 1) {
				row++;
				this.fieldMap[row] = [];
			}

			this.fieldMap[row][column] = {
				flagged: false,
				revealed: false,
				mine: mineIndexes.has(i)
			};

			mineField.appendChild(createField(i));
		}
	}

	/**
	 * Gets the value of an input field.
	 * @alias getInputValue
	 * @param {string} id - The id attribute of the field.
	 * @param {boolean} returnNumber - If the return value should be number or not.
	 * @returns {string/number} The value of an input field.
	 */
	function getInputValue(id, returnNumber) {
		var value = document.getElementById(id).value;

		return returnNumber ? Number(value) : value;
	}

	/**
	 * Sets the value of an input field.
	 * @alias setInputValue
	 * @param {string} id - The id of the input field.
	 * @param {string/number} value - The value to be set.
	 */
	function setInputValue(id, value) {
		document.getElementById(id).value = value;
	}

	/**
	 * Reads and sets the input parameters for generating the minefield.
	 * In case there are any not recommended settings, more appropriate values will be set.
	 * @alias setGameVariables
	 */
	function setGameVariables() {
		this.nrOfRows = getInputValue('minesweeper-height', true);
		if (this.nrOfRows < 2) {
			this.nrOfRows = 2;
			setInputValue('minesweeper-height', this.nrOfRows);
		} else if (this.nrOfRows > 30) {
			this.nrOfRows = 30;
			setInputValue('minesweeper-height', this.nrOfRows);
		}

		this.nrOfColumns = getInputValue('minesweeper-width', true);
		if (this.nrOfColumns < 2) {
			this.nrOfColumns = 2;
			setInputValue('minesweeper-width', this.this.nrOfColumns);
		} else if (this.nrOfColumns > 30) {
			this.nrOfColumns = 30;
			setInputValue('minesweeper-width', this.nrOfColumns);
		}

		this.nrOfFields = this.nrOfRows * this.nrOfColumns;

		this.nrOfMines = getInputValue('minesweeper-mines', true);
		if (this.nrOfMines >= this.nrOfFields) {
			this.nrOfMines = this.nrOfFields - 1;
			setInputValue('minesweeper-mines', this.nrOfMines);
		} else if (this.nrOfMines < 1) {
			this.nrOfMines = 1;
			setInputValue('minesweeper-mines', this.nrOfMines);
		}
	}

	/**
	 * Resets and resizes the minefield container.
	 * @alias setSize
	 * @param {object} mineField - A DOM node where the fields will be inserted into.
	 */
	function setSize(mineField) {
		var baseLength, fieldHeight, fieldWidth, fieldRatio, mineFieldSize, fieldMargin = 2;

		menuWidth = Math.ceil(document.getElementById('minesweeper-menu').getClientRects()[0].width),
		baseLength = document.body.clientWidth - menuWidth > document.body.clientHeight ? document.body.clientHeight - 100 : document.body.clientWidth - menuWidth - 100;
		fieldRatio = this.nrOfColumns > this.nrOfRows ? this.nrOfColumns : this.nrOfRows;
		this.fieldSize = Math.floor(baseLength / fieldRatio);
		mineFieldSize = 'opacity: 1; max-width: '.concat(this.nrOfColumns * (this.fieldSize + fieldMargin), 'px; max-height: ', this.nrOfRows * (this.fieldSize + fieldMargin),'px;');

		mineField.innerText = '';
		mineField.setAttribute('style', mineFieldSize);
	}

	/**
	 * Resets the game state. Stops the timer.
	 * @alias resetGame
	 */
	function resetGame() {
		this.game = {
			flagged: 0,
			reveals: 0,
			started: true
		};

		clearTimeout(this.timer);
	}

	/**
	 * Initializes a new game by resetting variables and regenerating the minefield.
	 * @alias newGame
	 */
	function newGame() {
		var mineField = document.getElementById('minesweeper-mineField');

		hideMessage();
		resetGame();
		setGameVariables();
		setSize(mineField);
		generateMineField(mineField);
		initTimer();
	}

	/**
	 * Checks if on the given coordinats exists a field.
	 * @alias isExistingNeighbor
	 * @param {array} coords - A pair of numbers that should map to a field in the DOM and the field map.
	 * @returns {boolean} It is true if the fields exists. False if not.
	 */
	function isExistingNeighbor(coords) {
		return 0 < coords[0] && coords[0] <= this.nrOfRows && 0 < coords[1] && coords[1] <= this.nrOfColumns;
	}

	/**
	 * Determines the theoretical position of the sourrounding fields.
	 * @alias getNeighborIndexes
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
	 * @alias getNeighborsMines
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
	 * @alias resolveField
	 * It reveals the following statuses: 
	 * - mines: mines not found yet
	 * - flagged mines: mines that have been flagged as suspect
	 * - untapped mines: mines the user did not tap and have been revealed for the user
	 * - mistaken mines: fields that have been tagged as suspect, but were not mines
	 * - dangerous fields: fields adjacent to mines
	 * - blank fields: fields that do not contain a mine and nor their neighbors have a mine
	 * @param {array} coords - A pair of numbers representing the coordinates of the field to be revealed.
	 * @param {boolean} victory - A flag showing if the game ended with victory or not.
	 */
	function resolveField(coords, victory) {
		var neighborMines,
			state = getState(coords);

		if (!state.revealed) {
			state.revealed = true;
			if (state.mine) {
				if (state.flagged) {
					setFieldState(coords, 'flagGood', '&#9873;');
				} else if (victory) {
					setFieldState(coords, 'mineGood', '&#9762;');
				} else {
					setFieldState(coords, 'mine', '&#9762;');
				}
			} else {
				neighborMines = getNeighborsMines(coords);
				if (state.flagged) {
					setFieldState(coords, 'flagBad', '&#9872;');
				} else if (neighborMines) {
					setFieldState(coords, 'danger', neighborMines);
				} else {
					setFieldState(coords, 'blank', '');
				}
			}
		}
	}

	/**
	 * Reveals all fields to the player in case the game is over.
	 * @alias revealAll
	 * @param {boolean} victory - A flag showing if the game ended with victory or not.
	 */
	function revealAll(victory) {
		for (var i = 1; i<= this.nrOfFields; i++) {
			resolveField(getFieldCoords(i), victory);
		}
	}

	/**
	 * It is the event when the game ends. Interaction is stopped, all fields are evaluated and a message is shown.
	 * @alias gameOver
	 */
	function gameOver() {
		revealAll(false);
		this.game.started = false;
		showMessage('You have tapped a mine, the Game is Over.', false);
	}

	/**
	 * Checks if victory conditions are met. If they are, victory is announced.
	 * @alias checkVictoryCondition
	 */
	function checkVictoryCondition() {
		var msg = "You've revealed all cells without tapping a single mine in ".concat(getTime(), ' seconds! Congratulations!');

		if (this.game.reveals === this.nrOfFields - this.nrOfMines) {
			revealAll(true);
			showMessage(msg, true);
			this.game.started = false;
		}
	}

	/**
	 * Reveal any fields that are in the immediate neighborhood.
	 * @alias revealNeighbors
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
	 * @alias revealField
	 * @param {array} coords - The coordinates for a given field.
	 */
	function revealField(coords) {
		var neighborMines,
			state = getState(coords);

		if (!state.revealed && !state.flagged) {
			state.revealed = true;
			this.game.reveals++;

			if (state.mine) {
				setFieldState(coords, 'mine', '&#9762;');
				gameOver();
			} else {
				neighborMines = getNeighborsMines(coords);
				if (neighborMines) {
					setFieldState(coords, 'danger', neighborMines);
				} else {
					setFieldState(coords, 'blank', '');
					revealNeighbors(coords);
				}
				checkVictoryCondition();
			}
		}
	}

	/**
	 * Sets or resets the flag on a field.
	 * @alias toggleFlag
	 * @param {array} coords - The coordinates for a given field.
	 */
	function toggleFlag(coords) {
		var state = getState(coords);

		if (!state.revealed) {
			if (state.flagged) {
				this.game.flagged--;
				state.flagged = false;
				setFieldState(coords, 'hiden', '');
			} else {
				this.game.flagged++;
				state.flagged = true;
				setFieldState(coords, 'flag', '&#9888;');
			}
		}
	}

	/**
	 * Handler for clicking on a field with the left mouse button.
	 * @alias handleLeftClick
	 */
	function handleLeftClick() {
		revealField(getFieldCoords(this.getAttribute('index')));
	}

	/**
	 * Handler for clicking on a field with the right mouse button.
	 * @alias handleRightClick
	 * @param {object} event - The click event object.
	 */
	function handleRightClick(event) {
		if (this.game.started) {
			toggleFlag(getFieldCoords(event.target.getAttribute('index')));
		}

		event.preventDefault();
	}

	return {
		showMessage: showMessage,
		getFieldCoords: getFieldCoords,
		getFieldIndex: getFieldIndex,
		getState: getState,
		setFieldState: setFieldState,
		formatTime: formatTime,
		getMineIndexes: getMineIndexes,
		generateMineField: generateMineField,
		setGameVariables: setGameVariables,
		resetGame: resetGame,
		isExistingNeighbor: isExistingNeighbor,
		getNeighborIndexes: getNeighborIndexes,
		getNeighborsMines: getNeighborsMines,
		resolveField: resolveField,
		gameOver: gameOver,
		checkVictoryCondition: checkVictoryCondition,
		revealNeighbors: revealNeighbors,
		revealField: revealField,
		toggleFlag: toggleFlag,
		setInputValue: setInputValue,
		getInputValue: getInputValue,
		newGame: newGame,
		hideMessage: hideMessage
	}
})();
	this.fieldMap = [];
