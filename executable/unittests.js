var utest = (function() {
	var boardContent = '';

	function log(...msg) {
		var i = 0,
			message = '';

		boardContent = boardContent.concat('<br/>');
		for (m of msg) {
			if (m !== undefined) {
				boardContent = boardContent.concat(m.toString());
			} else {
				boardContent = boardContent.concat('undefined');
			}
		}
		boardContent = boardContent.concat('<br/>');

		document.getElementById('testboard').innerHTML = boardContent;
	}
	
	function getMockDiv() {
		return document.getElementById('mockDiv');
	}
	
	function mockGameVariables(x, y, m) {
		mineSweeper.scope.setInputValue('minesweeper-height', x);
		mineSweeper.scope.setInputValue('minesweeper-width', y);
		mineSweeper.scope.setInputValue('minesweeper-mines', m);
	}

	function checkEqual(currentValue, expectedValue) {
		var match = currentValue === expectedValue;

		if (!match) {
			log('<i>Failed: ', currentValue, ' is not equal to ', expectedValue, '</i>');
		}

		return match;
	}

	function checkArrayEqual(currentArr, expectedArr) {
		var i = 0,
			match = currentArr.length === expectedArr.length;

		for (i; i < currentArr.length; i++) {
			if(currentArr[i] !== expectedArr[i]) {
				log('<i>Failed: ', currentArr[i], ' is not equal to ', expectedArr[i], '</i>');
				match = false;
			}
		}

		return match;
	}

	function checkType(currentValue, expectedValue) {
		var match = typeof currentValue === expectedValue;

		if (!match) {
			log('<i>Failed: ', currentValue, ' is not of type ', expectedValue, '</i>');
		}

		return match;
	}

	function checkIsGreater(currentValue, expectedValue) {
		var match = currentValue > expectedValue;

		if (!match) {
			log('<i>Failed: ', currentValue, ' is not greater than ', expectedValue, '</i>');
		}

		return match;
	}
	
	function runTests() {
		var result,
			nrOfTests = 0,
			fails = 0,
			passes = 0;

		for ([key, test] of tests) {
			result = test(mineSweeper.scope);

			if (result) {
				passes++;
				log(key, ' ... passed.');
			} else {
				fails++;
				log('<span style="color:red;">', key, ' ... failed.</span>');
			}
			nrOfTests++;
		}

		log('\n', '<b>From ', nrOfTests, ' tests ', passes, ' passed and ', fails, ' failed.</b>');
	}

	return {
		log: log,
		runTests: runTests,
		checkEqual: checkEqual,
		checkType: checkType,
		checkIsGreater: checkIsGreater,
		checkArrayEqual: checkArrayEqual,
		getMockDiv: getMockDiv,
		mockGameVariables: mockGameVariables
	}
})();



setTimeout(function() {
	utest.runTests.call(utest);
}, 500);

var tests = new Map();

tests.set('Game reset', function(scope) {
	var resetCheck,
		actionCheck,
		initialCheck = utest.checkEqual(scope.game.reveals, undefined);

	scope.resetGame(utest.getMockDiv());

	resetCheck = utest.checkEqual(scope.game.reveals, 0);

	scope.setGameVariables();
	scope.generateMineField(utest.getMockDiv());
	scope.revealField([1,1]);
	actionCheck = utest.checkIsGreater(scope.game.reveals, 0);

	return  initialCheck && resetCheck && actionCheck;
});

tests.set('Setting game variables', function(scope) {
	var normalCheck;

	utest.mockGameVariables(5, 5, 7);
	scope.setGameVariables();
	normalCheck = utest.checkEqual(scope.nrOfFields, 25);

	utest.mockGameVariables(50, 5, 7);
	scope.setGameVariables();
	limitCheck = utest.checkEqual(scope.nrOfRows, 30);

	return normalCheck && limitCheck;
});

tests.set('Generating field map and fields', function(scope) {
	var mockDiv = utest.getMockDiv();

	scope.generateMineField(mockDiv);

	return utest.checkType(scope.fieldMap, 'object') && mockDiv.hasChildNodes();
});

tests.set('Field map contains all the fields', function(scope) {
	var size = 0,
		i = 0,
		j = 0;

	scope.generateMineField(utest.getMockDiv());

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

	return utest.checkEqual(size, 150);
});

tests.set('The correct number of mines are generated', function(scope) {
	var mines;

	utest.mockGameVariables(8, 8, 10);
	scope.setGameVariables();
	mines = scope.getMineIndexes().size;

	return utest.checkEqual(mines, 10);
});

tests.set('Coordinates translate to corresponding index', function(scope) {
	var index = scope.getFieldIndex([8,8]);

	return utest.checkEqual(index, 64);
});

tests.set('Index translates to corresponding coordinates', function(scope) {
	var coordinates = scope.getFieldCoords(44);

	return utest.checkArrayEqual(coordinates, [6, 4]);
});
