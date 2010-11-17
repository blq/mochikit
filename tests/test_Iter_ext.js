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

	// run tests
	testTreePreOrderIter();
	testTreeLevelOrderIter();
	testTreePostOrderIter();
	testPairIter();
	testWindowIter();
	// todo: leafParentIter

	//---------

	// copy from test_Base.js
    var flat = list(iflattenArray([1, "2", 3, [4, [5, [6, 7], 8, [], 9]]]));
    var expect = [1, "2", 3, 4, 5, 6, 7, 8, 9];
    t.is( repr(flat), repr(expect), "iflattenArray" );

	t.eq(list(MochiKit.Iter.iflattenArray([ [1], [4,[5]], [],[[[]]],[9], [[4]] ])), [1,4,5,9,4], 'iflattenArray ok');


	t.eq(list(MochiKit.Iter.chainFromIter([ [1], [4,5], [9] ])), [1,4,5,9]);
	t.eq(list(MochiKit.Iter.chainFromIter([ iter([1]), iter([4,5]), [9] ])), [1,4,5,9]);

	t.eq(list(chainFromIter(groupby([1,1,1,2,2,3,3]), function(v) { return v[1]; })), [1,1,1,2,2,3,3], 'indirectChain complements groupby');
	//------

	t.eq( list(uniqueView([1,2,3,4])), [1,2,3,4]);
	t.eq( list(uniqueView([1,1, 2,3,4,4,4])), [1,2,3,4]);
	t.eq( list(uniqueView([1])), [1]);
	t.eq( list(uniqueView([])), []);
	t.eq( list(uniqueView([1,1,1,1])), [1]);

	//----
	t.eq( list(iproduct([1, 2, 3], ['a', 'b'])), [[1, 'a'], [1, 'b'], [2, 'a'], [2, 'b'], [3, 'a'], [3, 'b']], '');

	//---
	t.eq( list( izipLongest([]) ), [], '');
	t.eq( list( izipLongest([ [] ]) ), [], '');
	t.eq( list( izipLongest([ [1] ]) ), [[1]], '');
	t.eq( list( izipLongest([ [1], [2] ]) ), [[1, 2]], '');
	t.eq( list( izipLongest([ [1], [2, 3] ]) ), [[1, 2], [null, 3]], '');

};
