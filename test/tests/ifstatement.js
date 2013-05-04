// should handle if statements by linking the test expression with true/false branches
/*
n0 [label="entry", style="rounded"]
n1 [label="1"]
n2 [label="statement1"]
n3 [label="exit", style="rounded"]
n4 [label="2"]
n5 [label="statement2"]
n6 [label="3"]
n7 [label="statementelse"]
n0 -> n1 []
n1 -> n2 [label="true"]
n1 -> n4 [label="false"]
n2 -> n3 []
n4 -> n5 [label="true"]
n4 -> n6 [label="false"]
n5 -> n3 []
n6 -> n7 [label="true"]
n6 -> n3 [label="false"]
n7 -> n3 []
*/
if (1) {
	statement1;
} else if (2) {
	statement2;
} else if (3) {
	statementelse;
}
