import unicornhat as corn

import time
import http.client

#conn = http.client.HTTPConnection('localhost:3000')
#conn.request("GET","/api/student/12")
#r1 = conn.getresponse()
#data = r1.read()
#print(data)

red = (255,0,0)
green = (0,255,0)

def verify(valid):
  corn.set_all(green if valid else red)
  corn.show()
  time.sleep(0.5)
  corn.clear()
  corn.show()

running  = True

while running:
    id = input("Student ID: ")
    if id == "0":
      verify(True)
    elif id == "1":
        verify(False)
    elif id == "exit":
        running = False
    else:
        print("Invalid Input")
