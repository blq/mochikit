#
# does a Closure compile/compress + dependecy files generation
#
# @author Fredrik Blomqvist
#
# @see http://code.google.com/closure/library/docs/closurebuilder.html
#
#

import os
import shutil
import subprocess

import make_closure_deps
#import Closure.bin.build.modulebuilder # our own tool



def build_modules(modules):
  mod_args = []
  for mod in modules:
    mod_args.extend([ '--module', mod[0] + ':' + ','.join(mod[1]) ])

  # example cmd line (todo: extract params as configs)
  args = [
    '--compiler_jar', 'scripts/Closure/compiler.jar',
    '--output_mode', 'compiled',
    '--root', 'MochiKit'
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
      --externs scripts/closure_externs/mochikit_extern.js\
      --externs scripts/closure_externs/generic_types.js\
      --externs scripts/closure_externs/webkit_console.js\
      --externs scripts/closure_externs/json.js'
  ]

  # our own tool, similar to Google's closurebuilder.py but let's you work with *module(s)*, not files.
  subprocess.check_call(['python', 'scripts/Closure/bin/build/modulebuilder.py'] + args) # throws if build fails


def main():
  # list modules (not file names!) you want to build here
  # todo: should rather parse the MochiKit.js file (as pack.py does) but this way we can be more illustrative

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
    ('MochiKit_Core', mochikit_core_modules),
    # example. separate modules in several packages
    ('MochiKit_blq_fork_extensions', [ 'MochiKit.Base_ext', 'MochiKit.Bisect', 'MochiKit.HeapQ', 'MochiKit.Iter_ext', 'MochiKit.Random' ])
  ]

  build_modules(modules)

  # move output to packed folder
  for mod in modules:
    shutil.move(mod[0] + '.js', 'packed/MochiKit/Closure')

  # also build a complete pack (for comparison with "old" pack.py)
  build_modules([
    ('MochiKit', modules[0][1] + modules[1][1])
  ])
  shutil.move('MochiKit.js', 'packed/MochiKit/Closure')

  shutil.move('goog.js', 'packed/MochiKit/Closure/base.js') # assumes 'keep_base_separate' param was used above

  # generate dependency file
  make_closure_deps.main()



if __name__ == '__main__':
  main()
