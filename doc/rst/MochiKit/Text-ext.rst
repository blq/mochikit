.. title:: MochiKit.Text-ext - text processing algorithms

Name
====

MochiKit.Text-ext - various text processing algorithms

*Availability*:
    Available in MochiKit 1.5+

Synopsis
========

::

    todo: ...


Description
===========

Various algorithms dealing with text/strings


Dependencies
============

- :mochiref:`MochiKit.Text`


Overview
========

Text extensions
------------------------

Extends the existing MochiKit.Text namespace

ASDF ASDF ASDF



API Reference
=============

Functions
---------

:mochidef:`levenshteinDistance(s, t, allowTransposition=false)`:

    Computes the Levenshtein distance [1]_ between two strings.

    returns "distance" between the two strings. The larger the number, the bigger the difference.



:mochidef:`humanStringCompare(a, b)`:

    Human friendly string comparator. Makes 'abc9' be sorted *before* 'abc123'.
    Not case sensitive (todo: add optional flag for this?).

    Based on Michael Herf's ``strcmp4humans`` [2]_

    returns -1, 0, +1  (comparator)



See Also
========

.. [1] Levenshtein distance: http://en.wikipedia.org/wiki/Levenshtein_distance
.. [2] Michael Herf's strcmp4humans: http://stereopsis.com/strcmp4humans.html


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
