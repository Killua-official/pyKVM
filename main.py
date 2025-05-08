import platform
import socket

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from ch9329 import keyboard
from ch9329 import mouse
from ch9329.mouse import MouseCtrl
from serial import Serial

serial = Serial("COM8", 9600, timeout=0.05)

app = FastAPI()
api = FastAPI()

app.mount("/api", api)
app.mount("/", StaticFiles(directory="public", html=True), name="public")

@api.post("/keydown")
async def keydown(key: str, control: bool = False, shift: bool = False, alt: bool = False):
    key_map = {
        "meta": "win",
        "capslock": "caps_lock",
        "arrowright": "arrow_right",
        "arrowleft": "arrow_left",
        "arrowdown": "arrow_down",
        "arrowup": "arrow_up"
    }
    key = key_map.get(key.lower(), key.lower())

    if key in {"shift", "control", "alt"}:
        return

    allowed_keys = set("abcdefghijklmnopqrstuvwxyz0123456789 `~!@#$%^&*()-_=+[]{}|;:'\",.<>/?\\") | {
        "enter", "backspace", "tab", "space", "escape", "arrow_left", "arrow_right",
        "arrow_up", "arrow_down", "caps_lock", "win"
    }

    if key not in allowed_keys:
        print(f"[WARNING] Unsupported key: {key}")
        return

    modifiers = []
    if control:
        modifiers.append("ctrl")
    if shift:
        modifiers.append("shift")
    if alt:
        modifiers.append("alt")

    print(f"[DEBUG] KeyDown - Key: {key}, Modifiers: {modifiers}")
    try:
        keyboard.press(serial, key, modifiers)
    except Exception as e:
        print(f"[ERROR] keydown failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api.post("/keyup")
async def keyup():
    try:
        keyboard.release(serial)
    except Exception as e:
        print(f"[ERROR] keyup failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api.post("/mousedown")
async def mousedown(button: MouseCtrl):
    try:
        mouse.press(serial, button)
    except Exception as e:
        print(f"[ERROR] mousedown failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api.post("/mouseup")
async def mouseup():
    try:
        mouse.release(serial)
    except Exception as e:
        print(f"[ERROR] mouseup failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api.post("/mousemove")
async def mousemove(x: int, y: int):
    try:
        mouse.move(serial, x, y)
    except Exception as e:
        print(f"[ERROR] mousemove failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api.post("/switch-language")
async def switch_language():
    try:
        keyboard.press(serial, "alt", ["shift"])
    except Exception as e:
        print(f"[ERROR] switch-language failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api.get("/device")
def get_device_info():
    return {
        "hostname": socket.gethostname(),
        "os": platform.system() + " " + platform.release(),
        "resolution": "1920x1080",
        "connection": "USB + HDMI"
    }

@api.get("/ping")
def ping():
    return {"status": "ok"}


if __name__ == '__main__':
    print("Execute `uvicorn main:app --reload` to start the server.")

