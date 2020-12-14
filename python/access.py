#import unicornhat as corn

import time
import requests
import logging

import http.client
http.client.HTTPConnection.debuglevel = 1

# You must initialize logging, otherwise you'll not see debug output.
logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
requests_log = logging.getLogger("requests.packages.urllib3")
requests_log.setLevel(logging.DEBUG)
requests_log.propagate = True

red = (255,0,0)
green = (0,255,0)

def checkid(id):
  r = requests.get('http://127.0.0.1:3000/api/student/' + id)
  print(r.text)


#def verify(valid):
  #corn.set_all(green if valid else red)
  #corn.show()
  #time.sleep(0.5)
  #corn.clear()
  #corn.show()

running  = True

while running:
    id = input("Student ID: ")
    checkid(id)
    #verify(isGood)
