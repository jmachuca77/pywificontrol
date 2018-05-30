#!/bin/bash

# WARNING: this script is run as root!
set -e
set -x

pushd ~apsync/start_wificontrol
./init_wifi.py
screen -L -d -m -S wificontrol -s /bin/bash ./server.py >start_wificontrol.log 2>&1

exit 0
