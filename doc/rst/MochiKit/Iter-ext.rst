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

Even more iterators

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

    convenience in the common(?) case where you need to do a mapping but also discard certain elements (when mapFn returns null/undefined)
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

        uniqueView([1, 1, 2, 3, 4, 4, 4]) --> [1, 2, 3, 4]


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

    Similar to :mochiref:`MochiKit.Iter.izip` but continues until the longest iterator is exhausted, filling missing values with ``fillValue``, default ``null``





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
