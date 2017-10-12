<<<<<<< HEAD:scripts/init_wifi.py
# wificontrol code is placed under the GPL license.
# Written by Ivan Sapozhkov (ivan.sapozhkov@emlid.com)
# Copyright (c) 2016, Emlid Limited
=======
#!/usr/bin/python

# Written by Aleksandr Aleksandrov <aleksandr.aleksandrov@emlid.com>
#
# Copyright (c) 2017, Emlid Limited
>>>>>>> 9f8637d... init_wifi: init example moved to tools, updated to a newer version:tools/init_wifi.py
# All rights reserved.

# If you are interested in using wificontrol code as a part of a
# closed source project, please contact Emlid Limited (info@emlid.com).

# This file is part of wificontrol.

# wificontrol is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# wificontrol is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with wificontrol.  If not, see <http://www.gnu.org/licenses/>.


import sys

from wificontrol import WiFiControl

<<<<<<< HEAD:scripts/init_wifi.py
def connection_callback(result, wific):
    if not result:
        print("Can't connect to any network.")
        print("Start HOSTAP mode")
        try:
            wific.start_host_mode()
        except WiFiControlError as error:
            print(error)
            sys.exit(2)
        else: 
            print("In HOST mode")
            sys.exit(10)
=======

def _show_result(result, wifi_controller):
    if result:
        sys.stdout.write("Network mode: client")
>>>>>>> 9f8637d... init_wifi: init example moved to tools, updated to a newer version:tools/init_wifi.py
    else:
        if wifi_controller.start_host_mode():
            sys.stdout.write("Network mode: master")
        else:
            sys.stdout.write("Network mode: unknown")


def initialize():
    try:
        wifi_controller = WiFiControl()
    except OSError:
        sys.stdout.write("Network mode: unknown")
    else:
        wifi_controller.turn_on_wifi()

        if wifi_controller.start_client_mode():
            wifi_controller.start_connecting(
                None, callback=_show_result,
                args=(wifi_controller,))
        else:
            if wifi_controller.start_host_mode():
                sys.stdout.write("Network mode: master")
            else:
                sys.stdout.write("Network mode: unknown")


if __name__ == "__main__":
    initialize()
