# uncompyle6 version 2.11.2
# Python bytecode 2.7 (62211)
# Decompiled from: Python 2.7.13 (default, Apr  4 2017, 08:47:57) 
# [GCC 4.2.1 Compatible Apple LLVM 8.1.0 (clang-802.0.38)]
# Embedded file name: build/lib/updater/utils.py
# Compiled at: 2017-02-22 02:46:08
import subprocess
import os
import pexpect
device = None
tests = {}
test_package = 'python-reachview'
update_thread = None
install_thread = None

def parse_tests(result_string):
    tests = {'u-blox': False,
       'mpu': False,
       'lora': False,
       'stc': False,
       'ltc': False
       }
    for test in result_string.split(','):
        if test:
            info = test.split(':')
            if info[0] not in tests:
                continue
            try:
                tests[info[0]] = True if info[1] == 'true' else False
            except IndexError:
                pass

    return tests


def update_first_setup_status():
    path = '/etc/reachview'
    name = 'first_time_setup.cfg'
    if not os.path.exists(path):
        try:
            os.mkdir(path)
        except OSError as error:
            print error

    if not os.path.exists(path + '/' + name):
        try:
            open(path + '/' + name, 'w').close()
        except IOError as error:
            print error


def reboot():
    subprocess.call('reboot', shell=True)
# okay decompiling utils.pyc
