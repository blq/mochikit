@echo off
REM example compilation of MochiKit using the Google Closure compiler, http://code.google.com/p/closure-compiler/
REM note that not all MochiKit modules are included yet
REM add --formatting PRETTY_PRINT to examine result
java -jar Closure/compiler.jar ^
	--compilation_level SIMPLE_OPTIMIZATIONS ^
	--warning_level VERBOSE ^
	--summary_detail_level 3 ^
	^
	--js_output_file ../packed/MochiKit/mochikit.cmp.js ^
	^
	--js ../MochiKit/Base.js ^
	--js ../MochiKit/Async.js ^
	--js ../MochiKit/Iter.js ^
	--js ../MochiKit/DOM.js ^
	--js ../MochiKit/Style.js ^
	--js ../MochiKit/Signal.js ^
	--js ../MochiKit/DateTime.js ^
	--js ../MochiKit/Format.js ^
	--js ../MochiKit/Text.js ^
	--js ../MochiKit/Logging.js ^
	--js ../MochiKit/LoggingPane.js ^
	--js ../MochiKit/Color.js ^
	--js ../MochiKit/Selector.js ^
	^
	--externs closure_externs/mochikit_extern.js ^
	--externs closure_externs/webkit_console.js ^
	--externs closure_externs/json.js ^
	%*