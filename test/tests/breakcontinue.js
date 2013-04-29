// should handle break and continue for loops
/*
n0 [label="entry"]
n1 [label="t"]
n2 [label="for (i in i) {\n    break;\n}"]
n3 [label="whiletest"]
n4 [label="test"]
n4 -> n4 [label="true"]
n5 [label="for (i in i) {\n    continue;\n}"]
n5 -> n5 [label="true"]
n6 [label="t"]
n7 [label="dotest"]
n7 -> n6 [label="true"]
n8 [label="whiletest"]
n9 [label="t"]
n9 -> n8 [label="true"]
n9 -> n8 [label="false"]
n8 -> n9 [label="true"]
n10 [label="exit"]
n8 -> n10 [label="false"]
n7 -> n8 [label="false"]
n6 -> n7 [label="true"]
n6 -> n7 [label="false"]
n5 -> n6 [label="false"]
n4 -> n5 [label="false"]
n3 -> n4 [label="true"]
n3 -> n4 [label="false"]
n2 -> n3 [label="true"]
n2 -> n3 [label="false"]
n1 -> n2 [label="true"]
n11 [label="update"]
n11 -> n1 [label="normal"]
n1 -> n11 [label="false"]
n0 -> n1 [label="normal"]
*/

for (;; update) {
	if (t)
		break;
}

for (i in i) {
	break;
}

do {
	break;
} while (dotest);

while (whiletest) {
	break;
}

for (; test;) {
	continue;
}

for (i in i) {
	continue;
}

do {
	if (t)
		continue;
} while (dotest);

while (whiletest) {
	if (t)
		continue;
}
