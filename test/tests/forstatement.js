// should handle for statements with and without each of the parts
/*
n0 [label="entry", style="rounded"]
n1 [label="test"]
n2 [label="empty"]
n3 [label="test"]
n4 [label="empty"]
n5 [label="update"]
n6 [label="init"]
n7 [label="test"]
n8 [label="empty"]
n9 [label="update"]
n10 [label="exit", style="rounded"]
n0 -> n1 []
n1 -> n2 [label="true"]
n1 -> n3 [label="false"]
n2 -> n1 []
n3 -> n4 [label="true"]
n3 -> n6 [label="false"]
n4 -> n5 []
n5 -> n3 []
n6 -> n7 []
n7 -> n8 [label="true"]
n7 -> n10 [label="false"]
n8 -> n9 []
n9 -> n7 []
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
