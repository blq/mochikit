if (typeof(tests) == 'undefined') { tests = {}; }

tests.test_Iter_ext = function (t) {


	var tree = {
		value: 1,
		children: [
			{
				value: 2,
				children: [
					{
						value: 4,
						children: []
					}
				]
			},
			{
				value: 3,
				children: [
					{
						value: 5,
						children: [
							{
								value: 7,
								children: []
							}
						]
					},
					{
						value: 6,
						children: []
					}
				]
			}
		]
	};

	function getChildNodes(node)
	{
		return MochiKit.Iter.iter(node.children); // wrap in Iterator to verify we handle iterator children
	//	return node.children;
	}


	//----------------------

	function testTreePreOrderIter()
	{
		var nodeValues = MochiKit.Base.map(
			function(node)
			{
				return node.value;
			},
			MochiKit.Iter.treePreOrder(tree, getChildNodes)
		);

	//	logDebug('treePreOrderIter:', nodeValues.join(', '));

		t.is(MochiKit.Base.compare(nodeValues, [ 1, 3, 6, 5, 7, 2, 4 ]), 0, 'treePreOrderIter');
	}
	testTreePreOrderIter();

	function testTreeLevelOrderIter()
	{
		var nodeValues = MochiKit.Base.map(
			function(node)
			{
				return node.value;
			},
			MochiKit.Iter.treeLevelOrder(tree, getChildNodes)
		);

	//	logDebug('treeLevelOrderIter:', nodeValues.join(', '));

		t.is(MochiKit.Base.compare(nodeValues, [ 1, 2, 3, 4, 5, 6, 7 ]), 0, 'treeLevelOrderIter');
	}
	testTreeLevelOrderIter();

	function testTreePostOrderIter()
	{
		var nodeValues = MochiKit.Base.map(
			function(node)
			{
				return node.value;
			},
			MochiKit.Iter.treePostOrder(tree, getChildNodes)
		);

	//	logDebug('treePostOrderIter:', nodeValues.join(', '));

		t.is(MochiKit.Base.compare(nodeValues, [ 6, 7, 5, 3, 4, 2, 1 ]), 0, 'treePostOrderIter');
	}
	testTreePostOrderIter();

	function testPairIter()
	{
		var range = [ 1, 2, 3, 4, 5 ];

		var values = MochiKit.Iter.list(
			MochiKit.Iter.pairView(range)
		);

		t.is(MochiKit.Base.compare(values, [ [1, 2], [2, 3], [3, 4], [4, 5] ]), 0, 'pairView(nonEmpty)');


		var singlePair = MochiKit.Iter.list(
			MochiKit.Iter.pairView([1, 2])
		);

		t.is(MochiKit.Base.compare(singlePair, [ [1, 2] ]), 0, 'pairView(singlePair)');


/*		// todo: hmm, should iteration of ranges with less than 2 elems throw or return empty?
		var empty = [];
		values = MochiKit.Iter.list(
			MochiKit.Iter.pairView(empty)
		);
		t.is(MochiKit.Base.compare(values, []), 0, 'pairIter empty range');
*/
	}
	testPairIter();

	function testWindowIter()
	{
		var range = [ 1, 2, 3, 4, 5 ];

		var values = MochiKit.Iter.list(
			MochiKit.Iter.windowView(range)
		);

		t.is(MochiKit.Base.compare(values, [ [1, 2], [2, 3], [3, 4], [4, 5] ]), 0, 'windowView(nonEmpty)');


		var singlePair = MochiKit.Iter.list(
			MochiKit.Iter.windowView([1, 2])
		);

		t.is(MochiKit.Base.compare(singlePair, [ [1, 2] ]), 0, 'windowView(singlePair)');
	}
	testWindowIter();


	// todo: leafParentIter

	function test_flatten()
	{
		// copy from test_Base.js
		var flat = list(iflattenArray([1, "2", 3, [4, [5, [6, 7], 8, [], 9]]]));
		var expect = [1, "2", 3, 4, 5, 6, 7, 8, 9];
		t.is( repr(flat), repr(expect), "iflattenArray" );

		t.eq(list(MochiKit.Iter.iflattenArray([ [1], [4,[5]], [],[[[]]],[9], [[4]] ])), [1,4,5,9,4], 'iflattenArray ok');
	}
	test_flatten();


	function test_chainFromIter()
	{
		t.eq(list(MochiKit.Iter.chainFromIter([ [1], [4,5], [9] ])), [1,4,5,9]);
		t.eq(list(MochiKit.Iter.chainFromIter([ iter([1]), iter([4,5]), [9] ])), [1,4,5,9]);
		t.eq(list(MochiKit.Iter.chainFromIter([])), []);

		t.eq(list(chainFromIter(groupby([1,1,1,2,2,3,3]), function(v) { return v[1]; })), [1,1,1,2,2,3,3], 'indirectChain complements groupby');
	}
	test_chainFromIter();


	function test_uniqueView()
	{
		t.eq( list(uniqueView([1,2,3,4])), [1,2,3,4]);
		t.eq( list(uniqueView([1,1, 2,3,4,4,4])), [1,2,3,4]);
		t.eq( list(uniqueView([1])), [1]);
		t.eq( list(uniqueView([])), []);
		t.eq( list(uniqueView([1,1,1,1])), [1]);
	}
	test_uniqueView();


	function test_product()
	{
		t.eq( list(iproduct([1, 2, 3], ['a', 'b'])), [[1, 'a'], [1, 'b'], [2, 'a'], [2, 'b'], [3, 'a'], [3, 'b']], '');
		t.eq( list(iproduct([], [])), []);
		t.eq( list(iproduct([])), []);
	}
	test_product();


	function test_izipLongest()
	{
		t.eq( list( izipLongest([]) ), [], '');
		t.eq( list( izipLongest([ [] ]) ), [], '');
		t.eq( list( izipLongest([ [1] ]) ), [[1]], '');
		t.eq( list( izipLongest([ [1], [2] ]) ), [[1, 2]], '');
		t.eq( list( izipLongest([ [1], [2, 3] ]) ), [[1, 2], [null, 3]], '');
	}
	test_izipLongest();


	function test_interleave()
	{
		t.eq(list(interleave([])), []);
		t.eq(list(interleave([1])), [1]);
		t.eq(list(interleave(['a', 'b', 'c'], [1, 2, 3], ['x', 'y', 'z'])), ['a', 1, 'x', 'b', 2, 'y', 'c', 3, 'z']);
	}
	test_interleave();

	function test_compress()
	{
		t.eq(list(compressIter(['A','B','C','D','E','F'], [1,0,1,0,1,1])), ['A','C','E','F']);
        t.eq(list(compressIter(['A','B','C','D','E','F'], [0,0,0,0,0,0])), []);
        t.eq(list(compressIter(['A','B','C','D','E','F'], [1,1,1,1,1,1])), ['A','B','C','D','E','F']);
        t.eq(list(compressIter(['A','B','C','D','E','F'], [1,0,1])), ['A','C']);
        t.eq(list(compressIter(['A','B','C'], [0,1,1,1,1,1])), ['B','C']);

        var n = 1000;
        var data = chainFromIter(repeat(list(range(6)), n));
		//var data = chainFromIter(repeat(xrange(6), n));
        var selectors = chainFromIter(repeat([0, 1]));
		t.eq(list(compressIter(data, selectors)), list(repeatSeq([1,3,5], n)));
	}
	test_compress();


	function test_combinations()
	{
		t.eq(list(combinations(['A','B','C','D'], 2)), [['A','B'], ['A','C'], ['A','D'], ['B','C'], ['B','D'], ['C','D']]);
        t.eq(list(combinations(range(4), 3)), [[0,1,2], [0,1,3], [0,2,3], [1,2,3]]);
	}
	test_combinations();

	function test_combinationsWithReplacement()
	{
        function numcombs(n, r)
		{
            if (n == 0) {
				if (r != 0)
					return 0;
				return 1;
            }
          // todo:  return fact(n+r-1) / fact(r) / fact(n-1); // floor divs
		}

		var cwr = combinationsWithReplacement;

		t.eq(list(cwr(['A','B','C'], 2)), [['A','A'], ['A','B'], ['A','C'], ['B','B'], ['B','C'], ['C','C']]);
/* // todo: ..
		for (var n = 0; n < 7; ++n) {
			var values = map(function(x) { return 5*x-12; }, range(n));
			for (var r = 0; r < n + 2; ++r) {
				var result = list(cwr(values, r));

				t.eq(result.length, numcombs(n, r));           			// right number of combs
			//todo:	self.assertEqual(result.length, len(set(result)))         // no repeats
				t.eq(result, sorted(result));   	             // lexicographic order

				var regular_combs = list(combinations(values, r));           // compare to combs without replacement
				if (n == 0 || r <= 1)
					t.eq(result, regular_combs);            // cases that should be identical
			//	else
			// todo: self.assertTrue(set(result) >= set(regular_combs))  // rest should be supersets of regular combs

				for (c in result) {
					t.eq(c.length, r);                       // r-length combinations
					var noruns = [k for k,v in groupby(c)]                  // combo without consecutive repeats
				//	self.assertEqual(noruns.length, len(set(noruns)))     // no repeats other than consecutive
					t.eq(list(c), sorted(c));                // keep original ordering
					self.assertTrue(all(e in values for e in c))        // elements taken from input iterable
					self.assertEqual(noruns, [e for e in values if e in c])     // comb is a subsequence of the input iterable
				}
				t.eq(result, list(cwr(values, r)));
			}
		}
*/
	}
	test_combinationsWithReplacement();


	function test_permutations()
	{
		// todo: more tests..
		t.eq(list(permutations([])), [[]]);
		t.eq(list(permutations([], 10)), []);
		t.eq(list(permutations([1,2,3], 32)), []);  // r > n
		t.eq(list(permutations(range(3), 2)), [[0,1], [0,2], [1,0], [1,2], [2,0], [2,1]]);
	}
	test_permutations();


	function test_javaLikeIter()
	{
		function dummyJavaIterator(data)
		{
			var _data = data;
			var index = 0;

			return {
				hasNext: function() {
					return index < _data.length;
				},
				next: function() {
					return _data[index++];
				}
			};
		}

		var lst = [1, 2, 3, 4, 5];
		t.eq(list(javaLikeIterator(dummyJavaIterator(lst))), [1, 2, 3, 4, 5], "javaLikeIterator ok");
	}
	test_javaLikeIter();


	function test_countValue() {
		var lst = [1, 0, 0, 1, 1, 0, 0, 1];

		t.eq(countValue(lst, 1), 4, "countValue ok");
	}
	test_countValue();


	function test_limit() {
		var lst = [1, 2, 3, 4, 5, 6, 7, 8];

		t.eq(list(limit(lst, 5)), [1, 2, 3, 4, 5], "limit iterator ok");
	}
	test_limit();


	function test_accumulate() {
		var lst = [1, 2, 3, 4, 5];

		t.eq(list(accumulate(lst)), [1, 3, 6, 10, 15], "accumulate iterator ok");
	}
	test_accumulate();


	function test_pluck() {
		var items = [{ p: 1 }, { p: 2 }, { p: 3 }, { p: 4 }];

		t.eq(list(pluck(items, 'p')), [1, 2, 3, 4], "pluck iterator ok");
	}
	test_pluck();


	function test_zipWith() {
		var sum = MochiKit.Iter.zipWith(MochiKit.Base.operator.add, [1, 2, 3], [3, 2, 1, 0]);
		t.eq(list(sum), [4, 4, 4], 'zipWith iterator ok');
	}
	test_zipWith();


};
