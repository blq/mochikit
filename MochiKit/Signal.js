/***

MochiKit.Signal 1.5

See <http://mochikit.com/> for documentation, downloads, license, etc.

(c) 2006 Jonathan Gardner, Beau Hartshorne, Bob Ippolito.  All rights Reserved.

***/

if (typeof goog != 'undefined' && typeof goog.provide == 'function') {
	goog.provide('MochiKit.Signal');

	goog.require('MochiKit.Base');
	goog.require('MochiKit.DOM');
}

MochiKit.Base.module(MochiKit, 'Signal', '1.5', ['Base', 'DOM']);

/**
 * @type {!Array.<!MochiKit.Signal.Ident>}
 * @private
 */
MochiKit.Signal._observers = [];

/**
 * @id MochiKit.Signal.Event
 * client code should rarely/never need to instantiate this themselves, only internal MochiKit.Signal
 * @param {Object} src
 * @param {Event=} e
 * @constructor
 */
MochiKit.Signal.Event = function (src, e) {
    this._event = e || window.event;
    this._src = src;
};
MochiKit.Signal.Event.__export__ = false;

/**
 * @return {string}
 */
MochiKit.Signal.Event.prototype.__repr__ = function () {
	var repr = MochiKit.Base.repr;
	var str = '{event(): ' + repr(this.event()) +
		', src(): ' + repr(this.src()) +
		', type(): ' + repr(this.type()) +
		', target(): ' + repr(this.target());

	if (this.type() &&
		this.type().indexOf('key') === 0 ||
		this.type().indexOf('mouse') === 0 ||
		this.type().indexOf('click') != -1 ||
		this.type() == 'contextmenu') {
		str += ', modifier(): ' + '{alt: ' + repr(this.modifier().alt) +
		', ctrl: ' + repr(this.modifier().ctrl) +
		', meta: ' + repr(this.modifier().meta) +
		', shift: ' + repr(this.modifier().shift) +
		', any: ' + repr(this.modifier().any) + '}';
	}

	if (this.type() && this.type().indexOf('key') === 0) {
		str += ', key(): {code: ' + repr(this.key().code) +
			', string: ' + repr(this.key().string) + '}';
	}

	if (this.type() && (
		this.type().indexOf('mouse') === 0 ||
		this.type().indexOf('click') != -1 ||
		this.type() == 'contextmenu')) {

		str += ', mouse(): {page: ' + repr(this.mouse().page) +
			', client: ' + repr(this.mouse().client);

		if (this.type() != 'mousemove' && this.type() != 'mousewheel') {
			str += ', button: {left: ' + repr(this.mouse().button.left) +
				', middle: ' + repr(this.mouse().button.middle) +
				', right: ' + repr(this.mouse().button.right) + '}';
		}
		if (this.type() == 'mousewheel') {
			str += ', wheel: ' + repr(this.mouse().wheel);
		}
		str += '}';
	}
	if (this.type() == 'mouseover' || this.type() == 'mouseout' ||
		this.type() == 'mouseenter' || this.type() == 'mouseleave') {
		str += ', relatedTarget(): ' + repr(this.relatedTarget());
	}
	str += '}';
	return str;
};

 /**
  * @id MochiKit.Signal.Event.prototype.toString
  * @return {string}
  */
MochiKit.Signal.Event.prototype.toString = function () {
	return this.__repr__();
};

/**
 * @id MochiKit.Signal.Event.prototype.src
 * @return {Element}
 */
MochiKit.Signal.Event.prototype.src = function () {
	return this._src;
};

/**
 * @id MochiKit.Signal.Event.prototype.event
 * @return {Event}
 */
MochiKit.Signal.Event.prototype.event = function () {
	return this._event;
};

/**
 * @id MochiKit.Signal.Event.prototype.type
 * @return {string}
 */
MochiKit.Signal.Event.prototype.type = function () {
	if (this._event.type === "DOMMouseScroll") {
		return "mousewheel";
	} else {
		return this._event.type || undefined;
	}
};

/**
 * @id MochiKit.Signal.Event.prototype.target
 * @return {Element}
 */
MochiKit.Signal.Event.prototype.target = function () {
	return this._event.target || this._event.srcElement;
};

MochiKit.Signal.Event.prototype._relatedTarget = null;
/**
 * @id MochiKit.Signal.Event.prototype.relatedTarget
 * @return {Element}
 */
MochiKit.Signal.Event.prototype.relatedTarget = function () {
	if (this._relatedTarget !== null) {
		return this._relatedTarget;
	}

	var elem = null;
	if (this.type() == 'mouseover' || this.type() == 'mouseenter') {
		elem = (this._event.relatedTarget ||
			this._event.fromElement);
	} else if (this.type() == 'mouseout' || this.type() == 'mouseleave') {
		elem = (this._event.relatedTarget ||
			this._event.toElement);
	}
	try {
		if (elem !== null && elem.nodeType !== null) {
			this._relatedTarget = elem;
			return elem;
		}
	} catch (ignore) {
		// Firefox 3 throws a permission denied error when accessing
		// any property on XUL elements (e.g. scrollbars)...
	}

	return undefined;
};

MochiKit.Signal.Event.prototype._modifier = null;
/**
 * @id MochiKit.Signal.Event.prototype.modifier
 * @return {{ shift: boolean, ctrl: boolean, meta: boolean, alt: boolean, any: boolean }}
 */
MochiKit.Signal.Event.prototype.modifier = function () {
	if (this._modifier !== null) {
		return this._modifier;
	}
	var m = {};
	m.alt = this._event.altKey;
	m.ctrl = this._event.ctrlKey;
	m.meta = this._event.metaKey || false; // IE and Opera punt here
	m.shift = this._event.shiftKey;
	m.any = m.alt || m.ctrl || m.shift || m.meta;
	this._modifier = m;
	return m;
};

MochiKit.Signal.Event.prototype._key = null;
/**
 * @id MochiKit.Signal.Event.prototype.key
 * @return {{ code: integer, string: string }}
 */
MochiKit.Signal.Event.prototype.key = function () {
	if (this._key !== null) {
		return this._key;
	}
	var k = {};
	if (this.type() && this.type().indexOf('key') === 0) {

		/*

			If you're looking for a special key, look for it in keydown or
			keyup, but never keypress. If you're looking for a Unicode
			chracter, look for it with keypress, but never keyup or
			keydown.

			Notes:

			FF key event behavior:
			key     event   charCode    keyCode
			DOWN    ku,kd   0           40
			DOWN    kp      0           40
			ESC     ku,kd   0           27
			ESC     kp      0           27
			a       ku,kd   0           65
			a       kp      97          0
			shift+a ku,kd   0           65
			shift+a kp      65          0
			1       ku,kd   0           49
			1       kp      49          0
			shift+1 ku,kd   0           0
			shift+1 kp      33          0

			IE key event behavior:
			(IE doesn't fire keypress events for special keys.)
			key     event   keyCode
			DOWN    ku,kd   40
			DOWN    kp      undefined
			ESC     ku,kd   27
			ESC     kp      27
			a       ku,kd   65
			a       kp      97
			shift+a ku,kd   65
			shift+a kp      65
			1       ku,kd   49
			1       kp      49
			shift+1 ku,kd   49
			shift+1 kp      33

			Safari key event behavior:
			(Safari sets charCode and keyCode to something crazy for
			special keys.)
			key     event   charCode    keyCode
			DOWN    ku,kd   63233       40
			DOWN    kp      63233       63233
			ESC     ku,kd   27          27
			ESC     kp      27          27
			a       ku,kd   97          65
			a       kp      97          97
			shift+a ku,kd   65          65
			shift+a kp      65          65
			1       ku,kd   49          49
			1       kp      49          49
			shift+1 ku,kd   33          49
			shift+1 kp      33          33

		*/

		/* look for special keys here */
		if (this.type() == 'keydown' || this.type() == 'keyup') {
			k.code = this._event.keyCode;
			k.string = (MochiKit.Signal._specialKeys[k.code] ||
				'KEY_UNKNOWN');
			this._key = k;
			return k;

		/* look for characters here */
		} else if (this.type() == 'keypress') {

			/*

				Special key behavior:

				IE: does not fire keypress events for special keys
				FF: sets charCode to 0, and sets the correct keyCode
				Safari: sets keyCode and charCode to something stupid

			*/

			k.code = 0;
			k.string = '';

			if (typeof(this._event.charCode) != 'undefined' &&
				this._event.charCode !== 0 &&
				!MochiKit.Signal._specialMacKeys[this._event.charCode]) {
				k.code = this._event.charCode;
				k.string = String.fromCharCode(k.code);
			} else if (this._event.keyCode &&
				typeof(this._event.charCode) == 'undefined') { // IE
				k.code = this._event.keyCode;
				k.string = String.fromCharCode(k.code);
			}

			this._key = k;
			return k;
		}
	}
	return undefined;
};

MochiKit.Signal.Event.prototype._mouse = null;
/**
 * @id MochiKit.Signal.Event.prototype.mouse
 * @return {{ page: Pos, client: Pos, button: { left: boolean, right: boolean, middle: boolean }, wheel: Pos }}
 */
MochiKit.Signal.Event.prototype.mouse = function () {
	if (this._mouse !== null) {
		return this._mouse;
	}

	var m = {};
	var e = this._event;

	if (this.type() && (
		this.type().indexOf('mouse') === 0 ||
		this.type().indexOf('drag') === 0 ||
		this.type().indexOf('click') != -1 ||
		this.type() == 'contextmenu')) {

		m.client = { x: 0, y: 0 };
		if (e.clientX || e.clientY) {
			m.client.x = (!e.clientX || e.clientX < 0) ? 0 : e.clientX;
			m.client.y = (!e.clientY || e.clientY < 0) ? 0 : e.clientY;
		}

		m.page = { x: 0, y: 0 };
		if (e.pageX || e.pageY) {
			m.page.x = (!e.pageX || e.pageX < 0) ? 0 : e.pageX;
			m.page.y = (!e.pageY || e.pageY < 0) ? 0 : e.pageY;
		} else {
			/*

				The IE shortcut can be off by two. We fix it. See:
				http://msdn.microsoft.com/workshop/author/dhtml/reference/methods/getboundingclientrect.asp

				This is similar to the method used in
				MochiKit.Style.getElementPosition().

			*/
			var de = MochiKit.DOM._document.documentElement;
			var b = MochiKit.DOM._document.body;

			m.page.x = e.clientX +
				(de.scrollLeft || b.scrollLeft) -
				(de.clientLeft || 0);

			m.page.y = e.clientY +
				(de.scrollTop || b.scrollTop) -
				(de.clientTop || 0);

		}
		if (this.type() != 'mousemove' && this.type() != 'mousewheel') {
			m.button = {};
			m.button.left = false;
			m.button.right = false;
			m.button.middle = false;

			/* we could check e.button, but which is more consistent */
			if (e.which) {
				m.button.left = (e.which == 1);
				m.button.middle = (e.which == 2);
				m.button.right = (e.which == 3);

				/*

					Mac browsers and right click:

						- Safari doesn't fire any click events on a right
						  click:
						  http://bugs.webkit.org/show_bug.cgi?id=6595

						- Firefox fires the event, and sets ctrlKey = true

						- Opera fires the event, and sets metaKey = true

					oncontextmenu is fired on right clicks between
					browsers and across platforms.

				*/

			} else {
				m.button.left = !!(e.button & 1);
				m.button.right = !!(e.button & 2);
				m.button.middle = !!(e.button & 4);
			}
		}
		if (this.type() == 'mousewheel') {
			m.wheel = { x: 0, y: 0 };
			if (e.wheelDeltaX || e.wheelDeltaY) {
				m.wheel.x = e.wheelDeltaX / -40 || 0;
				m.wheel.y = e.wheelDeltaY / -40 || 0;
			} else if (e.wheelDelta) {
				m.wheel.y = e.wheelDelta / -40;
			} else {
				m.wheel.y = e.detail || 0;
			}
		}
		this._mouse = m;
		return m;
	}
	return undefined;
};

/** @id MochiKit.Signal.Event.prototype.stop */
MochiKit.Signal.Event.prototype.stop = function () {
	this.stopPropagation();
	this.preventDefault();
};

/** @id MochiKit.Signal.Event.prototype.stopPropagation */
MochiKit.Signal.Event.prototype.stopPropagation = function () {
	if (this._event.stopPropagation) {
		this._event.stopPropagation();
	} else {
		this._event.cancelBubble = true;
	}
};

/** @id MochiKit.Signal.Event.prototype.preventDefault */
MochiKit.Signal.Event.prototype.preventDefault = function () {
	if (this._event.preventDefault) {
		this._event.preventDefault();
	} else if (this._confirmUnload === null) {
		this._event.returnValue = false;
	}
};

MochiKit.Signal.Event.prototype._confirmUnload = null;

/**
 * @id MochiKit.Signal.Event.prototype.confirmUnload
 * @param {string} msg
 */
MochiKit.Signal.Event.prototype.confirmUnload = function (msg) {
	if (this.type() == 'beforeunload') {
		this._confirmUnload = msg;
		this._event.returnValue = msg;
	}
};


/* Safari sets keyCode to these special values onkeypress. */
MochiKit.Signal._specialMacKeys = {
    3: 'KEY_ENTER',
    63289: 'KEY_NUM_PAD_CLEAR',
    63276: 'KEY_PAGE_UP',
    63277: 'KEY_PAGE_DOWN',
    63275: 'KEY_END',
    63273: 'KEY_HOME',
    63234: 'KEY_ARROW_LEFT',
    63232: 'KEY_ARROW_UP',
    63235: 'KEY_ARROW_RIGHT',
    63233: 'KEY_ARROW_DOWN',
    63302: 'KEY_INSERT',
    63272: 'KEY_DELETE'
};

/* for KEY_F1 - KEY_F12 */
(function () {
    var _specialMacKeys = MochiKit.Signal._specialMacKeys;
    for (var i = 63236; i <= 63242; i++) {
        // no F0
        _specialMacKeys[i] = 'KEY_F' + (i - 63236 + 1);
    }
})();

/* Standard keyboard key codes. */
MochiKit.Signal._specialKeys = {
    8: 'KEY_BACKSPACE',
    9: 'KEY_TAB',
    12: 'KEY_NUM_PAD_CLEAR', // weird, for Safari and Mac FF only
    13: 'KEY_ENTER',
    16: 'KEY_SHIFT',
    17: 'KEY_CTRL',
    18: 'KEY_ALT',
    19: 'KEY_PAUSE',
    20: 'KEY_CAPS_LOCK',
    27: 'KEY_ESCAPE',
    32: 'KEY_SPACEBAR',
    33: 'KEY_PAGE_UP',
    34: 'KEY_PAGE_DOWN',
    35: 'KEY_END',
    36: 'KEY_HOME',
    37: 'KEY_ARROW_LEFT',
    38: 'KEY_ARROW_UP',
    39: 'KEY_ARROW_RIGHT',
    40: 'KEY_ARROW_DOWN',
    44: 'KEY_PRINT_SCREEN',
    45: 'KEY_INSERT',
    46: 'KEY_DELETE',
    59: 'KEY_SEMICOLON', // weird, for Safari and IE only
    91: 'KEY_WINDOWS_LEFT',
    92: 'KEY_WINDOWS_RIGHT',
    93: 'KEY_SELECT',
    106: 'KEY_NUM_PAD_ASTERISK',
    107: 'KEY_NUM_PAD_PLUS_SIGN',
    109: 'KEY_NUM_PAD_HYPHEN-MINUS',
    110: 'KEY_NUM_PAD_FULL_STOP',
    111: 'KEY_NUM_PAD_SOLIDUS',
    144: 'KEY_NUM_LOCK',
    145: 'KEY_SCROLL_LOCK',
    186: 'KEY_SEMICOLON',
    187: 'KEY_EQUALS_SIGN',
    188: 'KEY_COMMA',
    189: 'KEY_HYPHEN-MINUS',
    190: 'KEY_FULL_STOP',
    191: 'KEY_SOLIDUS',
    192: 'KEY_GRAVE_ACCENT',
    219: 'KEY_LEFT_SQUARE_BRACKET',
    220: 'KEY_REVERSE_SOLIDUS',
    221: 'KEY_RIGHT_SQUARE_BRACKET',
    222: 'KEY_APOSTROPHE'
    // undefined: 'KEY_UNKNOWN'
};

(function () {
    /* for KEY_0 - KEY_9 */
    var _specialKeys = MochiKit.Signal._specialKeys;
    for (var i = 48; i <= 57; i++) {
        _specialKeys[i] = 'KEY_' + (i - 48);
    }

    /* for KEY_A - KEY_Z */
    for (i = 65; i <= 90; i++) {
        _specialKeys[i] = 'KEY_' + String.fromCharCode(i);
    }

    /* for KEY_NUM_PAD_0 - KEY_NUM_PAD_9 */
    for (i = 96; i <= 105; i++) {
        _specialKeys[i] = 'KEY_NUM_PAD_' + (i - 96);
    }

    /* for KEY_F1 - KEY_F12 */
    for (i = 112; i <= 123; i++) {
        // no F0
        _specialKeys[i] = 'KEY_F' + (i - 112 + 1);
    }
})();

/**
 * Internal object to keep track of created signals.
 * @param {Object} ident
 * @constructor
 */
MochiKit.Signal.Ident = function (ident) {
    this.source = ident.source;
    this.signal = ident.signal;
    this.listener = ident.listener;
    this.isDOM = ident.isDOM;
    this.objOrFunc = ident.objOrFunc;
    this.funcOrStr = ident.funcOrStr;
    this.connected = ident.connected;
	this.namespace = ident.namespace;
};
MochiKit.Signal.Ident.__export__ = false;
MochiKit.Signal.Ident.prototype = {};

MochiKit.Signal.Ident.prototype.__repr__ = function() {
	var repr = MochiKit.Base.repr;
	return 'src:' + repr(this.source) + ', sig: ' + repr(this.signal) + ', isDOM: ' + repr(this.isDOM) + ', connected: ' + repr(this.connected);
};

MochiKit.Signal._unloadCache = function () {
    var self = MochiKit.Signal;
    var observers = self._observers;

    for (var i = 0; i < observers.length; i++) {
        if (observers[i].signal !== 'onload' && observers[i].signal !== 'onunload') {
            self._disconnect(observers[i]);
        }
    }
};

MochiKit.Signal._listener = function (src, sig, func, obj, isDOM) {
    var self = MochiKit.Signal;
    var E = self.Event;
    if (!isDOM) {
        /* We don't want to re-bind already bound methods */
        if (typeof(func.im_self) == 'undefined') {
            return MochiKit.Base.bindLate(func, obj);
        } else {
            return func;
        }
    }
    obj = obj || src;
    if (typeof(func) == "string") {
        if (sig === 'onload' || sig === 'onunload') {
            return function (nativeEvent) {
                obj[func].apply(obj, [new E(src, nativeEvent)]);

                var ident = new MochiKit.Signal.Ident({
                    source: src, signal: sig, objOrFunc: obj, funcOrStr: func});

                MochiKit.Signal._disconnect(ident);
            };
        } else {
            return function (nativeEvent) {
                obj[func].apply(obj, [new E(src, nativeEvent)]);
            };
        }
    } else {
        if (sig === 'onload' || sig === 'onunload') {
            return function (nativeEvent) {
                func.apply(obj, [new E(src, nativeEvent)]);

                var ident = new MochiKit.Signal.Ident({
                    source: src, signal: sig, objOrFunc: func});

                MochiKit.Signal._disconnect(ident);
            };
        } else {
            return function (nativeEvent) {
                func.apply(obj, [new E(src, nativeEvent)]);
            };
        }
    }
};
/** @return {boolean} */
MochiKit.Signal._browserAlreadyHasMouseEnterAndLeave = function () {
    return /MSIE/.test(navigator.userAgent);
};
/** @return {boolean} */
MochiKit.Signal._browserLacksMouseWheelEvent = function () {
    return /Gecko\//.test(navigator.userAgent);
};

MochiKit.Signal._mouseEnterListener = function (src, sig, func, obj) {
    var E = MochiKit.Signal.Event;
	// todo: add im_func to this? could be regarded as "bound"?
    return function (nativeEvent) {
        var e = new E(src, nativeEvent);
        try {
            e.relatedTarget().nodeName;
        } catch (err) {
            /* probably hit a permission denied error; possibly one of
             * firefox's screwy anonymous DIVs inside an input element.
             * Allow this event to propogate up.
             */
            return;
        }
        e.stop();
        if (MochiKit.DOM.isChildNode(e.relatedTarget(), src)) {
            /* We've moved between our node and a child. Ignore. */
            return;
        }
        e.type = function () { return sig; };
        if (typeof(func) == "string") {
            return obj[func].apply(obj, [e]);
        } else {
            return func.apply(obj, [e]);
        }
    };
};

/**
 * creates and validates a handler object
 * @throws {Error} if invalid input arguments
 */
MochiKit.Signal._getDestPair = function (objOrFunc, funcOrStr) {
    var obj = null;
    var func = null;
    if (typeof(funcOrStr) != 'undefined') {
        obj = objOrFunc;
        func = funcOrStr;
        if (typeof(funcOrStr) == 'string') {
            if (typeof(objOrFunc[funcOrStr]) != "function") {
                throw new Error("'funcOrStr' must be a function on 'objOrFunc'");
            }
        } else if (typeof(funcOrStr) != 'function') {
            throw new Error("'funcOrStr' must be a function or string");
        }
    } else if (typeof(objOrFunc) != "function") {
        throw new Error("'objOrFunc' must be a function if 'funcOrStr' is not given");
    } else {
        func = objOrFunc;
    }
    return [obj, func];
};

/**
 * @id MochiKit.Signal.connect
 * @param {!(Object|string|Element)} src
 * @param {string} sig signal
 * @param {!(Object|Function)} objOrFunc dest
 * @param {(Function|string)=} funcOrStr
 * @param {...*} var_args
 * @return {!Object} event handler
 */
MochiKit.Signal.connect = function (src, sig, objOrFunc/* optional */, funcOrStr, var_args) {
    if (typeof(src) == "string") {
        src = MochiKit.DOM.getElement(src);
    }
    var self = MochiKit.Signal;

    if (typeof(sig) != 'string') {
        throw new Error("'sig' must be a string");
    }
    
    var sig_ns = sig.split('.');
    if (sig_ns.length >= 2) {
        sig = sig_ns[0];
    }

    var destPair = self._getDestPair(objOrFunc, funcOrStr);
    var obj = destPair[0];
    var func = destPair[1];
    if (typeof(obj) == 'undefined' || obj === null) {
        obj = src;
    }

    var isDOM = !!(src.addEventListener || src.attachEvent);
    if (isDOM && (sig === "onmouseenter" || sig === "onmouseleave")
              && !self._browserAlreadyHasMouseEnterAndLeave()) {
        var listener = self._mouseEnterListener(src, sig.substr(2), func, obj);
        if (sig === "onmouseenter") {
            sig = "onmouseover";
        } else {
            sig = "onmouseout";
        }
    } else if (isDOM && sig == "onmousewheel" && self._browserLacksMouseWheelEvent()) {
        var listener = self._listener(src, sig, func, obj, isDOM);
        sig = "onDOMMouseScroll";
    } else {
        var listener = self._listener(src, sig, func, obj, isDOM);
    }

    if (src.addEventListener) {
        src.addEventListener(sig.substr(2), listener, false);
    } else if (src.attachEvent) {
        src.attachEvent(sig, listener); // useCapture unsupported
    }

    var ident = new MochiKit.Signal.Ident({
        source: src,
        signal: sig,
        listener: listener,
        isDOM: isDOM,
        objOrFunc: objOrFunc,
        funcOrStr: funcOrStr,
        connected: true,
        namespace: sig_ns[1] || ''
    });

    if (!isDOM && typeof(src.__connect__) == 'function') {
        var args = MochiKit.Base.extend([ident], arguments, 1);
        src.__connect__.apply(src, args);
    }
    
    self._observers.push(ident);

    return ident;
};

/** @id MochiKit.Signal.connectOnce */
MochiKit.Signal.connectOnce = function (src, sig, objOrFunc/* optional */, funcOrStr) {
    var self = MochiKit.Signal;
    var ident1 = self.connect(src, sig, objOrFunc, funcOrStr);
    var ident2;
    ident2 = self.connect(src, sig, function() {
        self.disconnect(ident1);
        self.disconnect(ident2);
    });
    return ident1;
};

/**
 * @param {Object} ident event handler
 * @private
 */
MochiKit.Signal._disconnect = function (ident) {
    // already disconnected
    if (!ident.connected) {
        return;
    }
    ident.connected = false;
    var src = ident.source;
    var sig = ident.signal;
    var listener = ident.listener;
    // check isDOM
    if (!ident.isDOM) {
        if (typeof(src.__disconnect__) == 'function') {
            src.__disconnect__(ident, sig, ident.objOrFunc, ident.funcOrStr);
        }
        return;
    }
    if (src.removeEventListener) {
        src.removeEventListener(sig.substr(2), listener, false);
    } else if (src.detachEvent) {
        src.detachEvent(sig, listener); // useCapture unsupported
    } else {
        throw new Error("'src' must be a DOM element");
    }
};

 /**
  * @id MochiKit.Signal.disconnect
  * @param {Object} ident event handler
  * // undocumented {boolean} return. false if a matching slot not found ("failed")
  */
MochiKit.Signal.disconnect = function (ident) {
    var self = MochiKit.Signal;
    var observers = self._observers;
    var m = MochiKit.Base;
    if (arguments.length > 1) {
        // compatibility API
        var src = arguments[0];
        if (typeof(src) == "string") {
            src = MochiKit.DOM.getElement(src);
        }
        var sig = arguments[1];
        var obj = arguments[2];
        var func = arguments[3];
        for (var i = observers.length - 1; i >= 0; i--) {
            var o = observers[i];
            if (o.source === src && o.signal === sig && o.objOrFunc === obj && o.funcOrStr === func) {
                self._disconnect(o);
                if (self._lock === 0) {
                    observers.splice(i, 1);
                } else {
                    self._dirty = true;
                }
                return true;
            }
        }
    } else {
        var idx = m.findIdentical(observers, ident);
        if (idx >= 0) {
            self._disconnect(ident);
            if (self._lock === 0) {
                observers.splice(idx, 1);
            } else {
                self._dirty = true;
            }
            return true;
        }
    }
    return false;
};

/**
 * @id MochiKit.Signal.disconnectAllTo
 * @param {Object|Function} objOrFunc
 * @param {!(Function|string)=} [funcOrStr]
 */
MochiKit.Signal.disconnectAllTo = function (objOrFunc, /* optional */funcOrStr) {
    var self = MochiKit.Signal;
    var observers = self._observers;
    var disconnect = self._disconnect;
    var lock = self._lock;
    var dirty = self._dirty;
    if (typeof(funcOrStr) === 'undefined') {
        funcOrStr = null;
    }
    for (var i = observers.length - 1; i >= 0; i--) {
        var ident = observers[i];
        if (ident.objOrFunc === objOrFunc &&
                (funcOrStr === null || ident.funcOrStr === funcOrStr)) {
            disconnect(ident);
            if (lock === 0) {
                observers.splice(i, 1);
            } else {
                dirty = true;
            }
        }
    }
    self._dirty = dirty;
};

/**
 * @id MochiKit.Signal.disconnectAll
 * @param {Object|string} src
 * @param {...string} var_args signal names
 */
MochiKit.Signal.disconnectAll = function (src, /* optional */var_args) {
    if (typeof(src) == "string") {
        src = MochiKit.DOM.getElement(src);
    }
    var m = MochiKit.Base;
    var signals = m.flattenArguments(m.extend(null, arguments, 1));
    var self = MochiKit.Signal;
    var disconnect = self._disconnect;
    var observers = self._observers;
    var i, ident;
    var lock = self._lock;
    var dirty = self._dirty;
    if (signals.length === 0) {
        // disconnect all
        for (i = observers.length - 1; i >= 0; i--) {
            ident = observers[i];
            if (ident.source === src) {
                disconnect(ident);
                if (lock === 0) {
                    observers.splice(i, 1);
                } else {
                    dirty = true;
                }
            }
        }
    } else {
        var sigs = {};
        for (i = 0; i < signals.length; i++) {
            sigs[signals[i]] = true;
        }
        for (i = observers.length - 1; i >= 0; i--) {
            ident = observers[i];
            if (ident.source === src && ident.signal in sigs) {
                disconnect(ident);
                if (lock === 0) {
                    observers.splice(i, 1);
                } else {
                    dirty = true;
                }
            }
        }
    }
    self._dirty = dirty;
};

/**
 * todo: support multiple args (flattening)?
 * todo: should support passing in a src object also!
 * @id MochiKit.Signal.disconnectNS
 * @param {string} sigAndOrNS  example: 'onclick.myNamespace' or '.myNamespace'. Note that namespace must start with a dot.
 * @return {integer} number of signals disconnected
 */
MochiKit.Signal.disconnectNS = function(sigAndOrNS) { // ok name?
    var self = MochiKit.Signal;

	var sig_ns = sigAndOrNS.split('.');
	if (sig_ns.length != 2) {
		throw new Error("No namespace found in 'sigAndOrNS'");
	}

	var signal = sig_ns[0];
	var namespace = sig_ns[1];
	// assert(namespace.length > 0);

	var n = 0;
	var observers = self._observers;
	for (var i = observers.length - 1; i >= 0; i--) {
		var ident = observers[i];

		if (
			(ident.namespace == namespace) && (
				(signal != '' && ident.signal == signal) ||
				(signal == '')
			)
		) {
			self._disconnect(ident);
			if (self._lock === 0) {
				observers.splice(i, 1);
			} else {
				self._dirty = true;
			}
			n += 1;
		}
	}
	return n;
};

/**
 * @id MochiKit.Signal.signal
 * @param {!Object} src
 * @param {string} sig signal
 * @param {...*} [var_args]
 * @throws {Error} if a handler raised an exception
 */
MochiKit.Signal.signal = function (src, sig, var_args) {
    var self = MochiKit.Signal;
    var observers = self._observers;
    if (typeof(src) == "string") {
        src = MochiKit.DOM.getElement(src);
    }
    var args = MochiKit.Base.extend(null, arguments, 2);
    var errors = [];
    self._lock++;
    for (var i = 0; i < observers.length; i++) {
        var ident = observers[i];
        if (ident.source === src && ident.signal === sig &&
                ident.connected) {
            try {
                if (ident.isDOM && ident.funcOrStr != null) {
                    var obj = ident.objOrFunc;
                    obj[ident.funcOrStr].apply(obj, args);
                } else if (ident.isDOM) {
                    ident.objOrFunc.apply(src, args);
                } else {
                    ident.listener.apply(src, args);
                }
            } catch (e) {
                errors.push(e);
            }
        }
    }
    self._lock--;
	self._gc();
    if (errors.length == 1) {
        throw errors[0];
    } else if (errors.length > 1) {
        var e = new Error("Multiple errors thrown in handling 'sig', see errors property");
        e.errors = errors;
        throw e;
    }
};

/**
 * frees any pending disconnects (if lock allows)
 * @return {boolean} false if locked and no gc could be performed
 * @private
 */
MochiKit.Signal._gc = function() {
	var self = MochiKit.Signal;
	var observers = self._observers;
    if (self._lock === 0 && self._dirty) {
        for (var i = observers.length - 1; i >= 0; i--) {
            if (!observers[i].connected) {
                observers.splice(i, 1);
            }
        }
		self._dirty = false;
		return true;
    }
	return false;
};


/**
 * Combination of disconnectAll(src) and disconnectAllTo(objOrFunc).
 * Disconnects all signals to src that are also are bound to objOrFunc.
 * todo: ok name?
 * @param {Object} src
 * @param {Object|Function} objOrFunc
 */
MochiKit.Signal.disconnectAllFromTo = function(src, objOrFunc) {
	var self = MochiKit.Signal;
	var observers = self._observers;
	var disconnect = self._disconnect;
	var lock = self._lock;
	var dirty = self._dirty;

	for (var i = observers.length - 1; i >= 0; i--) {
		var ident = observers[i];
		if (ident.objOrFunc === objOrFunc && ident.source == src) {
			disconnect(ident);
			if (lock === 0) {
				observers.splice(i, 1);
			} else {
				dirty = true;
			}
		}
	}
	self._dirty = dirty;
};


/**
 * shorthand for a call to disconnectAll() + disconnectAllTo()
 * typically to be run during teardown in an obj's destructor
 *
 * @param {Object} obj
 */
MochiKit.Signal.close = function(obj) {
	// todo: write a custom low-level method optimized to do both of these in one iteration?
	// ok order? guess theoretically there can be cases both ways if complex assumptions are made..
	MochiKit.Signal.disconnectAll(obj);
	MochiKit.Signal.disconnectAllTo(obj);
};


//------ PubSub ---------

/**
 * hidden dummy object to create a broadcast system
 * @see publish, subscribe
 * @private
 * @type {!Object}
 * @const
 */
MochiKit.Signal._pubsub_topics = {};


/**
 * broadcasts a signal to all listeners to the topic attached via <a href="#method_subscribe">subscribe()</a>
 * ref <a href="http://docs.dojocampus.org/dojo/publish">dojo.publish()</a> (difference is that this allows multiple arguments)
 *
 * @param {string} topic
 * @param {...*} [var_args] optional multiple arguments passed to the listeners
 */
MochiKit.Signal.publish = function(topic, var_args) {
	// use a timeout to "sneak out" of the current context to
	// let publishers not have to worry about exceptions.
	// ok? (code that assumes publish signals fire synchronously should be considered "bad") => umm.. some of our current code does that apparently.. :(
//	setTimeout(function() {
		MochiKit.Signal.signal.apply(MochiKit.Signal/*or null?*/, MochiKit.Base.extend([MochiKit.Signal._pubsub_topics, topic], arguments, 1));
//	}, 0);
};

/**
 * same syntax as <a href="http://mochikit.com/doc/html/MochiKit/Signal.html#fn-connect">MochiKit.Signal.connect()</a> but with source (first param) already bound.<br />
 * see also <a href="#method_publish">publish()</a><br />
 * ref <a href="http://docs.dojocampus.org/dojo/subscribe">dojo.subscribe()</a>
 * note: this will also be disconnected if calling disconnectAllTo() on the context object (should we block this?)
 *
 * @param {string} topic
 * @param {!(Object|function())} objOrFunc
 * @param {(!Function|string)=} [funcOrStr]
 * @return {!EventHandler}
 */
MochiKit.Signal.subscribe = function(topic, objOrFunc, funcOrStr) { // == partial(connect, MochiKit.Signal._topics)
	// todo: or should we wrap the function in a setTimeout(fn, 0)?
	return MochiKit.Signal.connect(MochiKit.Signal._pubsub_topics, topic, objOrFunc, funcOrStr);
};

/**
 * disconnects a signal attached with <a href="#method_subscribe">subscribe()</a> <br />
 * same as disconnect (alias), mostly for symmetry (same as dojo) (or skip?)
 * ref <a href="http://docs.dojocampus.org/dojo/unsubscribe">dojo.unsubscribe()</a>
 * todo: unsubscribeAll etc?
 *
 * @param {EventHandler} handle
 */
MochiKit.Signal.unsubscribe = function(handle) {
	MochiKit.Signal.disconnect(handle);
};



/** @this {MochiKit.Signal} */
MochiKit.Signal.__new__ = function (win) {
    var m = MochiKit.Base;
    this._document = document;
    this._window = win;
    MochiKit.Signal._lock = 0;
    this._dirty = false;

	// todo: deprecate this? only IE<8 really ever needed this(?)
    try {
        this.connect(window, 'onunload', this._unloadCache);
    } catch (e) {
        // pass: might not be a browser
    }

    m.nameFunctions(this);
};

MochiKit.Signal.__new__(this);

//
// XXX: Internet Explorer blows
//
if (MochiKit.__export__) {
	window.connect = MochiKit.Signal.connect;
	window.disconnect = MochiKit.Signal.disconnect;
	window.disconnectAll = MochiKit.Signal.disconnectAll;
	window.signal = MochiKit.Signal.signal;
}

MochiKit.Base._exportSymbols(this, MochiKit.Signal);
