// ReachView code is placed under the GPL license.
// Written by Egor Fedorov (egor.fedorov@emlid.com) and Danil Kramorov (danil.kramorov@emlid.com)
// Copyright (c) 2015-2016, Emlid Limited
// All rights reserved.

// If you are interested in using ReachView code as a part of a
// closed source project, please contact Emlid Limited (info@emlid.com).

// This file is part of ReachView.

// ReachView is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// ReachView is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with ReachView.  If not, see <http://www.gnu.org/licenses/>.

$(document).ready(function(){
    requirejs(['socket', 'bootstrap_select'], function (io, bootstrap_select) {
        var lostConnectionNoty;
        var emptyRequiredModal = false;
        var incorrectSymbolsNumber = false;
        var incorrectSymbols = false;
        var syncInterval;
        var new_network = {};
        var to_append = '';

        var testPass = false;
        var wifiPass = false;
        var timePass = false;
        var updatePass = false;

        var disconnect_msg = 'Lost connection with APSync. Please check your network, then try refreshing the page.';

        $('.bootstrap-select').selectpicker();
        $(".styled, .multiselect-container input").uniform({ radioClass: 'choice' });

        $(document).on("click", "#create_new_network", function(e) {
            
            $(this).parents('.modal-content').find('.required_field:visible').each(function(){
                if($.trim($(this).val()) == ''){
                    emptyRequiredModal = true;
                    return false;
                }
            });

            if($('#new_network_pass:visible').length != 0){
                if($('#new_network_pass').val().length < 8)
                    incorrectSymbolsNumber = true;
                else
                    incorrectSymbolsNumber = false;
            }
            else
                incorrectSymbolsNumber = false;   

            if(emptyRequiredModal){
                $(this).parents('.modal-content').find('.required_field:visible').filter(function() { return $.trim($(this).val()) == ""; }).css('border', '1px solid red');
                $(this).parents('.modal-content').find('.required_field').filter(function() { return $.trim($(this).val()) != ""; }).css('border', '1px solid #ddd');
                emptyRequiredModal = false;
            }
            else{

                $(this).parents('.modal-content').find('.required_field').css('border', '1px solid #ddd');

                if(incorrectSymbols){
                    $('.modal_add_warning').text('Incorrect symbols. Use only a-z, 1-9 characters.');
                }
                else if(incorrectSymbolsNumber){
                    $('.modal_add_warning').text('Password should contain at least 8 characters');
                }
                else{

                    new_network['ssid'] = $('#new_network_name').val();
                    new_network['password'] = $('#new_network_pass').val();
                    new_network['security'] = $('#security_select').val();
                    new_network['identity'] = $('#new_network_identity').val();

                    $('#modal_network').modal('hide');

                    socket.emit('add new network', new_network);
                }
            }
        })

        $(document).on("change", "#security_select", function(e) {
            
            $('#new_network_identity').removeClass('required_field');
            $('#new_network_identity').parents('.form-group').css('display', 'none');

            $('#new_network_pass').addClass('required_field');
            $('#new_network_pass').parents('.form-group').css('display', 'block');
            $('#uniform-show_pass').parents('.form-group').css('display', 'block');



            if($(this).val() == 'open'){
                $('#new_network_pass').removeClass('required_field');
                $('#new_network_pass').parents('.form-group').css('display', 'none');
                $('#uniform-show_pass').parents('.form-group').css('display', 'none');
            }
            else if($(this).val() == 'wpaeap'){
                $('#new_network_identity').addClass('required_field');
                $('#new_network_identity').parents('.form-group').css('display', 'block');
            }
        })

        $('#modal_network').on('show.bs.modal', function() {

            $('#new_network_name').val('');
            $('#new_network_pass').val('');
            $('#new_network_pass').attr('type', 'password');
            $('#new_network_identity').val('');
            $('#security_select').val('wpa2psk');
            $('#security_select').selectpicker('refresh');
            $('#show_pass').attr('checked', false);
            $('#show_pass').parent().removeClass('checked');
            $('.modal_add_warning').text('');

            $('#security_select').change();

            $('#modal_network input').css('border', '1px solid #ddd');
        })

        $(document).on("change", "#show_pass", function(e) {
            if($(this).is(':checked')){
                $('#new_network_pass').attr('type', 'text');
            }
            else{
                $('#new_network_pass').attr('type', 'password');   
            }
        })

        $(document).on("click", "#added_wi-fi li", function(e) {

            if(!$(this).hasClass('connected_wi-fi_network')){
                $('#modal_saved_connect .network_title').text($(this).find('.wi-fi_title').text());
                $('#modal_saved_connect .network_mac').text('Security: ' + $(this).find('.wi-fi_security').val());
                $('#modal_saved_connect').modal('show');
            }

            return false;
        })

        $(document).on("click", "#connected_wi-fi li", function(e) {
            return false;
        })

        $(document).on("click", "#connect_network", function(e) {

            var network_to_connect = {};
            network_to_connect['ssid'] = $('#modal_saved_connect .network_title').text();
            disconnect_msg = 'APSync is connecting to another network. Switch to ' + network_to_connect['ssid'] + ' to continue.';
            
            socket.emit('connect to network', network_to_connect);

            $('#modal_saved_connect').modal('hide');

            return false;
        })

        $(document).on("click", "#forget_network", function(e) {

            var network_to_remove = {};
            network_to_remove['ssid'] = $('#modal_saved_connect .network_title').text();
            
            socket.emit('remove network', network_to_remove);

            $('#modal_saved_connect').modal('hide');

            return false;
        })

        $('.update_apsync').on('click', function(){
            
            if(!$(this).hasClass('disabled')){
                socket.emit('upgrade reachview');
                $('.current_version').text('Updating...');
                $('.update_status').html('<i class="icon-spinner2 spinner text-warning"></i>');
                $('.row_try_skip').css('display', 'none');
                $('.skip_update_btn').css('display', 'none');
                $('.update_apsync').addClass('disabled');
            }

            return false;
        });

        $('.skip_update, .skip_update_btn').on('click', function(){

            socket.emit('skip update');
            $('.update_status').html('<i class="icon-checkmark3 text-success"></i>');
            $('.update_anchor:not(.collapsed)').click();
            $('.row_try_skip').css('display', 'none');
            $('.skip_update_btn').css('display', 'none');
            updatePass = true;

            if(updatePass && timePass && wifiPass && testPass)
                $('.to_app').removeClass('disabled');
            else
                $('.to_app').addClass('disabled');

            return false;
        });

        $('.try_again').on('click', function(){
            $('.row_try_skip').css('display', 'none');

            socket.emit('get reachview version');
            $('.current_version').text('Getting current version...');

            $('.update_status').html('<i class="icon-spinner2 spinner text-warning"></i>');

            return false;
        });

        $(document).on('click', '#save_host_name_button', function(){

            var emptyRequiredModal = false;
            var incorrectSymbols = false;
            var incorrectSymbolsNumber = false;

            $(this).parents('.panel-body').find('.required_field').filter(function() { return $.trim($(this).val()) != ""; }).css('border', '1px solid #ddd');

            if(document.getElementById('input_new_host_name').value.match(/[^a-zA-Z0-9_\-]/g)){
                incorrectSymbols = true;
            }
            else{
                incorrectSymbols = false;
            }

            if($('#input_new_host_name').val().length < 5 || $('#input_new_host_name').val().length > 20)
                incorrectSymbolsNumber = true;
            else
                incorrectSymbolsNumber = false;

            $(this).parents('.panel-body').find('.required_field').each(function(){
                if($.trim($(this).val()) == ''){
                    emptyRequiredModal = true;
                    return false;
                }
            });

            if(emptyRequiredModal){
                $(this).parents('.panel-body').find('.required_field').filter(function() { return $.trim($(this).val()) == ""; }).css('border', '1px solid red');
                emptyRequiredModal = false;
            }
            else{
                $(this).parents('.panel-body').find('.required_field').css('border', '1px solid #ddd');
                $('#accordion-control-right-group3 .modal_edit_warning').css({'margin-top': '5px'});

                if(incorrectSymbols){
                    $('#accordion-control-right-group3 .modal_edit_warning').text('Valid characters are A-Z a-z 0-9 _ -');
                    $('#accordion-control-right-group3 .modal_edit_warning').css({'margin-top': '5px', 'font-size': '12px'});
                }
                else if(incorrectSymbolsNumber){
                    $('#accordion-control-right-group3 .modal_edit_warning').text('Host name must be 5-20 characters');
                    $('#accordion-control-right-group3 .modal_edit_warning').css({'margin-top': '5px', 'font-size': '12px'});
                }
                else{
                    console.log($('#input_new_host_name').val())
                    socket.emit('set reach name', $('#input_new_host_name').val());
                }
            }

            return false;
        });

        $('.create_ap').on('click', function(){
            if($(this).hasClass('disabled'))
                console.log('disabled');
            else{

                disconnect_msg = 'APSync is creating a new access point and has been disconnected from the network';

                noty({ 
                    width: 200,
                    text: 'Creating Access Point in 3...',
                    type: 'information',
                    dismissQueue: true,
                    timeout: 3000,
                    closeWith: false,
                    layout: 'topRight',
                    callback: {
                        onClose: function(){
                            socket.emit('create access point');
                        }
                    }
                });

                setTimeout(function(){$('.noty_text').text('Creating Access Point in 2...')}, 1000);
                setTimeout(function(){$('.noty_text').text('Creating Access Point in 1...')}, 2000);
            }


            return false;
        });

        $('.to_app').on('click', function(){
            if($(this).hasClass('disabled'))
                console.log('disabled');
            else{

                disconnect_msg = 'APSync is rebooting and has been disconnected from this network.';

                noty({ 
                    width: 200,
                    text: 'Reboot will start in 3...',
                    type: 'information',
                    dismissQueue: true,
                    timeout: 3000,
                    closeWith: false,
                    layout: 'topRight',
                    callback: {
                        onClose: function(){
                            socket.emit('reboot now');
                        }
                    }
                });

                setTimeout(function(){$('.noty_text').text('Reboot will start in 2...')}, 1000);
                setTimeout(function(){$('.noty_text').text('Reboot will start in 1...')}, 2000);
            }


            return false;
        });
        // SocketIO namespace:
        socket = io();

        // say hello on connect
        socket.on("connect", function () {

            socket.emit("browser connected", {data: "I'm connected"});

            if(typeof lostConnectionNoty != "undefined")
                 lostConnectionNoty.close();
        });

        socket.on("reconnect", function () {
            $('.disconnect_overlay').fadeOut();
            $('body').css('position', 'relative');

            $(window).resize();
        });

        socket.on("disconnect", function () {

            $('.disconnect_overlay').fadeIn();
            $('body').css('position', 'fixed');

            lostConnectionNoty = noty({
                width: 200,
                text: disconnect_msg,
                type: 'error',
                dismissQueue: true,
                timeout: false,
                closeWith: false,
                layout: 'topRight',
                callback: {
                    onClose: function(){
                        $('.disconnect_overlay').fadeOut();
                        $('body').css('position', 'relative');

                        noty({
                            width: 200,
                            text: 'APSync reconnected!',
                            type: 'success',
                            dismissQueue: true,
                            timeout: false,
                            closeWith: false,
                            timeout: 3000,
                            layout: 'topRight'
                        });
                    }
                }
            });
        })

        socket.on('connect_error', function() {
            console.clear();
            console.log('Lost connection with sockets');
        })

        socket.emit('get saved wifi networks');

        socket.on('reachview upgrade status', function(msg){
            console.log('reachview upgrade status', msg);

            if(timePass && wifiPass)
                $('.to_app').removeClass('disabled');
            else
                $('.to_app').addClass('disabled'); 
        });

        socket.on("name change status", function(msg) {

            if(!msg[0]){
                noty({
                    width: 200,
                    text: 'Host name was changed',
                    type: 'success',
                    dismissQueue: true,
                    timeout: 3000,
                    closeWith: ['click'],
                    layout: 'topRight'
                });

                $('.current_hotspot_name').text(msg[1]);
                document.title = msg[1] + " | APSync";
                //socket.emit("check bluetooth status");
            }
            else {
                console.log('Host name change unsuccesful: ', msg);
                noty({
                        width: 200,
                        text: 'Host name change was unsuccesful',
                        type: 'error',
                        dismissQueue: true,
                        timeout: 3000,
                        closeWith: ['click'],
                        layout: 'topRight'
                    });

                    $('.current_hotspot_name').text(msg[1]);
                    document.title = msg[1] + " | APSync";

                }
        });

        socket.on("wifi saved networks results", function(msg) {

            var connectedNetwork = false;

            var to_append = '';

            msg.forEach(function(key, value) {

                var ssid = (key['ssid'] != '') ? key['ssid'] : 'Unknown';

                if(key['connected'])
                    to_append += '<li class="media connected_wi-fi_network">';
                else
                    to_append += '<li class="media">';

                to_append += '<a href="#" class="media-link"><div class="media-body">';
                to_append += '<div class="media-heading text-semibold wi-fi_title">' + ssid + '</div>';
                if(key['connected']){
                    to_append += '<span class="text-muted">Connected (' + key['IP'] + ')</span>';
                    connectedNetwork = true;
                }
                else
                    to_append += '<span class="text-muted">Saved</span>';
                to_append += '<input type="hidden" class="wi-fi_mac" value="' + key['mac address'] + '"><input type="hidden" class="wi-fi_security" value="' + key['security'] + '"></div>';
                
                if(key['connected'])
                    to_append += '<div class="media-right media-middle text-nowrap"><span class="text-muted wi-fi_remove"><i class="icon-link text-size-base"></i></span></div>';

                to_append += '</a></li>';
            })

            $('#added_wi-fi').html(to_append);
            $('#connected_wi-fi').html('');
            $('#connected_wi-fi').append($('.connected_wi-fi_network'));

            if(connectedNetwork){
                $('.wifi_status').html('<i class="icon-checkmark3 text-success"></i>');
                socket.emit('get time sync status');
                $('.overlay.sync_overlay').fadeOut();
                $('.sync_status').html('<i class="icon-spinner2 spinner text-warning"></i>');

                syncInterval = setInterval(function(){socket.emit('get time sync status');}, 1000);

                wifiPass = true;
            }
            else{
                $('.wifi_status').html('<i class="icon-circle-small text-danger-400"></i>'); 
    	    $('.wi-fi_anchor.collapsed').click(); 
                wifiPass = false;
            }

        })

        socket.on('time sync status', function(msg){

            if(msg['status']){
                $('.sync_status').html('<i class="icon-checkmark3 text-success"></i>');
                $('.time_sync_warning').text('Time was synchronized!');

                clearInterval(syncInterval);

                timePass = true;

                if(timePass && wifiPass){
                    $('.to_app').removeClass('disabled');
                    $('.create_ap').removeClass('disabled');
                }
                else {
                    $('.to_app').addClass('disabled');
                    $('.create_ap').addClass('disabled'); 
                }

                $('.set_hostname_status').html('<i class="icon-spinner2 spinner text-warning"></i>');
                socket.emit('get reach name');


            }
            else{
                $('.time_sync_warning').text('Check your internet connection or connect antenna.');
                timePass = false;
            }
        });

        socket.on("receive reach name", function(msg) {
            console.log('Current Hostname and Device: ', msg);
            $('.set_hostname_status').html('<i class="icon-checkmark3 text-success"></i>');
            document.getElementById("input_new_host_name").placeholder = msg[0];
            $('.current_hotspot_name').text(msg[0]);
            
            
        });

        socket.on('opkg update result', function(msg){
            console.log('opkg update result', msg);

            if(msg['state'] == 'Failed'){
                $('.update_status').html('<i class="icon-cross2 text-danger-400"></i>');
                $('.update_anchor.collapsed').click();

                if (msg['locked']) {
                    $('.current_version').html('Update system is used by another process. Please try again later.');
                } else {
                    $('.current_version').html('Update server unreachable. Check your Internet connection or try again later.');
                }

                $('.available_version').css('display', 'none');
                $('.row_try_skip').css('display', 'block');
                $('.update_apsync').css('display', 'none');
    	    $('.update_anchor.collapsed').click();
            }
            else if (msg['state'] == 'Finished')
            {
                socket.emit('is reachview upgrade available');
            }
        });

        socket.on('update system locked', function(msg){
            console.log('update system locked');

            $('.update_anchor.collapsed').click();
            $('.update_status').html('<i class="icon-cross2 text-danger-400"></i>');

            $('.current_version').text('Update system is used by another process. Please try again later.');
            $('.available_version').css('display', 'none');

            $('.row_try_skip').css('display', 'block');
        });

        socket.on('current reachview version', function(msg){
            console.log('current reachview version', msg);

            var version = (msg['version'] != null) ? 'Current ReachView version: ' + msg['version'] : 'Could not retrieve ReachView version.';

            $('.current_version').text(version);

            socket.emit('update');
            $('.available_version').css('display', 'block');
            $('.available_version').text('Checking for updates...');
        });

        socket.on('reachview upgrade version', function(msg){
            console.log('reachview upgrade version', msg);

            if(!msg['upgrade available']){
                $('.update_status').html('<i class="icon-checkmark3 text-success"></i>');
                $('.update_apsync').css('display', 'none');
                $('.available_version').css('display', 'none');
                // socket.emit('get reachview version');
                // $('.current_version').text('Getting current version...');

                updatePass = true;

                if(updatePass && timePass && wifiPass && testPass)
                    $('.to_app').removeClass('disabled');
                else
                    $('.to_app').addClass('disabled');
            } else {
                $('.available_version').css('display', 'block');
                $('.available_version').text('Available version: ' + msg['available version']);
                $('.update_status').html('<i class="text-warning icon-circle-small"></i>');
                $('.update_apsync').css('display', 'inline-block');
                $('.update_anchor.collapsed').click();
            }
        });

        socket.on('test results', function(msg){

        	console.log(msg);

            $('.tests_status').css('display', 'none');

            if(msg['device'] == 'Reach'){
            	$('.ltc_test, .stc_test, .lora_test').parent().css('display', 'none');
            }

            if(!msg['ltc']){
                $('.tests_status').html('<i class="icon-cross2 text-danger-400"></i>');
                $('.test_warning').text('Test 3 failed');
                $('.test_warning').slideDown();
                testPass = true;
            }

            if(!msg['stc']){
                $('.tests_status').html('<i class="icon-cross2 text-danger-400"></i>');
                $('.test_warning').text('Test 4 failed');
                $('.test_warning').slideDown();
                testPass = true;
            }

            if(!msg['lora']){
                $('.tests_status').html('<i class="icon-cross2 text-danger-400"></i>');
                $('.test_warning').text('Test 5 failed');
                $('.test_warning').slideDown();
                testPass = true;
            }

            if(!msg['mpu']){
                $('.tests_status').html('<i class="icon-cross2 text-danger-400"></i>');
                $('.test_warning').text('Test 1 failed');
                $('.test_warning').slideDown();
                testPass = true;
            }

            if(!msg['u-blox']){
                $('.tests_status').html('<i class="icon-cross2 text-danger-400"></i>');
                $('.test_warning').text('Test 2 failed');
                $('.test_warning').slideDown();
                testPass = false;
            }

            if(msg['device'] == 'Reach'){
	            if(msg['u-blox'] && msg['mpu']){
	                $('.tests_status').html('<i class="icon-checkmark3 text-success"></i>');
	                testPass = true;
	            }
	        }
	        else{
	            if(msg['u-blox'] && msg['mpu'] && msg['lora'] && msg['ltc'] && msg['stc']){
	                $('.tests_status').html('<i class="icon-checkmark3 text-success"></i>');
	                testPass = true;
	            }
	        }

            $('.tests_status').fadeIn();

            if(msg['mpu'])
                $('.mpu_test').html('<i class="icon-checkmark3 text-success"></i>');
            else
                $('.mpu_test').html('<i class="icon-cross2 text-danger-400"></i>');  

            if(msg['u-blox'])
                $('.u-blox_test').html('<i class="icon-checkmark3 text-success"></i>');
            else
                $('.u-blox_test').html('<i class="icon-cross2 text-danger-400"></i>');

            if(msg['lora'])
                $('.lora_test').html('<i class="icon-checkmark3 text-success"></i>');
            else
                $('.lora_test').html('<i class="icon-cross2 text-danger-400"></i>');

            if(msg['stc'])
                $('.stc_test').html('<i class="icon-checkmark3 text-success"></i>');
            else
                $('.stc_test').html('<i class="icon-cross2 text-danger-400"></i>');

            if(msg['ltc'])
                $('.ltc_test').html('<i class="icon-checkmark3 text-success"></i>');
            else
                $('.ltc_test').html('<i class="icon-cross2 text-danger-400"></i>');

            socket.emit('get saved wifi networks');
        });
    })
});
