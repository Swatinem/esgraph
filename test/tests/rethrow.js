// should handle try/catch with rethrow
/*
n0 [label="entry", style="rounded"]
n1 [label="statement"]
n2 [label="throw e;"]
n3 [label="catch (e)"]
n4 [label="rethrow"]
n5 [label="throw e;"]
n6 [label="exit", style="rounded"]
n0 -> n1 []
n1 -> n2 []
n2 -> n3 [color="red", label="exception"]
n3 -> n4 []
n4 -> n5 []
n5 -> n6 [color="red", label="exception"]
*/
try {
	statement;
	throw e;
} catch (e) {
	rethrow;
	throw e;
}
