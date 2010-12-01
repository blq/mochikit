#
# does a Closure compile/compress + dependecy files generation
#
# @author Fredrik Blomqvist
#

import subprocess

import make_closure_deps
#import Closure.bin.build.modulebuilder # our own tool


if __name__ == '__main__':

  # list modules (not file names!) you want to build here
  compile_modules = [ 'MochiKit.Base', 'MochiKit.Signal', 'MochiKit.Iter', 'MochiKit.Base_ext', 'MochiKit.Bisect', 'MochiKit.HeapQ', 'MochiKit.Iter_ext' ]


  # example cmd line (todo: extract params as configs)
  p = subprocess.Popen(['python', 'Closure/bin/build/modulebuilder.py',
    '--compiler_jar', 'Closure/compiler.jar',
    '--output_mode', 'compiled',
    '--root', '../MochiKit',
    '--module', 'MochiKit:' + ','.join(compile_modules),
    '--list_unused_files', 'true',
    # ---
    # cmd line for actual compiler. must be a separate string
    # todo: enable VERBOSE mode once last issues in code have been fixed - this is where compiler really does its job!
    '--compiler_flags', '\
      --compilation_level SIMPLE_OPTIMIZATIONS\
      --warning_level DEFAULT\
      --summary_detail_level 3\
      --formatting PRETTY_PRINT\
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
  ])

  # generate dependency file
  make_closure_deps.main()