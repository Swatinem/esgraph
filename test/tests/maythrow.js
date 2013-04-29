// should handle function calls and new statements that might throw
/*
n0 [label="entry"]
n1 [label="1 && call();"]
n2 [label="new klass();"]
n3 [label="statement;"]
n4 [label="exit"]
n3 -> n4 [label="normal"]
n2 -> n3 [label="normal"]
n2 -> n4 [label="exception"]
n1 -> n2 [label="normal"]
n1 -> n4 [label="exception"]
n0 -> n1 [label="normal"]
*/
1 && call();
new klass();
statement;
