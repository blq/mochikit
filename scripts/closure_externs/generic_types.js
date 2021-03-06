/**
 *
 * @fileoverview
 * Common generic types not dependent on a particular implementation (at least not explicitly..)
 *
 * ..pretty sketchy for now
 *
 * @externs
 *
 */


/**
 * @typedef {number}
 */
var integer;

/**
 * @see MochiKit.Base.isArrayLike
 * (should be same as goog.array.ArrayLike)
 * @typedef {(Array|NodeList|Arguments|{ length: integer })}
 */
var ArrayLike;

// attempt to separate iterator, iterable and iterator"factory" (name..?)

/**
 * @typedef {{next: !Function}}
 */
var Iterator;

/**
 * @typedef {({ iter: function(): !Iterator }|{ __iterator__: function(): !Iterator })} // todo: deprecate .iter()
 */
var IteratorFactory; //..name!? call it Sequence? 'Collection' seems to be Python's naming

/**
 * @see http://mochikit.com/doc/html/MochiKit/Iter.html#fn-iter
 * @see MochiKit.Iter.isIterable
 * @typedef {(Iterator|ArrayLike|IteratorFactory)}
 */
var Iterable;


/**
 * @see MochiKit.Base.isDateLike
 * todo: see goog.date.DateLike
 * @typedef {Date|{getTime: function(): number}}
 */
var DateLike;

/**
 * @enum {integer}
 */
var TriState = {
	TRUE: 1,
	FALSE: -1,
	MAYBE: 0
};


// todo: ? these doesn't seem to be visible to compiler?
/**
 * return -1, 0, +1
 * @typedef {function(*, *): integer}
 */
var BinaryComparator; // unary also?

/**
 * @typedef {function(*, *): boolean}
 */
var BinaryPredicate;

/**
 * @typedef {function(*): boolean}
 */
var Predicate;

/**
 * @typedef {Predicate}
 */
var UnaryPredicate;

/**
 * @typedef {function(?): !TriState}
 */
var TriStatePredicate;

/**
 * @typedef {function(?, ?): !TriState}
 */
var BinaryTriStatePredicate;

/**
 * @typedef {TriStatePredicate}
 */
var UnaryTriStatePredicate;



/**
 * @typedef {{w: number, h: number}}
 */
var Size;

/**
 * @see MochiKit.Style.Dimensions
 * @typedef {{w: number, h: number}}
 */
var Dimensions;

/**
 * @typedef {{x: number, y: number}}
 */
var Pos;

/**
 * @typedef {{x: number, y: number}}
 */
var Point;

/**
 * @typedef {{x: number, y: number}}
 */
var Coordinates;

/**
 * @typedef {Coordinates}
 */
var Position;

/**
 * union of Pos/Point & Size
 * @typedef {{x: number, y: number, w: number, h: number}}
 */
var Bounds; // or change to interface spec?

/**
 * @see MochiKit.Base.isValue
 * @typedef {boolean|number|string}
 */
var Value;

/**
 * ok?
 * @typedef {boolean|number}
 */
var numbers;
