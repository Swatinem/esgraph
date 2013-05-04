
var esgraph = require('../');
var esprima = require('esprima');
var fs = require('fs');
var walkes = require('walkes');

function createTest(dir, file) {
	var contents = fs.readFileSync(dir + file, 'utf8');
	var ast = esprima.parse(contents, {comment: true, range: true});
	var comments = ast.comments;
	delete ast.comments;
	it(comments[0].value.trim() + ' (' + file + ')', function () {
		if (ast.body[0].type === 'FunctionDeclaration')
			ast = ast.body[0].body;
		var cfg = esgraph(ast);
		var expected = comments[1].value.trim();
		var actual = esgraph.dot(cfg, {source: contents}).trim();
		if (actual !== expected)
			console.log(actual);
		actual.should.eql(expected);
	});
}

describe('esgraph', function () {
	var dir = __dirname + '/tests/';
	var files = fs.readdirSync(dir);
	files.forEach(function (file) {
		createTest(dir, file);
	});

	it('should handle long graphs', function () {
		var source = Array(1e4).join('stmt;');
		var ast = esprima.parse(source);
		var cfg = esgraph(ast);
		var dot = esgraph.dot(cfg);
	});
});

describe('esgraph.dot', function () {
	it('should number the nodes starting at `counter`', function () {
		var out = esgraph.dot(esgraph(esprima.parse('var a;')), {counter: 10});
		out.should.not.include('n0');
		out.should.include('n10');
	});
});
