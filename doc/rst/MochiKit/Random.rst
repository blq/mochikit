.. title:: MochiKit.Random - Random numbers and algorithms

Name
====

*THIS IS NOT YET AN OFFICIAL MOCHIKIT COMPONENT*

MochiKit.Random - Random numbers and algorithms

*Availability*:
    Available in MochiKit 1.5+

Synopsis
========

::

    var randomData = map(randRange, repeat(2000, 1000)); // -> Array of 1000 elements with random numbers from 0 to 1999


Description
===========

Random numbers and associated algorithms.
The API is largely a subset of the Python random [1]_ module. By default uses the Mersenne Twister [2]_ generator, but
other generators, including the native ``Math.random``, can be used. See source code for details.


Dependencies
============

- :mochiref:`MochiKit.Base`


Overview
========

Random numbers
------------------------



API Reference
=============

Functions
---------

:mochidef:`random()`:

    Return the next random floating point number in the range ``[0.0, 1.0)``.


:mochidef:`seed([x])`:

    Initialize the basic random number generator. If ``x`` is omitted or None, current
    system time is used; current system time is also used to initialize the generator
    when the module is first imported.


:mochidef:`getState()`:

    Return an object capturing the current internal state of the generator. This object can be passed to :mochiref:`setState()` to restore the state.


:mochidef:`setState(state)`:

    ``state`` should have been obtained from a previous call to :mochiref:`getState()`, and :mochiref:`setState()` restores the internal
    state of the generator to what it was at the time :mochiref:`setState()` was called.


:mochidef:`randRange([start=0], stop[, step=1])`:

    Choose a random item from ``range(start, stop[, step])``
    Half-open range, i.e does Not include ``stop``


:mochidef:`choice(seq)`:

    Return a random element from the non-empty sequence ``seq``.


:mochidef:`shuffle(values)`:

    Shuffles an array using the Fisher-Yates algorithm [3]_ (Knuth). ``O(N)``
    (in-place algorithm)

    Returns the shuffled input array to enable chaining.

    (..shuffling an array by sorting using a random comparator is a Bad idea [4]_)


:mochidef:`sample(population, k)`:

    Return a ``k`` length list of unique elements chosen from the ``population`` sequence.
    Used for random sampling without replacement.

    Returns a new list containing elements from the population while
    leaving the original population unchanged.  The resulting list is
    in selection order so that all sub-slices will also be valid random
    samples.  This allows raffle winners (the sample) to be partitioned
    into grand prize and second place winners (the subslices).

    Note: does not support iterator as input, use list(iterable).


:mochidef:`deal(numItems, opt_func)`:

    Generates a unique random range of numbers from ``0..N-1`` (or rather ``f(0)..f(N-1)`` ) (no number occurs twice. think dealing a deck of cards)

    todo: might drop this. equivalent to::

        deal = shuffle(map(func || operator.identity, range(numItems)));


:mochidef:`uniform(a, b)`:

    Return a random floating point number ``N`` such that ``a <= N <= b`` for ``a <= b`` and ``b <= N <= a`` for ``b < a``.
    The end-point value b may or may not be included in the range depending on floating-point rounding in the equation ``a + (b-a) * random()``.



See Also
========

.. [1] Python random module: http://docs.python.org/library/random.html
.. [2] Mersenne Twister 19937: http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/emt.html
.. [3] Fisher-Yates shuffle: http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
.. [4] Microsoft does shuffling: http://www.robweir.com/blog/2010/02/microsoft-random-browser-ballot.html

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
