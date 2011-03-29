.. title:: MochiKit.Iter-ext - Iteration extensions

Name
====

*THIS IS NOT YET AN OFFICIAL MOCHIKIT COMPONENT*

MochiKit.Iter-ext - even more iterators

*Availability*:
    Available in MochiKit 1.5+

Synopsis
========

::

    function length(a) {
        return Math.sqrt(a.x*a.x + a.y*a.y);
    }

    function sub(a, b) {
        return { x: a.x - b.x, y: a.y - b.y };
    }

    var polyline = [{x: 0, y: 0}, {x: 3, y: 0}, {x: 3, y: 4}]; // right triangle

    var perimeter = sum(imap(
        function(pair) { return length(sub(pair[1], pair[0])); }, // could do in two map steps also; pair->segment vector->length
        pairView(polyline, true)
    ));

    assert( perimeter == 3 + 4 + 5 );


Description
===========

Even more iterators. "Closes the gap" to the Python itertools module, http://docs.python.org/library/itertools.html, and then some.

Extends the existing :mochiref:`MochiKit.Iter` namespace


Dependencies
============

- :mochiref:`MochiKit.Base`
- :mochiref:`MochiKit.Iter`


Overview
========

Iterator extensions
------------------------

::

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

    forEach(treeLevelOrder(root, itemgetter('childnodes')), function(node) {
        ....
    });


API Reference
=============

Functions
---------

:mochidef:`pairView(iterable)`:

    Pairwise view of an iterable (overlapping)

    ::

        pairView([a, b, c, d, ...]) --> [ [a,b], [b,c], [c,d], ...]


:mochidef:`treePreOrder(iterable, getChildNodes)`:

    parent->child order (depth-first, preorder). "standard" recursive descent.
    see http://en.wikipedia.org/wiki/Tree_traversal

    ::

        nodes = map(itemgetter('value'), treePreOrder(tree, itemgetter(children))) --> [ 1, 3, 6, 5, 7, 2, 4 ]


:mochidef:`treeLevelOrder(iterable, getChildNodes)`:

    top-down, breadth-first, level-order traversal (parent->siblings order)
    see http://en.wikipedia.org/wiki/Tree_traversal
    useful for searching and culling for example.

    ::

        nodes = map(itemgetter('value'), treeLevelOrder(tree, itemgetter(children))) --> [ 1, 2, 3, 4, 5, 6, 7 ]


:mochidef:`treePostOrder(iterable, getChildNodes)`:

    bottom-up iteration, leaf -> parent
    see http://en.wikipedia.org/wiki/Tree_traversal
    Useful for pruning for example.

    ::

        nodes = map(itemgetter('value'), treePostOrder(tree, itemgetter(children))) --> [ 6, 7, 5, 3, 4, 2, 1 ]


:mochidef:`windowView(iterable, windowSize=2, stepSize=1)`:

    sliding-window iterator, generalized pairView


:mochidef:`filterMap(mapFn, iterable)`:

    convenience in the common(?) case where you need to do a mapping but also discard
    certain elements (when mapFn returns null/undefined)
    i.e if mapFn null/undefined is treated as false


:mochidef:`iflattenArray(root)`:

    iterator vesion of :mochiref:`MochiKit.Base.flattenArray`


:mochidef:`chainFromIter(seq[, getIter])`:

    Resembles Python's ``chain.from_iter``
    one level flattening of a sequence of iterables
    generalized chain (intended for larger volumes, think nodes->values of a tree-structure).
    Can be used to traverse :mochiref:`groupby` sequences: ``indirectChain(groupby([1,1,1,2,2,3,3]), function(v) { return v[1]; })`` -> ``[1,1,1,2,2,3,3]`` i.e an inverse of the groupby)


:mochidef:`uniqueView(iterable[, pred])`:

     filters out adjacent equal elements.
     kindof equivalent to: ``imap(function(v){ return v[0]; }, groupby(iterable))``
     see also http://www.sgi.com/tech/stl/unique.html

     ::

        uniqueView([1, 1, 2, 3, 4, 4, 4]) --> 1, 2, 3, 4


:mochidef:`iproduct(a, b[, ...])`:

    resembles nested loops over the input sequences
    see http://docs.python.org/library/itertools.html#itertools.product

    todo: ! currently only supports two input sequences


:mochidef:`enumerate(sequence[, start=0])`:

    Convenience wrapper for :mochiref:`MochiKit.Iter.izip` and :mochiref:`MochiKit.Iter.count`.
    Returns an iterator over ``[index, sequence{i}]`` pairs.

    ::

        forEach(enumerate(seq), function(i_val) {
            var i = i_val[0], val = i_val[1];
            ...
        });


:mochidef:`breakIt()`:

    Experimental. Equivalent to the ``break`` statement, but for iterator traversal loops.

    (convenience for throwing the :mochiref:`MochiKit.Iter.StopIteration` exception)


:mochidef:`izipLongest(iterables, fillValue=null)`:

    Similar to :mochiref:`MochiKit.Iter.izip` but continues until the longest iterator is
    exhausted, filling missing values with ``fillValue``, default ``null``


:mochidef:`combinations(iterables, r)`:

    Return ``r`` length subsequences of elements from the input iterable.

    Combinations are emitted in lexicographic sort order. So, if the input ``iterable`` is sorted, the
    combination tuples will be produced in sorted order.

    Elements are treated as unique based on their position, not on their value.
    So if the input elements are unique, there will be no repeat values in each combination.

    ::

        combinations([A,B,C,D], 2) --> [A,B], [A,C], [A,D], [B,C], [B,D], [C,D]
        combinations(range(4), 3) --> [0,1,2], [0,1,3], [0,2,3], [1,2,3]


    The number of items returned is ``n! / r! / (n-r)!`` when ``0 <= r <= n`` or zero when ``r > n``.


:mochidef:`combinationsWithReplacement(iterables, r)`:

    Return ``r`` length subsequences of elements from the input ``iterable`` allowing individual elements to be repeated more than once.

    Combinations are emitted in lexicographic sort order. So, if the input ``iterable`` is sorted, the combination tuples will be produced in sorted order.

    Elements are treated as unique based on their position, not on their value. So if the input elements are unique, the generated combinations will also be unique.

    ::

        combinationsWithReplacement([A,B,C], 2) --> [A,A], [A,B], [A,C], [B,B], [B,C], [C,C]


    The number of items returned is ``(n+r-1)! / r! / (n-1)!`` when ``n > 0``.


:mochidef:`permutations(iterables[, r])`:

    Return successive ``r`` length permutations of elements in the ``iterable``.

    If ``r`` is not specified or is undefined, then ``r`` defaults to the length of the ``iterable`` and all possible full-length permutations are generated.

    Permutations are emitted in lexicographic sort order. So, if the input ``iterable`` is sorted, the permutation tuples will be produced in sorted order.

    Elements are treated as unique based on their position, not on their value. So if the input elements are unique, there will be no repeat values in each permutation.


    The number of items returned is ``n! / (n-r)!`` when ``0 <= r <= n`` or zero when ``r > n``.


:mochidef:`compressIter(data, selectors)`:

    Make an iterator that filters elements from ``data`` returning only those that have a
    corresponding element in ``selectors`` that evaluates to ``True``. Stops when either the ``data``
    or ``selectors`` iterables has been exhausted.

    ::

        compress([A,B,C,D,E,F], [1,0,1,0,1,1]) --> A, C, E, F


:mochidef:`interleave(iterable[, ...]))`:

    ::

        interleave([a, b, c], [1, 2, 3], [x, y, z]) --> a, 1, x, b, 2, y, c, 3, z


:mochidef:`advance(iter, n)`:

    Advances iterator ``iter`` ``n`` steps.


:mochidef:`generateN(genFn, n)`:

    Returns iterable equivalent of applying ``genFn()`` ``n`` times.


:mochidef:`any(iterable, func)`:

    Alias for :mochiref:`MochiKit.Iter.some`


:mochidef:`all(iterable, func)`:

    Alias for :mochiref:`MochiKit.Iter.every`


:mochidef:`starmap(fun, seq[, self])`:

    Alias for :mochiref:`MochiKit.Iter.applymap`


:mochidef:`repeatSeq(iterable, n)`:

    Repeats the ``iterable`` sequence ``n`` times.
    Note. this assumes the iterable is Not an iterator, i.e can be restarted (doesn't use auxilary storage as :mochiref:`MochiKit.Iter.cycle()` does)

    ::

        repeatSeq(xrange(3), 3) --> 0, 1, 2, 0, 1, 2, 0, 1, 2

    (osbserve the use of :mochiref:`MochiKit.Iter.xrange()` and not :mochiref:`MochiKit.Iter.range()` above)


:mochidef:`xrange([start,] stop[,step])`:

    Similar to :mochiref:`MochiKit.Iter.range()` but returns an iterable *collection* instead of an *iterator*.
    This enables the range to be re-used multiple times, i.e it won't get exhausted.
    This semantics are identical to Python.

    ::

        r = range(3)
        xr = xrange(3)
        forEach(r, log); --> 0, 1, 2
        forEach(xr, log); --> 0, 1 ,2
        assert( list(r) == [] )
        assert( list(xr) == [0, 1, 2] )


:mochidef:`javaLikeIterator(iterator)`:

	converts the "Java style" ``iterator`` to the JS 1.7 interface.

	see http://download.oracle.com/javase/1.5.0/docs/api/java/util/Iterator.html



Objects
-------

:mochidef:`EmptyIter`:

    Empty iterator object, use as a singleton.


See Also
========

.. [1] The iteration protocol is described in
       PEP 234 - Iterators: http://www.python.org/peps/pep-0234.html
.. [2] Python's itertools
       module: http://docs.python.org/lib/module-itertools.html
.. [3] Iteration in JavaScript: http://bob.pythonmac.org/archives/2005/07/06/iteration-in-javascript/
.. [4] Tree traversal: http://en.wikipedia.org/wiki/Tree_traversal


Authors
=======

- Fredrik Blomqvist <fblomqvist at gmail.com>


Copyright
=========

Copyright 2005-2010 Bob Ippolito <bob@redivi.com>. This program is
dual-licensed free software; you can redistribute it and/or modify it
under the terms of the `MIT License`_ or the `Academic Free License
v2.1`_.

.. _`MIT License`: http://www.opensource.org/licenses/mit-license.php
.. _`Academic Free License v2.1`: http://www.opensource.org/licenses/afl-2.1.php
