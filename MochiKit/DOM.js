/***

MochiKit.DOM 1.5

See <http://mochikit.com/> for documentation, downloads, license, etc.

(c) 2005 Bob Ippolito.  All rights Reserved.

***/

if (typeof goog != 'undefined' && typeof goog.provide == 'function') {
	goog.provide('MochiKit.DOM');

	goog.require('MochiKit.Base');
}

MochiKit.Base.module(MochiKit, 'DOM', '1.5', ['Base']);

MochiKit.Base.update(MochiKit.DOM, /** @lends {MochiKit.DOM} */{

    /**
     * @id MochiKit.DOM.currentWindow
     * @return {!Window}
     */
    currentWindow: function () {
        return MochiKit.DOM._window;
    },

    /**
     * @id MochiKit.DOM.currentDocument
     * @return {!Document}
     */
    currentDocument: function () {
        return MochiKit.DOM._document;
    },

    /** @id MochiKit.DOM.withWindow */
    withWindow: function (win, func) {
        var self = MochiKit.DOM;
        var oldDoc = self._document;
        var oldWin = self._window;
        var rval;
        try {
            self._window = win;
            self._document = win.document;
            rval = func();
        } catch (e) {
            self._window = oldWin;
            self._document = oldDoc;
            throw e;
        }
        self._window = oldWin;
        self._document = oldDoc;
        return rval;
    },

    /** @id MochiKit.DOM.formContents  */
    formContents: function (elem/* = document.body */) {
        var names = [];
        var values = [];
        var m = MochiKit.Base;
        var self = MochiKit.DOM;
        if (typeof(elem) == "undefined" || elem === null) {
            elem = self._document.body;
        } else {
            elem = self.getElement(elem);
        }
        m.nodeWalk(elem, function (elem) {
            var name = elem.name;
            if (m.isNotEmpty(name)) {
                var tagName = elem.tagName.toUpperCase();
                if (tagName === "INPUT"
                    && (elem.type == "radio" || elem.type == "checkbox")
                    && !elem.checked
                ) {
                    return null;
                }
                if (tagName === "SELECT") {
                    if (elem.type == "select-one") {
                        if (elem.selectedIndex >= 0) {
                            var opt = elem.options[elem.selectedIndex];
                            var v = opt.value;
                            if (!v) {
                                var h = opt.outerHTML;
                                // internet explorer sure does suck.
                                if (h && !h.match(/^[^>]+\svalue\s*=/i)) {
                                    v = opt.text;
                                }
                            }
                            names.push(name);
                            values.push(v);
                            return null;
                        }
                        // no form elements?
                        names.push(name);
                        values.push("");
                        return null;
                    } else {
                        var opts = elem.options;
                        if (!opts.length) {
                            names.push(name);
                            values.push("");
                            return null;
                        }
                        for (var i = 0; i < opts.length; i++) {
                            var opt = opts[i];
                            if (!opt.selected) {
                                continue;
                            }
                            var v = opt.value;
                            if (!v) {
                                var h = opt.outerHTML;
                                // internet explorer sure does suck.
                                if (h && !h.match(/^[^>]+\svalue\s*=/i)) {
                                    v = opt.text;
                                }
                            }
                            names.push(name);
                            values.push(v);
                        }
                        return null;
                    }
                }
                if (tagName === "FORM" || tagName === "P" || tagName === "SPAN"
                    || tagName === "DIV"
                ) {
                    return elem.childNodes;
                }
                names.push(name);
                values.push(elem.value || '');
                return null;
            }
            return elem.childNodes;
        });
        return [names, values];
    },

    /** @id MochiKit.DOM.withDocument */
    withDocument: function (doc, func) {
        var self = MochiKit.DOM;
        var oldDoc = self._document;
        var rval;
        try {
            self._document = doc;
            rval = func();
        } catch (e) {
            self._document = oldDoc;
            throw e;
        }
        self._document = oldDoc;
        return rval;
    },

    /** @id MochiKit.DOM.registerDOMConverter */
    registerDOMConverter: function (name, check, wrap, /* optional */override) {
        MochiKit.DOM.domConverters.register(name, check, wrap, override);
    },

    /** @id MochiKit.DOM.coerceToDOM */
    coerceToDOM: function (node, ctx) {
        var m = MochiKit.Base;
        var im = MochiKit.Iter;
        var self = MochiKit.DOM;
        if (im) {
            var iter = im.iter;
            var repeat = im.repeat;
        }
        var map = m.map;
        var domConverters = self.domConverters;
        var coerceToDOM = arguments.callee;
        var NotFound = m.NotFound;
        while (true) {
            if (typeof(node) == 'undefined' || node === null) {
                return null;
            }
            // this is a safari childNodes object, avoiding crashes w/ attr
            // lookup
            if (typeof(node) == "function" &&
                    typeof(node.length) == "number" &&
                    !(node instanceof Function)) {
                node = im ? im.list(node) : m.extend(null, node);
            }
            if (typeof(node.nodeType) != 'undefined' && node.nodeType > 0) {
                return node;
            }
            if (typeof(node) == 'number' || typeof(node) == 'boolean') {
                node = node.toString();
                // FALL THROUGH
            }
            if (typeof(node) == 'string') {
                return self._document.createTextNode(node);
            }
            if (typeof(node.__dom__) == 'function') {
                node = node.__dom__(ctx);
                continue;
            }
            if (typeof(node.dom) == 'function') {
                node = node.dom(ctx);
                continue;
            }
            if (typeof(node) == 'function') {
                node = node.apply(ctx, [ctx]);
                continue;
            }

            if (im) {
                // iterable
                var iterNodes = null;
                try {
                    iterNodes = iter(node);
                } catch (e) {
                    // pass
                }
                if (iterNodes) {
                    return map(coerceToDOM, iterNodes, repeat(ctx));
                }
            } else if (m.isArrayLike(node)) {
                var func = function (n) { return coerceToDOM(n, ctx); };
                return map(func, node);
            }

            // adapter
            try {
                node = domConverters.match(node, ctx);
                continue;
            } catch (e) {
                if (e != NotFound) {
                    throw e;
                }
            }

            // fallback
            return self._document.createTextNode(node.toString());
        }
        // mozilla warnings aren't too bright
        return undefined;
    },

    /**
     * @id MochiKit.DOM.isChildNode
	 * @param {!Node|string} node
	 * @param {!Node|string} maybeparent
     * @return {boolean}
     */
    isChildNode: function (node, maybeparent) {
        var self = MochiKit.DOM;
        if (typeof(node) == "string") {
            node = self.getElement(node);
        }
        if (typeof(maybeparent) == "string") {
            maybeparent = self.getElement(maybeparent);
        }
        if (typeof(node) == 'undefined' || node === null) {
            return false;
        }
        while (node != null && node !== self._document) {
            if (node === maybeparent) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    },

	/**
	 * @id MochiKit.DOM.setNodeAttribute
	 * @param {!Node|string} node
	 * @param {string} attr
	 * @param {*} value
	 * @return {Node} chained input node
	 */
    setNodeAttribute: function (node, attr, value) {
        var o = {};
        o[attr] = value;
        try {
            return MochiKit.DOM.updateNodeAttributes(node, o);
        } catch (e) {
            // pass
        }
        return null;
    },

	/**
	 * @id MochiKit.DOM.getNodeAttribute
	 * @param {!Node|string} node
	 * @param {string} attr
	 * @return {*}
	 */
    getNodeAttribute: function (node, attr) {
        var self = MochiKit.DOM;
        var rename = self.attributeArray.renames[attr];
        var ignoreValue = self.attributeArray.ignoreAttr[attr];
        node = self.getElement(node);
        try {
            if (rename) {
                return node[rename];
            }
            var value = node.getAttribute(attr);
            if (value != ignoreValue) {
                return value;
            }
        } catch (e) {
            // pass
        }
        return null;
    },

    /** @id MochiKit.DOM.removeNodeAttribute */
    removeNodeAttribute: function (node, attr) {
        var self = MochiKit.DOM;
        var rename = self.attributeArray.renames[attr];
        node = self.getElement(node);
        try {
            if (rename) {
                return node[rename];
            }
            return node.removeAttribute(attr);
        } catch (e) {
            // pass
        }
        return null;
    },

	/**
	 * @id MochiKit.DOM.updateNodeAttributes
	 * @param {!Node|string} node
	 * @param {Object} attrs
	 * @return {Node} chained input node
	 */
    updateNodeAttributes: function (node, attrs) {
        var elem = node;
        var self = MochiKit.DOM;
        var base = MochiKit.Base;
        if (typeof(node) == 'string') {
            elem = self.getElement(node);
        }
        if (attrs) {
            if (self.attributeArray.compliant) {
                // not IE, good.
                for (var k in attrs) { // todo: use o.hasOwnProperty(k) test?
                    var v = attrs[k];
                    if (typeof(v) == 'object' && typeof(elem[k]) == 'object') {
                        if (k == "style" && MochiKit.Style) {
                            MochiKit.Style.setStyle(elem, v);
                        } else {
                            base.updatetree(elem[k], v);
                        }
                    } else if (k.substring(0, 2) == "on") {
                        if (typeof(v) == "string") {
                            v = new Function(v);
                        }
                        elem[k] = v;
                    } else {
                        elem.setAttribute(k, v);
                    }
                    if (base.isValue(elem[k]) && elem[k] != v) {
                        // Also set property for weird attributes (see #302 & #335)
                        elem[k] = v;
                    }
                }
            } else {
                // IE is insane in the membrane
                var renames = self.attributeArray.renames;
                for (var k in attrs) { // todo: use o.hasOwnProperty(k) test?
                    v = attrs[k];
                    var renamed = renames[k];
                    if (k == "style" && typeof(v) == "string") {
                        elem.style.cssText = v;
                    } else if (typeof(renamed) == "string") {
                        elem[renamed] = v;
                    } else if (typeof(elem[k]) == 'object'
                            && typeof(v) == 'object') {
                        if (k == "style" && MochiKit.Style) {
                            MochiKit.Style.setStyle(elem, v);
                        } else {
                            base.updatetree(elem[k], v);
                        }
                    } else if (k.substring(0, 2) == "on") {
                        if (typeof(v) == "string") {
                            v = new Function(v);
                        }
                        elem[k] = v;
                    } else {
                        elem.setAttribute(k, v);
                    }
                    if (base.isValue(elem[k]) && elem[k] != v) {
                        // Also set property for weird attributes (see #302 & #335)
                        elem[k] = v;
                    }
                }
            }
        }
        return elem;
    },

    /**
	 * @id MochiKit.DOM.appendChildNodes
	 * @see http://mochikit.com/doc/html/MochiKit/DOM.html#fn-appendchildnodes
	 * @param {Node|string} node
	 * @param {*} childNode
	 * @param {...*} [var_args] can be coerced
	 * @return {Node} input node
	 */
    appendChildNodes: function (node, childNode, var_args/*, nodes...*/) {
        var elem = node;
        var self = MochiKit.DOM;
        if (typeof(node) == 'string') {
            elem = self.getElement(node);
        }
        var nodeStack = [
            self.coerceToDOM(
                MochiKit.Base.extend(null, arguments, 1),
                elem
            )
        ];
        var concat = MochiKit.Base.concat;
        while (nodeStack.length) {
            var n = nodeStack.shift();
            if (typeof(n) == 'undefined' || n === null) {
                // pass
            } else if (typeof(n.nodeType) == 'number') {
                elem.appendChild(n);
            } else {
                nodeStack = concat(n, nodeStack);
            }
        }
        return elem;
    },


    /**
	 * @id MochiKit.DOM.insertSiblingNodesBefore
	 * @param {Node|string} node
	 * @param {*} sibling
	 * @param {...*} [var_args] args can be coerced
	 * @return {Node}
	 */
    insertSiblingNodesBefore: function (node/*, nodes...*/, sibling, var_args) {
        var elem = node;
        var self = MochiKit.DOM;
        if (typeof(node) == 'string') {
            elem = self.getElement(node);
        }
        var nodeStack = [
            self.coerceToDOM(
                MochiKit.Base.extend(null, arguments, 1),
                elem
            )
        ];
        var parentnode = elem.parentNode;
        var concat = MochiKit.Base.concat;
        while (nodeStack.length) {
            var n = nodeStack.shift();
            if (typeof(n) == 'undefined' || n === null) {
                // pass
            } else if (typeof(n.nodeType) == 'number') {
                parentnode.insertBefore(n, elem);
            } else {
                nodeStack = concat(n, nodeStack);
            }
        }
        return parentnode;
    },

    /**
	 * @id MochiKit.DOM.insertSiblingNodesAfter
	 * @param {Node|string} node
	 * @param {*} sibling
	 * @param {...*} [var_args] args can be coerced
	 * @return {Node}
	 */
    insertSiblingNodesAfter: function (node/*, nodes...*/, sibling, var_args) {
        var elem = node;
        var self = MochiKit.DOM;

        if (typeof(node) == 'string') {
            elem = self.getElement(node);
        }
        var nodeStack = [
            self.coerceToDOM(
                MochiKit.Base.extend(null, arguments, 1),
                elem
            )
        ];

        if (elem.nextSibling) {
            return self.insertSiblingNodesBefore(elem.nextSibling, nodeStack);
        }
        else {
            return self.appendChildNodes(elem.parentNode, nodeStack);
        }
    },

	/**
	 * @id MochiKit.DOM.replaceChildNodes
	 * @see http://mochikit.com/doc/html/MochiKit/DOM.html#fn-replacechildnodes
	 * if no childnodes are specified this will clear the child list
	 * @param {Node|string} node
	 * @param {...*} [var_args]
	 * @return {Node}
	 */
    replaceChildNodes: function (node, var_args/*, nodes...*/) {
        var elem = node;
        var self = MochiKit.DOM;
        if (typeof(node) == 'string') {
            elem = self.getElement(node);
            arguments[0] = elem;
        }
        var child;
        while ((child = elem.firstChild)) {
            elem.removeChild(child);
        }
        if (arguments.length < 2) {
            return elem;
        } else {
            return self.appendChildNodes.apply(this, arguments);
        }
    },

    /** @id MochiKit.DOM.createDOM */
    createDOM: function (name, attrs/*, nodes... */) {
        var elem;
        var self = MochiKit.DOM;
        var m = MochiKit.Base;
        if (typeof(attrs) == "string" || typeof(attrs) == "number") {
            var args = m.extend([name, null], arguments, 1);
            return arguments.callee.apply(this, args);
        }
        if (typeof(name) == 'string') {
            // Internet Explorer is dumb
            var xhtml = self._xhtml;
            if (attrs && !self.attributeArray.compliant) {
                // http://msdn.microsoft.com/workshop/author/dhtml/reference/properties/name_2.asp
                var contents = "";
                if ('name' in attrs) {
                    contents += ' name="' + self.escapeHTML(attrs.name) + '"';
                }
                if (name == 'input' && 'type' in attrs) {
                    contents += ' type="' + self.escapeHTML(attrs.type) + '"';
                }
                if (contents) {
                    name = "<" + name + contents + ">";
                    xhtml = false;
                }
            }
            var d = self._document;
            if (xhtml && d === document) {
                elem = d.createElementNS("http://www.w3.org/1999/xhtml", name);
            } else {
                elem = d.createElement(name);
            }
        } else {
            elem = name;
        }
        if (attrs) {
            self.updateNodeAttributes(elem, attrs);
        }
        if (arguments.length <= 2) {
            return elem;
        } else {
            var args = m.extend([elem], arguments, 2);
            return self.appendChildNodes.apply(this, args);
        }
    },

    /** @id MochiKit.DOM.createDOMFunc */
    createDOMFunc: function (/* tag, attrs, *nodes */) {
        var m = MochiKit.Base;
        return m.partial.apply(
            this,
            m.extend([MochiKit.DOM.createDOM], arguments)
        );
    },

	/**
	 * @id MochiKit.DOM.removeElement
	 * @param {Element|string} elem
	 * @return {Element}
	 */
    removeElement: function (elem) {
        var self = MochiKit.DOM;
        if (typeof(elem) == "string") {
            elem = self.getElement(elem);
        }
        var e = self.coerceToDOM(elem);
        if (e && e.parentNode) e.parentNode.removeChild(e);
        return e;
    },

	/**
	 * @id MochiKit.DOM.swapDOM
	 * @param {Element|string} dest
	 * @param {Element|string} src
	 * @return {Element} (src)
	 */
    swapDOM: function (dest, src) {
        var self = MochiKit.DOM;
        dest = self.getElement(dest);
        var parent = dest.parentNode;
        if (src) {
            if (typeof(src) == "string") {
                src = self.getElement(src);
            }
            src = self.coerceToDOM(src, parent);
            parent.replaceChild(src, dest);
        } else {
            parent.removeChild(dest);
        }
        return src;
    },

	/**
	 * @id MochiKit.DOM.getElement
	 * note: although this fn can return an array this
	 * is currently not annotated since it is seldom(?)
	 * used and would just complicate other annotation
	 * @param {(string|Object|Element)} id
	 * //param {...(string|Element)} var_args
	 * //return {(Element|Array.<Element>)}
	 * @return {Element}
	 */
    getElement: function (id/*, var_args*/) {
        var self = MochiKit.DOM;
        if (arguments.length == 1) {
            return ((typeof(id) == "string") ?
                self._document.getElementById(id) : id);
        } else {
            return MochiKit.Base.map(self.getElement, arguments);
        }
    },

	/**
	 * Sniffs for the best impl on current platform (IE _really_ needs this on larger DOMs).
	 * todo: should merge this "deeper" with the existing getElementsByTagAndClassName function (now only in the simplest tagName=* case)
	 *
	 * Based on code by Robert Nyman, http://www.robertnyman.com, Code/licensing: http://code.google.com/p/getelementsbyclassname/
	 * see also http://robertnyman.com/2008/05/27/the-ultimate-getelementsbyclassname-anno-2008/
	 *
	 * @param {string} className(s) separate classes by space to lookup multiple (any order, AND combination)
	 * @param {(!Element|string)=} [elm=document] starting root node
	 * @return {!Array.<!Element>} (Not a nodelist) empty list if no elems found
	 */
	getElementsByClassName: function(className, /*optional*/parent) {
		var self = MochiKit.DOM;
		if (self._document.getElementsByClassName) {
			// native implementation (todo: is this case worth checking? http://robertnyman.com/2008/05/27/the-ultimate-getelementsbyclassname-anno-2008/#comment-600797)
			self.getElementsByClassName = function(className, elm) {
				elm = elm || self._document;
				elm = self.getElement(elm);

				var elements = elm.getElementsByClassName(className);
				return MochiKit.Base.extend([], elements); // transform nodelist to real array
			};
		} else if (self._document.evaluate) {
			// XPath impl
			self.getElementsByClassName = function(className, elm) {
				elm = elm || self._document;
				elm = self.getElement(elm);

				var classes = className.split(" ");
				var classesToCheck = "";
				for (var k = 0, kl = classes.length; k < kl; ++k) {
					classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[k] + " ')]";
				}

				var tag = '*'; // todo: remove tag search from expression altogether?
				var elements = [];
				try {
					var xhtmlNamespace = "http://www.w3.org/1999/xhtml";
					var namespaceResolver = (self._document.documentElement.namespaceURI === xhtmlNamespace) ? xhtmlNamespace : null; // could move this to precalc stage?
					elements = self._document.evaluate(".//" + tag + classesToCheck, elm, namespaceResolver, 0, null);
				} catch (e) {
					elements = self._document.evaluate(".//" + tag + classesToCheck, elm, null, 0, null);
				}

				// todo: drop thsi Iter dep.
				return MochiKit.Iter.list(elements); // transform to real array (iterates using iterateNext)
			};
		} else {
			// fallback to getElementsByTagName and filtering
			self.getElementsByClassName = function(className, elm) {
				elm = elm || self._document;
				elm = self.getElement(elm);

				var classes = className.split(" ");
				var classesToCheck = [];
				for (var k = 0, kl = classes.length; k < kl; ++k) {
					classesToCheck.push(new RegExp("(^|\\s)" + classes[k] + "(\\s|$)"));
				}

				var elements = elm.all ? elm.all : elm.getElementsByTagName('*');

				var returnElements = [];
				for (var l = 0, ll = elements.length; l < ll; ++l) {
					var current = elements[l];

					var match = false;
					for (var m = 0, ml = classesToCheck.length; m < ml; ++m) {
						match = classesToCheck[m].test(current.className);
						if (!match)
							break;
					}
					if (match) {
						returnElements.push(current);
					}
				}
				return returnElements;
			};
		}

		return self.getElementsByClassName(className, parent);
	},

    /** @id MochiKit.DOM.getElementsByTagAndClassName */
    getElementsByTagAndClassName: function (tagName, className,
            /* optional */parent) {
        var self = MochiKit.DOM;
        if (typeof(tagName) == 'undefined' || tagName === null) {
            tagName = '*';
        }
        if (typeof(parent) == 'undefined' || parent === null) {
            parent = self._document;
        }
        parent = self.getElement(parent);
        if (parent == null) {
            return [];
        }
		if (tagName == '*') {
			// simple fast-path. todo: should integrate deeper
			return self.getElementsByClassName(className, parent);
		}

        var children = (parent.getElementsByTagName(tagName)
            || self._document.all);
        if (typeof(className) == 'undefined' || className === null) {
            return MochiKit.Base.extend(null, children);
        }

        var elements = [];
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var cls = child.className;
            if (typeof(cls) != "string") {
                cls = child.getAttribute("class");
            }
            if (typeof(cls) == "string") {
                var classNames = cls.split(' ');
                for (var j = 0; j < classNames.length; j++) {
                    if (classNames[j] == className) {
                        elements.push(child);
                        break;
                    }
                }
            }
        }

        return elements;
    },

	/** @private */
    _newCallStack: function (path, once) {
        var rval = function () {
            var callStack = arguments.callee.callStack;
            for (var i = 0; i < callStack.length; i++) {
                if (callStack[i].apply(this, arguments) === false) {
                    break;
                }
            }
            if (once) {
                try {
                    this[path] = null;
                } catch (e) {
                    // pass
                }
            }
        };
        rval.callStack = [];
        return rval;
    },

    /** @id MochiKit.DOM.addToCallStack */
    addToCallStack: function (target, path, func, once) {
        var self = MochiKit.DOM;
        var existing = target[path];
        var regfunc = existing;
        if (!(typeof(existing) == 'function'
                && typeof(existing.callStack) == "object"
                && existing.callStack !== null)) {
            regfunc = self._newCallStack(path, once);
            if (typeof(existing) == 'function') {
                regfunc.callStack.push(existing);
            }
            target[path] = regfunc;
        }
        regfunc.callStack.push(func);
    },

    /** @id MochiKit.DOM.addLoadEvent */
    addLoadEvent: function (func) {
        var self = MochiKit.DOM;
        self.addToCallStack(self._window, "onload", func, true);
    },

    /** @id MochiKit.DOM.focusOnLoad */
    focusOnLoad: function (element) {
        var self = MochiKit.DOM;
        self.addLoadEvent(function () {
            element = self.getElement(element);
            if (element) {
                element.focus();
            }
        });
    },

    /**
     * @id MochiKit.DOM.setElementClass
     * @param {string|!Element} element
     * @param {string} className
     */
    setElementClass: function (element, className) {
        var self = MochiKit.DOM;
        var obj = self.getElement(element);
        if (self.attributeArray.compliant) {
            obj.setAttribute("class", className);
        } else {
            obj.setAttribute("className", className);
        }
    },

	/**
	 * @id MochiKit.DOM.toggleElementClass
	 * @see http://mochikit.com/doc/html/MochiKit/DOM.html#fn-toggleelementclass
	 * @param {string} className
	 * @param {!Element|string} element
	 * @param {...(!Element|string)} [var_args]
	 */
    toggleElementClass: function (className, element, var_args/*, element... */) {
        var self = MochiKit.DOM;
        for (var i = 1; i < arguments.length; i++) {
            var obj = self.getElement(arguments[i]);
            if (!self.addElementClass(obj, className)) {
                self.removeElementClass(obj, className);
            }
        }
    },

    /**
     * @id MochiKit.DOM.addElementClass
     * @param {string|!Element} element
     * @param {string} className
     * @return {boolean}
     */
    addElementClass: function (element, className) {
        var self = MochiKit.DOM;
        var obj = self.getElement(element);
        var cls = obj.className;
        if (typeof(cls) != "string") {
            cls = obj.getAttribute("class");
        }
        // trivial case, no className yet
        if (typeof(cls) != "string" || cls.length === 0) {
            self.setElementClass(obj, className);
            return true;
        }
        // the other trivial case, already set as the only class
        if (cls == className) {
            return false;
        }
        var classes = cls.split(" ");
        for (var i = 0; i < classes.length; i++) {
            // already present
            if (classes[i] == className) {
                return false;
            }
        }
        // append class
        self.setElementClass(obj, cls + " " + className);
        return true;
    },

    /**
     * @id MochiKit.DOM.removeElementClass
     * @param {string|!Element} element
     * @param {string} className
     * @return {boolean}
     */
    removeElementClass: function (element, className) {
        var self = MochiKit.DOM;
        var obj = self.getElement(element);
        var cls = obj.className;
        if (typeof(cls) != "string") {
            cls = obj.getAttribute("class");
        }
        // trivial case, no className yet
        if (typeof(cls) != "string" || cls.length === 0) {
            return false;
        }
        // other trivial case, set only to className
        if (cls == className) {
            self.setElementClass(obj, "");
            return true;
        }
        var classes = cls.split(" ");
        for (var i = 0; i < classes.length; i++) {
            // already present
            if (classes[i] == className) {
                // only check sane case where the class is used once
                classes.splice(i, 1);
                self.setElementClass(obj, classes.join(" "));
                return true;
            }
        }
        // not found
        return false;
    },

    /**
	 * @id MochiKit.DOM.swapElementClass
	 * @param {Element|string} element
	 * @param {string} fromClass
	 * @param {string} toClass
	 * @return {boolean}
	 */
    swapElementClass: function (element, fromClass, toClass) {
        var obj = MochiKit.DOM.getElement(element);
        var res = MochiKit.DOM.removeElementClass(obj, fromClass);
        if (res) {
            MochiKit.DOM.addElementClass(obj, toClass);
        }
        return res;
    },

    /**
     * @id MochiKit.DOM.hasElementClass
     * @param {string|!Element} element
     * @param {string} className
     * @param {...string} [var_args]
     * @return {boolean}
     */
    hasElementClass: function (element, className, var_args/*...*/) {
        var obj = MochiKit.DOM.getElement(element);
        if (obj == null) {
            return false;
        }
        var cls = obj.className;
        if (typeof(cls) != "string" && typeof(obj.getAttribute) == "function") {
            cls = obj.getAttribute("class");
        }
        if (typeof(cls) != "string") {
            return false;
        }
        var classes = cls.split(" ");
        for (var i = 1; i < arguments.length; i++) {
            var good = false;
            for (var j = 0; j < classes.length; j++) {
                if (classes[j] == arguments[i]) {
                    good = true;
                    break;
                }
            }
            if (!good) {
                return false;
            }
        }
        return true;
    },

    /**
	 * @id MochiKit.DOM.escapeHTML
	 * @param {string} s
	 * @return {string}
	 */
    escapeHTML: function (s) {
        return s.replace(/&/g, "&amp;"
            ).replace(/"/g, "&quot;"
            ).replace(/</g, "&lt;"
            ).replace(/>/g, "&gt;");
    },

    /** @id MochiKit.DOM.toHTML */
    toHTML: function (dom) {
        return MochiKit.DOM.emitHTML(dom).join("");
    },

    /**
	 * @id MochiKit.DOM.emitHTML
	 * @param {Node} dom
	 * @param {Array=} [lst]
	 * @return {!Array}
	 */
    emitHTML: function (dom, /* optional */lst) {
        if (typeof(lst) == 'undefined' || lst === null) {
            lst = [];
        }
        // queue is the call stack, we're doing this non-recursively
        var queue = [dom];
        var self = MochiKit.DOM;
        var escapeHTML = self.escapeHTML;
        var attributeArray = self.attributeArray;
        while (queue.length) {
            dom = queue.pop();
            if (typeof(dom) == 'string') {
                lst.push(dom);
            } else if (dom.nodeType == 1) {
                // we're not using higher order stuff here
                // because safari has heisenbugs.. argh.
                //
                // I think it might have something to do with
                // garbage collection and function calls.
                lst.push('<' + dom.tagName.toLowerCase());
                var attributes = [];
                var domAttr = attributeArray(dom);
                for (var i = 0; i < domAttr.length; i++) {
                    var a = domAttr[i];
                    attributes.push([
                        " ",
                        a.name,
                        '="',
                        escapeHTML(a.value),
                        '"'
                    ]);
                }
                attributes.sort();
                for (i = 0; i < attributes.length; i++) {
                    var attrs = attributes[i];
                    for (var j = 0; j < attrs.length; j++) {
                        lst.push(attrs[j]);
                    }
                }
                if (dom.hasChildNodes()) {
                    lst.push(">");
                    // queue is the FILO call stack, so we put the close tag
                    // on first
                    queue.push("</" + dom.tagName.toLowerCase() + ">");
                    var cnodes = dom.childNodes;
                    for (i = cnodes.length - 1; i >= 0; i--) {
                        queue.push(cnodes[i]);
                    }
                } else {
                    lst.push('/>');
                }
            } else if (dom.nodeType == 3) {
                lst.push(escapeHTML(dom.nodeValue));
            }
        }
        return lst;
    },

    /** @id MochiKit.DOM.scrapeText */
    scrapeText: function (node, /* optional */asArray) {
        var rval = [];
        (function (node) {
            var cn = node.childNodes;
            if (cn) {
                for (var i = 0; i < cn.length; i++) {
                    arguments.callee.call(this, cn[i]);
                }
            }
            var nodeValue = node.nodeValue;
            if (typeof(nodeValue) == 'string') {
                rval.push(nodeValue);
            }
        })(MochiKit.DOM.getElement(node));
        if (asArray) {
            return rval;
        } else {
            return rval.join("");
        }
    },

	/**
	 * @id MochiKit.DOM.removeEmptyTextNodes
	 * @see http://mochikit.com/doc/html/MochiKit/DOM.html#fn-removeemptytextnodes
	 * @param {!Node|string} element
	 */
    removeEmptyTextNodes: function (element) {
        element = MochiKit.DOM.getElement(element);
        for (var i = 0; i < element.childNodes.length; i++) {
            var node = element.childNodes[i];
            if (node.nodeType == 3 && !/\S/.test(node.nodeValue)) {
                node.parentNode.removeChild(node);
            }
        }
    },

	/**
	 * @id MochiKit.DOM.getFirstElementByTagAndClassName
	 * todo: insert the byClassName optimization
	 * @param {?string} tagName
	 * @param {?string} className
	 * @param {(Node|string)=} [parent=document]
	 * @return {Element}
	 */
    getFirstElementByTagAndClassName: function (tagName, className,
            /* optional */parent) {
        var self = MochiKit.DOM;
        if (typeof(tagName) == 'undefined' || tagName === null) {
            tagName = '*';
        }
        if (typeof(parent) == 'undefined' || parent === null) {
            parent = self._document;
        }
        parent = self.getElement(parent);
        if (parent == null) {
            return null;
        }
        var children = (parent.getElementsByTagName(tagName)
            || self._document.all);
        if (children.length <= 0) {
            return null;
        } else if (typeof(className) == 'undefined' || className === null) {
            return children[0];
        }

        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var cls = child.className;
            if (typeof(cls) != "string") {
                cls = child.getAttribute("class");
            }
            if (typeof(cls) == "string") {
                var classNames = cls.split(' ');
                for (var j = 0; j < classNames.length; j++) {
                    if (classNames[j] == className) {
                        return child;
                    }
                }
            }
        }
        return null;
    },

	/**
	 * @id MochiKit.DOM.getFirstParentByTagAndClassName
	 * @param {Element|string} elem
	 * @param {?string} tagName
	 * @param {?string} className
	 * @return {Element}
	 */
    getFirstParentByTagAndClassName: function (elem, tagName, className) {
        var self = MochiKit.DOM;
        elem = self.getElement(elem);
        if (typeof(tagName) == 'undefined' || tagName === null) {
            tagName = '*';
        } else {
            tagName = tagName.toUpperCase();
        }
        if (typeof(className) == 'undefined' || className === null) {
            className = null;
        }
        if (elem) {
            elem = elem.parentNode;
        }
        while (elem && elem.tagName) {
            var curTagName = elem.tagName.toUpperCase();
            if ((tagName === '*' || tagName == curTagName) &&
                (className === null || self.hasElementClass(elem, className))) {
                return elem;
            }
            elem = elem.parentNode;
        }
        return null;
    },

	/** @this {MochiKit.DOM} */
    __new__: function (win) {

        var m = MochiKit.Base;
        if (typeof(document) != "undefined") {
            this._document = document;
            var kXULNSURI = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
            MochiKit.DOM._xhtml = (document.documentElement &&
                document.createElementNS &&
                document.documentElement.namespaceURI === kXULNSURI);
        } else if (MochiKit.MockDOM) {
            this._document = MochiKit.MockDOM.document;
        }
        this._window = win;

        MochiKit.DOM.domConverters = new m.AdapterRegistry();

        var __tmpElement = this._document.createElement("span");
        var attributeArray;
        if (__tmpElement && __tmpElement.attributes &&
                __tmpElement.attributes.length > 0) {
            // for braindead browsers (IE) that insert extra junk
            var filter = m.filter;
            attributeArray = function (node) {
                /***

                    Return an array of attributes for a given node,
                    filtering out attributes that don't belong for
                    that are inserted by "Certain Browsers".

                ***/
                return filter(attributeArray.ignoreAttrFilter, node.attributes);
            };
            attributeArray.ignoreAttr = {};
            var attrs = __tmpElement.attributes;
            var ignoreAttr = attributeArray.ignoreAttr;
            for (var i = 0; i < attrs.length; i++) {
                var a = attrs[i];
                ignoreAttr[a.name] = a.value;
            }
            attributeArray.ignoreAttrFilter = function (a) {
                return (attributeArray.ignoreAttr[a.name] != a.value);
            };
            attributeArray.compliant = false;
            attributeArray.renames = {
				// todo: verify if we might need to add: accesskey, maxlength, tabindex, valign
                "class": "className",
                "checked": "defaultChecked",
                "usemap": "useMap",
                "for": "htmlFor",
                "readonly": "readOnly",
                "colspan": "colSpan",
                "rowspan": "rowSpan",
                "bgcolor": "bgColor",
                "cellspacing": "cellSpacing",
                "cellpadding": "cellPadding"
            };
        } else {
            attributeArray = function (node) {
                return node.attributes;
            };
            attributeArray.compliant = true;
            attributeArray.ignoreAttr = {};
            attributeArray.renames = {};
        }
        attributeArray.__export__ = false;
        MochiKit.DOM.attributeArray = attributeArray;

        // Backwards compatibility aliases
        /** @id MochiKit.DOM.computedStyle  */
        m._deprecated(this, 'computedStyle', 'MochiKit.Style.getStyle', '1.4', true);
        /** @id MochiKit.DOM.elementDimensions  */
        m._deprecated(this, 'elementDimensions', 'MochiKit.Style.getElementDimensions', '1.4');
        /** @id MochiKit.DOM.elementPosition  */
        m._deprecated(this, 'elementPosition', 'MochiKit.Style.getElementPosition', '1.4');
        /** @id MochiKit.DOM.getViewportDimensions */
        m._deprecated(this, 'getViewportDimensions', 'MochiKit.Style.getViewportDimensions', '1.4');
        /** @id MochiKit.DOM.hideElement */
        m._deprecated(this, 'hideElement', 'MochiKit.Style.hideElement', '1.4');
        /** @id MochiKit.DOM.makeClipping */
        m._deprecated(this, 'makeClipping', 'MochiKit.Style.makeClipping', '1.4.1');
        /** @id MochiKit.DOM.makePositioned */
        m._deprecated(this, 'makePositioned', 'MochiKit.Style.makePositioned', '1.4.1');
        /** @id MochiKit.DOM.setElementDimensions */
        m._deprecated(this, 'setElementDimensions', 'MochiKit.Style.setElementDimensions', '1.4');
        /** @id MochiKit.DOM.setElementPosition */
        m._deprecated(this, 'setElementPosition', 'MochiKit.Style.setElementPosition', '1.4');
        /** @id MochiKit.DOM.setDisplayForElement */
        m._deprecated(this, 'setDisplayForElement', 'MochiKit.Style.setDisplayForElement', '1.4');
        /** @id MochiKit.DOM.setOpacity */
        m._deprecated(this, 'setOpacity', 'MochiKit.Style.setOpacity', '1.4');
        /** @id MochiKit.DOM.showElement */
        m._deprecated(this, 'showElement', 'MochiKit.Style.showElement', '1.4');
        /** @id MochiKit.DOM.undoClipping */
        m._deprecated(this, 'undoClipping', 'MochiKit.Style.undoClipping', '1.4.1');
        /** @id MochiKit.DOM.undoPositioned */
        m._deprecated(this, 'undoPositioned', 'MochiKit.Style.undoPositioned', '1.4.1');
        /** @id MochiKit.DOM.Coordinates */
        m._deprecated(this, 'Coordinates', 'MochiKit.Style.Coordinates', '1.4');
        /** @id MochiKit.DOM.Dimensions */
        m._deprecated(this, 'Dimensions', 'MochiKit.Style.Dimensions', '1.4');

        // shorthand for createDOM syntax
        var createDOMFunc = this.createDOMFunc;
        /** @id MochiKit.DOM.A */
        MochiKit.DOM.A = createDOMFunc("a");
        /** @id MochiKit.DOM.ARTICLE */
        MochiKit.DOM.ARTICLE = createDOMFunc("article");
        /** @id MochiKit.DOM.ASIDE */
        MochiKit.DOM.ASIDE = createDOMFunc("aside");
        /** @id MochiKit.DOM.AUDIO */
        MochiKit.DOM.AUDIO = createDOMFunc("audio");
        /** @id MochiKit.DOM.BR */
        MochiKit.DOM.BR = createDOMFunc("br");
        /** @id MochiKit.DOM.BUTTON */
        MochiKit.DOM.BUTTON = createDOMFunc("button");
        /** @id MochiKit.DOM.CANVAS */
        MochiKit.DOM.CANVAS = createDOMFunc("canvas");
        /** @id MochiKit.DOM.CAPTION */
        MochiKit.DOM.CAPTION = createDOMFunc("caption");
        /** @id MochiKit.DOM.CITE */
        MochiKit.DOM.CITE = createDOMFunc("cite");
        /** @id MochiKit.DOM.CODE */
        MochiKit.DOM.CODE = createDOMFunc("code");
        /** @id MochiKit.DOM.DD */
        MochiKit.DOM.DD = createDOMFunc("dd");
        /** @id MochiKit.DOM.DEL */
        MochiKit.DOM.DEL = createDOMFunc("del");
        /** @id MochiKit.DOM.DFN */
        MochiKit.DOM.DFN = createDOMFunc("dfn");
        /** @id MochiKit.DOM.DIV */
        MochiKit.DOM.DIV = createDOMFunc("div");
        /** @id MochiKit.DOM.DL */
        MochiKit.DOM.DL = createDOMFunc("dl");
        /** @id MochiKit.DOM.DT */
        MochiKit.DOM.DT = createDOMFunc("dt");
        /** @id MochiKit.DOM.EM */
        MochiKit.DOM.EM = createDOMFunc("em");
		/** @id MochiKit.DOM.EMBED */
		MochiKit.DOM.EMBED = createDOMFunc("embed");
        /** @id MochiKit.DOM.FIELDSET */
        MochiKit.DOM.FIELDSET = createDOMFunc("fieldset");
        /** @id MochiKit.DOM.FIGURE */
        MochiKit.DOM.FIGURE = createDOMFunc("figure");
        /** @id MochiKit.DOM.FIGCAPTION */
        MochiKit.DOM.FIGCAPTION = createDOMFunc("figcaption");
        /** @id MochiKit.DOM.FOOTER */
        MochiKit.DOM.FOOTER = createDOMFunc("footer");
        /** @id MochiKit.DOM.FORM */
        MochiKit.DOM.FORM = createDOMFunc("form");
        /** @id MochiKit.DOM.H1 */
        MochiKit.DOM.H1 = createDOMFunc("h1");
        /** @id MochiKit.DOM.H2 */
        MochiKit.DOM.H2 = createDOMFunc("h2");
        /** @id MochiKit.DOM.H3 */
        MochiKit.DOM.H3 = createDOMFunc("h3");
        /** @id MochiKit.DOM.H4 */
        MochiKit.DOM.H4 = createDOMFunc("h4");
        /** @id MochiKit.DOM.H5 */
        MochiKit.DOM.H5 = createDOMFunc("h5");
        /** @id MochiKit.DOM.H6 */
        MochiKit.DOM.H6 = createDOMFunc("h6");
        /** @id MochiKit.DOM.HEADER */
        MochiKit.DOM.HEADER = createDOMFunc("header");
        /** @id MochiKit.DOM.HGROUP */
        MochiKit.DOM.HGROUP = createDOMFunc("hgroup");
        /** @id MochiKit.DOM.HR */
        MochiKit.DOM.HR = createDOMFunc("hr");
        /** @id MochiKit.DOM.I */
        MochiKit.DOM.I = createDOMFunc("i");
        /** @id MochiKit.DOM.IFRAME */
        MochiKit.DOM.IFRAME = createDOMFunc("iframe");
        /** @id MochiKit.DOM.IMG */
        MochiKit.DOM.IMG = createDOMFunc("img");
        /** @id MochiKit.DOM.INPUT */
        MochiKit.DOM.INPUT = createDOMFunc("input");
        /** @id MochiKit.DOM.KBD */
        MochiKit.DOM.KBD = createDOMFunc("kbd");
        /** @id MochiKit.DOM.LABEL */
        MochiKit.DOM.LABEL = createDOMFunc("label");
        /** @id MochiKit.DOM.LEGEND */
        MochiKit.DOM.LEGEND = createDOMFunc("legend");
        /** @id MochiKit.DOM.LI */
        MochiKit.DOM.LI = createDOMFunc("li");
        /** @id MochiKit.DOM.LINK */
        MochiKit.DOM.LINK = createDOMFunc("link");
        /** @id MochiKit.DOM.MARK */
        MochiKit.DOM.MARK = createDOMFunc("mark");
        /** @id MochiKit.DOM.METER */
        MochiKit.DOM.METER = createDOMFunc("meter");
        /** @id MochiKit.DOM.NAV */
        MochiKit.DOM.NAV = createDOMFunc("nav");
        /** @id MochiKit.DOM.OL */
        MochiKit.DOM.OL = createDOMFunc("ol");
        /** @id MochiKit.DOM.OPTGROUP */
        MochiKit.DOM.OPTGROUP = createDOMFunc("optgroup");
        /** @id MochiKit.DOM.OPTION */
        MochiKit.DOM.OPTION = createDOMFunc("option");
        /** @id MochiKit.DOM.P */
        MochiKit.DOM.P = createDOMFunc("p");
        /** @id MochiKit.DOM.PRE */
        MochiKit.DOM.PRE = createDOMFunc("pre");
        /** @id MochiKit.DOM.PROGRESS */
        MochiKit.DOM.PROGRESS = createDOMFunc("progress");
        /** @id MochiKit.DOM.SAMP */
        MochiKit.DOM.SAMP = createDOMFunc("samp");
        /** @id MochiKit.DOM.SCRIPT */
        MochiKit.DOM.SCRIPT = createDOMFunc("script");
        /** @id MochiKit.DOM.SECTION */
        MochiKit.DOM.SECTION = createDOMFunc("section");
        /** @id MochiKit.DOM.SELECT */
        MochiKit.DOM.SELECT = createDOMFunc("select");
		/** @id MochiKit.DOM.SOURCE */
		MochiKit.DOM.SOURCE = createDOMFunc("source");
        /** @id MochiKit.DOM.SPAN */
        MochiKit.DOM.SPAN = createDOMFunc("span");
        /** @id MochiKit.DOM.STRONG */
        MochiKit.DOM.STRONG = createDOMFunc("strong");
        /** @id MochiKit.DOM.STYLE */
        MochiKit.DOM.STYLE = createDOMFunc("style");
        /** @id MochiKit.DOM.SUB */
        MochiKit.DOM.SUB = createDOMFunc("sub");
        /** @id MochiKit.DOM.SUP */
        MochiKit.DOM.SUP = createDOMFunc("sup");
        /** @id MochiKit.DOM.TABLE */
        MochiKit.DOM.TABLE = createDOMFunc("table");
        /** @id MochiKit.DOM.TBODY */
        MochiKit.DOM.TBODY = createDOMFunc("tbody");
        /** @id MochiKit.DOM.TD */
        MochiKit.DOM.TD = createDOMFunc("td");
        /** @id MochiKit.DOM.TEXTAREA */
        MochiKit.DOM.TEXTAREA = createDOMFunc("textarea");
        /** @id MochiKit.DOM.TFOOT */
        MochiKit.DOM.TFOOT = createDOMFunc("tfoot");
        /** @id MochiKit.DOM.TH */
        MochiKit.DOM.TH = createDOMFunc("th");
        /** @id MochiKit.DOM.THEAD */
        MochiKit.DOM.THEAD = createDOMFunc("thead");
		/** @id MochiKit.DOM.TIME */
		MochiKit.DOM.TIME = createDOMFunc("time");
        /** @id MochiKit.DOM.TR */
        MochiKit.DOM.TR = createDOMFunc("tr");
        /**
		 * @id MochiKit.DOM.TT
		 * @deprecated
		 */
        MochiKit.DOM.TT = createDOMFunc("tt");
        /** @id MochiKit.DOM.UL */
        MochiKit.DOM.UL = createDOMFunc("ul");
        /** @id MochiKit.DOM.VAR */
        MochiKit.DOM.VAR = createDOMFunc("var");
		/** @id MochiKit.DOM.VIDEO */
		MochiKit.DOM.VIDEO = createDOMFunc("video"); // see <source> also

        /** @id MochiKit.DOM.NBSP */
        MochiKit.DOM.NBSP = "\u00a0";

        /** @id MochiKit.DOM.$ */
        MochiKit.DOM.$ = this.getElement;

        m.nameFunctions(this);
    }
});


MochiKit.DOM.__new__(((typeof(window) == "undefined") ? this : window));

//
// XXX: Internet Explorer blows
//
if (MochiKit.__export__) {
    window.withWindow = MochiKit.DOM.withWindow;
    window.withDocument = MochiKit.DOM.withDocument;
}

MochiKit.Base._exportSymbols(this, MochiKit.DOM);
