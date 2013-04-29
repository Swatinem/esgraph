// should handle while loops
/*
n0 [label="entry"]
n1 [label="true"]
n2 [label="empty;"]
n2 -> n1 [label="normal"]
n1 -> n2 [label="true"]
n3 [label="exit"]
n1 -> n3 [label="false"]
n0 -> n1 [label="normal"]
*/
while (true) {
	empty;
}
