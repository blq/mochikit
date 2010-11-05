/**
 *
 * @fileoverview
 * Common generic types not dependent on a particular implementation (at least not explicitly..)
 *
 * ..pretty sketchy for now, will change
 *
 * @externs
 *
 */


/**
 * @typedef {number}
 */
var integer;

/**
 * used in a couple of places (drop?)
 * @typedef {integer}
 */
var Int;

/**
 * @see http://mochikit.com/doc/html/MochiKit/Iter.html#fn-iter
 * @see MochiKit.Iter.isIterable
 * @typedef {(Array|{next: function(): *}|{iter: function(): {next: function(): *}}|Arguments|NodeList)} // add {length: number} (simpy add ArrayLike?) also? (and __iterator__?).
 */
var Iterable;

/**
 * @see MochiKit.Base.isArrayLike
 * todo: should be same as goog.array.ArrayLike
 * @typedef {Array|NodeList|Arguments|{ length: number }}
 */
var ArrayLike;

/**
 * @see MochiKit.Base.isDateLike
 * todo: see goog.date.DateLike
 * @typedef {Date|{getTime: function(): number}}
 */
var DateLike;


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