.. title:: MochiKit.Iter-ext - Iteration extensions

Name
====

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
        function(pair) { return length(sub(pair[1], pair[0])); }, // could do in to map steps also; pair->segment vector->length
        pairView(polyline, true)
    ));

    assert( perimeter == 3 + 4 + 5 );


Description
===========

Even more iterators


Dependencies
============

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

    assert(  );


API Reference
=============

Functions
---------

:mochidef:`pairView(iterable)`:

    Pairwise view of an iterable (overlapping)

    ``pairView(iterable)`` -->
    [a, b, c, d, ...] -> [[a,b],[b,c],[c,d], ...], ...


:mochidef:`treePreOrder(iterable, getChildeNodes)`:

    parent->child order (depth-first, preorder). "standard" recursive descent.
    ref <a href="http://en.wikipedia.org/wiki/Tree_traversal">tree traversal</a>

    ::

        nodes = map(itemgetter('value'), treePreOrder(tree, itemgetter(children))) -->
        [ 1, 3, 6, 5, 7, 2, 4 ]


:mochidef:`treeLevelOrder(iterable, getChildeNodes)`:

    top-down, breadth-first, level-order traversal (parent->siblings order)
    ref <a href="http://en.wikipedia.org/wiki/Tree_traversal">tree traversal</a>
    useful for searching and culling for example.

    ::

        nodes = map(itemgetter('value'), treeLevelOrder(tree, itemgetter(children))) -->
        [ 1, 2, 3, 4, 5, 6, 7 ]


:mochidef:`treePostOrder(iterable, getChildeNodes)`:

    bottom-up iteration, leaf -> parent
    ref <a href="http://en.wikipedia.org/wiki/Tree_traversal">tree traversal</a>
    Useful for pruning for example.

    ::

        nodes = map(itemgetter('value'), treePostOrder(tree, itemgetter(children))) -->
        [ 6, 7, 5, 3, 4, 2, 1 ]



See Also
========

.. [1] The iteration protocol is described in
       PEP 234 - Iterators: http://www.python.org/peps/pep-0234.html
.. [2] Python's itertools
       module: http://docs.python.org/lib/module-itertools.html
.. [3] Iteration in JavaScript: http://bob.pythonmac.org/archives/2005/07/06/iteration-in-javascript/


Authors
=======

- Fredrik Blomqvist <fblomqvist at gmail.com>


Copyright
=========

Copyright 2005 Bob Ippolito <bob@redivi.com>. This program is
dual-licensed free software; you can redistribute it and/or modify it
under the terms of the `MIT License`_ or the `Academic Free License
v2.1`_.

.. _`MIT License`: http://www.opensource.org/licenses/mit-license.php
.. _`Academic Free License v2.1`: http://www.opensource.org/licenses/afl-2.1.php
