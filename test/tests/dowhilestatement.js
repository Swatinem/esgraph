// should handle do-while loops
/*
n0 [label="entry", style="rounded"]
n1 [label="empty"]
n2 [label="false"]
n3 [label="exit", style="rounded"]
n0 -> n1 []
n1 -> n2 []
n2 -> n1 [label="true"]
n2 -> n3 [label="false"]
*/
do {
	empty;
} while (false);
