20XX-YY-ZZ      v1.5

- Changed MochiKit.Signal.signal to support DOM source objects with custom
  arguments, instead of always wrapping into Event object.
- Removed the Dojo and JSAN integrations, since they are not maintained.
- Simplified module init and export code, saving up to 5kB in packed
  download size.
- Changed MochiKit.Selector.findChildElements to support element lookup
  via MochiKit.DOM.getElement.
- Fixed MochiKit.DOM.hasElementClass handling of text DOM nodes (#330).
- Reimplemented MochiKit.Format.truncToFixed and roundToFixed to resolve
  rounding errors and other issues (#333).
- Fixed MochiKit.Style.getElementPosition when using a 0,0 relative
  position (#332).
- Fixed bug with empty iterators in MochiKit.Iter.chain (#2).
- Fixed inverted width and height in MochiKit.Visual.squish().
- Modified MochiKit.DateTime.toISOTime() to handle the previously
  undocumented ``realISO`` argument correctly.
- Added new MochiKit.Text module to eventually replace MochiKit.Format.
- Added the MochiKit.Base.bool() function.
- Added MochiKit.Visual.Transitions.spring for creating "springy" effects
- Changed MochiKit.Visual to support specifying transitions a strings.
- Added new 'replace' queue position to MochiKit.Visual for cancelling
  existing effects instead of completing them (as 'break' does).
- Removed MochiKit.Visual.Color and getElementsComputedStyle compatibility
  aliases (obsolete since version 1.1, see #337).
- Added the MochiKit.Async.Deferred.prototype.setFinalizer() function.
- Added "rowSpan" attribute mapping in MochiKit.DOM for IE (#357).
- Added MochiKit.DOM.NBSP string constant (#246).
- Added the MochiKit.Signal.connectOnce() function.
- Added the MochiKit.Base.isValue() function.
- Added MochiKit.Async.loadScript() function.
- New optional error argument to Deferred.prototype.cancel().
- Improved speed of MochiKit.Selector by using querySelectorAll() if possible.
- Added MochiKit.Base.serializeJSON() support for toJSON() methods.
  Note that this affects Date object serialization is some browsers.
- Added state() method for MochiKit.Async.Deferred. Also clarified docs on
  available properties.
- Removed MochiKit.Style dependency from MochiKit.Signal. This also subtly
  changes the mouse event coordinate values, but should be compatible.
- Added new MochiKit.Base.module() and moduleExport() functions.
- Added new MochiKit.DOM creator functions; ARTICLE, ASIDE, CAPTION, FIGURE,
  FIGCAPTION, FOOTER, HEADER, HGROUP, IFRAME, LINK, MARK, METER, NAV,
  PROGRESS, SCRIPT and STYLE.
- Fixed MochiKit.Async.XHR issue in Firefox and Chrome for local resources
  (issue #11).
- Added new "responseType" option to MochiKit.Async.doXHR().
- Added new "withCredentials" option to MochiKit.Async.doXHR().

- *https://github.com/blq/mochikit fork changes start here*

- Made all modules have Google Closure module dependency specifications

- Added Base-ext module
- Added "bind 2.0". Support for placeholder arguments and nesting. Similar to the C++ Boost bind lib.
- Added Base.bind2, partial2, method2, bindLate2,
- Added Base.protect, apply
- Added Base.isBoundFunction
- Added Base.partition
- Added Base.operator.getitem, setitem, delitem, pow, floordiv, concat, iconcat
- Added an optional 'step' parameter to Base.counter()
- Made all base Base.operators named (have .NAME property)
- Added Base.countValue

- Added Iter-ext module
- Added Iter.treePreOrder, treeLevelOrder, treePostOrder
- Added Iter.pairIter
- Added Iter.windowView
- Added Iter.uniqueView
- Added Iter.izipLongest
- Added Iter.iproduct
- Added Iter.enumerate
- Added Iter.chainFromIter
- Added Iter.iflattenArray
- Added Iter.filterMap
- Added alias to Iter.any=some, all=every, starmap=applymap
- Added Iter.isSorted
- Added an optional 'step' parameter to Iter.count() (symmetry with Base.counter() change)
- Fixed Iter.islice bug. consuming one item too much. Added unit tests to verify.
- Added Iter.advance
- Made Iter.iextend take an optional 'skip' param similar to Base.extend()
- Added Iter.generateN
- Added Iter.remapView
- Added Iter.interleave
- Added Iter.compressIter
- Added Iter.combinations
- Added Iter.combinationsWithReplacement
- Added Iter.repeatSeq
- Added Iter.xrange
- Added Iter.permutations
- Added Iter.EmptyIter
- Made Iter.iter() support objects with the __iterator__ decorator function (ES 1.7)

- Added Text-ext module
- Added Text.humanStringCompare
- Added Text.levenshteinDistance

- Added HeapQ module based on the Python.heapq module API.
- Added HeapQ.heapify, heapPush, heapPop, isHeap, heapReplace, heapPushPop, heapSort
- Added example priority queue class based on the heap functions
- Added HeapQ.imergeSorted
- Added HeapQ.nSmallest and nLargest (partial sorting)
- Added HeapQ.heapIter

- Made DOM.removeElement silently handle null, as well as already removed elements
- Added DOM.getElementsByClassName that uses browser-optimized paths
- Made the simplest tagName=* case in DOM.getElementsByTagAndClassName use the optimization

- Changed Async.addCallback/addErrback to interpret no return value as piping, i.e pass on the last non-void value.

- Added Random module.
- Added Random.randRange
- Added Random.shuffle, sample, choice, uniform
- Added an explicit Mersenne Twister 19937 random number generator
- Added support for Random.seed(), getState() and setState()

- Added Bisect module based on the Python.bisect module API.
- Added Bisect.bisectLeft, bisectRight, insortLeft, insortRight
- Added a SortedCollection example class based on the Bisect module
- Added a Set example class based on the Bisect module

- Added a javaLikeIterator to support .hasNext/.next style iterators

- Base.bindMethods now returns self to enable inline usage
- Added Base.operator.max and Base.operator.min
- Added Signal.disconnectAllFromTo

- Support for namespaced signals (similar to jQuery)
- Added Async.timeout and Async.when
- Added Iter.accumulate and Iter.limit
- Added Iter.pluck
- Added Iter.chunked
- Added Iter.zipWith

- Added DOM shorthand alias for <audio>, <video>, <source> etc

- Added Base.operator.call

- Iter.next can now take an optional default value to be returned if iterable is exhausted. Similar to Python.


20XX-YY-ZZ      v1.4.3 (bug fix release)

- Fixed MochiKit.Logging usage of map without a namespace (#338).
- Fixed MochiKit.Color.Color.prototype.isLight() and isDark() to not
  return constant false and true values (#341).
- Fixed incorrect z-index restore after MochiKit.DragAndDrop usage (#339).
- Fixed MochiKit.Async.wait() handling of missing optional value (#345).
- Fixed MochiKit.Signal.signal() re-entrancy locking when observers
  both disconnect other observers and signal new events (#346).
- Fixed possible exception throwing in MochiKit.Base.repr() (#353).
- Added MochiKit.Signal.Event.prototype.mouse() support for HTML5
  drag events (#354).

2008-11-27      v1.4.2 (bug fix release)

- Changed default packed version to contain all modules (since easy
  customization is now available).
- More fixes in MochiKit.Style.getElementDimensions for IE and hidden
  elements (#325).
- Fixed issue in MochiKit.Style.getViewportDimensions when called within the
  document HEAD.
- Fixed MochiKit.DOM.coerceToDOM() handling of arrays when MochiKit.Iter
  is not loaded (#328).

2008-11-02      v1.4.1 (bug fix release)

- Added export of deprecated MochiKit.DOM.computedStyle function (#324).
- Fixed issue in MochiKit.Style.getElementDimensions when elements are
  hidden due to CSS class definitions (#325).
- Moved makePositioned, undoPositioned, makeClipping and undoClipping
  from MochiKit.DOM to MochiKit.Style due to circular dependency (#327).
- Fixed makeClipping and undoClipping to handle overflow-x and overflow-y
  styles correctly (#326).
- Fixed issue with Event.relatedTarget() sometimes returning XUL elements
  in Mozilla-based browsers (#322).

2008-10-21      v1.4

- Added pt_BR to MochiKit.Format.LOCALE.
- MochiKit.Async now sets the "X-Requested-With: XMLHttpRequest" header,
  a de facto standard (Prototype, jQuery, Mootools).
- MochiKit.Signal custom handlers no longer cause callbacks to get re-bound to
  the source if they were previously bound.
- Fixed MochiKit.Signal.signal re-entrancy bug that could cause recently
  disconnected slots to get signaled.
- MochiKit.Base.evalJSON will now evaluate JSON that is wrapped in a
  ``/* comment block */``.
- MochiKit.Color's HSV to RGB conversion code fixed to return the correct
  value (hsv.v for RGB values) in cases where saturation === 0.
- doXHR workaround for a Mozilla bug when calling XMLHttpRequest in certain
  situations. Always wraps call in a callLater(0, doXHR, url, opts).
- parseQueryString will now parse values with embedded "="
- Workaround for a Safari DOM crash when using MochiKit.Iter.list.
  http://bugs.webkit.org/show_bug.cgi?id=12191
- New removeNodeAttribute function in MochiKit.DOM.
- MochiKit.Async.doXHR and dependent functions now accept 201 CREATED and
  204 NO CONTENT as valid.
- MochiKit.DOM.formContents now treats option tags the same way that
  form posts do in the case of missing and empty string value attributes,
  even in IE.
- MochiKit.Base.queryString now accepts third queryString([names, values])
  form.
- MochiKit.DOM.formContents now defaults to document.body if no element is
  given.
- New MochiKit.Selector module (still somewhat experimental)
- MochiKit.LoggingPane fixes for Internet Explorer
- MochiKit.DOM now creates XHTML nodes in XUL documents.
- MochiKit.LoggingPane now works on pages with '#' in the URL on IE
- New MochiKit.Async.doXHR as a convenient method for doing custom
  XMLHttpRequests (e.g. extra headers, overrideMimeType, etc.)
- New __connect__ protocol for MochiKit.Signal.connect source notifications
- Added colSpan, bgColor to the list of DOM renames for Internet Explorer
- New MochiKit.Signal.disconnectAllTo function
- MochiKit.Base.parseQueryString now accepts leading question mark
- New MochiKit.Base.values function
- Fixed MochiKit.Signal.disconnect when called from a signal handler invoked
  by MochiKit.Signal.signal
- parseQueryString now splits on HTML entities equivalent to ampersand as well
- Better XHTML compatibility (removed obvious cases where uppercase tagName or
  nodeName was assumed)
- MochiKit.Base.queryString now handles array values in the same way HTML
  forms handle multiple elements of the same name.
- MochiKit.Base.parseQueryString now returns {} for empty query string instead
  of {"": "undefined"}
- MochiKit.DOM.formContents now handles option value="" correctly.
- MochiKit.DOM now checks for undefined className.
- MochiKit.Iter.groupby() now uses compare() to group rather than == and !=
- serializeJSON no longer serializes undefined, as per the JSON spec
- Fixed an infinite recursion bug in serializeJSON if an adapter
  returns the object itself.
- Fixed vertical tab and control char encoding in serializeJSON (#313).
- New MochiKit.Base.operator.seq and sne to support strict comparison
- MochiKit.Base.isArrayLike no longer returns true for DOM text nodes
- Added readonly-readOnly to the list of DOM renames for Internet Explorer
- New MochiKit.Signal event method: confirmUnload (sets returnValue for
  onbeforeunload)
- Fix interpreter help() function for Firefox and IE
- API version compatibility notes added
- New MochiKit.Base functions methodcaller and compose
- Support IE-based native console logging (Debugger, Atlas)
- Refactored style functions from MochiKit.DOM to MochiKit.Style
- MochiKit.Async.DeferredList is now a proper Deferred
- MochiKit.DOM.formContents now supports SELECT multiple tags
- Re-use StopIteration Error if the browser already has it
- Workaround IE type="" bug for INPUT elements
- Allow LoggingPane to work in IE with hyphen-containing URLs
- Replace percents for Safari native logging to avoid crashing
- New MochiKit.DOM.coerceToDOM .dom(node) / .__dom__(node) protocol
- MochiKit.DOM's MochiKit.Iter dependency is now optional
- Added expand all link to the documentation index
- Added MochiKit.DOM.isChildNode function.
- Added synthesizing for onmouseenter/onmouseleave
- Added animation functions and classes to MochiKit.Visual.
- Added MochiKit.Style.getElementDimensions support for calculating the
  actual content size (without padding and borders).
- Added MochiKit.DOM.insertSiblingNodesBefore, getFirstElementByTagAndClassName,
  getFirstParentByTagAndClassName, makeClipping, makePositioned,
  undoClipping, undoPositioned and removeEmptyTextNodes functions.
- Added MochiKit.Base.bindLate, camelize, flattenArray, mean, median and
  noop functions.
- New MochiKit.DragAndDrop module for drag and drop handling.
- New MochiKit.Sortable module for lists sortable with drag and drop.
- Changed MochiKit.Signal.connect to use late function binding also
  for non-DOM signals (#307).
- Fixed MochiKit.Color.isColor when symbols not exported (#296).
- Added support for inclusion in SVG files (#290).
- Fixed rounding errors in MochiKit.Format.twoDigitFloat (#275).
- Fixed MochiKit.Logging to convert log levels to strings (#273).
- Fixed MochiKit.Iter.forEach and iextend for array-like objects with
  and iter function (#268).

2006-04-29      v1.3.1 (bug fix release)

- Fix sendXMLHttpRequest sendContent regression
- Internet Explorer fix in MochiKit.Logging (printfire exception)
- Internet Explorer XMLHttpRequest object leak fixed in MochiKit.Async

2006-04-26      v1.3 "warp zone"

- IMPORTANT: Renamed MochiKit.Base.forward to forwardCall (for export)
- IMPORTANT: Renamed MochiKit.Base.find to findValue (for export)
- New MochiKit.Base.method as a convenience form of bind that takes the
  object before the method
- New MochiKit.Base.flattenArguments for flattening a list of arguments to
  a single Array
- Refactored MochiRegExp example to use MochiKit.Signal
- New key_events example demonstrating use of MochiKit.Signal's key handling
  capabilities.
- MochiKit.DOM.createDOM API change for convenience: if attrs is a string,
  null is used and the string will be considered the first node. This
  allows for the more natural P("foo") rather than P(null, "foo").
- MochiKit Interpreter example refactored to use MochiKit.Signal and now
  provides multi-line input and a help() function to get MochiKit function
  signature from the documentation.
- Native Console Logging for the default MochiKit.Logging logger
- New MochiKit.Async.DeferredList, gatherResults, maybeDeferred
- New MochiKit.Signal example: draggable
- Added sanity checking to Deferred to ensure that errors happen when chaining
  is used incorrectly
- Opera sendXMLHttpRequest fix (sends empty string instead of null by default)
- Fix a bug in MochiKit.Color that incorrectly generated hex colors for
  component values smaller than 16/255.
- Fix a bug in MochiKit.Logging that prevented logs from being capped at a
  maximum size
- MochiKit.Async.Deferred will now wrap thrown objects that are not instanceof
  Error, so that the errback chain is used instead of the callback chain.
- MochiKit.DOM.appendChildNodes and associated functions now append iterables
  in the correct order.
- New MochiKit-based SimpleTest test runner as a replacement for Test.Simple
- MochiKit.Base.isNull no longer matches undefined
- example doctypes changed to HTML4
- isDateLike no longer throws error on null
- New MochiKit.Signal module, modeled after the slot/signal mechanism in Qt
- updated elementDimensions to calculate width from offsetWidth instead
  of clientWidth
- formContents now works with FORM tags that have a name attribute
- Documentation now uses MochiKit to generate a function index

2006-01-26      v1.2 "the ocho"

- Fixed MochiKit.Color.Color.lighterColorWithLevel
- Added new MochiKit.Base.findIdentical function to find the index of an
  element in an Array-like object. Uses === for identity comparison.
- Added new MochiKit.Base.find function to find the index of an element in
  an Array-like object. Uses compare for rich comparison.
- MochiKit.Base.bind will accept a string for func, which will be immediately
  looked up as self[func].
- MochiKit.DOM.formContents no longer skips empty form elements for Zope
  compatibility
- MochiKit.Iter.forEach will now catch StopIteration to break
- New MochiKit.DOM.elementDimensions(element) for determining the width and
  height of an element in the document
- MochiKit.DOM's initialization is now compatible with
  HTMLUnit + JWebUnit + Rhino
- MochiKit.LoggingPane will now re-use a ``_MochiKit_LoggingPane`` DIV element
  currently in the document instead of always creating one.
- MochiKit.Base now has operator.mul
- MochiKit.DOM.formContents correctly handles unchecked checkboxes that have
  a custom value attribute
- Added new MochiKit.Color constructors fromComputedStyle and fromText
- MochiKit.DOM.setNodeAttribute should work now
- MochiKit.DOM now has a workaround for an IE bug when setting the style
  property to a string
- MochiKit.DOM.createDOM now has workarounds for IE bugs when setting the
  name and for properties
- MochiKit.DOM.scrapeText now walks the DOM tree in-order
- MochiKit.LoggingPane now sanitizes the window name to work around IE bug
- MochiKit.DOM now translates usemap to useMap to work around IE bug
- MochiKit.Logging is now resistant to Prototype's dumb Object.prototype hacks
- Added new MochiKit.DOM documentation on element visibility
- New MochiKit.DOM.elementPosition(element[, relativeTo={x: 0, y: 0}])
  for determining the position of an element in the document
- Added new MochiKit.DOM createDOMFunc aliases: CANVAS, STRONG

2005-11-14      v1.1

- Fixed a bug in numberFormatter with large numbers
- Massively overhauled documentation
- Fast-path for primitives in MochiKit.Base.compare
- New groupby and groupby_as_array in MochiKit.Iter
- Added iterator factory adapter for objects that implement iterateNext()
- Fixed isoTimestamp to handle timestamps with time zone correctly
- Added new MochiKit.DOM createDOMFunc aliases: SELECT, OPTION, OPTGROUP,
  LEGEND, FIELDSET
- New MochiKit.DOM formContents and enhancement to queryString to support it
- Updated view_source example to use dp.SyntaxHighlighter 1.3.0
- MochiKit.LoggingPane now uses named windows based on the URL so that
  a given URL will get the same LoggingPane window after a reload
  (at the same position, etc.)
- MochiKit.DOM now has currentWindow() and currentDocument() context
  variables that are set with withWindow() and withDocument(). These
  context variables affect all MochiKit.DOM functionality (getElement,
  createDOM, etc.)
- MochiKit.Base.items will now catch and ignore exceptions for properties
  that are enumerable but not accessible (e.g. permission denied)
- MochiKit.Async.Deferred's addCallback/addErrback/addBoth
  now accept additional arguments that are used to create a partially
  applied function. This differs from Twisted in that the callback/errback
  result becomes the *last* argument, not the first when this feature
  is used.
- MochiKit.Async's doSimpleXMLHttpRequest will now accept additional
  arguments which are used to create a GET query string
- Did some refactoring to reduce the footprint of MochiKit by a few
  kilobytes
- escapeHTML to longer escapes ' (apos) and now uses
  String.replace instead of iterating over every char.
- Added DeferredLock to Async
- Renamed getElementsComputedStyle to computedStyle and moved
  it from MochiKit.Visual to MochiKit.DOM
- Moved all color support out of MochiKit.Visual and into MochiKit.Color
- Fixed range() to accept a negative step
- New alias to MochiKit.swapDOM called removeElement
- New MochiKit.DOM.setNodeAttribute(node, attr, value) which sets
  an attribute on a node without raising, roughly equivalent to:
  updateNodeAttributes(node, {attr: value})
- New MochiKit.DOM.getNodeAttribute(node, attr) which gets the value of
  a node's attribute or returns null without raising
- Fixed a potential IE memory leak if using MochiKit.DOM.addToCallStack
  directly (addLoadEvent did not leak, since it clears the handler)

2005-10-24      v1.0

- New interpreter example that shows usage of MochiKit.DOM  to make
  an interactive JavaScript interpreter
- New MochiKit.LoggingPane for use with the MochiKit.Logging
  debuggingBookmarklet, with logging_pane example to show its usage
- New mochiregexp example that demonstrates MochiKit.DOM and MochiKit.Async
  in order to provide a live regular expression matching tool
- Added advanced number formatting capabilities to MochiKit.Format:
  numberFormatter(pattern, placeholder="", locale="default") and
  formatLocale(locale="default")
- Added updatetree(self, obj[, ...]) to MochiKit.Base, and changed
  MochiKit.DOM's updateNodeAttributes(node, attrs) to use it when appropiate.
- Added new MochiKit.DOM createDOMFunc aliases: BUTTON, TT, PRE
- Added truncToFixed(aNumber, precision) and roundToFixed(aNumber, precision)
  to MochiKit.Format
- MochiKit.DateTime can now handle full ISO 8601 timestamps, specifically
  isoTimestamp(isoString) will convert them to Date objects, and
  toISOTimestamp(date, true) will return an ISO 8601 timestamp in UTC
- Fixed missing errback for sendXMLHttpRequest when the server does not
  respond
- Fixed infinite recusion bug when using roundClass("DIV", ...)
- Fixed a bug in MochiKit.Async wait (and callLater) that prevented them
  from being cancelled properly
- Workaround in MochiKit.Base bind (and partial) for functions that don't
  have an apply method, such as alert
- Reliably return null from the string parsing/manipulation functions if
  the input can't be coerced to a string (s + "") or the input makes no sense;
  e.g. isoTimestamp(null) and isoTimestamp("") return null

2005-10-08      v0.90

- Fixed ISO compliance with toISODate
- Added missing operator.sub
- Placated Mozilla's strict warnings a bit
- Added JSON serialization and unserialization support to MochiKit.Base:
  serializeJSON, evalJSON, registerJSON. This is very similar to the repr
  API.
- Fixed a bug in the script loader that failed in some scenarios when a script
  tag did not have a "src" attribute (thanks Ian!)
- Added new MochiKit.DOM createDOMFunc aliases: H1, H2, H3, BR, HR, TEXTAREA,
  P, FORM
- Use encodeURIComponent / decodeURIComponent for MochiKit.Base urlEncode
  and parseQueryString, when available.

2005-08-12      v0.80

- Source highlighting in all examples, moved to a view-source example
- Added some experimental syntax highlighting for the Rounded Corners example,
  via the LGPL dp.SyntaxHighlighter 1.2.0 now included in examples/common/lib
- Use an indirect binding for the logger conveniences, so that the global
  logger could be replaced by setting MochiKit.Logger.logger to something else
  (though an observer is probably a better choice).
- Allow MochiKit.DOM.getElementsByTagAndClassName to take a string for parent,
  which will be looked up with getElement
- Fixed bug in MochiKit.Color.fromBackground (was using node.parent instead of
  node.parentNode)
- Consider a 304 (NOT_MODIFIED) response from XMLHttpRequest to be success
- Disabled Mozilla map(...) fast-path due to Deer Park compatibility issues
- Possible workaround for Safari issue with swapDOM, where it would get
  confused because two elements were in the DOM at the same time with the
  same id
- Added missing THEAD convenience function to MochiKit.DOM
- Added lstrip, rstrip, strip to MochiKit.Format
- Added updateNodeAttributes, appendChildNodes, replaceChildNodes to
  MochiKit.DOM
- MochiKit.Iter.iextend now has a fast-path for array-like objects
- Added HSV color space support to MochiKit.Visual
- Fixed a bug in the sortable_tables example, it now converts types
  correctly
- Fixed a bug where MochiKit.DOM referenced MochiKit.Iter.next from global
  scope

2005-08-04      v0.70

- New ajax_tables example, which shows off XMLHttpRequest, ajax, json, and
  a little TAL-ish DOM templating attribute language.
- sendXMLHttpRequest and functions that use it (loadJSONDoc, etc.) no longer
  ignore requests with status == 0, which seems to happen for cached or local
  requests
- Added sendXMLHttpRequest to MochiKit.Async.EXPORT, d'oh.
- Changed scrapeText API to return a string by default. This is API-breaking!
  It was dumb to have the default return value be the form you almost never
  want. Sorry.
- Added special form to swapDOM(dest, src). If src is null, dest is removed
  (where previously you'd likely get a DOM exception).
- Added three new functions to MochiKit.Base for dealing with URL query
  strings: urlEncode, queryString, parseQueryString
- MochiKit.DOM.createDOM will now use attr[k] = v for all browsers if the name
  starts with "on" (e.g. "onclick"). If v is a string, it will set it to
  new Function(v).
- Another workaround for Internet "worst browser ever" Explorer's setAttribute
  usage in MochiKit.DOM.createDOM (checked -> defaultChecked).
- Added UL, OL, LI convenience createDOM aliases to MochiKit.DOM
- Packing is now done by Dojo's custom Rhino interpreter, so it's much smaller
  now!

2005-07-29      v0.60

- Beefed up the MochiKit.DOM test suite
- Fixed return value for MochiKit.DOM.swapElementClass, could return
  false unexpectedly before
- Added an optional "parent" argument to
  MochiKit.DOM.getElementsByTagAndClassName
- Added a "packed" version in packed/MochiKit/MochiKit.js
- Changed build script to rewrite the URLs in tests to account for the
  JSAN-required reorganization
- MochiKit.Compat to potentially work around IE 5.5 issues
  (5.0 still not supported). Test.Simple doesn't seem to work there,
  though.
- Several minor documentation corrections

2005-07-27      v0.50

- Initial Release
