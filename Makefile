test:
	@echo TRAVIS_JOB_ID $(TRAVIS_JOB_ID)
	NODE_ENV=test ./node_modules/.bin/mocha

lib-cov: clean-cov
	./node_modules/.bin/jscoverage lib lib-cov

clean-cov:
	rm -rf lib-cov

test-cov: lib-cov
	@echo TRAVIS_JOB_ID $(TRAVIS_JOB_ID)
	ESGRAPH_COV=1 NODE_ENV=test ./node_modules/.bin/mocha -R html-cov 1> coverage.html

test-coveralls: lib-cov
	@echo TRAVIS_JOB_ID $(TRAVIS_JOB_ID)
	ESGRAPH_COV=1 NODE_ENV=test ./node_modules/.bin/mocha -R mocha-lcov-reporter | ./node_modules/.bin/coveralls

.PHONY: test test-cov test-coveralls clean-cov
