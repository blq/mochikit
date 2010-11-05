#!/usr/bin/env python
#
# Copyright 2009 Google Inc. All Rights Reserved.

"""Generates out a Closure deps.js file given a list of JavaScript sources.

Paths can be specified as arguments or (more commonly) specifying trees
with the flags (call with --help for descriptions).

Usage: depswriter.py [path/to/js1.js [path/to/js2.js] ...]
"""

import logging
import optparse
import os
import shlex
import sys

import source
import treescan





def MakeDepsFile(source_map, postFix=''):
  """Make a generated deps file.

  Args:
    source_map: A dict map of the source path to source.Source object.

  Returns:
    str, A generated deps file source.
  """
  paths = [_GetDepsLine(path + postFix, js_source)
                  for path, js_source in source_map.items() if len(js_source.provides) > 0]
  paths.sort(key=str.lower)
  return ''.join(paths)


def _GetDepsLine(path, js_source):
  """Get a deps.js file string for a source."""

  return 'goog.addDependency(\'%s\', %s, %s);\n' % (
      path.replace("\\", "/"), list(js_source.provides), list(js_source.requires))


def _GetOptionsParser():
  """Get the options parser."""

  parser = optparse.OptionParser(__doc__)

  parser.add_option('--output_file',
                    dest='output_file',
                    action='store',
                    help=('If specified, write output to this path instead of '
                          'writing to standard output.'))
  parser.add_option('--root',
                    dest='roots',
                    default=[],
                    action='append',
                    help='A root directory to scan for JS source files. '
                    'Paths of JS files in generated deps file will be '
                    'relative to this path.  This flag may be specified '
                    'multiple times.')
  parser.add_option('--root_with_prefix',
                    dest='roots_with_prefix',
                    default=[],
                    action='append',
                    help='A root directory to scan for JS source files, plus '
                    'a prefix (if either contains a space, surround with '
                    'quotes).  Paths in generated deps file will be relative '
                    'to the root, but preceeded by the prefix.  This flag '
                    'may be specified multiple times.')
  parser.add_option('--path_with_depspath',
                    dest='paths_with_depspath',
                    default=[],
                    action='append',
                    help='A path to a source file and an alternate path to '
                    'the file in the generated deps file (if either contains '
                    'a space, surround with whitespace). This flag may be '
                    'specifified multiple times.')
  # todo: integrate depswriter's "--path_with_prefix" also (and a "--path_with_prefix_and_postfix"?)
  # or make this a more general "--path_with_postfix" flag?
  parser.add_option('--append_version',
                    dest='append_version',
                    action='store',
                    help=('If specified, append version as "?v=version" to each url.'))


  return parser



def _GetRelativePathToSourceDict(root, prefix=''):
  """Scans a top root directory for .js sources.

  Args:
    root: str, Root directory.
    prefix: str, Prefix for returned paths.

  Returns:
    dict, A map of relative paths (with prefix, if given), to source.Source
      objects.
  """
  # Remember and restore the cwd when we're done. We work from the root so
  # that paths are relative from the root.
  start_wd = os.getcwd()
  os.chdir(root)

  path_to_source = {}
  for path in treescan.ScanTreeForJsFiles('.'):
    prefixed_path = os.path.join(prefix, path)
    path_to_source[prefixed_path] = source.Source(source.GetFileContents(path))

  os.chdir(start_wd)

  return path_to_source


def _GetPair(s):
  """Return a string as a shell-parsed tuple.  Two values expected."""
  try:
    first, second = shlex.split(s)
    return (first, second)
  except:
    raise Exception('Unable to parse input line as a pair: %s' % s)


def GatherFiles(roots=[], roots_with_prefix=[], paths_with_depspath=[], args=[]):
  path_to_source = {}

  # Roots without prefixes
  for root in roots:
    path_to_source.update(_GetRelativePathToSourceDict(root))

  # Roots with prefixes
  for root_and_prefix in roots_with_prefix:
    root, prefix = _GetPair(root_and_prefix)
    path_to_source.update(_GetRelativePathToSourceDict(root, prefix=prefix))

  # Source paths
  for path in args:
    path_to_source[path] = source.Source(source.GetFileContents(path))

  # Source paths with alternate deps paths
  for path_with_depspath in paths_with_depspath:
    srcpath, depspath = _GetPair(path_with_depspath)
    path_to_source[depspath] = source.Source(source.GetFileContents(srcpath))

  return path_to_source


def main():
  """CLI frontend to MakeDepsFile."""
  logging.basicConfig(format=(sys.argv[0] + ': %(message)s'),
                      level=logging.INFO)
  options, args = _GetOptionsParser().parse_args()

  path_to_source = GatherFiles(roots=options.roots, roots_with_prefix=options.roots_with_prefix, paths_with_depspath=options.paths_with_depspath, args=args)

  postFix = ''
  if options.append_version:
    postFix += '?v=' + options.append_version

  # Make our output pipe.
  if options.output_file:
    out = open(options.output_file, 'w')
  else:
    out = sys.stdout

  out.write('// This file was autogenerated by %s.\n' % sys.argv[0])
  out.write('// Please do not edit.\n')

  out.write(MakeDepsFile(path_to_source, postFix=postFix))


if __name__ == '__main__':
  main()
