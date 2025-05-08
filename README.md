# Portable KVM-over-USB System
This project is an attempt to solve a very practical problem: how to connect to a server that does not have SSH, IPMI, or iDRAC. In such cases, there is only one thing left to do - physically connect a keyboard, mouse, and monitor. We made it easier.

**pyKVM** is a portable system that allows you to control a server or mini pc using a regular laptop and inexpensive USB devices: a CH9329 chip for mouse and keyboard emulation, and HDMI video capture. As a result, we got something like a software KVM device launched through a browser.

## What Has Been Implemented
The frontend runs entirely in the browser and is written in pure HTML, CSS and JavaScript. It displays the stream from the HDMI device and transmits user actions to the server via API. Mouse movements, clicks, scrolling, keyboard input and switching the layout language (by ```Alt+Shift```) are supported.

The server runs on FastAPI. It accepts commands and transmits them via the COM port to CH9329. All keyboard and mouse control logic is implemented in Python, including modifier processing (```Shift, Ctrl, Alt```), visual feedback and adaptation to different languages.

The connection status is also displayed - a green circle if everything works; red - if video capture fails; gray - if the server does not respond. This is implemented by checking the HDMI status and analyzing the received image.

## How to Run
### 1. Hardware Required
- Laptop or PC with USB port
- CH9329 USB serial adapter (for keyboard/mouse emulation)
- HDMI-to-USB video capture device

### 2. Installation
To run, you need to install dependencies:
```
pip install -r requirements.txt
```

### 2. Start the Server
And then just start the server:
```
uvicorn main:app --reload
```

And open http://localhost:8000 in the browser.

## Why We Built It

Off-the-shelf KVM switches are expensive and often unavailable locally (especially in Kazakhstan). We built an open-source, cross-platform alternative that works out of the box using widely available hardware.

Though originally developed as a thesis project, pyKVM turned into a real, working tool — suitable for use in datacenters, field diagnostics, or even embedded system debugging without requiring a monitor or physical input devices.