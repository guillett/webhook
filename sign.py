# -*- coding: utf-8 -*-

import hashlib
import hmac
import sys

def main():
  content = sys.argv[len(sys.argv)-1]
  h = hmac.new(str.encode('secret'), digestmod='sha256')

  print(content)
  h.update(str.encode(content))
  print(h.hexdigest())

if __name__ == '__main__':
  main()
