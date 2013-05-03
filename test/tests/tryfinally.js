// should handle basic finally
/*
n0 [label="entry"]
n1 [label="intry"]
n2 [label="infinally"]
n3 [label="exit"]
n2 -> n3 [label="normal"]
n1 -> n2 [label="normal"]
n0 -> n1 [label="normal"]
*/
try {
	intry;
} finally {
	infinally;
}
