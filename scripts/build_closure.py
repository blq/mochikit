#
# does a Closure compile/compress + dependecy files generation
#

import sys

import make_closure_deps


if __name__ == '__main__':

  # todo: call modulebuilder and bake the compiled pack(s)

  # generate dependency file
  make_closure_deps.main()