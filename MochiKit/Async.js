/***

MochiKit.Async 1.5

See <http://mochikit.com/> for documentation, downloads, license, etc.

(c) 2005 Bob Ippolito.  All rights Reserved.

***/

if (typeof goog != 'undefined' && typeof goog.provide == 'function') {
	goog.provide('MochiKit.Async');

	goog.require('MochiKit.Base');
}

MochiKit.Base.module(MochiKit, 'Async', '1.5', ['Base']);

/**
 * @id MochiKit.Async.Deferred
 * @see http://mochikit.com/doc/html/MochiKit/Async.html#fn-deferred
 * @param {Function=} [canceller]
 * @constructor
 */
MochiKit.Async.Deferred = function (/* optional */ canceller) {
    this.chain = [];
    this.id = this._nextId();
    this.fired = -1;
    this.paused = 0;
    this.results = [null, null];
    this.canceller = canceller;
    this.silentlyCancelled = false;
    this.chained = false;
    this.finalized = false;
};

/**
 * @id MochiKit.Async.Deferred.prototype.repr
 * @return {string}
 */
MochiKit.Async.Deferred.prototype.repr = function () {
	return 'Deferred(' + this.id + ', ' + this.state() + ')';
};

/**
 * @return {string}
 */
MochiKit.Async.Deferred.prototype.toString = MochiKit.Base.forwardCall("repr");

/**
 * @return {integer}
 */
MochiKit.Async.Deferred.prototype._nextId = MochiKit.Base.counter();

/**
 * @id MochiKit.Async.Deferred.prototype.state
 * @return {string}
 */
MochiKit.Async.Deferred.prototype.state = function () {
	if (this.fired == -1) {
		return 'unfired';
	} else if (this.fired === 0) {
		return 'success';
	} else {
		return 'error';
	}
};

/**
 * @id MochiKit.Async.Deferred.prototype.cancel
 * @param {*=} [e]
 */
MochiKit.Async.Deferred.prototype.cancel = function (e) {
	var self = MochiKit.Async;
	if (this.fired == -1) {
		if (this.canceller) {
			this.canceller(this);
		} else {
			this.silentlyCancelled = true;
		}
		if (this.fired == -1) {
			if (typeof(e) === 'string') {
				e = new self.GenericError(e);
			} else if (!(e instanceof Error)) {
				e = new self.CancelledError(this);
			}
			this.errback(e);
		}
	} else if ((this.fired === 0) && (this.results[0] instanceof self.Deferred)) {
		this.results[0].cancel(e);
	}
};

/** @private */
MochiKit.Async.Deferred.prototype._resback = function (res) {
	/***

	The primitive that means either callback or errback

	***/
	this.fired = ((res instanceof Error) ? 1 : 0);
	this.results[this.fired] = res;
	if (this.paused === 0) {
		this._fire();
	}
};

/** @private */
MochiKit.Async.Deferred.prototype._check = function () {
	if (this.fired != -1) {
		if (!this.silentlyCancelled) {
			throw new MochiKit.Async.AlreadyCalledError(this);
		}
		this.silentlyCancelled = false;
	}
};

/**
 * @id MochiKit.Async.Deferred.prototype.callback
 * @param {*=} res
 */
MochiKit.Async.Deferred.prototype.callback = function (res) {
	this._check();
	if (res instanceof MochiKit.Async.Deferred) {
		throw new Error("Deferred instances can only be chained if they are the result of a callback");
	}
	this._resback(res);
};

/**
 * @id MochiKit.Async.Deferred.prototype.errback
 * @param {*=} res
 */
MochiKit.Async.Deferred.prototype.errback = function (res) {
	this._check();
	var self = MochiKit.Async;
	if (res instanceof self.Deferred) {
		throw new Error("Deferred instances can only be chained if they are the result of a callback");
	}
	if (!(res instanceof Error)) {
		res = new self.GenericError(res);
	}
	this._resback(res);
};

/**
 * @id MochiKit.Async.Deferred.prototype.addBoth
 * @param {?Function} fn
 * @param {...*} [var_args] arguments that will be partially applied to fn
 * @return {!MochiKit.Async.Deferred} (this, chain)
 */
MochiKit.Async.Deferred.prototype.addBoth = function (fn, var_args) {
	if (arguments.length > 1) {
		fn = MochiKit.Base.partial.apply(null, arguments);
	}
	return this.addCallbacks(fn, fn);
};

/**
 * @id MochiKit.Async.Deferred.prototype.addCallback
 * @param {?Function} fn
 * @param {...*} [var_args] arguments that will be partially applied to fn
 * @return {!MochiKit.Async.Deferred} (this, chain)
 */
MochiKit.Async.Deferred.prototype.addCallback = function (fn, var_args) {
	if (arguments.length > 1) {
		fn = MochiKit.Base.partial.apply(null, arguments);
	}
	return this.addCallbacks(fn, null);
};

/**
 * @id MochiKit.Async.Deferred.prototype.addErrback
 * @param {?Function} fn
 * @param {...*} [var_args] arguments that will be partially applied to fn
 * @return {!MochiKit.Async.Deferred} (this, chain)
 */
MochiKit.Async.Deferred.prototype.addErrback = function (fn, var_args) {
	if (arguments.length > 1) {
		fn = MochiKit.Base.partial.apply(null, arguments);
	}
	return this.addCallbacks(null, fn);
};

/**
 * @id MochiKit.Async.Deferred.prototype.addCallbacks
 * pass null as cb/eb to set "don't care"
 * @param {?Function} cb
 * @param {?Function} eb
 * @return {!MochiKit.Async.Deferred} (this, chain)
 */
MochiKit.Async.Deferred.prototype.addCallbacks = function (cb, eb) {
	if (this.chained) {
		throw new Error("Chained Deferreds can not be re-used");
	}
	if (this.finalized) {
		throw new Error("Finalized Deferreds can not be re-used");
	}
	this.chain.push([cb, eb]);
	if (this.fired >= 0) {
		this._fire();
	}
	return this;
};

/** @id MochiKit.Async.Deferred.prototype.setFinalizer */
MochiKit.Async.Deferred.prototype.setFinalizer = function (fn) {
	if (this.chained) {
		throw new Error("Chained Deferreds can not be re-used");
	}
	if (this.finalized) {
		throw new Error("Finalized Deferreds can not be re-used");
	}
	if (arguments.length > 1) {
		fn = MochiKit.Base.partial.apply(null, arguments);
	}
	this._finalizer = fn;
	if (this.fired >= 0) {
		this._fire();
	}
	return this;
};

/** @private */
MochiKit.Async.Deferred.prototype._fire = function () {
	/***

	Used internally to exhaust the callback sequence when a result
	is available.

	***/
	var chain = this.chain;
	var fired = this.fired;
	var res = this.results[fired];
	var self = this;
	var cb = null;
	while (chain.length > 0 && this.paused === 0) {
		// Array
		var pair = chain.shift();
		var f = pair[fired];
		if (f === null) { // todo: allow undefined? i.e use "=="?
			continue;
		}
		try {
			var ret = f(res);
			// test patch based on goog.Deferred port and Dojo logic, I'd also say this is more intuitive..
			if (ret !== undefined) { // If no result, then use previous result.
				res = ret;
			}
			fired = ((res instanceof Error) ? 1 : 0);
			if (res instanceof MochiKit.Async.Deferred) {
				cb = function (res) {
					self.paused--;
					self._resback(res);
				};
				this.paused++;
			}
		} catch (err) {
			fired = 1;
			if (!(err instanceof Error)) {
				err = new MochiKit.Async.GenericError(err);
			}
			res = err;
		}
	}
	this.fired = fired;
	this.results[fired] = res;
	if (this.chain.length == 0 && this.paused === 0 && this._finalizer) {
		this.finalized = true;
		this._finalizer(res);
	}
	if (cb && this.paused) {
		// this is for "tail recursion" in case the dependent deferred
		// is already fired
		res.addBoth(cb);
		res.chained = true;
	}
};


/** @id MochiKit.Async.evalJSONRequest */
MochiKit.Async.evalJSONRequest = function (req) {
	return MochiKit.Base.evalJSON(req.responseText);
};

/**
 * @id MochiKit.Async.succeed
 * @param {*=} [result]
 * @return {!MochiKit.Async.Deferred} (this, chain)
 */
MochiKit.Async.succeed = function (/* optional */result) {
	var d = new MochiKit.Async.Deferred();
	d.callback.apply(d, arguments);
	return d;
};

/**
 * @id MochiKit.Async.fail
 * @param {*=} [result]
 * @return {!MochiKit.Async.Deferred} (this, chain)
 */
MochiKit.Async.fail = function (/* optional */result) {
	var d = new MochiKit.Async.Deferred();
	d.errback.apply(d, arguments);
	return d;
};

/**
 * @id MochiKit.Async.getXMLHttpRequest
 * @return {!XMLHttpRequest}
 * @throws {MochiKit.Async.BrowserComplianceError} if not supported
 */
MochiKit.Async.getXMLHttpRequest = function () {
	var self = arguments.callee;
	if (!self.XMLHttpRequest) {
		var tryThese = [
			function () { return new XMLHttpRequest(); },
			function () { return new ActiveXObject('Msxml2.XMLHTTP'); },
			function () { return new ActiveXObject('Microsoft.XMLHTTP'); },
			function () { return new ActiveXObject('Msxml2.XMLHTTP.4.0'); },
			function () {
				throw new MochiKit.Async.BrowserComplianceError("Browser does not support XMLHttpRequest");
			}
		];
		for (var i = 0; i < tryThese.length; i++) {
			var func = tryThese[i];
			try {
				self.XMLHttpRequest = func;
				return func();
			} catch (e) {
				// pass
			}
		}
	}
	return self.XMLHttpRequest();
};

/**
 * @this {XMLHttpRequest}
 * @private
 */
MochiKit.Async._xhr_onreadystatechange = function (d) {
	// MochiKit.Logging.logDebug('this.readyState', this.readyState);
	var m = MochiKit.Base;
	if (this.readyState == 4) {
		// IE SUCKS
		try {
			this.onreadystatechange = null;
		} catch (e) {
			try {
				this.onreadystatechange = m.noop;
			} catch (e2) {
			}
		}
		var status = null;
		try {
			status = this.status;
            if (!status && (this.response || m.isNotEmpty(this.responseText))) {
				// 0 or undefined seems to mean cached or local
				status = 304;
			}
		} catch (e) {
			// pass
			// MochiKit.Logging.logDebug('error getting status?', repr(items(e)));
		}
		// 200 is OK, 201 is CREATED, 204 is NO CONTENT
		// 304 is NOT MODIFIED, 1223 is apparently a bug in IE
		if (status == 200 || status == 201 || status == 204 ||
				status == 304 || status == 1223) {
			d.callback(this);
		} else {
			var err = new MochiKit.Async.XMLHttpRequestError(this, "Request failed");
			if (err.number) {
				// XXX: This seems to happen on page change
				d.errback(err);
			} else {
				// XXX: this seems to happen when the server is unreachable
				d.errback(err);
			}
		}
	}
};

/** @private */
MochiKit.Async._xhr_canceller = function (req) {
	// IE SUCKS
	try {
		req.onreadystatechange = null;
	} catch (e) {
		try {
			req.onreadystatechange = MochiKit.Base.noop;
		} catch (e2) {
		}
	}
	req.abort();
};


/**
 * @id MochiKit.Async.sendXMLHttpRequest
 * @param {!XMLHttpRequest} req
 * @param {string=} [sendContent]
 * @return {!MochiKit.Async.Deferred}
 */
MochiKit.Async.sendXMLHttpRequest = function (req, /* optional */ sendContent) {
	if (typeof(sendContent) == "undefined" || sendContent === null) {
		sendContent = "";
	}

	var m = MochiKit.Base;
	var self = MochiKit.Async;
	var d = new self.Deferred(m.partial(self._xhr_canceller, req));

	try {
		req.onreadystatechange = m.bind(self._xhr_onreadystatechange, req, d);
		req.send(sendContent);
	} catch (e) {
		try {
			req.onreadystatechange = null;
		} catch (ignore) {
			// pass
		}
		d.errback(e);
	}

	return d;
};

/**
 * @id MochiKit.Async.doXHR
 * @param {string} url
 * @param {Object=} [opts]
 * @return {!MochiKit.Async.Deferred}
 */
MochiKit.Async.doXHR = function (url, opts) {
	var m = MochiKit.Base;
	opts = m.update({
		method: 'GET',
		sendContent: ''
		/*
		queryString: undefined,
		username: undefined,
		password: undefined,
		headers: undefined,
		mimeType: undefined,
		responseType: undefined,
		withCredentials: undefined
		*/
		, async: true // test to enable synchronous requests (for window.onunload state-saving)
	}, opts);
	var self = MochiKit.Async;
	var req = self.getXMLHttpRequest();
	if (opts.queryString) {
		var qs = m.queryString(opts.queryString);
		if (qs) {
			url += "?" + qs;
		}
	}
	// Safari will send undefined:undefined, so we have to check.
	// We can't use apply, since the function is native.
	if ('username' in opts) {
		req.open(opts.method, url, opts.async, opts.username, opts.password);
	} else {
		req.open(opts.method, url, opts.async);
	}
	if (req.overrideMimeType && opts.mimeType) {
		req.overrideMimeType(opts.mimeType);
	}
	req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
	if (opts.headers) {
		var headers = opts.headers;
		if (!m.isArrayLike(headers)) {
			headers = m.items(headers);
		}
		for (var i = 0; i < headers.length; i++) {
			var header = headers[i];
			var name = header[0];
			var value = header[1];
			req.setRequestHeader(name, value);
		}
    }
    if ("responseType" in opts && "responseType" in req) {
        req.responseType = opts.responseType;
    }
    if (opts.withCredentials) {
        req.withCredentials = 'true';
    }
    return self.sendXMLHttpRequest(req, opts.sendContent);
};

/**
 * @param {string} url
 * @param {...*} [var_args]
 * @return {string}
 * @private
 */
MochiKit.Async._buildURL = function (url, var_args/*, ...*/) {
	if (arguments.length > 1) {
		var m = MochiKit.Base;
		var qs = m.queryString.apply(null, m.extend(null, arguments, 1));
		if (qs) {
			return url + "?" + qs;
		}
	}
	return url;
};

/**
 * @id MochiKit.Async.doSimpleXMLHttpRequest
 * @param {string} url
 * @return {!MochiKit.Async.Deferred}
 */
MochiKit.Async.doSimpleXMLHttpRequest = function (url/*, ...*/) {
	var self = MochiKit.Async;
	url = self._buildURL.apply(self, arguments);
	return self.doXHR(url);
};

/**
 * @id MochiKit.Async.loadJSONDoc
 * @param {string} url
 * @return {!MochiKit.Async.Deferred}
 */
MochiKit.Async.loadJSONDoc = function (url/*, ...*/) {
	var self = MochiKit.Async;
	url = self._buildURL.apply(self, arguments);
	var d = self.doXHR(url, {
		'mimeType': 'text/plain',
		'headers': [['Accept', 'application/json']]
	});
	d = d.addCallback(self.evalJSONRequest);
	return d;
};

/**
 * @id MochiKit.Async.loadScript
 * todo: though we don't have/want a dependency on DOM here I'd say
 * some way of specifying the context document elem might be useful? (typically in iframe cases)
 * @param {string} url
 * @return {!MochiKit.Async.Deferred}
 */
MochiKit.Async.loadScript = function (url) {
	var d = new MochiKit.Async.Deferred();
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.onload = function () {
		script.onload = null;
		script.onerror = null;
		script.onreadystatechange = null;
		script = null;
		d.callback();
	};
	script.onerror = function (msg) {
		script.onload = null;
		script.onerror = null;
		script.onreadystatechange = null;
		script = null;
		msg = "Failed to load script at " + url + ": " + msg;
		d.errback(new URIError(msg, url));
	}
	script.onreadystatechange = function () {
		if (script.readyState == "loaded" || script.readyState == "complete") {
			script.onload();
		} else {
			// IE doesn't bother to report errors...
			MochiKit.Async.callLater(10, script.onerror, "Script loading timed out")
		}
	};
	document.getElementsByTagName("head")[0].appendChild(script);
	script.src = url;
	return d;
};

/**
 * @id MochiKit.Async.wait
 * @param {number} seconds
 * @param {*=} [value]
 * @return {!MochiKit.Async.Deferred}
 */
MochiKit.Async.wait = function (seconds, /* optional */value) {
	var d = new MochiKit.Async.Deferred();
	var cb = MochiKit.Base.bind("callback", d, value);
	var timeout = setTimeout(cb, Math.floor(seconds * 1000));
	d.canceller = function () {
		try {
			clearTimeout(timeout);
		} catch (e) {
			// pass
		}
	};
	return d;
};

/**
 * @id MochiKit.Async.callLater
 * @param {number} seconds
 * @param {Function} func
 * @param {...*} [var_args]
 * @return {!MochiKit.Async.Deferred}
 */
MochiKit.Async.callLater = function (seconds, func, var_args) {
	var m = MochiKit.Base;
	var pfunc = m.partial.apply(m, m.extend(null, arguments, 1));
	return MochiKit.Async.wait(seconds).addCallback(
		function (res) { return pfunc(); }
	);
};


/**
 * @id MochiKit.Async.DeferredLock
 * @constructor
 */
MochiKit.Async.DeferredLock = function () {
    this.waiting = [];
    this.locked = false;
    this.id = this._nextId();
};

MochiKit.Async.DeferredLock.prototype.__class__ = MochiKit.Async.DeferredLock;
/** @id MochiKit.Async.DeferredLock.prototype.acquire */
MochiKit.Async.DeferredLock.prototype.acquire = function () {
	var d = new MochiKit.Async.Deferred();
	if (this.locked) {
		this.waiting.push(d);
	} else {
		this.locked = true;
		d.callback(this);
	}
	return d;
};
/** @id MochiKit.Async.DeferredLock.prototype.release */
MochiKit.Async.DeferredLock.prototype.release = function () {
	if (!this.locked) {
		throw TypeError("Tried to release an unlocked DeferredLock");
	}
	this.locked = false;
	if (this.waiting.length > 0) {
		this.locked = true;
		this.waiting.shift().callback(this);
	}
};
/**
 * @return {integer}
 * @private
 */
MochiKit.Async.DeferredLock.prototype._nextId = MochiKit.Base.counter();

/** @return {string} */
MochiKit.Async.DeferredLock.prototype.repr = function () {
	var state;
	if (this.locked) {
		state = 'locked, ' + this.waiting.length + ' waiting';
	} else {
		state = 'unlocked';
	}
	return 'DeferredLock(' + this.id + ', ' + state + ')';
};
/** @return {string} */
MochiKit.Async.DeferredLock.prototype.toString = MochiKit.Base.forwardCall("repr");


/**
 * @id MochiKit.Async.DeferredList
 * @see http://mochikit.com/doc/html/MochiKit/Async.html#fn-deferredlist
 * @constructor
 * @extends {MochiKit.Async.Deferred}
 * @param {!Array.<!MochiKit.Async.Deferred>} list
 * @param {boolean=} [fireOnOneCallback=false]
 * @param {boolean=} [fireOnOneErrback=false]
 * @param {boolean=} [consumeErrors=false]
 * @param {function()=} [canceller]
 */
MochiKit.Async.DeferredList = function (list, /* optional */fireOnOneCallback, fireOnOneErrback, consumeErrors, canceller) {

    // call parent constructor
    MochiKit.Async.Deferred.apply(this, [canceller]);

    this.list = list;
    var resultList = [];
    this.resultList = resultList;

    this.finishedCount = 0;
    this.fireOnOneCallback = fireOnOneCallback;
    this.fireOnOneErrback = fireOnOneErrback;
    this.consumeErrors = consumeErrors;

    var cb = MochiKit.Base.bind(this._cbDeferred, this);
    for (var i = 0; i < list.length; i++) {
        var d = list[i];
        resultList.push(undefined);
        d.addCallback(cb, i, true);
        d.addErrback(cb, i, false);
    }

    if (list.length === 0 && !fireOnOneCallback) {
        this.callback(this.resultList);
    }
};

MochiKit.Async.DeferredList.prototype = new MochiKit.Async.Deferred();
MochiKit.Async.DeferredList.prototype.constructor = MochiKit.Async.DeferredList;

/**
 * @param {integer} index
 * @param {boolean} succeeded
 * @param {*} result
 * @private
 */
MochiKit.Async.DeferredList.prototype._cbDeferred = function (index, succeeded, result) {
    this.resultList[index] = [succeeded, result];
    this.finishedCount += 1;
    if (this.fired == -1) {
        if (succeeded && this.fireOnOneCallback) {
            this.callback([index, result]);
        } else if (!succeeded && this.fireOnOneErrback) {
            this.errback(result);
        } else if (this.finishedCount == this.list.length) {
            this.callback(this.resultList);
        }
    }
    if (!succeeded && this.consumeErrors) {
        result = null;
    }
    return result;
};

/**
 * @id MochiKit.Async.gatherResults
 * @param {!(Array.<!MochiKit.Async.Deferred>|MochiKit.Async.Deferred)} deferreds
 * @param {...!(Array.<!MochiKit.Async.Deferred>|MochiKit.Async.Deferred)} [var_args]
 * @return {!MochiKit.Async.DeferredList}
 */
MochiKit.Async.gatherResults = function (deferreds, var_args) {
	var deferredList = MochiKit.Base.flattenArguments(arguments);
    var d = new MochiKit.Async.DeferredList(deferredList, false, true, false);
    d.addCallback(function (results) {
        var ret = [];
        for (var i = 0; i < results.length; i++) {
            ret.push(results[i][1]);
        }
        return ret;
    });
    return d;
};

/**
 * @id MochiKit.Async.maybeDeferred
 * @param {Function} func
 * @return {!MochiKit.Async.Deferred}
 */
MochiKit.Async.maybeDeferred = function (func) {
    var self = MochiKit.Async;
    var result;
    try {
        var r = func.apply(null, MochiKit.Base.extend([], arguments, 1));
        if (r instanceof self.Deferred) {
            result = r;
        } else if (r instanceof Error) {
            result = self.fail(r);
        } else {
            result = self.succeed(r);
        }
    } catch (e) {
        result = self.fail(e);
    }
    return result;
};


/**
 * similar to MochiKit.Async.maybeDeferred but looks
 * at a value instead of a function result.
 *
 * @id MochiKit.Async.when
 * @param {*} valueOrDeferred
 * @return {!MochiKit.Async.Deferred}
 */
MochiKit.Async.when = function(valueOrDeferred) {
//	if (valueOrDeferred instanceof MochiKit.Async.Deferred) {
	if (typeof valueOrDeferred != 'undefined' && typeof valueOrDeferred.addCallback == 'function') { // better sniff?
		return valueOrDeferred;
	}
	return MochiKit.Async.succeed(valueOrDeferred);
};


/**
 * wraps a deferred in a timeout block
 * todo: support passing in a custom timeout-error value?
 *
 * @id MochiKit.Async.timeout
 * @param {!MochiKit.Async.Deferred} d
 * @param {integer} ms timeout
 * @return {!MochiKit.Async.Deferred}
 */
MochiKit.Async.timeout = function(d, ms) {
	var dt = new MochiKit.Async.Deferred();

	var h = setTimeout(function() { // don't use partial here since some browsers pass (undocumented..) args to the callback
	//	dt.errback();
		dt.cancel(); // errback works too but since MK.Async supports a cancel concept we use it (translates to an error if no canceller attached)
	}, ms);

	d.addBoth(function() { clearTimeout(h); }) // can't use partial/bind for native fn in IE<9
		.addCallbacks(MochiKit.Base.bind(dt.callback, dt), MochiKit.Base.bind(dt.errback, dt));

	return dt;
};



/** @this {MochiKit.Async} */
MochiKit.Async.__new__ = function () {
    var m = MochiKit.Base;
    var ne = m.partial(m._newNamedError, this);

    ne("AlreadyCalledError",
        /**
         * @id MochiKit.Async.AlreadyCalledError
         * @constructor
         */
        function (deferred) {
            /***

            Raised by the Deferred if callback or errback happens
            after it was already fired.

            ***/
            this.deferred = deferred;
        }
    );

    ne("CancelledError",
        /**
         * @id MochiKit.Async.CancelledError
         * @constructor
         */
        function (deferred) {
            /***

            Raised by the Deferred cancellation mechanism.

            ***/
            this.deferred = deferred;
        }
    );

    ne("BrowserComplianceError",
        /**
         * @id MochiKit.Async.BrowserComplianceError
         * @constructor
         */
        function (msg) {
            /***

            Raised when the JavaScript runtime is not capable of performing
            the given function.  Technically, this should really never be
            raised because a non-conforming JavaScript runtime probably
            isn't going to support exceptions in the first place.

            ***/
            this.message = msg;
        }
    );

    ne("GenericError",
        /**
         * @id MochiKit.Async.GenericError
         * @constructor
         */
        function (msg) {
            this.message = msg;
        }
    );

    ne("XMLHttpRequestError",
        /**
         * @id MochiKit.Async.XMLHttpRequestError
         * @constructor
         */
        function (req, msg) {
            /***

            Raised when an XMLHttpRequest does not complete for any reason.

            ***/
            this.req = req;
            this.message = msg;
            try {
                // Strange but true that this can raise in some cases.
                this.number = req.status;
            } catch (e) {
                // pass
            }
        }
    );

    m.nameFunctions(this);
};

MochiKit.Async.__new__();

MochiKit.Base._exportSymbols(this, MochiKit.Async);
