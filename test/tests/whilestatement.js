// should handle while loops
/*
n0 [label="entry", style="rounded"]
n1 [label="true"]
n2 [label="empty"]
n3 [label="exit", style="rounded"]
n0 -> n1 []
n1 -> n2 [label="true"]
n1 -> n3 [label="false"]
n2 -> n1 []
*/
while (true) {
	empty;
}
