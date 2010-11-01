.. title:: MochiKit.Base-ext - functional programming

Name
====

MochiKit.Base-ext - even more functional programming

*Availability*:
    Available in MochiKit 1.5+

Synopsis
========

::

    function f(x)
    {
        return "f(" + x + ")";
    }

    function g(x)
    {
        return "g(" + x + ")";
    }

    function h(x, y)
    {
        return "h(" + x + ", " + y + ")";
    }

    function k()
    {
        return "k()";
    }

    function test(f)
    {
        return f("x", "y");
    }

    // compose_f_gx
    t.is(test( bind2(f, bind2(g, _1)) ), 'f(g(x))');

    // compose_f_hxy
    t.is(test( bind2(f, bind2(h, _1, _2)) ), 'f(h(x, y))');

    // compose_h_fx_gx
    t.is(test( bind2(h, bind2(f, _1), bind2(g, _1)) ), 'h(f(x), g(x))');

    // compose_h_fx_gy
    t.is(test( bind2(h, bind2(f, _1), bind2(g, _2)) ), 'h(f(x), g(y))');

    // compose_f_k
    t.is(test( bind2(f, bind2(k)) ), 'f(k())');


Description
===========

Even more functional programming


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

    inspired by the C++ boost bind: http://www.boost.org/doc/libs/1_44_0/libs/bind/bind.html

    ::

        bind2(...)


:mochidef:`protect(boundFn)`:

    simple wrapper to mask the fact that a fn is bound.
    to be used in cases where you don't want to evaluate a nested bind
    see http://www.boost.org/doc/libs/1_44_0/libs/bind/bind.html#nested_binds


:mochidef:`apply(fn, a, b, ...)`:

    assumes first arg is a function,
    calls it with the rest of the arguments applied.
    see http://www.boost.org/doc/libs/1_44_0/libs/bind/bind.html#nested_binds


See Also
========

.. [1] C++ Boost bind: http://www.boost.org/doc/libs/1_44_0/libs/bind/bind.html
.. [2] Nested bind: http://www.boost.org/doc/libs/1_44_0/libs/bind/bind.html#nested_binds


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
