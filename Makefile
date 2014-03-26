test: lint
	NODE_ENV=test node --harmony ./node_modules/.bin/istanbul cover \
		./node_modules/mocha/bin/_mocha

lint:
	-./node_modules/.bin/jshint ./test/test.js ./lib ./index.js

test-coveralls: test
	-cat ./coverage/lcov.info | ./node_modules/.bin/coveralls

.PHONY: test lint test-coveralls
