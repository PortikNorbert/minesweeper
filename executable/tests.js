unit.test('Game reset', function(scope) {
	var resetCheck,
		actionCheck,
		initialCheck = unit.checkEqual(scope.game.reveals, undefined);

	scope.resetGame(unit.getMockDiv());

	resetCheck = unit.checkEqual(scope.game.reveals, 0);

	scope.setGameVariables();
	scope.generateMineField(unit.getMockDiv());
	scope.revealField([1,1]);
	actionCheck = unit.checkIsGreater(scope.game.reveals, 0);

	return  initialCheck && resetCheck && actionCheck;
});

unit.test('Setting game variables', function(scope) {
	var normalCheck;

	unit.mockGameVariables(5, 5, 7);
	scope.setGameVariables();
	normalCheck = unit.checkEqual(scope.nrOfFields, 25);

	unit.mockGameVariables(50, 5, 7);
	scope.setGameVariables();
	limitCheck = unit.checkEqual(scope.nrOfRows, 30);

	return normalCheck && limitCheck;
});

unit.test('Generating field map and fields', function(scope) {
	var mockDiv = unit.getMockDiv();

	scope.generateMineField(mockDiv);

	return unit.checkType(scope.fieldMap, 'object') && mockDiv.hasChildNodes();
});

unit.test('Field map contains all the fields', function(scope) {
	var size = 0,
		i = 0,
		j = 0;

	scope.generateMineField(unit.getMockDiv());

	if (scope.fieldMap.length) {
		for(i; i < scope.fieldMap.length; i++) {
			if (scope.fieldMap[i] && scope.fieldMap[i].length) {
				for(j; j < scope.fieldMap[i].length; j++) {
					if (scope.fieldMap[i][j]) {
						size++;
					}
				}
			}
			j = 0;
		}
	}

	return unit.checkEqual(size, 150);
});

unit.test('The correct number of mines are generated', function(scope) {
	var mines;

	unit.mockGameVariables(8, 8, 10);
	scope.setGameVariables();
	mines = scope.getMineIndexes().size;

	return unit.checkEqual(mines, 10);
});

unit.test('Coordinates translate to corresponding index', function(scope) {
	var index = scope.getFieldIndex([8,8]);

	return unit.checkEqual(index, 64);
});

unit.test('Index translates to corresponding coordinates', function(scope) {
	var coordinates = scope.getFieldCoords(44);

	return unit.checkArrayEqual(coordinates, [6, 4]);
});

unit.test('Getting the state of a field', function(scope) {
	var state;

	scope.generateMineField(unit.getMockDiv());
	state = scope.getState([5, 5]);

	return unit.checkType(state, 'object')
});

unit.test('Using the flag', function(scope) {
	var state,
		initCheck,
		flagCheck,
		unFlagCheck;

	scope.generateMineField(unit.getMockDiv());

	state = scope.getState([5, 5]);
	initCheck = unit.checkEqual(state.flagged, false);

	scope.toggleFlag([5,5]);
	flagCheck = unit.checkEqual(state.flagged, true);

	scope.toggleFlag([5,5]);
	unFlagCheck = unit.checkEqual(state.flagged, false);

	return initCheck && flagCheck && unFlagCheck;
});

unit.test('Coordinates represent an existing field', function(scope) {
	return scope.isExistingField([5,5]) && !scope.isExistingField([-1,2]) && !scope.isExistingField([0,0]) && !scope.isExistingField([5,50]) && scope.isExistingField([8,8]);
});

unit.test('Finds the right number of neighbors', function(scope) {
	var firstFieldNeighbors = scope.getNeighborIndexes([1,1]).length,
		topFieldNeighbors = scope.getNeighborIndexes([1,5]).length,
		rightTopFieldNeighbors = scope.getNeighborIndexes([1,8]).length,
		lastFieldNeighbors = scope.getNeighborIndexes([8,8]).length,
		insideFieldNeighbors = scope.getNeighborIndexes([3,6]).length;

	return unit.checkEqual(firstFieldNeighbors, 3) && unit.checkEqual(topFieldNeighbors, 5) && unit.checkEqual(rightTopFieldNeighbors, 3) && unit.checkEqual(lastFieldNeighbors, 3) && unit.checkEqual(insideFieldNeighbors, 8);
});

unit.test('Finds the right number of mines at neighbors', function(scope) {
	var originalMineGenerator = scope.getMineIndexes,
		mockedMineGenerator = function() {
			return new Set([16, 22, 28, 35, 39, 43, 44, 53, 63, 64]);
		};

	scope.getMineIndexes = mockedMineGenerator;

	unit.mockGameVariables(8, 8, 10);
	scope.resetGame(unit.getMockDiv());
	scope.setGameVariables();
	scope.generateMineField(unit.getMockDiv());

	scope.getMineIndexes = originalMineGenerator;

	return unit.checkEqual(scope.getNeighboringMines([2,2]), 0) && unit.checkEqual(scope.getNeighboringMines([5,4]), 4) && unit.checkEqual(scope.getNeighboringMines([7,7]), 2) && unit.checkEqual(scope.getNeighboringMines([2,5]), 1);
});

unit.test('Blank field behavior', function(scope) {
	scope.revealField([1,1]);

	return unit.checkEqual(scope.game.reveals, 34);
});

unit.test('Game over on tapping a mine', function(scope) {
	scope.revealField([6,4]);

	return unit.checkEqual(scope.game.won, false);
});

unit.runTests(mineSweeper.scope);
