if(typeof goog!="undefined"&&typeof goog.provide=="function")MochiKit.Base_ext={};MochiKit.Base.module(MochiKit,"Base_ext","1.5",["Base"]);MochiKit.Base._arg_placeholder=function(a){this.index=a};
var _1=new MochiKit.Base._arg_placeholder(0),_2=new MochiKit.Base._arg_placeholder(1),_3=new MochiKit.Base._arg_placeholder(2),_4=new MochiKit.Base._arg_placeholder(3),_5=new MochiKit.Base._arg_placeholder(4),_6=new MochiKit.Base._arg_placeholder(5),_7=new MochiKit.Base._arg_placeholder(6),_8=new MochiKit.Base._arg_placeholder(7),_9=new MochiKit.Base._arg_placeholder(8),_10=new MochiKit.Base._arg_placeholder(9);
MochiKit.Base._rebind_preargs=function(a,b,c){for(var c=c||{},d=0;d<a.length;++d){var e=a[d];if(e instanceof MochiKit.Base._arg_placeholder){if(e.index<b.length)a[d]=b[e.index],c[e.index]=e.index}else typeof e=="function"&&typeof e.im_func=="function"&&MochiKit.Base._rebind_preargs(e.im_preargs,b,c)}return c};
MochiKit.Base.bind2=function(a,b){typeof a=="string"&&(a=b[a]);var c=a.im_func,d=a.im_preargs,e=a.im_self,f=MochiKit.Base;typeof a=="function"&&typeof a.apply=="undefined"&&(a=f._wrapDumbFunction(a));typeof c!="function"&&(c=a);typeof b!="undefined"&&(e=b);var d=typeof d=="undefined"?[]:d.slice(),g=Array.prototype.slice.call(arguments,b instanceof f._arg_placeholder?1:2),h=MochiKit.Base._rebind_preargs(d,g),i;for(i in h)g.splice(h[i],1);f.extend(d,g);g=function(){var a=arguments.callee,b=a.im_self;
b||(b=this);var c=[];if(a.im_preargs.length>0){for(var d=0,e=0;e<a.im_preargs.length;++e){var g=a.im_preargs[e];g instanceof f._arg_placeholder?(d=Math.max(d,g.index+1),g=arguments[g.index]):typeof g=="function"&&typeof g.im_func=="function"&&(g=g.apply(b,arguments));c.push(g)}for(;d<arguments.length;++d)c.push(arguments[d])}else c=arguments;b instanceof f._arg_placeholder&&(b=arguments[b.index]);return a.im_func.apply(b,c)};g.im_self=e;g.im_func=c;g.im_preargs=d;if(typeof c.NAME=="string")g.NAME=
"bind2("+c.NAME+",...)";return g};MochiKit.Base.partial2=function(a){var b=MochiKit.Base;return b.bind2.apply(this,b.extend([a,void 0],arguments,1))};MochiKit.Base.method2=function(a,b){var c=MochiKit.Base;return c.bind2.apply(this,c.extend([b,a],arguments,2))};MochiKit.Base.bindLate2=function(a){var b=MochiKit.Base,c=arguments;typeof a==="string"&&(c=b.extend([b.forwardCall(a)],arguments,1));return b.bind2.apply(this,c)};
MochiKit.Base.isBoundFunction=function(a){return typeof a=="function"&&typeof a.im_func=="function"};MochiKit.Base.protect=function(a){return function(){return a.apply(this,arguments)}};MochiKit.Base.apply=function(a){var b=MochiKit.Base.extend([],arguments,1);return a.apply(this,b)};
MochiKit.Base.partition=function(a,b,c,d,e){function f(b,c){var d=a[b];a[b]=a[c];a[c]=d}var b=b||MochiKit.Base.operator.cle,c=c||0,d=d||a.length-1,e=e||c+Math.floor((d-c)/2),g=a[e];f(e,d);for(e=c;c<=d;++c)b(a[c],g)&&(f(c,e),++e);f(e,d);return e};MochiKit.Base.countValue=function(a,b,c){var c=c||MochiKit.Base.operator.ceq,d=0;MochiKit.Iter.forEach(a,function(a){c(a,b)&&++d});return d};MochiKit.Base.negateComparator=function(a){return function(){return-1*a.apply(this,arguments)}};
MochiKit.Base_ext.__new__=function(){};MochiKit.Base_ext.__new__();MochiKit.Base._exportSymbols(this,MochiKit.Base);if(typeof goog!="undefined"&&typeof goog.provide=="function")MochiKit.Bisect={};MochiKit.Base.module(MochiKit,"Bisect","1.5",["Base"]);MochiKit.Bisect.bisectRight=function(a,b,c,d){c=c||0;for(d=d||a.length;c<d;){var e=Math.floor((c+d)/2);MochiKit.Base.compare(b,a[e])<0?d=e:c=e+1}return c};MochiKit.Bisect.insortRight=function(a,b,c,d){c=MochiKit.Bisect.bisectRight(a,b,c,d);a.splice(c,0,b);return a};
MochiKit.Bisect.bisectLeft=function(a,b,c,d){c=c||0;for(d=d||a.length;c<d;){var e=Math.floor((c+d)/2);MochiKit.Base.compare(a[e],b)<0?c=e+1:d=e}return c};MochiKit.Bisect.insortLeft=function(a,b,c,d){c=MochiKit.Bisect.bisectLeft(a,b,c,d);a.splice(c,0,b);return a};MochiKit.Bisect.bisect=MochiKit.Bisect.bisectRight;MochiKit.Bisect.insort=MochiKit.Bisect.insortRight;MochiKit.Bisect.__new__=function(){};MochiKit.Bisect.__new__();MochiKit.Base._exportSymbols(this,MochiKit.Bisect);if(typeof goog!="undefined"&&typeof goog.provide=="function")MochiKit.HeapQ={};MochiKit.Base.module(MochiKit,"HeapQ","1.5",["Base","Iter"]);MochiKit.HeapQ.heapify=function(a,b){for(var b=b||MochiKit.Base.operator.clt,c=Math.floor(a.length/2)-1;c>=0;--c)MochiKit.HeapQ._siftup(a,c,b);return a};MochiKit.HeapQ._siftdown=function(a,b,c,d){for(var d=d||MochiKit.Base.operator.clt,e=a[c];c>b;){var f=c-1>>1,g=a[f];if(d(e,g))a[c]=g,c=f;else break}a[c]=e};
MochiKit.HeapQ._siftup=function(a,b,c){for(var c=c||MochiKit.Base.operator.clt,d=a.length,e=b,f=a[b],g=2*b+1;g<d;){var h=g+1;h<d&&!c(a[g],a[h])&&(g=h);a[b]=a[g];b=g;g=2*b+1}a[b]=f;MochiKit.HeapQ._siftdown(a,e,b,c)};MochiKit.HeapQ.heapPush=function(a,b,c){c=c||MochiKit.Base.operator.clt;a.push(b);MochiKit.HeapQ._siftdown(a,0,a.length-1,c)};MochiKit.HeapQ.heapPop=function(a,b){var b=b||MochiKit.Base.operator.clt,c=a.pop(),d;a.length>0?(d=a[0],a[0]=c,MochiKit.HeapQ._siftup(a,0,b)):d=c;return d};
MochiKit.HeapQ.heapReplace=function(a,b,c){var c=c||MochiKit.Base.operator.clt,d=a[0];a[0]=b;MochiKit.HeapQ._siftup(a,0,c);return d};MochiKit.HeapQ.heapPushPop=function(a,b,c){c=c||MochiKit.Base.operator.clt;if(a.length>0&&c(a[0],b)){var d=a[0];a[0]=b;b=d;MochiKit.HeapQ._siftup(a,0,c)}return b};
MochiKit.HeapQ.imergeSorted=function(a,b){var c=MochiKit,d=c.Iter,b=b||c.Base.operator.clt,e=function(a,c){return b(a[0],c[0])},f=[];d.forEach(d.izip(d.count(),d.imap(d.iter,a)),function(a){var b=a[0],a=a[1];try{var c=a.next;f.push([c(),b,c])}catch(e){if(e!=d.StopIteration)throw e;}});c.HeapQ.heapify(f,e);return{repr:function(){return"imergeSorted(...)"},toString:MochiKit.Base.forwardCall("repr"),next:function(){for(;;){if(f.length==0)throw d.StopIteration;var a=f[0],b=a[0],i=a[2];try{a[0]=i(),c.HeapQ.heapReplace(f,
a,e)}catch(j){if(j!=d.StopIteration)throw j;c.HeapQ.heapPop(f,e)}return b}}}};MochiKit.HeapQ.heapIter=function(a,b){b=b||MochiKit.Base.operator.clt;return{next:function(){if(a.length==0)throw MochiKit.Iter.StopIteration;return MochiKit.HeapQ.heapPop(a,b)}}};
MochiKit.HeapQ.nLargest=function(a,b,c){var d=MochiKit,e=d.Iter,c=c||d.Base.operator.clt,b=e.iter(b),f=e.list(e.islice(b,a));if(f.length==0)return f;d.HeapQ.heapify(f,c);e.forEach(b,function(a){d.HeapQ.heapPushPop(f,a,c)});f.sort(function(a,b){return-1*d.Base.compare(a,b)});return f};MochiKit.HeapQ.nSmallest=function(a,b,c){var d=MochiKit,e=d.Iter,c=c||d.Base.operator.clt,b=e.list(b);d.HeapQ.heapify(b,c);return d.Base.map(d.Base.partial(d.HeapQ.heapPop,b,c),e.range(Math.min(a,b.length)))};
MochiKit.HeapQ.isHeap=function(a,b){for(var b=b||MochiKit.Base.operator.cle,c=1;c<a.length;++c)if(!b(a[c-1>>1],a[c]))return!1;return!0};MochiKit.HeapQ.heapSort=function(a,b){var c=MochiKit,d=c.Iter.list(a);c.HeapQ.heapify(d,b);return c.Base.map(c.Base.partial(c.HeapQ.heapPop,d,b),c.Iter.range(d.length))};MochiKit.HeapQ.__new__=function(){};MochiKit.HeapQ.__new__();MochiKit.Base._exportSymbols(this,MochiKit.HeapQ);if(typeof goog!="undefined"&&typeof goog.provide=="function")MochiKit.Iter_ext={};MochiKit.Base.module(MochiKit,"Iter_ext","1.5",["Base","Iter"]);MochiKit.Iter.treePreOrder=function(a,b){var c=[a];return{repr:function(){return"treePreOrder(...)"},toString:MochiKit.Base.forwardCall("repr"),next:function(){if(c.length==0)throw MochiKit.Iter.StopIteration;var a=c.pop();MochiKit.Iter.iextend(c,b(a));return a}}};
MochiKit.Iter.treeLevelOrder=function(a,b){var c=[a];return{repr:function(){return"treeLevelOrder(...)"},toString:MochiKit.Base.forwardCall("repr"),next:function(){if(c.length==0)throw MochiKit.Iter.StopIteration;var a=c.shift();MochiKit.Iter.iextend(c,b(a));return a}}};
MochiKit.Iter.treePostOrder=function(a,b){var c=[[a,!1]];return{repr:function(){return"treePostOrder(...)"},toString:MochiKit.Base.forwardCall("repr"),next:function(){for(;;){if(c.length==0)throw MochiKit.Iter.StopIteration;var a=c.pop();if(a[1])return a[0];a[1]=!0;c.push(a);MochiKit.Iter.iextend(c,MochiKit.Iter.imap(function(a){return[a,!1]},b(a[0])))}}}};
MochiKit.Iter.pairView=function(a,b){var b=b||!1,c=MochiKit.Iter.iter(a);try{var d=c.next()}catch(e){if(e!=MochiKit.Iter.StopIteration)throw e;return MochiKit.Iter.EmptyIter}b&&(c=MochiKit.Iter.chain(c,[d]));return{repr:function(){return"pairView(...)"},toString:MochiKit.Base.forwardCall("repr"),next:function(){var a=c.next(),b=[d,a];d=a;return b}}};
MochiKit.Iter.windowView=function(a,b,c){var b=b||2,c=c||1,d=MochiKit.Iter.iter(a),e=[];return{repr:function(){return"windowView(...)"},toString:MochiKit.Base.forwardCall("repr"),next:function(){if(e.length<b)for(;e.length<b;)e.push(d.next());else for(var a=0;a<c;++a)e.shift(),e.push(d.next());return e.slice()}}};MochiKit.Iter.filterMap=function(a,b,c){return MochiKit.Iter.ifilter(c||function(a){return typeof a!=="undefined"&&a!==null},MochiKit.Iter.imap(a,b))};
MochiKit.Iter.iflattenArray=function(a){var b=[a];return{repr:function(){return"iflattenArray(...)"},toString:MochiKit.Base.forwardCall("repr"),next:function(){for(;;){if(b.length==0)throw MochiKit.Iter.StopIteration;var a=b.shift();if(a instanceof Array)Array.prototype.splice.apply(b,[0,0].concat(a));else return a}}}};
MochiKit.Iter.chainFromIter=function(a,b){var b=b||MochiKit.Iter.iter,c=MochiKit.Iter.iter(a),d=null;return{repr:function(){return"chainFromIter(...)"},toString:MochiKit.Base.forwardCall("repr"),next:function(){for(d==null&&(d=MochiKit.Iter.iter(b(c.next())));;)try{return d.next()}catch(a){if(a!=MochiKit.Iter.StopIteration)throw a;d=MochiKit.Iter.iter(b(c.next()))}}}};
MochiKit.Iter.uniqueView=function(a,b){var b=b||MochiKit.Base.operator.ceq,c=MochiKit.Iter.iter(a),d=!0,e;return{repr:function(){return"uniqueView(...)"},toString:MochiKit.Base.forwardCall("repr"),next:function(){if(d)return d=!1,e=c.next();for(var a=c.next();b(e,a);)a=c.next();return e=a}}};
MochiKit.Iter.iproduct=function(a,b){var c=MochiKit.Iter.iter(a),d=null,e,f;return{repr:function(){return"iproduct(...)"},toString:MochiKit.Base.forwardCall("repr"),next:function(){for(;;){d==null&&(e=c.next(),d=MochiKit.Iter.iter(b));try{return f=d.next(),[e,f]}catch(a){if(a!=MochiKit.Iter.StopIteration)throw a;d=null}}}}};MochiKit.Iter.enumerate=function(a,b){return MochiKit.Iter.izip(MochiKit.Iter.count(b),a)};MochiKit.Iter.breakIt=function(){throw MochiKit.Iter.StopIteration;};
MochiKit.Iter.EmptyIter={repr:function(){return"EmptyIter"},toString:MochiKit.Base.forwardCall("repr"),next:MochiKit.Iter.breakIt};MochiKit.Iter.generateN=function(a,b){return MochiKit.Iter.imap(function(){return a()},MochiKit.Iter.range(b))};
MochiKit.Iter.izipLongest=function(a,b){var b=b||null,a=MochiKit.Base.map(MochiKit.Iter.iter,a),c=a.length;return{repr:function(){return"izipLongest(...)"},toString:MochiKit.Base.forwardCall("repr"),next:function(){for(var d=Array(a.length),e=0;e<a.length;++e)try{d[e]=a[e].next()}catch(f){if(f!=MochiKit.Iter.StopIteration)throw f;a[e]=MochiKit.Iter.repeat(b);d[e]=b;--c}if(c==0)throw MochiKit.Iter.StopIteration;return d}}};MochiKit.Iter.any=function(){return MochiKit.Iter.some.apply(this,arguments)};
MochiKit.Iter.all=function(){return MochiKit.Iter.every.apply(this,arguments)};MochiKit.Iter.starmap=function(){return MochiKit.Iter.applymap.apply(this,arguments)};MochiKit.Iter.advance=function(a,b){for(;b-- >0;)a.next();return a};MochiKit.Iter.isSorted=function(a,b){return MochiKit.Iter.every(MochiKit.Iter.windowView(a),b||MochiKit.Base.operator.cle)};MochiKit.Iter.interleave=function(){return MochiKit.Iter.chainFromIter(MochiKit.Iter.izip.apply(this,arguments))};
MochiKit.Iter.remapView=function(a,b){return MochiKit.Iter.imap(MochiKit.Base.partial(MochiKit.Base.operator.getitem,b),a)};MochiKit.Iter.compressIter=function(a,b){return MochiKit.Iter.imap(function(a){return a[0]},MochiKit.Iter.ifilter(function(a){return a[1]?!0:!1},MochiKit.Iter.izip(a,b)))};
MochiKit.Iter.combinations=function(a,b){var c=MochiKit,d=MochiKit.Iter,e=d.list(a),f=e.length;if(b>f)return MochiKit.Iter.EmptyIter;var g=d.list(d.range(b)),h=!0;return{repr:function(){return"combinations(...)"},toString:c.Base.forwardCall("repr"),next:function(){if(h)return h=!1,d.list(d.remapView(g,e));for(;;){for(var a=!0,c=b-1;c>=0;--c)if(g[c]!=c+f-b){a=!1;break}if(a)throw MochiKit.Iter.StopIteration;g[c]+=1;for(a=c+1;a<b;++a)g[a]=g[a-1]+1;return d.list(d.remapView(g,e))}}}};
MochiKit.Iter.combinationsWithReplacement=function(a,b){var c=MochiKit,d=MochiKit.Iter,e=d.list(a),f=e.length;if(f==0||b==0)return d.EmptyIter;var g=d.list(d.repeat(0,b)),h=!0;return{repr:function(){return"combinationsWithReplacement(...)"},toString:c.Base.forwardCall("repr"),next:function(){if(h)return h=!1,d.list(d.remapView(g,e));for(;;){for(var a=!0,c=b-1;c>=0;--c)if(g[c]!=f-1){a=!1;break}if(a)throw d.StopIteration;g=g.slice(0,c).concat(d.list(d.repeat(g[c]+1,b-c)));return d.list(d.remapView(g,
e))}}}};MochiKit.Iter.repeatSeq=function(a,b){if(b==0)return MochiKit.Iter.EmptyIter;var c=MochiKit.Iter.iter(a);return{next:function(){try{return c.next()}catch(d){if(d!=MochiKit.Iter.StopIteration||--b<=0)throw d;c=MochiKit.Iter.iter(a);return c.next()}}}};
MochiKit.Iter.permutations=function(a,b){var c=MochiKit,d=MochiKit.Iter,e=d.list(a),f=e.length,b=b||f;if(b>f)return d.EmptyIter;var g=d.list(d.range(f)),h=d.list(d.range(f,f-b,-1)),i=!0;return{repr:function(){return"permutations(...)"},toString:c.Base.forwardCall("repr"),next:function(){if(i)return i=!1,d.list(d.remapView(d.islice(g,0,b),e));if(f==0)throw d.StopIteration;for(var a=!0,c=b-1;c>=0;--c)if(h[c]-=1,h[c]==0)g=g.slice(0,c).concat(g.slice(c+1),g[c]),h[c]=f-c;else{var a=g.length-h[c],l=g[c];
g[c]=g[a];g[a]=l;a=!1;break}if(a)throw d.StopIteration;return d.list(d.remapView(d.islice(g,0,b),e))}}};MochiKit.Iter._Range=function(a,b,c){this.start=a;this.stop=b;this.step=c};MochiKit.Iter._Range.prototype.__iterator__=function(){return new MochiKit.Iter.range(this.start,this.stop,this.step)};
MochiKit.Iter.xrange=function(){var a=0,b=0,c=1;if(arguments.length==1)b=arguments[0];else if(arguments.length==2)a=arguments[0],b=arguments[1];else if(arguments.length==3)a=arguments[0],b=arguments[1],c=arguments[2];else throw new TypeError("xrange() takes 1, 2, or 3 arguments!");if(c===0)throw new TypeError("xrange() step must not be 0");return new MochiKit.Iter._Range(a,b,c)};MochiKit.Iter.isJavaLikeIterator=function(a){return a&&typeof a.hasNext=="function"&&typeof a.next=="function"};
MochiKit.Iter.javaLikeIterator=function(a){return{repr:function(){return"javaLikeIterator"},toString:MochiKit.Base.forwardCall("repr"),next:function(){if(!a.hasNext())throw MochiKit.Iter.StopIteration;return a.next()}}};MochiKit.Iter.registerJavaLikeIteratorSupport=function(){Iter.registerIteratorFactory("javaStyleIterator",MochiKit.Iter.isJavaLikeIterator,MochiKit.Iter.javaLikeIterator)};MochiKit.Iter_ext.__new__=function(){};MochiKit.Iter_ext.__new__();MochiKit.Base._exportSymbols(this,MochiKit.Iter);MochiKit.Base.module(MochiKit,"_MersenneTwister19937","1.5",["Base"]);
MochiKit._MersenneTwister19937=function(){function a(a){return a<0?(a^d)+d:a}function b(b,c){return a(b+c&4294967295)}function c(c,d){for(var e=0,f=0;f<32;++f)c>>>f&1&&(e=b(e,a(d<<f)));return e}var d=2147483648,e=Array(624),f=625;this.init_genrand=function(d){e[0]=a(d&4294967295);for(f=1;f<624;f++)e[f]=b(c(1812433253,a(e[f-1]^e[f-1]>>>30)),f),e[f]=a(e[f]&4294967295)};this.init_by_array=function(d,f){var i,j,k;this.init_genrand(19650218);i=1;j=0;for(k=624>f?624:f;k;k--)e[i]=b(b(a(e[i]^c(a(e[i-1]^e[i-
1]>>>30),1664525)),d[j]),j),e[i]=a(e[i]&4294967295),i++,j++,i>=624&&(e[0]=e[623],i=1),j>=f&&(j=0);for(k=623;k;k--){j=e;var l=i,n;n=a(e[i]^c(a(e[i-1]^e[i-1]>>>30),1566083941));var m=i;n=n<m?a(4294967296-(m-n)&4294967295):n-m;j[l]=n;e[i]=a(e[i]&4294967295);i++;i>=624&&(e[0]=e[623],i=1)}e[0]=2147483648};this.genrand_int32=function(){var b,c=[0,2567483615];if(f>=624){var i;f==625&&this.init_genrand(5489);for(i=0;i<227;i++)b=a(e[i]&d|e[i+1]&2147483647),e[i]=a(e[i+397]^b>>>1^c[b&1]);for(;i<623;i++)b=a(e[i]&
d|e[i+1]&2147483647),e[i]=a(e[i+-227]^b>>>1^c[b&1]);b=a(e[623]&d|e[0]&2147483647);e[623]=a(e[396]^b>>>1^c[b&1]);f=0}b=e[f++];b=a(b^b>>>11);b=a(b^b<<7&2636928640);b=a(b^b<<15&4022730752);return b=a(b^b>>>18)};this.genrand_int31=function(){return this.genrand_int32()>>>1};this.genrand_real1=function(){return this.genrand_int32()*(1/4294967295)};this.genrand_real2=function(){return this.genrand_int32()*(1/4294967296)};this.genrand_real3=function(){return(this.genrand_int32()+0.5)*(1/4294967296)};this.genrand_res53=
function(){var a=this.genrand_int32()>>>5,b=this.genrand_int32()>>>6;return(a*67108864+b)*1.1102230246251565E-16};this._getState=function(){return{mt:e.slice(),mti:f}};this._setState=function(a){e=a.mt;f=a.mti}};if(typeof goog!="undefined"&&typeof goog.provide=="function")MochiKit.Random={};MochiKit.Base.module(MochiKit,"Random","1.5",["Base","_MersenneTwister19937"]);MochiKit.Random.seed=function(a){a=typeof a=="number"?a:(new Date).getTime();MochiKit.Random._generator.seed(a)};MochiKit.Random.getState=function(){return MochiKit.Random._generator.getState()};MochiKit.Random.setState=function(a){MochiKit.Random._generator.setState(a)};MochiKit.Random.random=function(){return MochiKit.Random._generator.random()};
MochiKit.Random.randRange=function(a,b,c){var d=MochiKit.Random;arguments.length==1&&(b=a,a=0);var c=c||1,e=b-a;if(c==1&&e>0)return Math.floor(a+Math.floor(d.random()*e));if(c>0)var f=Math.floor((e+c-1)/c);else c<0&&(f=Math.floor((e+c+1)/c));return a+c*Math.floor(d.random()*f)};MochiKit.Random.uniform=function(a,b){return a+(b-a)*MochiKit.Random.random()};MochiKit.Random.shuffle=function(a){for(var b=a.length-1;b>0;--b){var c=Math.floor(MochiKit.Random.random()*(b+1)),d=a[b];a[b]=a[c];a[c]=d}return a};
MochiKit.Random.deal=function(a,b){for(var b=b||MochiKit.Base.operator.identity,c=Array(a),d=0;d<a;++d){var e=Math.floor(MochiKit.Random.random()*(d+1));c[d]=c[e];c[e]=b(d)}return c};MochiKit.Random.choice=function(a){return a[Math.floor(MochiKit.Random.random()*a.length)]};MochiKit.Random.shuffled=function(a){var b=a.length,c=Array(b);c[0]=a[0];for(var d=1;d<b-1;++d){var e=Math.floor(MochiKit.Random.random()*(d+1));c[d]=c[e];c[e]=a[d]}return c};
MochiKit.Random.sample=function(a,b){for(var c=a.length,d=Array(b),e={},f=0;f<b;++f){for(var g=MochiKit.Random.randRange(c);g in e;)g=MochiKit.Random.randRange(c);e[g]=!0;d[f]=a[g]}return d};MochiKit.Random._IRndGenerator=function(){};MochiKit.Random._IRndGenerator.prototype.seed=function(){};MochiKit.Random._IRndGenerator.prototype.getState=function(){};MochiKit.Random._IRndGenerator.prototype.setState=function(){};MochiKit.Random._IRndGenerator.prototype.random=function(){};
MochiKit.Random.MersenneTwister=function(a){this._mt=new MochiKit._MersenneTwister19937;this.seed(a)};MochiKit.Random.MersenneTwister.prototype.seed=function(a){a=typeof a=="number"?a:(new Date).getTime();this._mt.init_genrand(a)};MochiKit.Random.MersenneTwister.prototype.getState=function(){return this._mt._getState()};MochiKit.Random.MersenneTwister.prototype.setState=function(a){this._mt._setState(a)};MochiKit.Random.MersenneTwister.prototype.random=function(){return this._mt.genrand_real2()};
MochiKit.Random.SystemRandom=function(){};MochiKit.Random.SystemRandom.prototype.seed=function(){};MochiKit.Random.SystemRandom.prototype.getState=function(){};MochiKit.Random.SystemRandom.prototype.setState=function(){};MochiKit.Random.SystemRandom.prototype.random=function(){return Math.random()};MochiKit.Random._generator=null;MochiKit.Random._setGenerator=function(a){MochiKit.Random._generator=a};MochiKit.Random.__new__=function(){MochiKit.Random._setGenerator(new MochiKit.Random.MersenneTwister)};
MochiKit.Random.__new__();MochiKit.Base._exportSymbols(this,MochiKit.Random);
