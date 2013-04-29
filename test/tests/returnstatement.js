// should handle returns
/*
n0 [label="entry"]
n1 [label="return a;"]
n2 [label="exit"]
n1 -> n2 [label="normal"]
n0 -> n1 [label="normal"]
*/
function t() {
	return a;
}
