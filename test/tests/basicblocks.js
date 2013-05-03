// should handle basic blocks and basic statements
/*
n0 [label="entry"]
n1 [label="statement1"]
n2 [label="function () {}"]
n3 [label="a = 1 + 2"]
n4 [label="block"]
n5 [label="exit"]
n4 -> n5 [label="normal"]
n3 -> n4 [label="normal"]
n3 -> n5 [label="exception"]
n2 -> n3 [label="normal"]
n1 -> n2 [label="normal"]
n0 -> n1 [label="normal"]
*/

statement1;
;
(function () {});
a = 1 + 2;
{
	block;
}
