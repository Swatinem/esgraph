// should handle for statements with and without each of the parts
/*
n0 [label="entry"]
n1 [label="test"]
n2 [label="empty"]
n2 -> n1 [label="normal"]
n1 -> n2 [label="true"]
n3 [label="test"]
n4 [label="empty"]
n5 [label="update"]
n5 -> n3 [label="normal"]
n4 -> n5 [label="normal"]
n3 -> n4 [label="true"]
n6 [label="init"]
n7 [label="test"]
n8 [label="empty"]
n9 [label="update"]
n9 -> n7 [label="normal"]
n8 -> n9 [label="normal"]
n7 -> n8 [label="true"]
n10 [label="exit"]
n7 -> n10 [label="false"]
n6 -> n7 [label="normal"]
n3 -> n6 [label="false"]
n1 -> n3 [label="false"]
n0 -> n1 [label="normal"]
*/

for (; test;) {
	empty;
}

for (; test; update) {
	empty;
}

for (init; test; update) {
	empty;
}
