from serial import Serial

import time

from ch9329 import keyboard
from ch9329 import mouse
from ch9329.config import get_manufacturer
from ch9329.config import get_parameters
from ch9329.config import get_product
from ch9329.config import get_serial_number

ser = Serial("/dev/ttyUSB0", 9600, timeout=0.05)

time.sleep(3)

# keyboard.press_and_release(ser, "a", modifiers=["ctrl"])
# keyboard.write(ser, "Hello World\n")
# keyboard.write(ser, "abcdefghijklmnopqrstuvwxyz\n")
# keyboard.write(ser, "ABCDEFGHIJKLMNOPQRSTUVWXYZ\n")
# keyboard.write(ser, "0123456789\n")
# keyboard.write(ser, "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~\n")

keyboard.press(ser, "a", modifiers=["ctrl"])
time.sleep(0.01)
keyboard.release(ser)
keyboard.press(ser, "a")
time.sleep(0.01)
keyboard.release(ser)

time.sleep(0.5)

mouse.move(ser, x=100, y=100)
mouse.move(ser, x=110, y=110)
time.sleep(0.5)
mouse.move(ser, x=50, y=50, relative=True)
mouse.click(ser, button="right")

print(get_serial_number(ser))
# 20193152CFBF
print(get_product(ser))
# WCH UART TO KB-MS_V1.7
print(get_manufacturer(ser))
# WWW.WCH.CN

params = get_parameters(ser)
for attr in [
    "cmd",
    "chip_working_mode",
    "serial_comm_mode",
    "serial_comm_address",
    "serial_comm_baud_rate",
    "serial_comm_packet_interval",
    "usb_vid",
    "usb_pid",
    "usb_keyboard_upload_interval",
    "usb_keyboard_release_delay",
    "usb_keyboard_automatic_return",
    "usb_string_enable",
    "usb_fast_upload",
]:
    print(f"{attr}: {getattr(params, attr, None)}")# cmd: 136
# chip_working_mode: 128
# serial_comm_mode: 128
# serial_comm_address: 0
# serial_comm_baud_rate: 9600
# serial_comm_packet_interval: 3
# usb_vid: 6790
# usb_pid: 57641
# usb_keyboard_upload_interval: 0
# usb_keyboard_release_delay: 1
# usb_keyboard_automatic_return: 0
# usb_string_enable: 0
# usb_fast_upload: 0

ser.close()