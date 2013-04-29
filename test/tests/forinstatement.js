// should handle for-in statements
/*
n0 [label="entry"]
n1 [label="for (var i in {}) {\n    empty;\n}"]
n2 [label="empty;"]
n2 -> n1 [label="normal"]
n1 -> n2 [label="true"]
n3 [label="for (i in call()) {\n    empty;\n}"]
n4 [label="empty;"]
n4 -> n3 [label="normal"]
n3 -> n4 [label="true"]
n5 [label="exit"]
n3 -> n5 [label="false"]
n3 -> n5 [label="exception"]
n1 -> n3 [label="false"]
n0 -> n1 [label="normal"]
*/
for (var i in {}) {
	empty;
}
for (i in call()) {
	empty;
}
