#
# a bit silly, all this does is the equivalent of the
# cmd line: "depswriter.py --root ../MochiKit --output_file ../MochiKit/deps.js"
# but this way we get an python tool- & build-chain
#

import sys

from Closure.bin.build import depswriter

def main():
  path_to_source = depswriter.GatherFiles(roots=['../MochiKit'])

  out = open('../MochiKit/deps.js', 'w')  # or sys.stdout

  out.write('// MochiKit dependencies.\n')

  out.write(depswriter.MakeDepsFile(path_to_source))


if __name__ == '__main__':
  main()