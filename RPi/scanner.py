import unicornhat as corn

import time
import requests

red = (100,0,0)
green = (0,100,0)
purple = (100,0, 100)
yellow = (0,100, 100)
blue = (0,0, 100)

def checkid(id):
  r = requests.get('http://127.0.0.1:3000/api/student/' + str(id))
  print(r.text)

def display(color, dur = 0):
  corn.set_all(color)
  corn.show()
  if(time > 0):
    time.sleep(dur)
    corn.clear()
    corn.show()

display(blue, dur = 1)

while True:
  isGood = False
  id = input("Student ID: ")
  try:
    # r = requests.get('http://127.0.0.1:3000/api/student/' + str(id))
    #isGood = (r.text == "true")
    isGood = id == 402954901

    display(green if isGood else red, dur = 3)
  except ValueError:
    display(yellow, dur=3)

