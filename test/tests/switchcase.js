// should handle switch/case with fallthrough and break
/*
n0 [label="entry"]
n1 [label="case 1:\n        expr1;"]
n2 [label="expr1"]
n3 [label="expr123"]
n4 [label="exit"]
n3 -> n4 [label="normal"]
n2 -> n3 [label="normal"]
n1 -> n2 [label="true"]
n5 [label="case 2:"]
n5 -> n3 [label="true"]
n6 [label="case 3:\n        expr123;\n        break;"]
n6 -> n3 [label="true"]
n7 [label="case 4:"]
n8 [label="expr45d"]
n8 -> n4 [label="normal"]
n7 -> n8 [label="true"]
n9 [label="case 5:"]
n9 -> n8 [label="true"]
n10 [label="default:\n        expr45d;"]
n10 -> n8 [label="normal"]
n9 -> n10 [label="false"]
n7 -> n9 [label="false"]
n6 -> n7 [label="false"]
n5 -> n6 [label="false"]
n1 -> n5 [label="false"]
n0 -> n1 [label="normal"]
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
