// should handle do-while loops
/*
n0 [label="entry"]
n1 [label="empty"]
n2 [label="false"]
n2 -> n1 [label="true"]
n3 [label="exit"]
n2 -> n3 [label="false"]
n1 -> n2 [label="normal"]
n0 -> n1 [label="normal"]
*/
do {
	empty;
} while (false);
