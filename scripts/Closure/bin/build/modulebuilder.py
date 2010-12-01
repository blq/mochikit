#!/usr/bin/env python
#
# Copyright 2010 Franson Technology. All Rights Reserved.


"""Utility for Closure Library module dependency calculation and compilation.
 author Fredrik Blomqvist @ GpsGate.com
"""


import logging
import optparse
import os
import sys

#import itertools # dang. the iteresting combinations() etc only available in 2.6+..

import depstree
import jscompiler
import source
import treescan

#import orderedset # doesn't work in Python 2.5.. (2.6+ only)

import closurebuilder



def _GetOptionsParser():
  """Get the options parser."""

  parser = optparse.OptionParser(__doc__)
  parser.add_option('--root',
                    dest='roots',
                    action='append',
                    help='The paths that should be traversed to build the '
                    'dependencies.')
  parser.add_option('-o',
                    '--output_mode',
                    dest='output_mode',
                    type='choice',
                    action='store',
                    choices=['compiled', 'dot', 'cmdline'],
                    default='cmdline',
                    help='The type of output to generate from this script. '
                    'Options are "compiled" to produce compiled output with '
                    'the Closure Compiler.  Default is "cmdline".')
  parser.add_option('-c',
                    '--compiler_jar',
                    dest='compiler_jar',
                    action='store',
                    help='The location of the Closure compiler .jar file.')
  parser.add_option('--output_file',
                    dest='output_file',
                    action='store',
                    help=('If specified, write output to this path instead of '
                          'writing to standard output.'))
  parser.add_option('-f',
                    '--compiler_flags',
                    dest='compiler_flags',
                    action='store',
                    help='Additional flags to pass to the Closure compiler.')
  parser.add_option('--module',
                    dest='modules',
                    action='append',
                    help='module namespace specification. syntax: NAME:ns1,ns2,..,nsN. repeat for next module. modules must be specified in dependency order'
                    )
  parser.add_option('--keep_dep_tags',
                    dest='keep_dep_tags',
                    action='store',
                    default=False,
                    help=('(re)injects the goog.provide and goog.require tags in the modules files (to enable dep-file generation)')
                    )
  parser.add_option('--list_unused_files',
                    dest='list_unused_files',
                    action='store',
                    default=False,
                    help=('display a list of the unused files in the root(s) after compilation')
                    )
  # todo: perhaps support a generic --keep_file_separate flag?
  parser.add_option('--keep_base_separate',
                    dest='keep_base_separate',
                    action='store',
                    default=True,
                    help=('keep the goog base.js as a separate module. i.e don''t bake into other module (NOT compatible with the "keep_dep_tags" flag)') #? incorrect docs? we are currently using these two flags combined..
                    )
  return parser


# http://www.noah.org/wiki/Python_notes
def ParseBoolean(b):
  # Handle case where b is already a Boolean type.
  if b == False or b == True:
    return b
  b = b.strip()
  if len(b) < 1:
    raise ValueError ('Cannot parse empty string into boolean.')
  b = b[0].lower()
  if b == 't' or b == 'y' or b == '1':
    return True
  if b == 'f' or b == 'n' or b == '0':
    return False
  raise ValueError ('Cannot parse string into boolean.')


# todo: shouldn't be global, should be part of the object that stores the modules refs..
# note that there will typically be an intersection between these sets
moduleProvides = {} # modulename->set of all provides in module
moduleRequires = {} # modulename->set of all requires in module

# output stream (stdout or file)
out = None

# sources is list of input files
# modules is a list of tuples (module-name, module NS) (modules in dep order)
# return list of tuples (module-name, module dependecy files, module deps)
def _generateModules(sources, modules, keepBaseSeparate=True):
  tree = depstree.DepsTree(sources)

  # list of tuples, (module_name, file_deps, module_deps_names)
  # + we force all modules to be dependent on the base goog module (could inject as a file deps also but this should work and is easier)
  baseDep = []
  if keepBaseSeparate:
    baseDep = ['goog']
  depLst = [ (mod[0], tree.GetDependencies(mod[1]), list(baseDep)) for mod in modules ]

  # subtract basedeps from "upper" deps
  # todo: what to do if a module becomes empty? (i.e a duplicate)
  for i in range(len(depLst)):
    for j in range(i+1, len(depLst)):
      bd = depLst[i]
      dp = depLst[j][1]
      for d in bd[1]:
        try:
          dp.remove(d)
        except:
          pass

  # create union of all provides/requires in the deps files per module
  global moduleProvides # modulename->set of all provides in module
  moduleProvides = {}
  global moduleRequires
  moduleRequires = {} # modulename->set of all requires in module

  for name, deps, moddeps in depLst:
    if len(deps) == 0:
      out.writelines('Warning - empty module: "' + name + '". Probably due to incorrect module ordering')
    moduleProvides[name] = set()
    moduleRequires[name] = set()
    for src in deps:
      for prov in src.provides:
        moduleProvides[name].add(prov)
      for req in src.requires:
        moduleRequires[name].add(req)

  # figure out module-module deps
  # todo: could/should also verify that all dependecies go "down" (the tree should have fixed this though)
  moduleModuleDeps = {} # moduleName->list of module deps
  for i in range(len(depLst)-1, -1, -1): # reverse
    td = depLst[i]
    for j in range(i-1, -1, -1):
      bd = depLst[j]
      if moduleRequires[td[0]] & moduleProvides[bd[0]]: # intersects? (todo: is there no isintersecting test? (more efficient since we don't actually need the complete intersection set)
        td[2].append(bd[0])
        # print 'module:', td[0], 'depends on module:', bd[0]

  # force goog.base to be present in compilation (note that it will Not become part of any of the modules, only a dummy goog.js will be output)
  # (?! this wasn't necessary previously?)
  gbase = closurebuilder._GetClosureBaseFile(sources) # _must_ be present!
  if keepBaseSeparate:
    depLst.insert(0, ('goog', [gbase], [])) # could rename it to make it clearer it is a dummy/helper? ('__goog'?)
    moduleProvides['goog'] = set()
    moduleRequires['goog'] = set()
  else:
    depLst[0][1].insert(0, gbase) # inject goog into base module

  return depLst


# string for closure compiler
# todo: not quite sure this works now.. (todo: this case? http://groups.google.com/group/closure-library-discuss/browse_thread/thread/bbcc4d9cea16b4b3/34e8b4a75733a2b7 and http://code.google.com/p/closure-library/issues/detail?id=164 )
# todo: support the new "keep_base_separate" flag also
def _generateCommandLine(modules, modulesOnly=False, lineBreaks=True, keepDeps=True):
  global moduleProvides
  global moduleRequires

  cmdLine = ''
  br = ' '
  if lineBreaks:
    br = '^\n'
  for name, deps, moddeps in modules:
    # could place the module specs anywhere
    if len(moddeps) > 0:
      cmdLine += '--module %s:%d:%s %s' % (name, len(deps), ','.join(moddeps), br)
    else:
      cmdLine += '--module %s:%d %s' % (name, len(deps), br)
    if not modulesOnly:
      for src in deps:
        cmdLine += '--js %s %s' % (src.GetPath(), br)

    # todo: doesn't seem to work in the cmd line case? howto specify line breaks?
    if keepDeps:
      cmdLine += '--module_wrapper %s:"' % name
      for prov in moduleProvides[name]:
        cmdLine += 'goog.provide(\'%s\');\n' % prov
      cmdLine += '\n'
      for req in moduleRequires[name] - moduleProvides[name]: # subtract the provides
        cmdLine += 'goog.require(\'%s\');\n' % req
      cmdLine += '%s" '  # where the code will be injected
      cmdLine += br

  return cmdLine


# list of flags to pass to internal compiler binding
# todo: investigate why compiler can't be forced to keep the prov&reqs..
def _getModuleFlags(modules, keepDeps=True): #? flag incorrect?
  global moduleProvides
  global moduleRequires

  flags = []
  for name, deps, moddeps in modules:
    mod = ''
    if len(moddeps) > 0:
      mod += '%s:%d:%s' % (name, len(deps), ','.join(moddeps)) # should there be a trailing ':'? (seem to work with and without)
    else:
      mod += '%s:%d' % (name, len(deps))
    flags += ['--module', mod]

    if keepDeps:
      provides = ''
      for prov in sorted(moduleProvides[name]):
        provides += 'goog.provide(\'%s\');\n' % prov

      requires = ''
      for req in sorted(moduleRequires[name] - moduleProvides[name]): # subtract the provides
        requires += 'goog.require(\'%s\');\n' % req

      flags += ['--module_wrapper', '%s:%s\n%s\n%%s' % (name, provides, requires)]

  return flags


# test. for use with graphviz
# todo: extract to separate "graphgenerator.py"
def _generateDotGraph(modules):
  out.write('// dotgraph output not ready!')
  dot = 'digraph G {\n'
  for name, deps, moddeps in modules:
    dot += '\tsubgraph cluster_' + name + ' {\n'
    for src in deps:
      dot += '\t\t"' + os.path.basename(src.GetPath()) + '";\n'
    dot += '\t}\n\n'
  dot += '}\n'
  return dot


# strNamespaces is a comma separated list of namespaces
# sources is the
def _ExtractNamespaces(strNamespaces, sources, allowWildCards=False):
  namespaces = strNamespaces.split(',')
  # todo: wildcard matching (would be cool to support full grep-style :) )

##  # test
##  for namespace in namespaces:
##    nsparts = namespace.split('.')
##    for part in nsparts:
##      if part == '*': # todo: support '?' etc
##        pass
##
##  # test
##  allNS = set()
##  for src in source:
##    allNS.add()

  return namespaces


def main():
  logging.basicConfig(format=(sys.argv[0] + ': %(message)s'),
                      level=logging.INFO)
  options, args = _GetOptionsParser().parse_args()

  if not options.modules:
    logging.error('No modules specified')
    sys.exit(1)

  # Make our output pipe.
  global out
  if options.output_file:
    out = open(options.output_file, 'w')
  else:
    out = sys.stdout

  options.keep_dep_tags = ParseBoolean(options.keep_dep_tags)
  options.keep_base_separate = ParseBoolean(options.keep_base_separate)

  sources = set()

  logging.info('Scanning paths...')
  for path in options.roots:
    for js_path in treescan.ScanTreeForJsFiles(path):
      sources.add(closurebuilder._PathSource(js_path))
  logging.info('%s sources scanned.', len(sources))

  # Add scripts specified on the command line.
  for path in args:
    sources.add(source.Source(closurebuilder._PathSource(path)))

  moduleBlocks = []
  for modcmd in options.modules:
    modSpec = modcmd.split(':')
    if len(modSpec) != 2:
      logging.error('Incorrect module specification: %s', modcmd)
      sys.exit(1)
    name = modSpec[0]
    namespaces = _ExtractNamespaces(modSpec[1], sources, allowWildCards=True)
    moduleBlocks.append(( name, namespaces ))

  modules = _generateModules(sources, moduleBlocks, keepBaseSeparate=options.keep_base_separate)

  output_mode = options.output_mode
  if output_mode == 'cmdline':
    out.writelines(_generateCommandLine(modules, keepDeps=options.keep_dep_tags))
  elif output_mode == 'dot':
    out.writelines(_generateDotGraph(modules))
  elif output_mode == 'compiled':

    # Make sure a .jar is specified.
    if not options.compiler_jar:
      logging.error('--compiler_jar flag must be specified if --output is '
                    '"compiled"')
      sys.exit(1)

    paths = []
    for name, deps, moddeps in modules:
      paths += [src.GetPath() for src in deps]

    compiler_flags = _getModuleFlags(modules, keepDeps=options.keep_dep_tags)
    if options.compiler_flags:
      compiler_flags += options.compiler_flags.split()

    compiled_source = jscompiler.Compile(options.compiler_jar,
      paths,
      compiler_flags
    )

    if compiled_source is None:
      logging.error('JavaScript compilation failed.')
      sys.exit(1)
    else:
      logging.info('JavaScript compilation succeeded.')
      out.write(compiled_source)

  else:
    logging.error('Invalid value for --output flag.')
    sys.exit(1)

  options.list_unused_files = ParseBoolean(options.list_unused_files)

  # todo: this overlapping could be used to generate _two_ deps files!
  # one with all files, and one with the compiled modules (merged with others).
  if options.list_unused_files:
    # could output contained modules also?
    all_src = set([src.GetPath() for src in sources])
    mod_src = set()
    for mod in modules:
      mod_src.update([src.GetPath() for src in mod[1]])
    orphans = all_src - mod_src
    if len(orphans) > 0:
      out.write('Orphan files in the input tree:\n' + '\n'.join(sorted(orphans, key=str.lower)))


if __name__ == '__main__':
  main()
