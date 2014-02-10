#!/usr/bin/env node

var esprima = require('esprima');
var walkes = require('walkes');
var esgraph = require('../');

process.stdin.resume();
process.stdin.setEncoding('utf8');

var data = '';
process.stdin.on('data', function (chunk) {
	data+= chunk;
});
process.stdin.on('end', function () {
	var source = data;
	// filter out hashbangs
	if (source.indexOf('#!') === 0) {
		source = '//' + source.substring(2);
	}

	try {
		var ast = esprima.parse(source, {range: true});
		var functions = findFunctions(ast);

		console.log('digraph cfg {');
		console.log('node [shape="box"]');
		var options = {counter: 0, source: source};
		functions.concat(ast).forEach(function (ast, i) {
			var cfg;
			var label = '[[main]]';
			if (~ast.type.indexOf('Function')) {
				cfg = esgraph(ast.body);
				label = 'function ' + (ast.id && ast.id.name || '') +
					'(' + ast.params.map(function (p) { return p.name; }) + ')';
			} else
				cfg = esgraph(ast);

			console.log('subgraph cluster_' + i + '{');
			console.log('label = "' + label + '"');
			console.log(esgraph.dot(cfg, options));
			console.log('}');
		});
		console.log('}');
	} catch (e) {
		console.log(e.message);
	}
});

function findFunctions(ast) {
	var functions = [];
	function handleFunction(node, recurse, stop) {
		functions.push(node);
		recurse(node.body);
	}
	walkes(ast, {
		FunctionDeclaration: handleFunction,
		FunctionExpression: handleFunction
	});
	return functions;
}

