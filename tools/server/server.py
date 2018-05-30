# uncompyle6 version 2.11.2
# Python bytecode 2.7 (62211)
# Decompiled from: Python 2.7.13 (default, Apr  4 2017, 08:47:57) 
# [GCC 4.2.1 Compatible Apple LLVM 8.1.0 (clang-802.0.38)]
# Embedded file name: build/lib/updater/server.py
# Compiled at: 2017-02-22 02:46:08
import eventlet
eventlet.monkey_patch()
import argparse
import sys
import time
import threading
from flask import Flask, render_template, redirect
from flask_socketio import SocketIO, disconnect
from wificontrol import WiFiControl
from sysdmanager import SystemdManager
#from opkg import Opkg, OpkgError, OpkgLockedError
import utils
app = Flask(__name__)
socketio = SocketIO(app)
wifi = WiFiControl()
sysd = SystemdManager()
#opkg = Opkg()
#opkg.update()

@app.route('/')
def hello():
    return render_template('index.html')


@socketio.on('connect')
def handle_connect():
    print 'Browser connected!'


@socketio.on('disconnect')
def handle_disconnect():
    print 'Browser disconnected!'


@socketio.on('get test results')
def get_tests_results():
    utils.tests['device'] = utils.device
    socketio.emit('test results', utils.tests)


@socketio.on('get time sync status')
def return_time_sync_status():
    socketio.emit('time sync status', {'status': not sysd.is_active('time_sync.service')})


@socketio.on('get reach name')
def get_reach_name():
    hostap_name = wifi.get_hostap_name()
    device_name = wifi.get_device_name()
    socketio.emit('receive reach name', [hostap_name, device_name])


@socketio.on('set reach name')
def set_hotspot_name(new_name):
    revert = wifi.set_device_names(new_name)
    dev_name = wifi.get_device_name()
    hostap_name = wifi.get_hostap_name()
    socketio.emit('name change status', [revert, dev_name, hostap_name])


@socketio.on('get saved wifi networks')
def get_known_networks():
    added_networks = wifi.get_added_networks()
    status = wifi.get_status()
    current_network = status[1]
    for network in added_networks:
        network['connected'] = False
        if status[0] == 'wpa_supplicant' and current_network is not None and network is not None and network['ssid'] == current_network['ssid']:
            network['connected'] = True
            network['mac address'] = current_network['mac address']
            network['IP'] = current_network['IP address']

    socketio.emit('wifi saved networks results', added_networks)
    return


@socketio.on('add new network')
def add_network(network):
    wifi.add_network(network)
    added_networks = wifi.get_added_networks()
    status = wifi.get_status()
    current_network = status[1]
    for network in added_networks:
        network['connected'] = False
        if status[0] == 'wpa_supplicant' and current_network is not None and network is not None and network['ssid'] == current_network['ssid']:
            network['connected'] = True
            network['mac address'] = current_network['mac address']
            network['IP'] = current_network['IP address']

    socketio.emit('wifi saved networks results', added_networks)
    return


@socketio.on('remove network')
def remove_network(network):
    wifi.remove_network(network)
    added_networks = wifi.get_added_networks()
    status = wifi.get_status()
    current_network = status[1]
    for network in added_networks:
        network['connected'] = False
        if status[0] == 'wpa_supplicant' and current_network is not None and network is not None and network['ssid'] == current_network['ssid']:
            network['connected'] = True
            network['mac address'] = current_network['mac address']
            network['IP'] = current_network['IP address']

    socketio.emit('wifi saved networks results', added_networks)
    return

@socketio.on('create access point')
def create_access_point():
    wifi.start_host_mode()

@socketio.on('connect to network')
def start_connecting(network):
    disconnect()
    socketio.sleep(0.1)
    wifi.start_connecting(network, timeout=5)


@socketio.on('update')
def run_opkg_update():
	return
    #def report_update_result(finished_state, socketio):
       # socketio.emit('opkg update result', finished_state)

    #socketio.start_background_task(opkg.update, report_update_result, (socketio,))


@socketio.on('get reachview version')
def get_reachview_version():
    return
    #try:
        #version = opkg.get_package_version(utils.test_package)
    #except OpkgLockedError:
    #    socketio.emit('update system locked')
    #else:
    #    socketio.emit('current reachview version', {'version': version
    #       })


@socketio.on('is reachview upgrade available')
def is_package_upgradable():
	return
    #try:
    #    new_version = opkg.is_package_upgradable(utils.test_package)
    #except OpkgLockedError:
    #    socketio.emit('update system locked')
    #else:
    #    socketio.emit('reachview upgrade version', {'available version': new_version,
    #       'upgrade available': bool(new_version)
    #       })
    #    if not new_version:
    #        utils.update_first_setup_status()


@socketio.on('upgrade reachview')
def run_opkg_upgrade_reachview():

    def report_upgrade_status(state, socketio):
        socketio.emit('reachview upgrade status', state)
        if state['state'] == 'Finished':
            utils.update_first_setup_status()

    #socketio.start_background_task(opkg.install, utils.test_package, report_upgrade_status, (socketio,))


@socketio.on('skip update')
def skip_update():
    utils.update_first_setup_status()


@socketio.on('reboot now')
def reboot():
    disconnect()
    socketio.sleep(0.1)
    utils.reboot()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=5000)
    parser.add_argument('--device', help='Reach/ReachRS')
    parser.add_argument('--tests')
    args = parser.parse_args()
    utils.device = args.device
    utils.tests = utils.parse_tests(args.tests or '')
    socketio.run(app, host='0.0.0.0', port=args.port)


if __name__ == '__main__':
    main()
# okay decompiling server.pyc
