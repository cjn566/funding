import unicornhat as corn
import sys
import time
import requests
from threading import Timer

red = (100,0,0)
green = (0,100,0)
purple = (100,0, 100)
yellow = (100,100, 0)
blue = (0,0, 100)

def display(color, dur = 0):
  corn.set_all(color)
  corn.show()
  if(time > 0):
    time.sleep(dur)
    corn.clear()
    corn.show()

display(blue, dur = 1)

while True:
  try:
    id = raw_input("Student ID: ")
    r = requests.get('http://127.0.0.1:3000/api/student/' + id)
    display(green if (r.text == "true") else red, dur = 4)
  except TypeError:
    print("Type Error: ", sys.exc_info()[0])
    display(yellow, dur = 2)
  except requests.ConnectionError:
    print("Connection Error: ", sys.exc_info()[0])
    display(yellow, dur = 2)
  except KeyboardInterrupt:
    print("Exiting.")
    display(red, dur = 0.3)
    exit()
  except:
    print("Unexpected Error: ", sys.exc_info()[0])
    display(yellow, dur = 2)

