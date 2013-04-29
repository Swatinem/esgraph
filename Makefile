test:
	@echo TRAVIS_JOB_ID $(TRAVIS_JOB_ID)
	NODE_ENV=test ./node_modules/.bin/mocha

lib-cov:
	./node_modules/.bin/jscoverage lib lib-cov

test-cov: lib-cov
	@echo TRAVIS_JOB_ID $(TRAVIS_JOB_ID)
	ESGRAPH_COV=1 NODE_ENV=test ./node_modules/.bin/mocha -R html-cov 1> coverage.html
	rm -rf lib-cov

test-coveralls: lib-cov
	@echo TRAVIS_JOB_ID $(TRAVIS_JOB_ID)
	ESGRAPH_COV=1 NODE_ENV=test ./node_modules/.bin/mocha -R mocha-lcov-reporter | ./node_modules/.bin/coveralls
	rm -rf lib-cov

.PHONY: test test-cov
