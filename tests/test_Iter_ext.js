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


	//----
	t.eq( list(iproduct([1, 2, 3], ['a', 'b'])), [[1, 'a'], [1, 'b'], [2, 'a'], [2, 'b'], [3, 'a'], [3, 'b']], '');

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


};
