from ch9329 import keyboard
from ch9329 import mouse
from ch9329.mouse import MouseCtrl
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from serial import Serial

serial = Serial("/dev/ttyUSB0", 9600, timeout=0.05)

app = FastAPI()
api = FastAPI()

app.mount("/api", api)
app.mount("/", StaticFiles(directory="public", html=True), name="public")


@api.post("/keydown")
def keydown(key: str, control: bool = False, shift: bool = False, alt: bool = False):
    key = {"meta": "win", "capslock": "caps_lock", "arrowright": "arrow_right", "arrowleft": "arrow_left",
           "arrowdown": "arrow_down", "arrowup": "arrow_up"}.get(key, key)
    if key in {"shift", "control", "alt"}: return

    if control and alt:
        modifiers = ["ctrl", "alt"]
    elif control:
        modifiers = ["ctrl"]
    elif alt:
        modifiers = ["alt"]
    else:
        modifiers = []

    keyboard.press(serial, key, modifiers)


@api.post("/keyup")
def keyup():
    keyboard.release(serial)


@api.post("/mousedown")
def mousedown(button: MouseCtrl):
    mouse.press(serial, button)


@api.post("/mouseup")
def mouseup():
    mouse.release(serial)


@api.post("/mousemove")
def mousemove(x: int, y: int):
    mouse.move(serial, x, y)


if __name__ == '__main__':
    print("Execute `fastapi dev main.py` to start the server.")
