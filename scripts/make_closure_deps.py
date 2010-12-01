#
# Generates Google Closure dependency file for MochiKit. i.e module<->file mapping
# using the Closure depswriter.py script
# @see http://code.google.com/closure/library/docs/depswriter.html
#
# all this does is the equivalent of the cmd line:
# "python depswriter.py --root ../MochiKit --output_file ../MochiKit/deps.js"
# but this way we get an 100% Python tool- & build-chain
#
# @author Fredrik Blomqvist
#

import sys
import subprocess

#from Closure.bin.build import depswriter

def main():

  p = subprocess.Popen(['python', 'Closure/bin/build/depswriter.py',
    '--output_file', '../MochiKit/deps.js',
    '--root', '../MochiKit', #use --root_with_prefix if more "advanced" paths needed
    '--append_version', '1.5' # not strictly necessary. todo: parse version from main script
  ])


if __name__ == '__main__':
  main()