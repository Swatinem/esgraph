// should handle returns
/*
n0 [label="entry", style="rounded"]
n1 [label="return a;"]
n2 [label="exit", style="rounded"]
n0 -> n1 []
n1 -> n2 []
*/
function t() {
	return a;
}
