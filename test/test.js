
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
		var counter = nodeCounter.keys.length;
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

// FIXME: do not copy-paste this around, find a proper place for it
function Map() {
	this.keys = [];
	this.values = [];
}
Map.prototype.has = function Map_has(key) {
	return ~this.keys.indexOf(key);
};
Map.prototype.get = function Map_get(key) {
	var index = this.keys.indexOf(key);
	return this.values[index];
};
Map.prototype.set = function Map_set(key, value) {
	var index = this.keys.indexOf(key);
	if (~index)
		return this.values[index] = value;
	this.keys.push(key);
	this.values.push(value);
};
