// should handle for-in statements
/*
n0 [label="entry", style="rounded"]
n1 [label="for (var i in {})"]
n2 [label="empty"]
n3 [label="for (i in call())"]
n4 [label="empty"]
n5 [label="exit", style="rounded"]
n0 -> n1 []
n1 -> n2 [label="true"]
n1 -> n3 [label="false"]
n2 -> n1 []
n3 -> n4 [label="true"]
n3 -> n5 [label="false"]
n3 -> n5 [color="red", label="exception"]
n4 -> n3 []
*/
for (var i in {}) {
	empty;
}
for (i in call()) {
	empty;
}
