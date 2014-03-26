
module.exports = dot;

function dot(cfg, options) {
	options = options || {};
	var counter = options.counter || 0;
	var source = options.source;

	var output = [];
	var nodes = cfg[2];
	var i;
	var node;

	// print all the nodes:
	for (i = 0; i < nodes.length; i++) {
		node = nodes[i];
		var label = node.label || node.type;
		if (!label && source && node.astNode.range) {
			var ast = node.astNode;
			var range = ast.range;
			var add = '';
			// special case some statements to get them properly printed
			if (ast.type === 'SwitchCase') {
				if (ast.test) {
					range = [range[0], ast.test.range[1]];
					add = ':';
				} else {
					range = [range[0], range[0]];
					add ='default:';
				}
			} else if (ast.type === 'ForInStatement') {
				range = [range[0], ast.right.range[1]];
				add = ')';
			} else if (ast.type === 'CatchClause') {
				range = [range[0], ast.param.range[1]];
				add = ')';
			}

			label = source.slice(range[0], range[1])
				.replace(/\n/g, '\\n')
				.replace(/\t/g, '    ')
				.replace(/"/g, '\\"') + add;
		}
		if (!label && node.astNode) {
			label = node.astNode.type;
		}
		output.push('n' + (counter + i) + ' [label="' + label + '"');
		if (~['entry', 'exit'].indexOf(node.type))
			output.push(', style="rounded"');
		output.push(']\n');
	}

	// print all the edges:
	for (i = 0; i < nodes.length; i++) {
		node = nodes[i];
		['normal', 'true', 'false', 'exception'].forEach(eachType);
	}
	function eachType(type) {
		var next = node[type];
		if (!next)
			return;

		output.push('n' + (counter + i) + ' -> n' + (counter + nodes.indexOf(next)) + ' [');
		if (type === 'exception')
			output.push('color="red", label="exception"');
		else if (~['true', 'false'].indexOf(type))
			output.push('label="' + type + '"');
		output.push(']\n');
	}

	if (options.counter !== undefined)
		options.counter+= nodes.length;

	return output.join('');
}

