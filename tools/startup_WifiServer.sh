{
date
PATH=$PATH:/usr/local/bin:/root
export PATH
echo $PATH
export USER=root
export HOME=/root
cd /root
pwd
/home/apsync/start_wificontrol/init_wifi.py
screen -d -m -s /bin/bash python /home/apsync/start_wificontrol/server.py
} > /tmp/server.log 2>&1
