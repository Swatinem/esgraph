// should handle switch/case with fallthrough and break
/*
n0 [label="entry", style="rounded"]
n1 [label="case 1:"]
n2 [label="expr1"]
n3 [label="expr123"]
n4 [label="exit", style="rounded"]
n5 [label="case 2:"]
n6 [label="case 3:"]
n7 [label="case 4:"]
n8 [label="expr45d"]
n9 [label="case 5:"]
n10 [label="default:"]
n0 -> n1 []
n1 -> n2 [label="true"]
n1 -> n5 [label="false"]
n2 -> n3 []
n3 -> n4 []
n5 -> n3 [label="true"]
n5 -> n6 [label="false"]
n6 -> n3 [label="true"]
n6 -> n7 [label="false"]
n7 -> n8 [label="true"]
n7 -> n9 [label="false"]
n8 -> n4 []
n9 -> n8 [label="true"]
n9 -> n10 [label="false"]
n10 -> n8 []
*/

switch (e) {
	case 1:
		expr1;
	case 2:
	case 3:
		expr123;
		break;
	case 4:
	case 5:
	default:
		expr45d;
}
