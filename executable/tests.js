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

unit.runTests();
