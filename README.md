# esgraph

creates a control flow graph from an esprima abstract syntax tree

[![Build Status](https://travis-ci.org/Swatinem/esgraph.png?branch=master)](https://travis-ci.org/Swatinem/esgraph)
[![Coverage Status](https://coveralls.io/repos/Swatinem/esgraph/badge.png?branch=master)](https://coveralls.io/r/Swatinem/esgraph)
[![Dependency Status](https://gemnasium.com/Swatinem/esgraph.png)](https://gemnasium.com/Swatinem/esgraph)

## Installation

    $ npm install esgraph

## Usage

```js
var cfg = esgraph(esprima.parse(ast));
// cfg[0] is the start node, cfg[1] is the end node

// a node may have any of the following properties:
node.normal; // the next statement reached via normal flow
node.true; // the next statement reached when `node.astNode` evaluates to true
node.false; // the next statement reached when `node.astNode` evaluates to false
node.exception; // the next statement reached when `node.astNode` throws

// additionally, each node has:
node.astNode; // this is the original esprima AST node, either a statement or an expression
node.prev; // an array of predecessor nodes. since they can be more than one
// per type, they are not grouped by type
```

## License

  LGPLv3

