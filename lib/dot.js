
module.exports = dot;

function dot(cfg, source) {
	var output = [];
	var nodes = cfg[2];

	// print all the nodes:
	for (var i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		var label = node.label || node.type;
		if (!label && source && node.astNode.range) {
			var ast = node.astNode;
			var range = ast.range;
			var add = '';
			// special case some statements to get them properly printed
			if (ast.type == 'SwitchCase') {
				if (ast.test) {
					range = [range[0], ast.test.range[1]];
					add = ':';
				} else {
					range = [range[0], range[0]];
					add ='default:';
				}
			} else if (ast.type == 'ForInStatement') {
				range = [range[0], ast.right.range[1]];
				add = ')';
			} else if (ast.type == 'CatchClause') {
				range = [range[0], ast.param.range[1]];
				add = ')';
			}

			label = source.slice(range[0], range[1])
				.replace(/\n/g, '\\n')
				.replace(/\t/g, '    ') + add;
		}
		output.push('n' + i + ' [label="' + label + '"');
		if (~['entry', 'exit'].indexOf(node.type))
			output.push(', style="rounded"');
		output.push(']\n');
	}

	// print all the edges:
	for (var i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		['normal', 'true', 'false', 'exception'].forEach(function (type) {
			var next = node[type];
			if (!next)
				return;

		output.push('n' + i + ' -> n' + nodes.indexOf(next) + ' [');
		if (type === 'exception')
			output.push('color="red", label="exception"')
		else if (~['true', 'false'].indexOf(type))
			output.push('label="' + type + '"');
		output.push(']\n');
		});
	}

	return output.join('');
}

