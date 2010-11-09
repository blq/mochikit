if (typeof(tests) == 'undefined') { tests = {}; }


tests.test_Base_ext = function (t) {

	//------ first block exact copy of existing bind tests to verify backwards compatibility

    // test bind
    var not_self = {"toString": function () { return "not self"; } };
    var self = {"toString": function () { return "self"; } };
    var func = function (arg) { return this.toString() + " " + arg; };
    var boundFunc = bind2(func, self);
    not_self.boundFunc = boundFunc;

    t.is( boundFunc("foo"), "self foo", "boundFunc bound to self properly" );
    t.is( not_self.boundFunc("foo"), "self foo", "boundFunc bound to self on another obj" );
    t.is( bind2(boundFunc, not_self)("foo"), "not self foo", "boundFunc successfully rebound!" );
    t.is( bind2(boundFunc, undefined, "foo")(), "self foo", "boundFunc partial no self change" );
    t.is( bind2(boundFunc, not_self, "foo")(), "not self foo", "boundFunc partial self change" );

    // test method
    not_self = {"toString": function () { return "not self"; } };
    self = {"toString": function () { return "self"; } };
    func = function (arg) { return this.toString() + " " + arg; };
    var boundMethod = method2(self, func);
    not_self.boundMethod = boundMethod;

    t.is( boundMethod("foo"), "self foo", "boundMethod bound to self properly" );
    t.is( not_self.boundMethod("foo"), "self foo", "boundMethod bound to self on another obj" );
    t.is( method2(not_self, boundMethod)("foo"), "not self foo", "boundMethod successfully rebound!" );
    t.is( method2(undefined, boundMethod, "foo")(), "self foo", "boundMethod partial no self change" );
    t.is( method2(not_self, boundMethod, "foo")(), "not self foo", "boundMethod partial self change" );

    // test bindLate
    self = {"toString": function () { return "self"; } };
    boundFunc = bindLate2("toString", self);
    t.is( boundFunc(), "self", "bindLate binds properly" );
    self.toString = function () { return "not self"; };
    t.is( boundFunc(), "not self", "bindLate late function lookup" );
    func = function (arg) { return this.toString() + " " + arg; };
    boundFunc = bindLate2(func, self);
    t.is( boundFunc("foo"), "not self foo", "bindLate fallback to standard bind" );

    // test partial application
    var a = [];
    var func = function (a, b) {
        if (arguments.length != 2) {
            return "bad args";
        } else {
            return this.value + a + b;
        }
    };
    var self = {"value": 1, "func": func};
    var self2 = {"value": 2};
    t.is( self.func(2, 3), 6, "setup for test is correct" );
    self.funcTwo = partial2(self.func, 2);
    t.is( self.funcTwo(3), 6, "partial application works" );
    t.is( self.funcTwo(3), 6, "partial application works still" );
    t.is( bind2(self.funcTwo, self2)(3), 7, "rebinding partial works" );
    self.funcTwo = bind2(bind2(self.funcTwo, self2), null);
    t.is( self.funcTwo(3), 6, "re-unbinding partial application works" );

	//----------

	// placeholder arguments and nested bind tests


	//--- example from http://www.boost.org/doc/libs/1_44_0/libs/bind/bind_as_compose.cpp
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
	t.is(test( partial2(f, partial2(g, _1)) ), 'f(g(x))', 'partial2: f(g(x))');

	// compose_f_hxy
	t.is(test( partial2(f, partial2(h, _1, _2)) ), 'f(h(x, y))', 'partial2: f(h(x, y))');

	// compose_h_fx_gx
	t.is(test( partial2(h, partial2(f, _1), partial2(g, _1)) ), 'h(f(x), g(x))', 'partial2: h(f(x), g(x))');

	// compose_h_fx_gy
	t.is(test( partial2(h, partial2(f, _1), partial2(g, _2)) ), 'h(f(x), g(y))', 'partial2: h(f(x), g(y))');

	// compose_f_k
	t.is(test( partial2(f, partial2(k)) ), 'f(k())', 'partial2: f(k())');

	//----same for bind2-------

	// compose_f_gx
	t.is(test( bind2(f, null, bind2(g, null, _1)) ), 'f(g(x))', 'bind2: f(g(x))');

	// compose_f_hxy
	t.is(test( bind2(f, null, bind2(h, null, _1, _2)) ), 'f(h(x, y))', 'bind2: f(h(x, y))');

	// compose_h_fx_gx
	t.is(test( bind2(h, null, bind2(f, null, _1), bind2(g, null, _1)) ), 'h(f(x), g(x))', 'bind2: h(f(x), g(x))');

	// compose_h_fx_gy
	t.is(test( bind2(h, null, bind2(f, null, _1), bind2(g, null, _2)) ), 'h(f(x), g(y))', 'bind2: h(f(x), g(y))');

	// compose_f_k
	t.is(test( bind2(f, null, bind2(k)) ), 'f(k())', 'bind2: f(k())');

	//----------

	t.is(bind2(operator.add)(1, 2), 3);
	t.is(bind2(operator.add, null, _1, 1)(2), 3);

	t.is(partial2(operator.add, _1, 1)(2), 3);

	t.is(bind2(operator.add, null, _1, _2)(1, 2), 3);
	t.is(bind2(operator.add, null, _2, _1)(1, 2), 3);

	t.is(bind2(operator.sub, null, _1, _2)(1, 2), -1);
	t.is(bind2(operator.sub, null, _1, _2)(2, 1), 1);

	t.is( bind2(operator.add, null, _2)(100, 2, 2), 4); // extra args apply

	//--------

	// using mochikit.compose
	var found = MochiKit.Iter.some([{ name: 'Per' }, { name: 'Fredrik' }, { name: 'Bob' }],
		compose(partial(operator.eq, 'Bob'), itemgetter('name'))
	);
	t.ok(found);

	// using partial2
	found = MochiKit.Iter.some([{ name: 'Per' }, { name: 'Fredrik' }, { name: 'Bob' }],
		partial2(operator.eq, 'Bob', partial2(itemgetter('name'), _1))
	);
	t.ok(found);

	found = MochiKit.Iter.some([{ name: 'Per' }, { name: 'Fredrik' }, { name: 'Bob' }],
		bind2(operator.eq, null, 'Bob', bind2(itemgetter('name'), null, _1))
	);
	t.ok(found);

	//------

	// test 'protect'
	function tst(fn, arg) { return fn(arg); };
	t.is(bind2(tst, null, protect(bind2(function(a, b) { return a + b; }, null, '*', _1)), _1)('!'), '*!');

	// test 'apply'
	var m = [ function(a) { return a + '0'; }, function(a) { return a + '1'; } ];
	var n = MochiKit.Base.map(bind2(apply, null, _1, 'X'), m);
	t.eq(n, [ 'X0', 'X1' ]);

	//----

	(function(){

		function f(a, b) {
			return a + b;
		}

		function g(a, b, c) {
			return a + b + c;
		}

		var fb = partial2(f, _1, _2);

		var fbb = partial2(fb, _1, 10);

		t.is(fbb(2), 12, 're-bind');


		// these combose are verified from C++ boost
		t.is( partial2(f, _1, 2)(2), 4);

		t.is( partial2(partial2(f, _1, 2), 3)(), 5);

		t.is( partial2(partial2(f, _1, 2), _2)(3, 13), 15, '_1 slot -> _2 slot. rebinding replaces placeholder slots.');
		t.is( partial2(partial2(partial2(f, _1, 2), _2), 3, 13)(), 15, 'same as above but fully bound');

		t.is( partial2(partial2(f, _1, _1), _2)(1, 3), 6, 'double _1 slots -> single _2 slot');
		t.is( partial2(partial2(partial2(f, _1, _1), _2), 1, 3)(), 6, 'same as above but fully bound');

		t.is( partial2(partial2(f, _2, _2), 123, _1)(1, 3), 2, 'double _2 slots -> single _1 slot');
		t.is( partial2(partial2(partial2(f, _2, _2), 123, _1), 1, 3)(), 2, 'same as above but fully bound');

		t.is( partial2(f, _2, partial2(f, _1, _2))(1, 2), 5);

		t.is( partial2(partial2(f, _2, partial2(f, _1, _2)), 1, 2)(), 5);

		t.is( partial2(partial2(f, _2, partial2(f, _1, _2)), _1, _1)(1, 123), 3, 'also nested binds have their slots replaced');

	})();




};
