{
date
PATH=$PATH:/usr/local/bin:/root
export PATH
echo $PATH
export USER=root
export HOME=/root
cd /root
pwd
python /root/Developer/pywificontrol/tools/init_wifi.py
screen -d -m -s /bin/bash python /root/Developer/WiFi_Controller_Ardupilot/server.py
} > /tmp/server.log 2>&1

