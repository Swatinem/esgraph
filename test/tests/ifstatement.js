// should handle if statements by linking the test expression with true/false branches
/*
n0 [label="entry"]
n1 [label="1"]
n2 [label="statement1;"]
n3 [label="exit"]
n2 -> n3 [label="normal"]
n1 -> n2 [label="true"]
n4 [label="2"]
n5 [label="statement2;"]
n5 -> n3 [label="normal"]
n4 -> n5 [label="true"]
n6 [label="3"]
n7 [label="statementelse;"]
n7 -> n3 [label="normal"]
n6 -> n7 [label="true"]
n6 -> n3 [label="false"]
n4 -> n6 [label="false"]
n1 -> n4 [label="false"]
n0 -> n1 [label="normal"]
*/
if (1) {
	statement1;
} else if (2) {
	statement2;
} else if (3) {
	statementelse;
}
