// should skip declarations
/*
n0 [label="entry"]
n1 [label="statement1"]
n2 [label="statement2"]
n3 [label="exit"]
n2 -> n3 [label="normal"]
n1 -> n2 [label="normal"]
n0 -> n1 [label="normal"]
*/
statement1;
function f() {}
statement2;
