if (typeof(tests) == 'undefined') { tests = {}; }


tests.test_Examples = function (t) {

	function test_SortedCollection() {
		var sd = new SortedCollection('The quick Brown Fox jumped'.split(' '), methodcaller('toLowerCase'));
		t.eq(sd._keys, ['brown', 'fox', 'jumped', 'quick', 'the']);
		t.eq(sd._items, ['Brown', 'Fox', 'jumped', 'quick', 'The']);

		//assert sd._key == str.lower
		//assert repr(sd) == "SortedCollection(['Brown', 'Fox', 'jumped', 'quick', 'The'], key=lower)"
		sd.setKey(methodcaller('toUpperCase'));
		//assert sd._key == str.upper
		t.ok(sd.length() === 5);
		t.eq(list(reversed(sd)), ['The', 'quick', 'jumped', 'Fox', 'Brown']);

		forEach(sd, function(item) {
			t.ok(sd.contains(item));
		});
		forEach(enumerate(sd), function(i_item) {
			t.ok(i_item[1] == sd.getItem(i_item[0]));
		});
		sd.insert('jUmPeD');
		sd.insertRight('QuIcK');
		t.eq(sd._keys, ['BROWN', 'FOX', 'JUMPED', 'JUMPED', 'QUICK', 'QUICK', 'THE']);
		t.eq(sd._items, ['Brown', 'Fox', 'jUmPeD', 'jumped', 'quick', 'QuIcK', 'The']);
		t.ok(sd.find_le('JUMPED') == 'jumped');
		t.ok(sd.find_ge('JUMPED') == 'jUmPeD');
		t.ok(sd.find_le('GOAT') == 'Fox');
		t.ok(sd.find_ge('GOAT') == 'jUmPeD');
		t.ok(sd.find('FOX') == 'Fox');
		t.ok(sd.getItem(3) == 'jumped');
		t.eq(list(islice(sd, 3, 5)), ['jumped', 'quick']);
		t.ok(sd.getItem(sd.length()-2) == 'QuIcK');
		t.eq(list(sd).slice(sd.length()-4, sd.length()-2), ['jumped', 'quick']);
		forEach(enumerate(sd), function(i_item) {
			t.ok(sd.index(i_item[1]) == i_item[0]);
		});

		t.ok(sd.index('xyzpdq') == -1);
		sd.remove('jumped');
		t.eq(list(sd), ['Brown', 'Fox', 'jUmPeD', 'quick', 'QuIcK', 'The']);
	}
	test_SortedCollection();


	function test_SortedCollection_example() {
		var s = new SortedCollection([], itemgetter(2));
		forEach([
			['roger', 'young', 30],
			['angela', 'jones', 28],
			['bill', 'smith', 22],
			['david', 'thomas', 32]],
			bind(s.insert, s)
		);

		t.eq(list(s), [['bill', 'smith', 22], ['angela', 'jones', 28], ['roger', 'young', 30], ['david', 'thomas', 32]], 'show records sorted by age');

		t.eq(s.find_le(29), ['angela', 'jones', 28], 'find oldest person aged 29 or younger');

		t.eq(s.find_lt(28), ['bill', 'smith', 22], 'find oldest person under 28');
		t.eq(s.find_gt(28), ['roger', 'young', 30], 'find youngest person over 28');

		var r = s.find_ge(32);
		t.ok(s.index(r) === 3, '1. find youngest person aged 32 or older. 2. get the index of their record');
		t.eq(s.getItem(3), ['david', 'thomas', 32], 'fetch the record at that index');

		s.setKey(itemgetter(0));
		t.eq(list(s), [['angela', 'jones', 28], ['bill', 'smith', 22], ['david', 'thomas', 32], ['roger', 'young', 30]], 'now sort by first name');
	}
	test_SortedCollection_example();

	//------------------------------------------

	// todo: verify before converting to tests
	function test_Set() {
		var a = new Set('abracadabra'.split(''));
		var b = new Set('alacazam'.split(''));
		t.ok(a.compare(b) < 0);
		logDebug(repr(a));
		logDebug(repr(b));
		t.eq(map(bind(a.contains, a), 'abcdr'.split('')), [true, true, true, true, true]);
		t.eq(map(bind(a.contains, a), '0ey'.split('')), [false, false, false]);
		logDebug(list(a));
		logDebug(repr(a.union(b)), ':union(a, b)');
		logDebug(repr(b.union(a)), ':union(b, a)');
		logDebug(repr(a.intersection(b)), ':intersection(a, b)');
		logDebug(repr(a.difference(b)), ':difference(a, b)');
		logDebug(repr(b.difference(a)), ':difference(b, a)');
		logDebug(repr(a.symmetricDifference(b)), ':symmetricDifference(a, b)');
		logDebug(repr(b.symmetricDifference(a)), ':symmetricDifference(b, a)');
		t.ok(a.intersection(b).union(a.symmetricDifference(b)).compare(a.union(b)) == 0);
		t.ok(a.intersection(b).intersection(a.symmetricDifference(b)).compare(new Set([])) == 0);
	}
	test_Set();

};
