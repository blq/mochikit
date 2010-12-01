#
# does a Closure compile/compress + dependecy files generation
#
# @author Fredrik Blomqvist
#
# @see http://code.google.com/closure/library/docs/closurebuilder.html
#
#

import subprocess

import make_closure_deps
#import Closure.bin.build.modulebuilder # our own tool


if __name__ == '__main__':

  # list modules (not file names!) you want to build here
  # todo: should rather parse the MochiKit.js file (as pack.py does) but this way we be more illustrative

  mochikit_core_modules = [
    'MochiKit.' + mod
    for mod in [
        "Base",
        "Iter",
        "Logging",
        "DateTime",
        "Format",
        "Text",
        "Async",
        "DOM",
        "Selector",
        "Style",
        "LoggingPane",
        "Color",
        "Signal",
        "Position",
        "Visual",
        "DragAndDrop",
        "Sortable"
    ]
  ]

  modules = [
    ('MochiKit', mochikit_core_modules),
    ('MochiKit_blq_fork_extensions', [ 'MochiKit.Base_ext', 'MochiKit.Bisect', 'MochiKit.HeapQ', 'MochiKit.Iter_ext', 'MochiKit.Random' ])
  ]

  mod_args = []
  for mod in modules:
    mod_args.extend([ '--module', mod[0] + ':' + ','.join(mod[1]) ])

  args = [
    '--compiler_jar', 'Closure/compiler.jar',
    '--output_mode', 'compiled',
    '--root', '../MochiKit'
    ] + mod_args + [
    '--list_unused_files', 'true', # list orphan files not picked up by the module spec. for debug/testing
    '--keep_base_separate', 'true', # whether you'd like goog Closure base.js baked in or include it separately
    # ---
    # cmd line for actual compiler. must be a separate string
    # todo: enable VERBOSE mode once last issues in code have been fixed - this is where compiler really does its job!
    # todo: unless you compile MochiKit *toghether*  with your app scripts, ADVANCED_OPTIMIZATION can't (currently) be used, need to "export" the API functions.
    '--compiler_flags', '\
      --compilation_level SIMPLE_OPTIMIZATIONS\
      --warning_level DEFAULT\
      --summary_detail_level 3\
      --jscomp_off nonStandardJsDocs\
      --process_closure_primitives true\
      \
      --jscomp_warning deprecated\
      --jscomp_warning visibility\
      --jscomp_warning accessControls\
      --jscomp_warning strictModuleDepCheck\
      \
      --externs closure_externs/mochikit_extern.js\
      --externs closure_externs/generic_types.js\
      --externs closure_externs/webkit_console.js\
      --externs closure_externs/json.js'
  ]

  # example cmd line (todo: extract params as configs)
  # our own tool, similar to Google's closurebuilder.py but let's you work with *module(s)*, not files.
  p = subprocess.Popen(['python', 'Closure/bin/build/modulebuilder.py'] + args)

  # generate dependency file
  make_closure_deps.main()
