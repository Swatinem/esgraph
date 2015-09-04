
var esgraph = require('../');
var espree = require('espree');
var fs = require('fs');

function createTest(dir, file) {
	var contents = fs.readFileSync(dir + file, 'utf8');
	var ast = espree.parse(contents, {comment: true, range: true});
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
		if(/.js$/.test(file)){
			createTest(dir, file);
		}
	});

	it('should handle long graphs', function () {
		var source = Array(1e4).join('stmt;');
		var ast = espree.parse(source);
		var cfg = esgraph(ast);
		esgraph.dot(cfg);
	});

	it('should omit implicit exception edges when omitExceptions option is set', function () {
		var contents = fs.readFileSync(dir + "basicblocks.js", 'utf8');
		var ast = espree.parse(contents, {comment: true, range: true});
		delete ast.comments;

		var cfg = esgraph(ast);
		cfg[1].prev.length.should.equal(2);

		cfg = esgraph(ast, {omitExceptions: true});
		cfg[1].prev.length.should.equal(1);
	});
});

describe('esgraph.dot', function () {
	it('should number the nodes starting at `counter`', function () {
		var out = esgraph.dot(esgraph(espree.parse('var a;')), {counter: 10});
		out.should.not.containEql('n0');
		out.should.containEql('n10');
	});
});
