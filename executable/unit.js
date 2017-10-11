window.hasUnitTests = true;
var unit = (function() {
	var boardContent = '',
		tests = new Map();

	function test(name, testFn) {
		tests.set(name, testFn);
	}

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
	
	function runTests(testScope) {
		var result,
			nrOfTests = 0,
			fails = 0,
			passes = 0;

		setTimeout(function() {
			for ([key, test] of tests) {
				result = test(testScope);

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
		}, 250);
	}

	return {
		log: log,
		test: test,
		runTests: runTests,
		checkEqual: checkEqual,
		checkType: checkType,
		checkIsGreater: checkIsGreater,
		checkArrayEqual: checkArrayEqual,
		getMockDiv: getMockDiv,
		mockGameVariables: mockGameVariables
	}
})();