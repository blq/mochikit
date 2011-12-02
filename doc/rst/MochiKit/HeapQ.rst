.. title:: MochiKit.HeapQ - Heap queue algorithm

Name
====

*THIS IS NOT YET AN OFFICIAL MOCHIKIT COMPONENT*

MochiKit.HeapQ - Heap queue algorithm

*Availability*:
    Available in MochiKit 1.5+

Synopsis
========

::

    var h = [];
    heapPush(h, [5, 'write code']);
    heapPush(h, [7, 'release product']);
    heapPush(h, [1, 'write spec']);
    heapPush(h, [3, 'create tests']);
    heapPop(h);
    -> [1, 'write spec']



Description
===========

This module provides an implementation of the heap [1]_ queue algorithm, also known as the priority queue algorithm.
Currently this is basically a clone/port of the Python heapq [2]_ module, http://docs.python.org/library/heapq.html


Dependencies
============

- :mochiref:`MochiKit.Base`
- :mochiref:`MochiKit.Iter`


Overview
========

TODO: ...


API Reference
=============

Functions
---------

:mochidef:`heapPush(heap, item[, cmp])`:

    Push the value ``item`` onto the ``heap``, maintaining the heap invariant.


:mochidef:`heapPop(heap[, cmp])`:

    Pop the smallest item off the ``heap``, maintaining the heap invariant.


:mochidef:`heapPushPop(heap, item[, cmp])`:

    Push ``item`` on the ``heap``, then pop and return the smallest item from the heap. The combined action runs more
    efficiently than :mochiref:`heapPush()` followed by a separate call to :mochiref:`heapPop()`.


:mochidef:`heapify(x[, cmp])`:

    Transform array ``x`` into a heap, in-place, in linear time.
    Returns the heap to enable chaining.


:mochidef:`heapReplace(heap, item[, cmp])`:

    Pop and return the smallest item from the heap, and also push the new item. The heap size doesn’t change. If the heap is empty, IndexError is raised.

    This one step operation is more efficient than a :mochiref:`heapPop()` followed by :mochiref:`heapPush()` and can be
    more appropriate when using a fixed-size heap. The pop/push combination always returns an element from the heap and replaces it with item.

    The value returned may be larger than the item added. If that isn’t desired, consider using :mochiref:`heapPushPop()` instead. Its push/pop
    combination returns the smaller of the two values, leaving the larger value on the heap.


:mochidef:`imergeSorted(iterables[, cmp])`:

    Merge multiple sorted inputs into a single sorted output (for example, merge timestamped entries from multiple log files).
    Returns an iterator over the sorted values.

    Similar to ``sorted(chain(iterables))`` but returns an iterable, does not pull the data into memory all at once, and
    assumes that each of the input streams is already sorted (smallest to largest).


:mochidef:`isHeap(lst[, cmp])`:

    Test if the ``lst`` Array fulfills the heap invariant.

    note: Observe that, in contrast to the default cmp in base heap functions, the compare fn must return true for equal elements also.


:mochidef:`nLargest(n, iterable[, cmp])`:

    Return a list with the ``n`` largest elements from the dataset defined by ``iterable``.


:mochidef:`nSmallest(n, iterable[, cmp])`:

    Return a list with the ``n`` smallest elements from the dataset defined by ``iterable``.



See Also
========

.. [1] Heap: http://en.wikipedia.org/wiki/Heap_(data_structure), http://en.wikipedia.org/wiki/Binary_heap
.. [2] Python heapq module: http://docs.python.org/library/heapq.html
.. [3] Priority queue: http://en.wikipedia.org/wiki/Priority_queue


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
