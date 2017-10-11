/**
 * How to play the game:
 *
 * Launch the game from the executable folder by double clicking on the minesweeper.html.
 * Once the game is loaded you can complete the form. You can set how many columns, rows and mines do you want to have.
 * Start a new game by hitting the 'Start new game button.'
 * Play the game by clicking on the fields one by one. Your goals is to reveal each field excluding the ones that contain a mine.
 * To learn, where the mines are, check the field you have been clicked. If the field does not contain a number, there are no mines in the immediate vicinity.
 * If you see a number in a field, that means that in the immediate vicinity there are that number of mines.
 * It is possible to tag a field with the right mouse button. Do this, if you suspect that there is a mine underneath. This way you can ensure that you don't click that field by accident.
 * To un-tag a field, right click on it again.
 * You can have a minefield of 70 x 70 in size.
 *
 * Legend of signs
 *
 * During gameplay:
 * - dark brown field: unrevealed field, it may contain a mine
 * - light brown field without any text: blank field, there are no mines around it
 * - light field with a number: it indicates, how many mines are in the neighboring fields
 * - a maroon field with a &#9888; (warning) sign: indicates a flagged field
 *
 * After the game ends:
 * - a black field with a &#9762; (radioactive) sign: a mine
 * - an orange field with a &#9872; (empty flag) sign: a field flagged, but not containing any mines
 * - a green field with a &#9873; (filled flag) sign: a field flagged and containing a mine
 * - a green field with a &#9762; (radioactive) sign: a mine not touched nor flagged
 *
 * The game was tested on Windows only, on the following browsers:
 * - Google Chrome Version 61.0.3163.100
 * - Mozilla Firefox Version 56.0
 * - Microsoft Edge Version 40.15063.0.0
 * - Internet Explorer Version 11.608.15063.0
 */
var mineSweeper = (function(isPublic) {
	/**
	 * The minesweeper scope variable contains all the functionalities of the game.
	 * There are several key variables accesible from outside of the methods:
	 * - {function} clock - The time counting mechanics are kept in this variable, it is a setTimeout function
	 * - {number} nrOfRows - How many rows the minefield will have.
	 * - {number} nrOfMines - How many mines the minefield will have.
	 * - {number} nrOfFields - How many clickable fields the minefield will have.
	 * - {number} nrOfColumns - How many columns the minefield will have.
	 * - {number} fieldMap - An array of arrays holding the status of each field.
	 * - {number} game - Some flags regarding the game progress.
	 * - {number} fieldSize - The width and height of a field used to give a dynamic size to the minesweeper.
	 */

	var getInputValue, setInputValue,
		showMessage, hideMessage,
		getFieldCoords, getFieldIndex,
		getState, setFieldState,
		formatTime, getClockTime, runClock, initClock,
		getRandomNumberBetween, getMineIndexes,
		createField, generateMineField, setNeighboringMinesCount, setGameVariables, setSize,
		resetGame, newGame, gameOver, isVictory, victory,
		isExistingField, getNeighboringMines,
		resolveField, resolveAllFields, revealNeighbors, revealField, toggleFlag,
		handleLeftClick, handleRightClick, handleKeyPress, scope = this;

	scope.game = {};

	/**
	 * Tells the value of an input field as a number.
	 * @alias getInputValue
	 * @param {string} id - The id attribute of the field.
	 * @returns {number} The value of an input field.
	 */
	getInputValue = function(id) {
		var value = document.getElementById(id).value;

		return Number(value);
	};

	/**
	 * Sets the value of an input field.
	 * @alias setInputValue
	 * @param {string} id - The id of the input field.
	 * @param {string/number} value - The value to be set.
	 */
	setInputValue = function(id, value) {
		document.getElementById(id).value = value;
	};

	/**
	 * Shows a modal window with a message in it.
	 * @alias showMessage
	 * @param {string} msg - The message to be displayed.
	 */
	showMessage = function(msg) {
		var modalClass = scope.game.won ? 'o-modal o-modal--open o-modal--victory' : 'o-modal o-modal--open';

		document.getElementById('minesweeper-modal-content').innerText = msg;
		document.getElementById('minesweeper-modal').setAttribute('class', modalClass);
	}

	/**
	 * Hides the modal window and deletes it's content.
	 * @alias hideMessage
	 */
	hideMessage = function() {
		var animationDelay = 250;

		document.getElementById('minesweeper-modal').setAttribute('class', 'o-modal');
		setTimeout(function() {
			document.getElementById('minesweeper-modal-content').innerText = '';
		}, animationDelay);
	};

	/**
	 * Tells the map to a field's state based on an field's order.
	 * @alias getFieldCoords
	 * @param {number} index - The order number of a field.
	 * @returns {array} An array of 2 numbers used to access a field's state in the field map.
	 */
	getFieldCoords = function(index) {
		return [Math.ceil(index / scope.nrOfColumns), index % scope.nrOfColumns || scope.nrOfColumns];
	};

	/**
	 * Tells the order number of a field based on a field map array.
	 * @alias getFieldIndex
	 * @param {array} coords - An array of 2 numbers used to access a field's state in the field map.
	 * @returns {number} Returns the order number of a field.
	 */
	getFieldIndex = function(coords) {
		return (coords[0] - 1) * scope.nrOfColumns + coords[1];
	};

	/**
	 * Tells the state of a field.
	 * @alias getState
	 * @param {array} coords - An array of 2 numbers used to access a field's state in the field map.
	 * @returns {object} Returns an object with 3 fields (if the field was revealed, if it is a mine and if it has a flag put on it).
	 */
	getState = function(coords) {
		return scope.fieldMap[coords[0]][coords[1]];
	};

	/**
	 * Sets the field's appearance on the page by applying a class.
	 * @alias setFieldState
	 * @param {array} coords - An array of 2 numbers used to access a field's state in the field map.
	 * @param {string} type - The type of the field, maps to a css class name.
	 * @param {string} content - The character to be shown in the field.
	 */
	setFieldState = function(coords, type, content) {
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
	};

	/**
	 * Formats the output time for the clock. If the number is smaller than 10 it adds a leading 0.
	 * @alias formatTime
	 * @param {number} time - The quantity of minutes or seconds
	 * @returns {string} Returns the formatted number.
	 */
	formatTime = function(time) {
		return time < 10 ? '0'.concat(time) : time;
	};

	/**
	 * Tells the time from the clock.
	 * @alias getClockTime
	 * @returns {string} Returns the time spent on solving the minefield.
	 */
	getClockTime = function() {
		return document.getElementById('minesweeper-timer').innerText;
	};

	/**
	 * Runs the clock until the game is lost or won.
	 * @alias runClock
	 * @param {object} clockField - The element from the DOM, where the clock is displayed.
	 * @param {number} minutes - The minutes already spent on the current session of the game.
	 * @param {number} seconds - The additional seconds already spent on the current session of the game.
	 */
	runClock = function(clockField, minutes, seconds) {
		seconds++;
		if (seconds === 60) {
			seconds = 0;
			minutes++;
		}

		clockField.innerText = formatTime(minutes).concat(':', formatTime(seconds));

		scope.clock = setTimeout(function() {
			if (scope.game.active) {
				runClock(clockField, minutes, seconds);
			}
		}, 1000);
	};

	/**
	 * Initializes the clock once the game becomes active.
	 * @alias initClock
	 */
	initClock = function() {
		var minutes = 0, seconds = 0,
			clockField = document.getElementById('minesweeper-timer');

		runClock(clockField, minutes, seconds);
	}

	/**
	 * Generates a random number from the given interval.
	 * @alias getRandomNumberBetween
	 * @param {number} min - The minimum value from the interval.
	 * @param {number} max - The maximum value from the interval.
	 * @returns {number} Returns a random number.
	 */
	getRandomNumberBetween = function(min, max) {
		return Math.round(Math.random() * (max - min) + min);
	};

	/**
	 * Generates the index of the mines.
	 * @alias getMineIndexes
	 * @returns {Set} Returns a set of numbers, each representing a single mine.
	 */
	getMineIndexes = function() {
		var minNrOfFields = 1,
			mineIndexes = new Set();

		while (mineIndexes.size < scope.nrOfMines) {
			mineIndexes.add(getRandomNumberBetween(minNrOfFields, scope.nrOfFields));
		}

		return mineIndexes;
	};

	/**
	 * Creates a new DOM element (field) and inserts it into the DOM.
	 * @alias createField
	 * @param {object} mineField - The element which contains all the fields.
	 * @param {number} index - The order number of a field.
	 */
	createField = function(mineField, index) {
		var field = document.createElement('div');

		field.setAttribute('index', index);
		field.setAttribute('class', 'c-minesweeper__field');
		field.setAttribute('id', 'minesweeper-field'.concat(index));
		field.setAttribute('style', 'width: '.concat(scope.fieldSize, 'px; height: ', scope.fieldSize, 'px;'));

		mineField.appendChild(field);
	};

	/**
	 * Generates the field map, which contains each field's state.
	 * @alias generateMineField
	 * @param {object} mineField - The element which contains all the fields.
	 */
	generateMineField = function(mineField) {
		var i = 1,
			column,
			row = 0,
			mineIndexes = scope.getMineIndexes();

		scope.fieldMap = [];

		for(i; i <= scope.nrOfFields; i++) {
			column = (i % scope.nrOfColumns) || scope.nrOfColumns;
			if (i % scope.nrOfColumns === 1) {
				row++;
				scope.fieldMap[row] = [];
			}

			scope.fieldMap[row][column] = {
				flagged: false,
				revealed: false,
				mine: mineIndexes.has(i)
			};

			createField(mineField, i);
		}
	};

	/**
	 * Sets on each field's state the number of neighboring mines.
	 * @alias setNeighboringMinesCount
	 */
	setNeighboringMinesCount = function() {
		var rows = 1, columns = 1;

		while (rows <= scope.nrOfRows) {
			while(columns <= scope.nrOfColumns) {
				getState([rows, columns]).neighborMines = getNeighboringMines([rows , columns]);
				columns++;
			}
			columns = 1;
			rows++;
		}
	};

	/**
	 * Reads, adjusts and sets the input parameters for the minefield.
	 * @alias setGameVariables
	 */
	setGameVariables = function() {
		scope.nrOfRows = getInputValue('minesweeper-height');
		if (scope.nrOfRows < 2) {
			scope.nrOfRows = 2;
			setInputValue('minesweeper-height', scope.nrOfRows);
		} else if (scope.nrOfRows > 70) {
			scope.nrOfRows = 70;
			setInputValue('minesweeper-height', scope.nrOfRows);
		}

		scope.nrOfColumns = getInputValue('minesweeper-width');
		if (scope.nrOfColumns < 2) {
			scope.nrOfColumns = 2;
			setInputValue('minesweeper-width', scope.nrOfColumns);
		} else if (scope.nrOfColumns > 70) {
			scope.nrOfColumns = 70;
			setInputValue('minesweeper-width', scope.nrOfColumns);
		}

		scope.nrOfFields = scope.nrOfRows * scope.nrOfColumns;

		scope.nrOfMines = getInputValue('minesweeper-mines');
		if (scope.nrOfMines >= scope.nrOfFields) {
			scope.nrOfMines = scope.nrOfFields - 1;
			setInputValue('minesweeper-mines', scope.nrOfMines);
		} else if (scope.nrOfMines < 1) {
			scope.nrOfMines = 1;
			setInputValue('minesweeper-mines', scope.nrOfMines);
		}
	};

	/**
	 * Sets the size of the minefield.
	 * @alias setSize
	 * @param {object} mineField - The element which contains all the fields.
	 */
	setSize = function(mineField) {
		var baseLength, fieldHeight, fieldWidth, fieldRatio, mineFieldSize, fieldMargin = 2;

		menuWidth = Math.ceil(document.getElementById('minesweeper-menu').getClientRects()[0].width),
		baseLength = (document.body.clientWidth - menuWidth > document.body.clientHeight ? document.body.clientHeight : document.body.clientWidth - menuWidth) - 110;
		fieldRatio = scope.nrOfColumns > scope.nrOfRows ? scope.nrOfColumns : scope.nrOfRows;
		scope.fieldSize = Math.floor(baseLength / fieldRatio) < 23 ? 23 : Math.floor(baseLength / fieldRatio);
		mineFieldSize = 'opacity: 1; width: '.concat(scope.nrOfColumns * (scope.fieldSize + fieldMargin), 'px; height: ', scope.nrOfRows * (scope.fieldSize + fieldMargin),'px;');

		mineField.setAttribute('style', mineFieldSize);
	};

	/**
	 * Resets the game and stops the clock.
	 * @alias resetGame
	 * @param {object} mineField - The element which contains all the fields.
	 */
	resetGame = function(mineField) {
		scope.game = {
			won: null,
			reveals: 0,
			active: true,
		};

		mineField.innerText = '';

		clearTimeout(scope.clock);
	};

	/**
	 * Starts a new game.
	 * @alias newGame
	 */
	newGame = function() {
		var mineField = document.getElementById('minesweeper-mineField'),
			mineFieldCt = document.getElementById('minesweeper-mineField-ct');

		mineFieldCt.setAttribute('style', 'display: block; width: 75%;');

		resetGame(mineField);
		hideMessage();
		setGameVariables();
		setSize(mineField);
		generateMineField(mineField);
		setNeighboringMinesCount();

		initClock();

		mineField.addEventListener('click', handleLeftClick);
		mineField.addEventListener('contextmenu', handleRightClick);
	};

	/**
	 * Checks if the given coordinates represent an existing a field.
	 * @alias isExistingField
	 * @param {array} coords - An array of 2 numbers used to access a field's state in the field map.
	 * @returns {boolean} It is true if the field exists.
	 */
	isExistingField = function(coords) {
		return 0 < coords[0] && coords[0] <= scope.nrOfRows && 0 < coords[1] && coords[1] <= scope.nrOfColumns;
	};

	/**
	 * Collects a list of suspected field map coordinates of any neighboring fields.
	 * @alias getNeighborIndexes
	 * @param {array} mainCoords - The selected field's map to it's state in the field map.
	 * @returns {array} A list of arrays, each used to access a field's state in the field map.
	 */
	getNeighborIndexes = function(mainCoords) {
		var indexes = [],
			neighborPositions = [
				[mainCoords[0]-1, mainCoords[1]-1],
				[mainCoords[0]-1, mainCoords[1]],
				[mainCoords[0]-1, mainCoords[1]+1],
				[mainCoords[0], mainCoords[1]+1],
				[mainCoords[0]+1, mainCoords[1]+1],
				[mainCoords[0]+1, mainCoords[1]],
				[mainCoords[0]+1, mainCoords[1]-1],
				[mainCoords[0], mainCoords[1]-1]
			];

		neighborPositions.map(function(pos) {
			if (isExistingField(pos)) {
				indexes.push(pos);
			}
		});

		return indexes;
	};

	/**
	 * Tell the number of mines in the neighboring fields.
	 * @alias getNeighboringMines
	 * @param {array} mainCoords - The selected field's map to it's state in the field map.
	 * @returns {number} Returns the number of mines in the neighboring fields.
	 */
	getNeighboringMines = function(mainCoords) {
		var mines = 0,
			neighborIndexes = getNeighborIndexes(mainCoords);

		neighborIndexes.map(function(coord) {
			mines += getState(coord).mine ? 1 : 0;
		});

		return mines;
	};

	/**
	 * Reveals a field with all it's states. It changes only the looks and it does not propagate to other fields.
	 * @alias resolveField
	 * @param {array} coords - An array of 2 numbers used to access a field's state in the field map.
	 */
	resolveField = function(coords) {
		var state = getState(coords);

		if (!state.revealed) {
			state.revealed = true;
			if (state.mine) {
				if (state.flagged) {
					setFieldState(coords, 'flagGood', '&#9873;');
				} else if (scope.game.won) {
					setFieldState(coords, 'mineGood', '&#9762;');
				} else {
					setFieldState(coords, 'mine', '&#9762;');
				}
			} else {
				if (state.flagged) {
					setFieldState(coords, 'flagBad', '&#9872;');
				} else if (state.neighborMines) {
					setFieldState(coords, 'danger', state.neighborMines);
				} else {
					setFieldState(coords, 'blank', '');
				}
			}
		}
	};

	/**
	 * Resolves all fields to the player, showing what each field is.
	 * @alias resolveAllFields
	 */
	resolveAllFields = function() {
		for (var i = 1; i<= scope.nrOfFields; i++) {
			resolveField(getFieldCoords(i));
		}
	};

	/**
	 * Sets the game over state.
	 * @alias gameOver
	 */
	gameOver = function() {
		scope.game.active = false;
		scope.game.won = false;
		resolveAllFields();
		showMessage('You have tapped a mine, the Game is Over.', false);
	};

	/**
	 * Checks if the conditions are met for wining the game.
	 * @alias isVictory
	 * @returns {boolean} Returns true if the game is won.
	 */
	isVictory = function() {
		return scope.game.reveals === scope.nrOfFields - scope.nrOfMines;
	};

	/**
	 * Sets the game won state.
	 * @alias victory
	 */
	victory = function() {
		var msg = "You've revealed all cells without tapping a single mine in ".concat(getClockTime(), ' seconds! Congratulations!');

		scope.game.active = false;
		scope.game.won = true;
		resolveAllFields();
		showMessage(msg, true);
	};

	/**
	 * Reveal the neighboring fields of a field selected.
	 * @alias revealNeighbors
	 * @param {number} mainIndex - The order number of the selected field.
	 */
	revealNeighbors = function(mainIndex) {
		var i,
			neighborIndexes = getNeighborIndexes(mainIndex);

		for (i = 0; i < neighborIndexes.length; i++) {
			revealField(neighborIndexes[i]);
		}
	};

	/**
	 * Reveals a field and checks for end game conditions.
	 * @alias revealField
	 * @param {array} coords - An array of 2 numbers used to access a field's state in the field map.
	 */
	revealField = function(coords) {
		var state = getState(coords);

		if (!state.revealed && !state.flagged) {
			state.revealed = true;
			scope.game.reveals++;

			if (state.mine) {
				setFieldState(coords, 'mine', '&#9762;');
				gameOver();
			} else {
				if (state.neighborMines) {
					setFieldState(coords, 'danger', state.neighborMines);
				} else {
					setFieldState(coords, 'blank', '');
					revealNeighbors(coords);
				}
				if (isVictory()) {
					victory();
				}
			}
		}
	};

	/**
	 * Sets or resets the flag on a field.
	 * @alias toggleFlag
	 * @param {array} coords - An array of 2 numbers used to access a field's state in the field map.
	 */
	toggleFlag = function(coords) {
		var state = getState(coords);

		if (!state.revealed) {
			if (state.flagged) {
				state.flagged = false;
				setFieldState(coords, 'hiden', '');
			} else {
				state.flagged = true;
				setFieldState(coords, 'flag', '&#9888;');
			}
		}
	};

	/**
	 * Handler for clicking on a field with the left mouse button.
	 * @alias handleLeftClick
	 * @param {object} event - The click event object.
	 */
	handleLeftClick = function(event) {
		if (event.target.getAttribute('id') !== 'minesweeper-mineField') {
			revealField(getFieldCoords(event.target.getAttribute('index')));
		}
	};

	/**
	 * Handler for clicking on a field with the right mouse button.
	 * @alias handleRightClick
	 * @param {object} event - The click event object.
	 */
	handleRightClick = function(event) {
		if (event.target.getAttribute('id') !== 'minesweeper-mineField' && scope.game.active) {
			toggleFlag(getFieldCoords(event.target.getAttribute('index')));
		}

		event.preventDefault();
	};

	/**
	 * Handler for pressing enter while on an input field.
	 * @alias handleKeyPress
	 * @param {object} event - The keypress event object.
	 */
	handleKeyPress = function(event) {
		if (event.key === 'Enter') {
			newGame();
		}
	};

	scope.setGameVariables = setGameVariables;
	scope.getFieldCoords = getFieldCoords;
	scope.getFieldIndex = getFieldIndex;
	scope.getState = getState;
	scope.formatTime = formatTime;
	scope.generateMineField = generateMineField;
	scope.resetGame = resetGame;
	scope.toggleFlag = toggleFlag;
	scope.isExistingField = isExistingField;
	scope.getNeighborIndexes = getNeighborIndexes;
	scope.getNeighboringMines = getNeighboringMines;
	scope.setNeighboringMinesCount = setNeighboringMinesCount;
	scope.gameOver = gameOver;
	scope.revealField = revealField;
	scope.setInputValue = setInputValue;
	scope.getInputValue = getInputValue;
	scope.getMineIndexes = getMineIndexes;

	return {
		newGame: newGame,
		hideMessage: hideMessage,
		scope: isPublic ? scope : null,
		handleKeyPress: handleKeyPress
	};
})(window.hasUnitTests);