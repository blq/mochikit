#
# a bit silly, all this does is the equivalent of cmd line: "depswriter --root ..MochiKit"
#

import sys

from Closure.bin.build import depswriter


if __name__ == '__main__':

  path_to_source = depswriter.GatherFiles(roots=['../MochiKit'])

  out = open('../MochiKit/deps.js', 'w')  # or sys.stdout

  out.write('// MochiKit dependencies.\n')

  out.write(depswriter.MakeDepsFile(path_to_source))