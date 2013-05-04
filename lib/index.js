
require('es6-shim');
var walker = require('walkes');

module.exports = ControlFlowGraph;

// TODO: switch/case with default before other cases?
// TODO: try/finally: finally follows try, but does not return to normal flow?
// TODO: labeled break/continue
// TODO: WithStatement

// TODO: use a ast->cfg map to avoid adding and deleting properties on ast nodes

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
		CatchClause: function (recurse) {
			this.cfg.connect(getEntry(this.body));
			recurse(this.body);
		},
		DoWhileStatement: function (recurse) {
			mayThrow(this.test);
			this.test.cfg
				.connect(getEntry(this.body), 'true')
				.connect(getSuccessor(this), 'false');
			recurse(this.body);
		},
		ExpressionStatement: function () {
			connectNext.call(this.expression);
		},
		FunctionDeclaration: function () {},
		ForStatement: function (recurse) {
			if (this.test) {
				mayThrow(this.test);
				this.test.cfg
					.connect(getEntry(this.body), 'true')
					.connect(getSuccessor(this), 'false');
				if (this.update)
					this.update.cfg.connect(this.test.cfg);
			} else if (this.update)
				this.update.cfg.connect(getEntry(this.body));
			if (this.update)
				mayThrow(this.update);
			if (this.init) {
				mayThrow(this.init);
				this.init.cfg.connect(this.test && this.test.cfg || getEntry(this.body));
			}
			recurse(this.body);
		},
		ForInStatement: function (recurse) {
			mayThrow(this)
			this.cfg
				.connect(getEntry(this.body), 'true')
				.connect(getSuccessor(this), 'false');
			recurse(this.body);
		},
		IfStatement: function (recurse) {
			recurse(this.consequent);
			mayThrow(this.test);
			this.test.cfg.connect(getEntry(this.consequent), 'true');
			if (this.alternate) {
				recurse(this.alternate);
				this.test.cfg.connect(getEntry(this.alternate), 'false');
			} else {
				this.test.cfg.connect(getSuccessor(this), 'false');
			}
		},
		ReturnStatement: function () {
			mayThrow(this);
			this.cfg.connect(exitNode);
		},
		SwitchCase: function (recurse) {
			if (this.test) {
				// if this is a real case, connect `true` to the body
				// or the body of the next case
				var check = this;
				while (!check.consequent.length && check.cfg.nextSibling)
					check = check.cfg.nextSibling.astNode;

				this.cfg.connect(check.consequent.length && getEntry(check.consequent[0]) || getSuccessor(this.cfg.parent), 'true');

				// and connect false to the next `case`
				this.cfg.connect(getSuccessor(this), 'false');
			} else {
				// this is the `default` case, connect it to the body, or the
				// successor of the parent
				this.cfg.connect(this.consequent.length && getEntry(this.consequent[0]) || getSuccessor(this.cfg.parent));
			}
			this.consequent.forEach(recurse);
		},
		SwitchStatement: function (recurse) {
			this.cfg.connect(this.cases[0].cfg);
			this.cases.forEach(recurse);
		},
		ThrowStatement: function () {
			this.cfg.connect(getExceptionTarget(this), 'exception');
		},
		TryStatement: function (recurse) {
			var handler = this.handlers[0] && this.handlers[0].cfg || getEntry(this.finalizer);
			catchStack.push(handler);
			recurse(this.block);
			catchStack.pop();
			
			if (this.handlers.length)
				recurse(this.handlers[0]);
			if (this.finalizer) {
				//this.finalizer.cfg.connect(getSuccessor(this));
				recurse(this.finalizer);
			}
		},
		VariableDeclaration: connectNext,
		WhileStatement: function (recurse) {
			mayThrow(this.test);
			this.test.cfg
				.connect(getEntry(this.body), 'true')
				.connect(getSuccessor(this), 'false');
			recurse(this.body);
		}
	});
	
	var entryNode = new FlowNode(astNode, undefined, 'entry');
	entryNode.normal = getEntry(astNode);
	walker(astNode, {default: function () {
		if (!this.cfg)
			return;
		delete this.cfg;
		walker.checkProps.apply(this, arguments);
	}});

	var reverseStack = [entryNode];
	while (reverseStack.length) {
		var cfgNode = reverseStack.pop();
		cfgNode.next = [];
		['normal', 'true', 'false', 'exception'].forEach(function (type) {
			var next = cfgNode[type];
			if (!next)
				return;
			if (!~cfgNode.next.indexOf(next))
				cfgNode.next.push(next);
			if (!~next.prev.indexOf(cfgNode))
				next.prev.push(cfgNode);
			if (!~reverseStack.indexOf(next) && !next.next)
				reverseStack.push(next);
		});
	}

	function getExceptionTarget(astNode) {
		return catchStack[catchStack.length - 1];
	}

	function mayThrow(astNode) {
		if (expressionThrows(astNode))
			astNode.cfg.connect(getExceptionTarget(this), 'exception');
	}
	function expressionThrows(astNode) {
		if (typeof astNode !== 'object' || 'FunctionExpression' === astNode.type)
			return false;
		if (astNode.type && ~throwTypes.indexOf(astNode.type))
			return true;
		var self = astNode;
		return Object.keys(self).some(function (key) {
			var prop = self[key];
			if (prop instanceof Array) {
				return prop.some(expressionThrows);
			} else if (typeof prop === 'object' && prop)
				return expressionThrows(prop);
			else
				return false;
		});
	}

	function getJumpTarget(astNode, types) {
		var parent = astNode.cfg.parent;
		while (!~types.indexOf(parent.type) && parent.cfg.parent)
			parent = parent.cfg.parent;
		return ~types.indexOf(parent.type) ? parent : null;
	}

	function connectNext() {
		mayThrow(this);
		this.cfg.connect(getSuccessor(this));
	}

	/**
	 * Returns the entry node of a statement
	 */
	function getEntry(astNode) {
		switch (astNode.type) {
			case 'BreakStatement':
				var target = getJumpTarget(astNode, breakTargets);
				return target ? getSuccessor(target) : exitNode;
			case 'ContinueStatement':
				var target = getJumpTarget(astNode, continueTargets);
				switch (target.type) {
					case 'ForStatement':
						// continue goes to the update, test or body
						return target.update && target.update.cfg || target.test && target.test.cfg || getEntry(target.body);
					case 'ForInStatement':
						return target.cfg;
					case 'DoWhileStatement':
					case 'WhileStatement':
						return target.test.cfg;
				}
				// unreached
			case 'BlockStatement':
			case 'Program':
				return astNode.body.length && getEntry(astNode.body[0]) || getSuccessor(astNode);
			case 'DoWhileStatement':
				return getEntry(astNode.body);
			case 'EmptyStatement':
				return getSuccessor(astNode);
			case 'ExpressionStatement':
				return getEntry(astNode.expression);
			case 'ForStatement':
				return astNode.init && astNode.init.cfg || astNode.test && astNode.test.cfg || getEntry(astNode.body);
			case 'FunctionDeclaration':
				return getSuccessor(astNode);
			case 'IfStatement':
				return astNode.test.cfg;
			case 'SwitchStatement':
				return getEntry(astNode.cases[0]);
			case 'TryStatement':
				return getEntry(astNode.block);
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
			case 'ForInStatement':
				return parent.cfg;
			case 'TryStatement':
				return parent.finalizer && astNode !== parent.finalizer && getEntry(parent.finalizer) || getSuccessor(parent);
			case 'SwitchCase':
				// the sucessor of a statement at the end of a case block is
				// the entry of the next cases consequent
				if (!parent.cfg.nextSibling)
					return getSuccessor(parent);
				var check = parent.cfg.nextSibling.astNode;
				while (!check.consequent.length && check.cfg.nextSibling)
					check = check.cfg.nextSibling.astNode;
				// or the next statement after the switch, if there are no more cases
				return check.consequent.length && getEntry(check.consequent[0]) || getSuccessor(parent.parent);
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
		walker(astNode, { default: function () {
			var parent = parentStack.length ? parentStack[parentStack.length - 1] : undefined;
			createNode(this, parent);
			// do not recurse for FunctionDeclaration or any sub-expression
			if (this.type == 'FunctionDeclaration' ||
			    this.type != 'ExpressionStatement' && ~this.type.indexOf('Expression'))
				return;
			parentStack.push(this);
			walker.checkProps.apply(this, arguments);
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
		function BlockOrProgram(recurse) {
			backToFront(this.body, recurse);
		}
		walker(astNode, {
			BlockStatement: BlockOrProgram,
			Program: BlockOrProgram,
			FunctionDeclaration: function () {},
			FunctionExpression: function () {},
			SwitchCase: function (recurse) {
				backToFront(this.consequent, recurse);
			},
			SwitchStatement: function (recurse) {
				backToFront(this.cases, recurse);
			},
		});
	}
	return [entryNode, exitNode];
};

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
	'DoWhileStatement',
	'WhileStatement'];
var breakTargets = continueTargets.concat(['SwitchStatement']);
var throwTypes = [
	'AssignmentExpression', // assigning to undef or non-writable prop
	'BinaryExpression', // instanceof and in on non-objects
	'CallExpression', // obviously
	'MemberExpression', // getters may throw
	'NewExpression', // obviously
	'UnaryExpression' // delete non-deletable prop
];
