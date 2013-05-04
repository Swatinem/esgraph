// should handle basic blocks and basic statements
/*
n0 [label="entry", style="rounded"]
n1 [label="statement1"]
n2 [label="function () {}"]
n3 [label="a = 1 + 2"]
n4 [label="block"]
n5 [label="exit", style="rounded"]
n0 -> n1 []
n1 -> n2 []
n2 -> n3 []
n3 -> n4 []
n3 -> n5 [color="red", label="exception"]
n4 -> n5 []
*/

statement1;
;
(function () {});
a = 1 + 2;
{
	block;
}
