.. title:: MochiKit.Base-ext - functional programming

Name
====

*THIS IS NOT YET AN OFFICIAL MOCHIKIT COMPONENT*

MochiKit.Base-ext - even more functional programming

*Availability*:
    Available in MochiKit 1.5+

Synopsis
========

::

    function f(x) {
        return "f(" + x + ")";
    }

    function g(x) {
        return "g(" + x + ")";
    }

    function h(x, y) {
        return "h(" + x + ", " + y + ")";
    }

    function k() {
        return "k()";
    }

    function test(f) {
        return f("x", "y");
    }

    // compose_f_gx
    t.is(test( partial2(f, partial2(g, _1)) ), 'f(g(x))');

    // compose_f_hxy
    t.is(test( partial2(f, partial2(h, _1, _2)) ), 'f(h(x, y))');

    // compose_h_fx_gx
    t.is(test( partial2(h, partial2(f, _1), partial2(g, _1)) ), 'h(f(x), g(x))');

    // compose_h_fx_gy
    t.is(test( partial2(h, partial2(f, _1), partial2(g, _2)) ), 'h(f(x), g(y))');

    // compose_f_k
    t.is(test( partial2(f, partial2(k)) ), 'f(k())');


Description
===========

Even more functional programming

Extends the existing MochiKit.Base namespace


Dependencies
============

- :mochiref:`MochiKit.Base`


Overview
========

Base extensions
------------------------

"bind 2.0"



API Reference
=============

Functions
---------

:mochidef:`bind2(fn, self, a, b, ...)`:

    "Bind 2.0".

    Apart from the functionality offered by :mochiref:`bind`, :mochiref:`bind2` also supports
    binding with placeholder arguments, inspired by the C++ Boost bind [1]_.

    ::

        bind(f, _2, _1)(x, y);                 // f(y, x)
        bind(g, _1, 9, _1)(x);                 // g(x, 9, x)
        bind(g, _3, _3, _3)(x, y, z);          // g(z, z, z)
        bind(g, _1, _1, _1)(x, y, z);          // g(x, x, x)


    Furthermore it allows nested binds [2]_
    This enables in-order function composition, as opposed to the RTL order of :mochiref:`compose`

    ::

        bind(f, _2, bind(g, _1))(x, y);         // f(y, g(x))



:mochidef:`bindLate2(func, self[, arg, ...])`:

    a version of :mochiref:`bindLate` that handles placeholders (based on :mochiref:`bind2`)


:mochidef:`method2(self, func, ...)`:

    a version of :mochiref:`method` that handles placeholders (based on :mochiref:`bind2`)


:mochidef:`partial2(func, arg[, ...])`:

    a version of :mochiref:`partial` that handles placeholders (based on :mochiref:`bind2`)


:mochidef:`protect(boundFn)`:

    Simple wrapper to mask the fact that ``boundFn`` is bound.

    Typically to be used in cases where you don't want a nested bind to be evaluated.


:mochidef:`apply(fn, a, b, ...)`:

    assumes first arg is a function, calls it with the rest of the arguments applied.

    note: might change name of this fn..

    ::

        var lst = [ function(a) { return a + '0'; }, function(a) { return a + '1'; } ];
    	MochiKit.Base.map(bind2(apply, null, _1, 'X'), m); -> [ 'X0', 'X1' ]



See Also
========

.. [1] C++ Boost bind: http://www.boost.org/doc/libs/1_46_0/libs/bind/bind.html
.. [2] Nested bind: http://www.boost.org/doc/libs/1_46_0/libs/bind/bind.html#nested_binds


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
