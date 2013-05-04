// should handle function calls and new statements that might throw
/*
n0 [label="entry", style="rounded"]
n1 [label="1 && call()"]
n2 [label="new klass()"]
n3 [label="statement"]
n4 [label="exit", style="rounded"]
n0 -> n1 []
n1 -> n2 []
n1 -> n4 [color="red", label="exception"]
n2 -> n3 []
n2 -> n4 [color="red", label="exception"]
n3 -> n4 []
*/
1 && call();
new klass();
statement;
