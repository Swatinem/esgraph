
var walker = require('walkes');

module.exports = ControlFlowGraph;
module.exports.dot = require('./dot');

// FIXME: switch/case with default before other cases?
// FIXME: catch creates a new scope, so should somehow be handled differently

// TODO: try/finally: finally follows try, but does not return to normal flow?

// TODO: labeled break/continue
// TODO: WithStatement

// TODO: avoid adding and deleting properties on ast nodes

/**
 * Returns [entry, exit] `FlowNode`s for the passed in AST
 */
function ControlFlowGraph(astNode) {
	var parentStack = [];
	var exitNode = new FlowNode(undefined, undefined, 'exit');
	var catchStack = [exitNode];

	createNodes(astNode);
	linkSiblings(astNode);

	walker(astNode, {
		DebuggerStatement: connectNext,
		// FS: Ignore catch clause's control flow
		CatchClause: connectNext /*function (node, recurse) {
			node.cfg.connect(getEntry(node.body));
			recurse(node.body);
		}*/,
		DoWhileStatement: function (node, recurse) {
			mayThrow(node.test);
			node.test.cfg
				.connect(getEntry(node.body), 'true')
				.connect(getSuccessor(node), 'false');
			recurse(node.body);
		},
		ExpressionStatement: connectNext,
		// FS: Treat function declaration as an evaluable expression
		FunctionDeclaration: connectNextNoThrow,
		ForStatement: function (node, recurse) {
			if (node.test) {
				mayThrow(node.test);
				node.test.cfg
					.connect(getEntry(node.body), 'true')
					.connect(getSuccessor(node), 'false');
				if (node.update)
					node.update.cfg.connect(node.test.cfg);
			} else if (node.update)
				node.update.cfg.connect(getEntry(node.body));
			if (node.update)
				mayThrow(node.update);
			if (node.init) {
				mayThrow(node.init);
				node.init.cfg.connect(node.test && node.test.cfg || getEntry(node.body));
			}
			recurse(node.body);
		},
		// FS: Invalid predicate
		ForOfStatement: connectNextNoThrow,
		ForInStatement: connectNextNoThrow/*function (node, recurse) {
			mayThrow(node);
			node.cfg
				.connect(getEntry(node.body), 'true')
				.connect(getSuccessor(node), 'false');
			recurse(node.body);
		}*/,
		IfStatement: function (node, recurse) {
			recurse(node.consequent);
			mayThrow(node.test);
			node.test.cfg.connect(getEntry(node.consequent), 'true');
			if (node.alternate) {
				recurse(node.alternate);
				node.test.cfg.connect(getEntry(node.alternate), 'false');
			} else {
				node.test.cfg.connect(getSuccessor(node), 'false');
			}
		},
		// FS: Ignore labeled statement's control flow
		LabeledStatement: connectNext,
		ReturnStatement: function (node) {
			mayThrow(node);
			node.cfg.connect(exitNode);
		},
		// FS: Ignore switch case's control flow
		SwitchCase: connectNext/*function (node, recurse) {
			if (node.test) {
				// if this is a real case, connect `true` to the body
				// or the body of the next case
				var check = node;
				while (!check.consequent.length && check.cfg.nextSibling)
					check = check.cfg.nextSibling.astNode;

				node.cfg.connect(check.consequent.length && getEntry(check.consequent[0]) || getSuccessor(node.cfg.parent), 'true');

				// and connect false to the next `case`
				node.cfg.connect(getSuccessor(node), 'false');
			} else {
				// this is the `default` case, connect it to the body, or the
				// successor of the parent
				node.cfg.connect(node.consequent.length && getEntry(node.consequent[0]) || getSuccessor(node.cfg.parent));
			}
			node.consequent.forEach(recurse);
		}*/,
		ClassDeclaration: connectNext,
		// FS: Ignore switch statement's control flow
		SwitchStatement: connectNext/*function (node, recurse) {
			node.cfg.connect(node.cases[0].cfg);
			node.cases.forEach(recurse);
		}*/,
		// FS: Ignore throw statement's control flow
		ThrowStatement: connectNext/*function (node) {
			node.cfg.connect(getExceptionTarget(node), 'exception');
		}*/,
		// FS: Ignore try statement's control flow
		TryStatement: connectNext/*function (node, recurse) {

			var handler = node.handler && node.handler.cfg || getEntry(node.finalizer);
			catchStack.push(handler);
			recurse(node.block);
			catchStack.pop();

			if (node.handler)
				recurse(node.handler);
			if (node.finalizer) {
				//node.finalizer.cfg.connect(getSuccessor(node));
				recurse(node.finalizer);
			}
		}*/,
		VariableDeclaration: connectNext,
		WhileStatement: function (node, recurse) {
			mayThrow(node.test);
			node.test.cfg
				.connect(getEntry(node.body), 'true')
				.connect(getSuccessor(node), 'false');
			recurse(node.body);
		},
		// FS: Ignore labeled statement's control flow
		WithStatement: connectNext
	});

	var entryNode = new FlowNode(astNode, undefined, 'entry');
	entryNode.normal = getEntry(astNode);
	walker(astNode, {default: function (node, recurse) {
		if (!node.cfg)
			return;
		// ExpressionStatements should refer to their expression directly
		if (node.type === 'ExpressionStatement')
			node.cfg.astNode = node.expression;
		delete node.cfg;
		walker.checkProps(node, recurse);
	}});

	var allNodes = [];
	var reverseStack = [entryNode];
	var cfgNode;
	while (reverseStack.length) {
		cfgNode = reverseStack.pop();
		allNodes.push(cfgNode);
		cfgNode.next = [];
		['exception', 'false', 'true', 'normal'].forEach(eachType);
	}
	function eachType(type) {
		var next = cfgNode[type];
		if (!next)
			return;
		if (!~cfgNode.next.indexOf(next))
			cfgNode.next.push(next);
		if (!~next.prev.indexOf(cfgNode))
			next.prev.push(cfgNode);
		if (!~reverseStack.indexOf(next) && !next.next)
			reverseStack.push(next);
	}

	function getExceptionTarget() {
		return catchStack[catchStack.length - 1];
	}

	function mayThrow(node) {
		if (expressionThrows(node))
			node.cfg.connect(getExceptionTarget(node), 'exception');
	}
	function expressionThrows(astNode) {
		if (typeof astNode !== 'object' || 'FunctionExpression' === astNode.type)
			return false;
		if (astNode.type && ~throwTypes.indexOf(astNode.type))
			return true;
		var self = astNode;
		return Object.keys(self).some(function (key) {
			// FS: avoiding circular references
			if (['parent', 'scope', 'handlers', 'directives', 'errors', 'loc', 'range'].indexOf(key) === -1) {
				var prop = self[key];
				if (prop instanceof Array) {
					return prop.some(expressionThrows);
				} else if (typeof prop === 'object' && prop)
					return expressionThrows(prop);
				else
					return false;
				}
		});
	}

	function getJumpTarget(astNode, types) {
		var parent = astNode.cfg.parent;
		while (!~types.indexOf(parent.type) && parent.cfg.parent)
			parent = parent.cfg.parent;
		return ~types.indexOf(parent.type) ? parent : null;
	}

	function connectNext(node) {
		mayThrow(node);
		node.cfg.connect(getSuccessor(node));
	}

	// FS: connect but doesn't throw
	function connectNextNoThrow(node) {
		node.cfg.connect(getSuccessor(node));
	}

	/**
	 * Returns the entry node of a statement
	 */
	function getEntry(astNode) {
		var target;
		switch (astNode.type) {
			case 'BreakStatement':
				target = getJumpTarget(astNode, breakTargets);
				return target ? getSuccessor(target) : exitNode;
			case 'ContinueStatement':
				target = getJumpTarget(astNode, continueTargets);
				switch (target.type) {
					case 'ForStatement':
						// continue goes to the update, test or body
						return target.update && target.update.cfg || target.test && target.test.cfg || getEntry(target.body);
					// FS: Not expected to enter here
					case 'ForOfStatement':
					case 'ForInStatement':
						//return target.cfg;
						throw 'Target forIn not expected';
					case 'DoWhileStatement':
					/* falls through */
					case 'WhileStatement':
						return target.test.cfg;
				}
			// unreached
			/* falls through */
			case 'BlockStatement':
			/* falls through */
			case 'Program':
				return astNode.body.length && getEntry(astNode.body[0]) || getSuccessor(astNode);
			case 'DoWhileStatement':
				return getEntry(astNode.body);
			case 'EmptyStatement':
				return getSuccessor(astNode);
			case 'ForStatement':
				return astNode.init && astNode.init.cfg || astNode.test && astNode.test.cfg || getEntry(astNode.body);
		  // FS: consider function declaration itself as the entry node (though it won't be evaluated)
			/*case 'FunctionDeclaration':
				return getSuccessor(astNode);*/
			case 'IfStatement':
				return astNode.test.cfg;
			// FS: the entry node is switch statement itself
			/*case 'SwitchStatement':
				return getEntry(astNode.cases[0]);*/
			// FS: the entry node is try statement itself
			/*case 'TryStatement':
				return getEntry(astNode.block);*/
			case 'WhileStatement':
				return astNode.test.cfg;
			default:
				return astNode.cfg;
		}
	}
	/**
	 * Returns the successor node of a statement
	 */
	function getSuccessor(astNode) {
		// part of a block -> it already has a nextSibling
		if (astNode.cfg.nextSibling)
			return astNode.cfg.nextSibling;
		var parent = astNode.cfg.parent;
		if (!parent) // it has no parent -> exitNode
			return exitNode;
		switch (parent.type) {
			case 'DoWhileStatement':
				return parent.test.cfg;
			case 'ForStatement':
				return parent.update && parent.update.cfg || parent.test && parent.test.cfg || getEntry(parent.body);
				// FS: Treat those as a default case
			/*case 'ForInStatement':
				return parent.cfg;*/
		  // no special behavior for try statement
			/*case 'TryStatement':
				return parent.finalizer && astNode !== parent.finalizer && getEntry(parent.finalizer) || getSuccessor(parent);*/
			// no special behavior for switch case
			/*case 'SwitchCase':
				// the sucessor of a statement at the end of a case block is
				// the entry of the next cases consequent
				if (!parent.cfg.nextSibling)
					return getSuccessor(parent);
				var check = parent.cfg.nextSibling.astNode;
				while (!check.consequent.length && check.cfg.nextSibling)
					check = check.cfg.nextSibling.astNode;
				// or the next statement after the switch, if there are no more cases
				return check.consequent.length && getEntry(check.consequent[0]) || getSuccessor(parent.parent);*/
			case 'WhileStatement':
				return parent.test.cfg;
			default:
				return getSuccessor(parent);
		}
	}

	/**
	 * Creates a FlowNode for every AST node
	 */
	function createNodes(astNode) {
		walker(astNode, { default: function (node, recurse) {
			var parent = parentStack.length ? parentStack[parentStack.length - 1] : undefined;
			createNode(node, parent);
			// do not recurse for FunctionDeclaration or any sub-expression
			if (node.type === 'FunctionDeclaration' || ~node.type.indexOf('Expression'))
				return;
			parentStack.push(node);
			walker.checkProps(node, recurse);
			parentStack.pop();
		}});
	}
	function createNode(astNode, parent) {
		if (!astNode.cfg)
			Object.defineProperty(astNode, 'cfg', {value: new FlowNode(astNode, parent), configurable: true});
	}

	/**
	 * Links in the next sibling for nodes inside a block
	 */
	function linkSiblings(astNode) {
		function backToFront(list, recurse) {
			// link all the children to the next sibling from back to front,
			// so the nodes already have .nextSibling
			// set when their getEntry is called
			for (var i = list.length - 1; i >= 0; i--) {
				var child = list[i];
				if (i < list.length - 1)
						child.cfg.nextSibling = getEntry(list[i + 1]);
				recurse(child);
			}
		}
		function BlockOrProgram(node, recurse) {
			backToFront(node.body, recurse);
		}
		walker(astNode, {
			BlockStatement: BlockOrProgram,
			Program: BlockOrProgram,
			FunctionDeclaration: function () {},
			FunctionExpression: function () {},
			ArrowFunctionExpression: function () {}
			// FS: no special case for switch
			/*SwitchCase: function (node, recurse) {
				backToFront(node.consequent, recurse);
			},
			SwitchStatement: function (node, recurse) {
				backToFront(node.cases, recurse);
			},*/
		});
	}
	return [entryNode, exitNode, allNodes];
}

function FlowNode(astNode, parent, type) {
	this.astNode = astNode;
	this.parent = parent;
	this.type = type;
	this.prev = [];
}
FlowNode.prototype.connect = function (next, type) {
	this[type || 'normal'] = next;
	return this;
};

var continueTargets = [
	'ForStatement',
	'ForInStatement',
	'ForOfStatement',
	'DoWhileStatement',
	'WhileStatement'];
var breakTargets = continueTargets/*.concat(['SwitchStatement'])*/;
var throwTypes = [
	'AssignmentExpression', // assigning to undef or non-writable prop
	'BinaryExpression', // instanceof and in on non-objects
	'CallExpression', // obviously
	'MemberExpression', // getters may throw
	'NewExpression', // obviously
	'UnaryExpression' // delete non-deletable prop
];
