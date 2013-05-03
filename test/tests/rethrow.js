// should handle try/catch with rethrow
/*
n0 [label="entry"]
n1 [label="statement"]
n2 [label="throw e;"]
n3 [label="catch (e) {\n    rethrow;\n    throw e;\n}"]
n4 [label="rethrow"]
n5 [label="throw e;"]
n6 [label="exit"]
n5 -> n6 [label="exception"]
n4 -> n5 [label="normal"]
n3 -> n4 [label="normal"]
n2 -> n3 [label="exception"]
n1 -> n2 [label="normal"]
n0 -> n1 [label="normal"]
*/
try {
	statement;
	throw e;
} catch (e) {
	rethrow;
	throw e;
}
