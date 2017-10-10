var utest = (function() {
	var boardContent = '';

	function log(...msg) {
		var board = document.getElementById('testboard');

		boardContent = boardContent.concat('\n', msg.join(''));
		board.value = boardContent;
	}

	function getMockDiv() {
		return document.getElementById('mockDiv');
	}
	
	function mockGameVariables(x, y, m) {
		mineSweeper.setInputValue('minesweeper-height', x);
		mineSweeper.setInputValue('minesweeper-width', y);
		mineSweeper.setInputValue('minesweeper-mines', m);
	}

	function mock(fn, mockFn) {
		
	}
	
	function checkEqual(currentValue, expectedValue) {
		var match = currentValue === expectedValue;

		if (match) {
			log('Currentvalue is equal to expectedvalue.');
		} else {
			log('FAIL: ', currentValue, ' is not equal to ', expectedValue);
		}

		return match;
	}
	
	function checkType(currentValue, expectedValue) {
		var match = typeof currentValue === expectedValue;

		if (match) {
			log('Type is matching.');
		} else {
			log('FAIL: ', currentValue, ' is not of type ', expectedValue);
		}

		return match;
	}
	
	function runTests() {
		var result,
			nrOfTests = 0,
			fails = 0,
			passes = 0;

		for ([key, test] of tests) {
			result = test();

			if (result) {
				passes++;
			} else {
				fails++;
				log('TEST: "', key, '" has failed.');
			}
			nrOfTests++;
		}

		log('\n', 'From ', nrOfTests, ' test ', passes, ' passed and ', fails, ' failed.');
	}

	return {
		log: log,
		mock: mock,
		runTests: runTests,
		checkEqual: checkEqual,
		checkType: checkType,
		getMockDiv: getMockDiv,
		mockGameVariables: mockGameVariables
	}
})();



setTimeout(function() {
	utest.runTests();
}, 500);

var tests = new Map();

tests.set('If number of fields is calculated properly', function() {
	utest.mockGameVariables(5, 5, 7);
	mineSweeper.setGameVariables.call(mineSweeper);

	return utest.checkEqual(mineSweeper.nrOfFields, 25);

});

tests.set('If number of rows is limited', function() {
	utest.mockGameVariables(50, 5, 7);
	mineSweeper.setGameVariables.call(mineSweeper);

	return utest.checkEqual(mineSweeper.nrOfRows, 30);
});

tests.set('If fieldMap is set', function() {
	mineSweeper.generateMineField.call(mineSweeper, utest.getMockDiv());

	return utest.checkType(mineSweeper.fieldMap, 'object');
});

tests.set('If fieldMap has the appropriate number of fields', function() {
	var size = 0,
		i = 0,
		j = 0;

	mineSweeper.generateMineField.call(mineSweeper, utest.getMockDiv());

	if (mineSweeper.fieldMap.length) {
		for(i; i < mineSweeper.fieldMap.length; i++) {
			if (mineSweeper.fieldMap[i] && mineSweeper.fieldMap[i].length) {
				for(j; j < mineSweeper.fieldMap[i].length; j++) {
					if (mineSweeper.fieldMap[i][j]) {
						size++;
					}
				}
			}
			j = 0;
		}
	}

	return utest.checkEqual(size, 150);
});

tests.set('If enough number of mines are generated', function() {
	var mines;

	utest.mockGameVariables(8, 8, 10);
	mineSweeper.setGameVariables.call(mineSweeper);
	mineSweeper.generateMineField.call(mineSweeper, utest.getMockDiv());
	mines = mineSweeper.getMineIndexes.call(mineSweeper).size;

	return utest.checkEqual(mines, 10);
});

tests.set('If the correct neighbors are returned', function() {
	var index = mineSweeper.getFieldIndex.call(mineSweeper,[8, 8]);

	return utest.checkEqual(index, 64);
});
