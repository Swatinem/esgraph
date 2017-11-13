const esgraph = require('../');
const { parse } = require('espree');
const { readdirSync, readFileSync } = require('fs');

function createTest(dir, file) {
  const contents = readFileSync(dir + file, 'utf8');
  let ast = parse(contents, { comment: true, range: true });
  const { comments } = ast;
  delete ast.comments;
  it(`${comments[0].value.trim()} (${file})`, () => {
    if (ast.body[0].type === 'FunctionDeclaration') ast = ast.body[0].body;
    const cfg = esgraph(ast);
    const expected = comments[1].value.trim();
    const actual = esgraph.dot(cfg, { source: contents }).trim();
    if (actual !== expected) console.log(actual);
    actual.should.eql(expected);
  });
}

describe('esgraph', () => {
  const dir = `${__dirname}/tests/`;
  const files = readdirSync(dir);
  files.forEach((file) => {
    if (/.js$/.test(file)) {
      createTest(dir, file);
    }
  });

  it('should handle long graphs', () => {
    const source = Array(1e4).join('stmt;');
    const ast = parse(source);
    const cfg = esgraph(ast);
    esgraph.dot(cfg);
  });
});

describe('esgraph.dot', () => {
  it('should number the nodes starting at `counter`', () => {
    const out = esgraph.dot(esgraph(parse('var a;')), { counter: 10 });
    out.should.not.containEql('n0');
    out.should.containEql('n10');
  });
});
