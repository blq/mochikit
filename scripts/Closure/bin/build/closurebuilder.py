#!/usr/bin/env python
#
# Copyright 2009 The Closure Library Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS-IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Utility for Closure Library dependency calculation.

ClosureBuilder scans source files to build dependency info.  From the
dependencies, the script can produce a manifest in dependency order,
a concatenated script, or compiled output from the Closure Compiler.

Paths to files can be expressed as individual arguments to the tool (intended
for use with find and xargs).  As a convenience, --root can be used to specify
all JS files below a directory.

usage: %prog [options] [file1.js file2.js ...]
"""

__author__ = 'nnaze@google.com (Nathan Naze)'


import logging
import optparse
import os
import sys
import string

import depstree
import jscompiler
import source
import treescan


def _GetOptionsParser():
  """Get the options parser."""

  parser = optparse.OptionParser(__doc__)
  parser.add_option('-i',
                    '--input',
                    dest='inputs',
                    action='append',
                    default=[],
                    help='One or more input files to calculate dependencies '
                    'for.  The namespaces in this file will be combined with '
                    'those given with the -n flag to form the set of '
                    'namespaces to find dependencies for.')
  parser.add_option('-n',
                    '--namespace',
                    dest='namespaces',
                    action='append',
                    default=[],
                    help='One or more namespaces to calculate dependencies '
                    'for.  These namespaces will be combined with those given '
                    'with the -i flag to form the set of namespaces to find '
                    'dependencies for.  A Closure namespace is a '
                    'dot-delimited path expression declared with a call to '
                    'goog.provide() (e.g. "goog.array" or "foo.bar").')
  parser.add_option('--root',
                    dest='roots',
                    action='append',
                    default=[],
                    help='The paths that should be traversed to build the '
                    'dependencies.')
  parser.add_option('-o',
                    '--output_mode',
                    dest='output_mode',
                    type='choice',
                    action='store',
                    choices=['list', 'script', 'compiled', 'deps', 'dot'],
                    default='list',
                    help='The type of output to generate from this script. '
                    'Options are "list" for a list of filenames, "script" '
                    'for a single script containing the contents of all the '
                    'files, or "compiled" to produce compiled output with '
                    'the Closure Compiler.  Default is "list".')
  parser.add_option('-c',
                    '--compiler_jar',
                    dest='compiler_jar',
                    action='store',
                    help='The location of the Closure compiler .jar file.')
  parser.add_option('-f',
                    '--compiler_flags',
                    dest='compiler_flags',
                    default=[],
                    action='append',
                    help='Additional flags to pass to the Closure compiler. '
                    'To pass multiple flags, --compiler_flags has to be '
                    'specified multiple times.')
  parser.add_option('--output_file',
                    dest='output_file',
                    action='store',
                    help=('If specified, write output to this path instead of '
                          'writing to standard output.'))
  # todo: integrate depswriter's "--path_with_prefix" also (and a "--path_with_prefix_and_postfix"?)
  # or make this a more general "--path_with_postfix" flag?
  parser.add_option('--append_version',
                    dest='append_version',
                    action='store',
                    help=('(mode=deps only). If specified, append version as "?v=version" to each url.'))
  parser.add_option('--noCache',
                    dest='noCache',
                    action='store_true',
                    help=('(mode=deps only). If specified, append a unique id, ex "&noCache=12313421", to each url to prevent browser from caching the script'))


  return parser


def _GetInputByPath(path, sources):
  """Get the source identified by a path.

  Args:
    path: str, A path to a file that identifies a source.
    sources: An iterable collection of source objects.

  Returns:
    The source from sources identified by path, if found.  Converts to
    absolute paths for comparison.
  """
  for js_source in sources:
    # Convert both to absolute paths for comparison.
    if os.path.abspath(path) == os.path.abspath(js_source.GetPath()):
      return js_source


def _GetClosureBaseFile(sources):
  """Given a set of sources, returns the one base.js file.

  Note that if zero or two or more base.js files are found, an error message
  will be written and the program will be exited.

  Args:
    sources: An iterable of _PathSource objects.

  Returns:
    The _PathSource representing the base Closure file.
  """
  base_files = [
      js_source for js_source in sources if _IsClosureBaseFile(js_source)]

  if not base_files:
    logging.error('No Closure base.js file found.')
    sys.exit(1)
  if len(base_files) > 1:
    logging.error('More than one Closure base.js files found at these paths:')
    for base_file in base_files:
      logging.error(base_file.GetPath())
    sys.exit(1)
  return base_files[0]


def _IsClosureBaseFile(js_source):
  """Returns true if the given _PathSource is the Closure base.js source."""
  return (os.path.basename(js_source.GetPath()) == 'base.js' and
          js_source.provides == set(['goog']))


class _PathSource(source.Source):
  """Source file subclass that remembers its file path."""

  def __init__(self, path):
    """Initialize a source.

    Args:
      path: str, Path to a JavaScript file.  The source string will be read
        from this file.
    """
    super(_PathSource, self).__init__(source.GetFileContents(path))

    self._path = path

  def GetPath(self):
    """Returns the path."""
    return self._path


def main():
  logging.basicConfig(format=(sys.argv[0] + ': %(message)s'),
                      level=logging.INFO)
  options, args = _GetOptionsParser().parse_args()

  # Make our output pipe.
  if options.output_file:
    out = open(options.output_file, 'w')
  else:
    out = sys.stdout

  sources = set()

  logging.info('Scanning paths...')
  for path in options.roots:
    for js_path in treescan.ScanTreeForJsFiles(path):
      sources.add(_PathSource(js_path))

  # Add scripts specified on the command line.
  for js_path in args:
    sources.add(_PathSource(js_path))

  logging.info('%s sources scanned.', len(sources))

  # Though deps output doesn't need to query the tree, we still build it
  # to validate dependencies.
  logging.info('Building dependency tree..')
  tree = depstree.DepsTree(sources)

  input_namespaces = set()
  inputs = options.inputs or []
  for input_path in inputs:
    js_input = _GetInputByPath(input_path, sources)
    if not js_input:
      logging.error('No source matched input %s', input_path)
      sys.exit(1)
    input_namespaces.update(js_input.provides)

  input_namespaces.update(options.namespaces)

  if not input_namespaces:
    logging.error('No namespaces found. At least one namespace must be '
                  'specified with the --namespace or --input flags.')
    sys.exit(2)

  # The Closure Library base file must go first.
  base = _GetClosureBaseFile(sources)
  deps = [base] + tree.GetDependencies(input_namespaces)

  output_mode = options.output_mode
  if output_mode == 'list':
    out.writelines([js_source.GetPath() + '\n' for js_source in deps])
  elif output_mode == 'deps':

    # typically for debug mode
    postFix = ''
    if options.append_version:
      postFix += '?v=' + options.append_version
    if options.noCache:
      out.writelines('var noCache = (new Date()).getTime();\n') # todo: must make the var name unique also! (or wrap entire deps block in a closure fn? or sniff for a single version?)
      if options.append_version:
        postFix += "&"
      else:
        postFix += "?"
      postFix += 'noCache=\'+noCache'
    else:
      postFix += "'"

    for js_source in deps:
      # todo: provide optional prefix And postfix
      path = js_source.GetPath().replace('\\', '/') # fix for windows paths
      out.writelines('goog.addDependency(\'%s%s, %s, %s);\n' % (path, postFix, list(js_source.provides), list(js_source.requires)))
  elif output_mode == 'dot':
    # todo: extract stuff like this to a separate "graphgenerator.py"
    out.writelines('digraph G {\n')

    for js_source in deps:
      jsFile = os.path.basename(js_source.GetPath())
      subName = 'cluster_' + jsFile.replace('.js', '')

      # file->module provides
      out.writelines('\tsubgraph ' + subName + ' {\n')
      out.writelines('\t\tlabel="%s";\n' % jsFile)
      for prov in js_source.provides:
        out.writelines('\t\t%s;\n' % prov.replace('.', '_')) # dot doesn't like '.' (?)
      out.writelines('\t}\n\n')

      # todo: ? only when using the "fdp" layout engine in graphivz this displays correctly?
      # file->module requires
      for req in js_source.requires:
        out.writelines('\t%s -> %s;\n' % (subName, req.replace('.', '_')))

      # only in case of a single module can we be sure the module reqs are same as file (assuming "everything" is tagged..)
      #if len(js_source.provides) == 1:
      #  for prov in js_source.provides:
      #    for req in js_source.requires:
      #      out.writelines('\t%s -> %s;\n' % (prov.replace('.', '_'), req.replace('.', '_')))


      #todo: file->file deps!

    out.writelines('}\n')

  elif output_mode == 'script':
    out.writelines([js_source.GetSource() for js_source in deps])
  elif output_mode == 'compiled':

    # Make sure a .jar is specified.
    if not options.compiler_jar:
      logging.error('--compiler_jar flag must be specified if --output is '
                    '"compiled"')
      sys.exit(2)

    compiled_source = jscompiler.Compile(
        options.compiler_jar,
        [js_source.GetPath() for js_source in deps],
        options.compiler_flags)

    if compiled_source is None:
      logging.error('JavaScript compilation failed.')
      sys.exit(1)
    else:
      logging.info('JavaScript compilation succeeded.')
      out.write(compiled_source)

  else:
    logging.error('Invalid value for --output flag.')
    sys.exit(2)


if __name__ == '__main__':
  main()
