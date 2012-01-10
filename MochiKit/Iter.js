/***

MochiKit.Iter 1.5

See <http://mochikit.com/> for documentation, downloads, license, etc.

(c) 2005 Bob Ippolito.  All rights Reserved.

***/

if (typeof goog != 'undefined' && typeof goog.provide == 'function') {
	goog.provide('MochiKit.Iter');

	goog.require('MochiKit.Base');
}

MochiKit.Base.module(MochiKit, 'Iter', '1.5', ['Base']);

MochiKit.Base.update(MochiKit.Iter, /** @lends {MochiKit.Iter} */{
    /**
     * @id MochiKit.Iter.registerIteratorFactory
     * @param {string} name
     * @param {!Predicate} check
     * @param {function(*): !Iterator} iterfactory
     * @param {boolean=} [override]
     */
    registerIteratorFactory: function (name, check, iterfactory, /* optional */ override) {
        MochiKit.Iter.iteratorRegistry.register(name, check, iterfactory, override);
    },

    /**
     * @id MochiKit.Iter.isIterable
     * @param {*} o
     * @return {boolean}
     */
    isIterable: function(o) {
        return o != null &&
               (typeof(o.next) == "function" || typeof(o.iter) == "function");
    },

    /**
     * @id MochiKit.Iter.iter
     * @param {!Iterable} iterable
     * @param {*=} [sentinel]
     * @return {!Iterator}
     */
    iter: function (iterable, /* optional */ sentinel) {
        var self = MochiKit.Iter;
        if (arguments.length == 2) {
            return self.takewhile(
                function (a) { return a != sentinel; },
                iterable
            );
        }
        if (typeof(iterable.next) == 'function') {
            return iterable;
        } else if (typeof(iterable.iter) == 'function') {
            return iterable.iter();
        }  else if (typeof(iterable.__iterator__) == 'function') { // todo: could argue this should be either first or last test.. (?)
            return iterable.__iterator__(false); // false should be the default (values)
        }

        try {
            return self.iteratorRegistry.match(iterable);
        } catch (e) {
            var m = MochiKit.Base;
            if (e == m.NotFound) {
                e = new TypeError(typeof(iterable) + ": " + m.repr(iterable) + " is not iterable");
            }
            throw e;
        }
    },

    /**
     * @id MochiKit.Iter.count
     * @param {number=} [n=0]
     * @param {number=} [step=1]
     * @return {!Iterator}
     */
    count: function (n, step/* = 1 */) {
        if (!n) {
            n = 0;
        }
		if (arguments.length < 2)
			step = 1;
        var m = MochiKit.Base;
        return {
            repr: function () { return "count(" + n + ")"; },
            toString: m.forwardCall("repr"),
            next: m.counter(n, step)
        };
    },

    /**
     * @id MochiKit.Iter.cycle
     * todo: add a fast (no mem) path for Array?
     * todo: should indicate the additional memory in the docs
     * @param {!Iterable} p
     * @return {!Iterator}
     */
    cycle: function (p) {
        var self = MochiKit.Iter;
        var m = MochiKit.Base;
        var lst = [];
        var iterator = self.iter(p);
        return {
            repr: function () { return "cycle(...)"; },
            toString: m.forwardCall("repr"),
            next: function () {
                try {
                    var rval = iterator.next();
                    lst.push(rval);
                    return rval;
                } catch (e) {
                    if (e != self.StopIteration) {
                        throw e;
                    }
                    if (lst.length === 0) {
                        this.next = function () {
                            throw self.StopIteration;
                        };
                    } else {
                        var i = -1;
                        this.next = function () {
                            i = (i + 1) % lst.length;
                            return lst[i];
                        };
                    }
                    return this.next();
                }
            }
        };
    },

    /**
     * @id MochiKit.Iter.repeat
     * @param {*} elem
     * @param {number=} [n=infinity]
     * @return {!Iterator}
     */
    repeat: function (elem, /* optional */n) {
        var m = MochiKit.Base;
        if (typeof(n) == 'undefined') {
            return {
                repr: function () {
                    return "repeat(" + m.repr(elem) + ")";
                },
                toString: m.forwardCall("repr"),
                next: function () {
                    return elem;
                }
            };
        }
        return {
            repr: function () {
                return "repeat(" + m.repr(elem) + ", " + n + ")";
            },
            toString: m.forwardCall("repr"),
            next: function () {
                if (n <= 0) {
                    throw MochiKit.Iter.StopIteration;
                }
                n -= 1;
                return elem;
            }
        };
    },

    /**
     * @id MochiKit.Iter.next
     * @param {!Iterator} iterator
     * @return {*}
     */
    next: function (iterator) {
        return iterator.next();
    },

    /**
     * @id MochiKit.Iter.izip
     * @param {!Iterable} p
     * ...
     * @return {!Iterator}
     */
    izip: function (p, q/*, ...*/) {
        var m = MochiKit.Base;
        var self = MochiKit.Iter;
        var next = self.next;
        var iterables = m.map(self.iter, arguments);
        return {
            repr: function () { return "izip(...)"; },
            toString: m.forwardCall("repr"),
            next: function () { return m.map(next, iterables); }
        };
    },

    /**
     * @id MochiKit.Iter.ifilter
     * @param {?Predicate} [pred=truth]
     * @param {!Iterable} seq
     * @return {!Iterator}
     */
    ifilter: function (pred, seq) {
        var m = MochiKit.Base;
        seq = MochiKit.Iter.iter(seq);
        if (pred === null) {
            pred = m.operator.truth;
        }
        return {
            repr: function () { return "ifilter(...)"; },
            toString: m.forwardCall("repr"),
            next: function () {
                while (true) {
                    var rval = seq.next();
                    if (pred(rval)) {
                        return rval;
                    }
                }
                // mozilla warnings aren't too bright
                return undefined;
            }
        };
    },

    /**
     * @id MochiKit.Iter.ifilterfalse
     * @param {?Predicate} [pred=truth]
     * @param {!Iterable} seq
     * @return {!Iterator}
     */
    ifilterfalse: function (pred, seq) {
        var m = MochiKit.Base;
        seq = MochiKit.Iter.iter(seq);
        if (pred === null) {
            pred = m.operator.truth;
        }
        return {
            repr: function () { return "ifilterfalse(...)"; },
            toString: m.forwardCall("repr"),
            next: function () {
                while (true) {
                    var rval = seq.next();
                    if (!pred(rval)) {
                        return rval;
                    }
                }
                // mozilla warnings aren't too bright
                return undefined;
            }
        };
    },

    /**
     * @id MochiKit.Iter.islice
     * @param {!Iterable} seq
     * @param {integer=} start
     * @param {integer=} stop
     * @param {integer=} [step=1]
     * @return {!Iterator}
     */
    islice: function (seq/*, [start,] stop[, step] */) {
        var self = MochiKit.Iter;
        var m = MochiKit.Base;
        seq = self.iter(seq);
        var start = 0;
        var stop = 0;
        var step = 1;
        var i = -1;
        if (arguments.length == 2) {
            stop = arguments[1];
        } else if (arguments.length == 3) {
            start = arguments[1];
            stop = arguments[2];
        } else {
            start = arguments[1];
            stop = arguments[2];
            step = arguments[3];
        }
        return {
            repr: function () {
                return "islice(" + ["...", start, stop, step].join(", ") + ")";
            },
            toString: m.forwardCall("repr"),
            next: function () {
                if (start >= stop) {
                    throw self.StopIteration;
                }

                var rval;
                while (i < start) {
                    rval = seq.next();
                    i++;
                }
                start += step;
                return rval;
            }
        };
    },

    /**
     * @id MochiKit.Iter.imap
     * @param {!Function} fun
     * @param {!Iterable} p
     * ...
     * @return {!Iterator}
     */
    imap: function (fun, p, q/*, ...*/) {
        var m = MochiKit.Base;
        var self = MochiKit.Iter;
        var iterables = m.map(self.iter, m.extend(null, arguments, 1));
        var map = m.map;
        var next = self.next;
        return {
            repr: function () { return "imap(...)"; },
            toString: m.forwardCall("repr"),
            next: function () {
                return fun.apply(this, map(next, iterables));
            }
        };
    },

    /**
	 * side note: in Python this is called 'starmap'.
     * @id MochiKit.Iter.applymap
     * @param {!Function} fun
     * @param {!Iterable} seq
     * @param {*=} [self]
     * @return {!Iterator}
     */
    applymap: function (fun, seq, self) {
        seq = MochiKit.Iter.iter(seq);
        var m = MochiKit.Base;
        return {
            repr: function () { return "applymap(...)"; },
            toString: m.forwardCall("repr"),
            next: function () {
                return fun.apply(self, seq.next());
            }
        };
    },

    /**
     * @id MochiKit.Iter.chain
     * @param {!Iterable} p
     * @param {...!Iterable} [var_args]
     * @return {!Iterator}
     */
    chain: function (p, q/*, ...*/) {
        // dumb fast path
        var self = MochiKit.Iter;
        var m = MochiKit.Base;
        if (arguments.length == 1) {
            return self.iter(arguments[0]);
        }
        var argiter = m.map(self.iter, arguments);
        return {
            repr: function () { return "chain(...)"; },
            toString: m.forwardCall("repr"),
            next: function () {
                while (argiter.length > 1) {
                    try {
                        return argiter[0].next();
                    } catch (e) {
                        if (e != self.StopIteration) {
                            throw e;
                        }
                        argiter.shift();
                    }
                }
                if (argiter.length == 1) {
                    // optimize last element
                    var arg = argiter.shift();
                    this.next = m.bind("next", arg);
                    return this.next();
                }
                throw self.StopIteration;
            }
        };
    },

    /**
     * @id MochiKit.Iter.takewhile
     * @param {!Predicate} pred
     * @param {!Iterable} seq
     * @return {!Iterator}
     */
    takewhile: function (pred, seq) {
        var self = MochiKit.Iter;
        seq = self.iter(seq);
        return {
            repr: function () { return "takewhile(...)"; },
            toString: MochiKit.Base.forwardCall("repr"),
            next: function () {
                var rval = seq.next();
                if (!pred(rval)) {
                    this.next = function () {
                        throw self.StopIteration;
                    };
                    this.next();
                }
                return rval;
            }
        };
    },

    /**
     * @id MochiKit.Iter.dropwhile
     * @param {!Predicate} pred
     * @param {!Iterable} seq
     * @return {!Iterator}
     */
    dropwhile: function (pred, seq) {
        seq = MochiKit.Iter.iter(seq);
        var m = MochiKit.Base;
        var bind = m.bind;
        return {
            "repr": function () { return "dropwhile(...)"; },
            "toString": m.forwardCall("repr"),
            "next": function () {
                while (true) {
                    var rval = seq.next();
                    if (!pred(rval)) {
                        break;
                    }
                }
                this.next = bind("next", seq);
                return rval;
            }
        };
    },

    _tee: function (ident, sync, iterable) {
        sync.pos[ident] = -1;
        var m = MochiKit.Base;
        var listMin = m.listMin;
        return {
            repr: function () { return "tee(" + ident + ", ...)"; },
            toString: m.forwardCall("repr"),
            next: function () {
                var rval;
                var i = sync.pos[ident];

                if (i == sync.max) {
                    rval = iterable.next();
                    sync.deque.push(rval);
                    sync.max += 1;
                    sync.pos[ident] += 1;
                } else {
                    rval = sync.deque[i - sync.min];
                    sync.pos[ident] += 1;
                    if (i == sync.min && listMin(sync.pos) != sync.min) {
                        sync.min += 1;
                        sync.deque.shift();
                    }
                }
                return rval;
            }
        };
    },

    /**
     * @id MochiKit.Iter.tee
     * @param {!Iterable} iterable
     * @param {number=} [n=2]
     * @return {!Array}
     */
    tee: function (iterable, n/* = 2 */) {
        var rval = [];
        var sync = {
            "pos": [],
            "deque": [],
            "max": -1,
            "min": -1
        };
        if (arguments.length == 1 || typeof(n) == "undefined" || n === null) {
            n = 2;
        }
        var self = MochiKit.Iter;
        iterable = self.iter(iterable);
        var _tee = self._tee;
        for (var i = 0; i < n; i++) {
            rval.push(_tee(i, sync, iterable));
        }
        return rval;
    },

    /**
     * @id MochiKit.Iter.list
     * @param {!Iterable} iterable
     * @return {!Array}
     */
    list: function (iterable) {
        // Fast-path for Array and Array-like
        var rval;
        if (iterable instanceof Array) {
            return iterable.slice();
        }
        // this is necessary to avoid a Safari crash
        if (typeof(iterable) == "function" &&
                !(iterable instanceof Function) &&
                typeof(iterable.length) == 'number') {
            rval = [];
            for (var i = 0; i < iterable.length; i++) {
                rval.push(iterable[i]);
            }
            return rval;
        }

        var self = MochiKit.Iter;
        iterable = self.iter(iterable);
        rval = [];
        var a_val;
        try {
            while (true) {
                a_val = iterable.next();
                rval.push(a_val);
            }
        } catch (e) {
            if (e != self.StopIteration) {
                throw e;
            }
            return rval;
        }
        // mozilla warnings aren't too bright
        return undefined;
    },


    /**
     * @id MochiKit.Iter.reduce
     * @param {function(*, *): *} fn
     * @param {!Iterable} iterable
     * @param {*=} [initial]
     * @return {*}
     */
    reduce: function (fn, iterable, /* optional */initial) {
        var x = initial;
        var self = MochiKit.Iter;
        iterable = self.iter(iterable);
        if (arguments.length < 3) {
            try {
                x = iterable.next();
            } catch (e) {
                if (e == self.StopIteration) {
                    e = new TypeError("reduce() of empty sequence with no initial value");
                }
                throw e;
            }
        }
        try {
            while (true) {
                x = fn(x, iterable.next());
            }
        } catch (e) {
            if (e != self.StopIteration) {
                throw e;
            }
        }
        return x;
    },

    /**
     * @id MochiKit.Iter.range
     * @param {number} start interepreted as stop if only one arg is give
     * @param {number=} [stop]
     * @param {number=} [step=1]
     * @return {!Iterator}
     */
    range: function (/* [start,] stop[, step] */) {
        var start = 0;
        var stop = 0;
        var step = 1;
        if (arguments.length == 1) {
            stop = arguments[0];
        } else if (arguments.length == 2) {
            start = arguments[0];
            stop = arguments[1];
        } else if (arguments.length == 3) {
            start = arguments[0];
            stop = arguments[1];
            step = arguments[2];
        } else {
            throw new TypeError("range() takes 1, 2, or 3 arguments!");
        }
        if (step === 0) {
            throw new TypeError("range() step must not be 0");
        }
        return {
            next: function () {
                if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
                    throw MochiKit.Iter.StopIteration;
                }
                var rval = start;
                start += step;
                return rval;
            },
            repr: function () {
                return "range(" + [start, stop, step].join(", ") + ")";
            },
            toString: MochiKit.Base.forwardCall("repr")
        };
    },

    /**
     * @id MochiKit.Iter.sum
     * @param {!Iterable} iterable
     * @param {number=} [start=0]
     * @return {number}
     */
    sum: function (iterable, start/* = 0 */) {
        if (typeof(start) == "undefined" || start === null) {
            start = 0;
        }
        var x = start;
        var self = MochiKit.Iter;
        iterable = self.iter(iterable);
        try {
            while (true) {
                x += iterable.next();
            }
        } catch (e) {
            if (e != self.StopIteration) {
                throw e;
            }
        }
        return x;
    },

    /**
     * @id MochiKit.Iter.exhaust
     * @param {!Iterable} iterable
     */
    exhaust: function (iterable) {
        var self = MochiKit.Iter;
        iterable = self.iter(iterable);
        try {
            while (true) {
                iterable.next();
            }
        } catch (e) {
            if (e != self.StopIteration) {
                throw e;
            }
        }
    },

    /**
     * @id MochiKit.Iter.forEach
     * @param {!Iterable} iterable
     * @param {!Function} func
     * @param {Object=} [obj] context
     */
    forEach: function (iterable, func, /* optional */obj) {
        var m = MochiKit.Base;
        var self = MochiKit.Iter;
        if (arguments.length > 2) {
            func = m.bind(func, obj);
        }
        // fast path for array
        if (m.isArrayLike(iterable) && !self.isIterable(iterable)) {
            try {
                for (var i = 0; i < iterable.length; i++) {
                    func(iterable[i]);
                }
            } catch (e) {
                if (e != self.StopIteration) {
                    throw e;
                }
            }
        } else {
            self.exhaust(self.imap(func, iterable));
        }
		return func; // .. useful? this way you could use the fn as an accumulator (example in EoP suggest this also, but we break ES standard)
    },

    /**
     * @id MochiKit.Iter.every
     * @param {!Iterable} iterable
     * @param {!Predicate} func
     * @return {boolean}
     */
    every: function (iterable, func) {
        var self = MochiKit.Iter;
        try {
            self.ifilterfalse(func, iterable).next();
            return false;
        } catch (e) {
            if (e != self.StopIteration) {
                throw e;
            }
            return true;
        }
    },

    /**
     * @id MochiKit.Iter.sorted
     * @param {!Iterable} iterable
     * @param {Comparator=} [cmp=compare]
     * @return {!Array}
     */
    sorted: function (iterable, /* optional */cmp) {
        var rval = MochiKit.Iter.list(iterable);
        if (arguments.length == 1) {
            cmp = MochiKit.Base.compare;
        }
        rval.sort(cmp);
        return rval;
    },

    /**
     * @id MochiKit.Iter.reversed
     * @param {!Iterable} iterable
     * @return {!Array}
     */
    reversed: function (iterable) {
        var rval = MochiKit.Iter.list(iterable);
        rval.reverse();
        return rval;
    },

    /**
     * @id MochiKit.Iter.some
     * @param {Iterable} iterable
     * @param {!Predicate} func
     * @return {boolean}
     */
    some: function (iterable, func) {
        var self = MochiKit.Iter;
        try {
            self.ifilter(func, iterable).next();
            return true;
        } catch (e) {
            if (e != self.StopIteration) {
                throw e;
            }
            return false;
        }
    },

    /** 
	 * @id MochiKit.Iter.iextend 
	 * @param {!Array} lst
	 * @param {!Iterable} iterable
	 * @param {integer=} [skip=0]
	 * @return {!Array}
	 */
    iextend: function (lst, iterable, /* optional */skip) { // todo: add support for a start pos? similar to Base.extend, resulting in a kindof islice/iextend combo.
		skip = skip || 0;
        var m = MochiKit.Base;
        var self = MochiKit.Iter;
        if (m.isArrayLike(iterable) && !self.isIterable(iterable)) {
            // fast-path for array-like
            for (var i = skip; i < iterable.length; i++) {
                lst.push(iterable[i]);
            }
        } else {
            iterable = self.iter(iterable);
            try {
				while (skip-- > 0) { // == Iter_ext.advance()
					iterable.next();
				}
                while (true) {
                    lst.push(iterable.next());
                }
            } catch (e) {
                if (e != self.StopIteration) {
                    throw e;
                }
            }
        }
        return lst;
    },

    /**
     * @id MochiKit.Iter.groupby
     * @param {!Iterable} iterable
     * @param {Function=} [keyfunc]
     * @return {!Iterator}
     */
    groupby: function(iterable, /* optional */ keyfunc) {
        var m = MochiKit.Base;
        var self = MochiKit.Iter;
        if (arguments.length < 2) {
            keyfunc = m.operator.identity;
        }
        iterable = self.iter(iterable);

        // shared
        var pk = undefined;
        var k = undefined;
        var v;

        function fetch() {
            v = iterable.next();
            k = keyfunc(v);
        }

        function eat() {
            var ret = v;
            v = undefined;
            return ret;
        }

        var first = true;
        var compare = m.compare;
        return {
            repr: function () { return "groupby(...)"; },
            next: function() {
                // iterator-next

                // iterate until meet next group
                while (compare(k, pk) === 0) {
                    fetch();
                    if (first) {
                        first = false;
                        break;
                    }
                }
                pk = k;
                return [k, {
                    next: function() {
                        // subiterator-next
                        if (v == undefined) { // Is there something to eat?
                            fetch();
                        }
                        if (compare(k, pk) !== 0) {
                            throw self.StopIteration;
                        }
                        return eat();
                    }
                }];
            }
        };
    },

    /**
     * @id MochiKit.Iter.groupby_as_array
     * @param {!Iterable} iterable
     * @param {Function=} [keyfunc]
     * @return {!Array}
     */
    groupby_as_array: function (iterable, /* optional */ keyfunc) {
        var m = MochiKit.Base;
        var self = MochiKit.Iter;
        if (arguments.length < 2) {
            keyfunc = m.operator.identity;
        }

        iterable = self.iter(iterable);
        var result = [];
        var first = true;
        var prev_key;
        var compare = m.compare;
        while (true) {
            try {
                var value = iterable.next();
                var key = keyfunc(value);
            } catch (e) {
                if (e == self.StopIteration) {
                    break;
                }
                throw e;
            }
            if (first || compare(key, prev_key) !== 0) {
                var values = [];
                result.push([key, values]);
            }
            values.push(value);
            first = false;
            prev_key = key;
        }
        return result;
    },

    /**
     * @id MochiKit.Iter.arrayLikeIter
     * @param {!ArrayLike} iterable
     * @return {!Iterator}
     */
    arrayLikeIter: function (iterable) {
        var i = 0;
        return {
            repr: function () { return "arrayLikeIter(...)"; },
            toString: MochiKit.Base.forwardCall("repr"),
            next: function () {
                if (i >= iterable.length) {
                    throw MochiKit.Iter.StopIteration;
                }
                return iterable[i++];
            }
        };
    },

    /**
     * @id MochiKit.Iter.hasIterateNext
     * @param {*} iterable
     * @return {boolean}
     */
    hasIterateNext: function (iterable) {
        return (iterable && typeof(iterable.iterateNext) == "function");
    },

    /**
     * @id MochiKit.Iter.iterateNextIter
     * @param {!{iterateNext: !Function}} iterable
     * @return {!Iterator}
     */
    iterateNextIter: function (iterable) {
        return {
            repr: function () { return "iterateNextIter(...)"; },
            toString: MochiKit.Base.forwardCall("repr"),
            next: function () {
                var rval = iterable.iterateNext();
                if (rval === null || rval === undefined) {
                    throw MochiKit.Iter.StopIteration;
                }
                return rval;
            }
        };
    }
});

/** @this MochiKit.Iter */
MochiKit.Iter.__new__ = function () {
    var m = MochiKit.Base;
    // Re-use StopIteration if exists (e.g. SpiderMonkey)
    if (typeof(StopIteration) != "undefined") {
        this.StopIteration = StopIteration;
    } else {
        /** @id MochiKit.Iter.StopIteration */
        this.StopIteration = new m.NamedError("StopIteration");
    }
    this.iteratorRegistry = new m.AdapterRegistry();
    // Register the iterator factory for arrays
    this.registerIteratorFactory(
        "arrayLike",
        m.isArrayLike,
        this.arrayLikeIter
    );

    this.registerIteratorFactory(
        "iterateNext",
        this.hasIterateNext,
        this.iterateNextIter
    );

    m.nameFunctions(this);

};

MochiKit.Iter.__new__();

//
// XXX: Internet Explorer blows
//
if (MochiKit.__export__) {
    reduce = MochiKit.Iter.reduce;
}

MochiKit.Base._exportSymbols(this, MochiKit.Iter);
