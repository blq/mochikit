if (typeof(tests) == 'undefined') { tests = {}; }

tests.test_Text_ext = function (t) {

	t.is(humanStringCompare('10', '2'), 1);
	t.is(humanStringCompare('10', 'asdf'), 1);

	t.is(humanStringCompare('xxx10', 'asdf53'), 1);

	t.eq(['z1.doc', 'z10.doc', 'z17.doc', 'z2.doc', 'z23.doc', 'z3.doc'].sort(humanStringCompare),
		 ['z1.doc', 'z2.doc', 'z3.doc', 'z10.doc', 'z17.doc', 'z23.doc']);
};
