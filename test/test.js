
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
		var actual = printGraph(cfg, contents).trim();
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
});

// TODO: how sophisticated should this be?
function printGraph(cfg, source) {
	var nodeCounter = new Map();
	var output = [];

	printNode(cfg[0]);
	return output.join('\n');

	function printNode(node) {
		if (nodeCounter.has(node))
			return;
		var counter = nodeCounter.size;
		nodeCounter.set(node, counter);

		var label = node.type || 
			source.slice(node.astNode.range[0], node.astNode.range[1])
				.replace(/\n/g, '\\n')
				.replace(/\t/g, '    ');
		output.push('n' + counter + ' [label="' + label + '"]');
		['normal', 'true', 'false', 'exception'].forEach(function (type) {
			var next = node[type];
			if (!next)
				return;
			printNode(next);
			var link = 'n' + counter + ' -> n' + nodeCounter.get(next) + ' [' +
				'label="' + type + '"]';
			output.push(link);
		});
	}
}
