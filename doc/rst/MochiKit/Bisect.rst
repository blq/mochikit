.. title:: MochiKit.Bisect - Array bisection algorithm

Name
====

*THIS IS NOT YET AN OFFICIAL MOCHIKIT COMPONENT*

MochiKit.Bisect - Array bisection algorithm

*Availability*:
    Available in MochiKit 1.5+

Synopsis
========

::

    // Locate the leftmost value exactly equal to x
    function index(a, x) {
        var i = bisectLeft(a, x);
        if (i != a.length && a[i] == x)
            return i;
        return NotFound;
    }

    // Find rightmost value less than x
    function find_lt(a, x) {
        var i = bisectLeft(a, x);
        if (i != 0)
            return a[i-1];
        return NotFound;
    }

    // Find rightmost value less than or equal to x
    function find_le(a, x) {
        var i = bisectRight(a, x);
        if (i != 0)
            return a[i-1];
        return NotFound;
    }

    // Find leftmost value greater than x
    function find_gt(a, x) {
        var i = bisectRight(a, x);
        if (i != a.length)
            return a[i];
        return NotFound;
    }

    // Find leftmost item greater than or equal to x
    function find_ge(a, x) {
        var i = bisectLeft(a, x);
        if (i != a.length)
            return a[i];
        return NotFound;
    }

::

    function grade(score, breakpoints, grades) {
        breakpoints = breakpoints || [60, 70, 80, 90];
        grades = grades || 'FDCBA';

        var i = bisect(breakpoints, score);
        return grades[i];
    }

    >> map(grade, [33, 99, 77, 70, 89, 90, 100]);
        --> ['F', 'A', 'C', 'C', 'B', 'A', 'A']


Description
===========

This module provides support for maintaining a list in sorted order without having to sort the
list after each insertion. For long lists of items with expensive comparison operations, this can
be an improvement over the more common approach. The module is called bisect because it uses
a basic bisection algorithm [1]_ to do its work. The source code may be most useful as a working example
of the algorithm (the boundary conditions are already right!).

Currently this is basically a clone/port of the Python bisect [3]_ module, http://docs.python.org/library/bisect.html


Dependencies
============

- :mochiref:`MochiKit.Base`


Overview
========

ASDF ASDF


API Reference
=============

Functions
---------

:mochidef:`bisectLeft(a, x[, lo=0, hi=a.length])`:

    Locate the insertion point for ``x`` in ``a`` to maintain sorted order. The parameters ``lo`` and ``hi`` may
    be used to specify a subset of the list which should be considered; by default the entire
    list is used. If ``x`` is already present in ``a``, the insertion point will be before (to the left of)
    any existing entries. The return value is suitable for use as the first parameter to ``list.splice()``
    assuming that ``a`` is already sorted.

    The returned insertion point ``i`` partitions the array ``a`` into two halves so that ``all(val < x for val in a[lo:i])``
    for the left side and ``all(val >= x for val in a[i:hi])`` for the right side.


:mochidef:`insortLeft(a, x[, lo=0, hi=a.length])`:

    Insert ``x`` in ``a`` in sorted order. This is equivalent to ``a.splice(bisectLeft(a, x, lo, hi), 0, x)``
    assuming that ``a`` is already sorted. Keep in mind that the ``O(log n)`` search is dominated by the slow ``O(n)`` insertion step.


:mochidef:`bisectRight(a, x[, lo=0, hi=a.length])`:

    Similar to :mochiref:`bisectLeft()`, but returns an insertion point which comes after (to the right of) any existing entries of ``x`` in ``a``.

    The returned insertion point ``i`` partitions the array ``a`` into two halves so that ``all(val <= x for val in a[lo:i])``
    for the left side and ``all(val > x for val in a[i:hi])`` for the right side.

    Also available via the ``bisect`` alias.


:mochidef:`insortRight(a, x[, lo=0, hi=a.length])`:

    Similar to :mochiref:`insortLeft()`, but inserting ``x`` in ``a`` after any existing entries of ``x``.

    Also available via the ``insort`` alias.


See Also
========

.. [1] Bisection method: http://en.wikipedia.org/wiki/Bisection_method
.. [2] Binary search: http://en.wikipedia.org/wiki/Binary_search
.. [3] Python bisect module: http://docs.python.org/library/bisect.html


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
