define('test_module', ['jquery'],
    function($){
        $(document).ready(function () {

            testScenarios = {};

            /***** UPDATE SECTION *****/

            /**
             * Run with: $(document).trigger('update_system_locked')
             */
            $(document).on('update_system_locked', function() {
                $('.update_status').html('<i class="icon-cross2 text-danger-400"></i>');

                $('.current_version').text('Update system is used by another process. Please try again later.');
                $('.available_version').css('display', 'none');

                $('.row_try_skip').css('display', 'block');
            });

            testScenarios.updateSystemLocked = function() {
                $(document).trigger('update_system_locked');
            };

            /**
             * Run with: $(document).trigger('opkg_update_result_fail_not_locked')
             */
            $(document).on('opkg_update_result_fail_not_locked', function() {
                $('.update_status').html('<i class="icon-cross2 text-danger-400"></i>');

                $('.current_version').html('Update server unreachable. Check your Internet connection or try again later.');

                currentVersion = false;
                $('.row_try_skip').css('display', 'block');
                $('.update_apsync').css('display', 'none');
            });

            testScenarios.opkgFail = function() {
                $(document).trigger('opkg_update_result_fail_not_locked');
            };

            /**
             * Run with: $(document).trigger('opkg_update_result_fail_locked')
             */
            $(document).on('opkg_update_result_fail_locked', function() {
                $('.update_status').html('<i class="icon-cross2 text-danger-400"></i>');

                $('.current_version').html('Update system is used by another process. Please try again later.');

                currentVersion = false;
                $('.row_try_skip').css('display', 'block');
                $('.update_apsync').css('display', 'none');
            });

            testScenarios.opkgFailLocked = function() {
                $(document).trigger('opkg_update_result_fail_locked');
            };

            /**
             * Run with: $(document).trigger('update_failed_not_locked')
             */
            $(document).on('update_failed_not_locked', function() {
                $(".coords_progress").css('display', 'none');
                $('.update_status').html('<i class="icon-cross2 text-danger-400"></i>');

                $('.current_version').html('Failed to perform update.');

                $('.skip_update_btn').css('display', 'inline-block');
                $('.update_apsync').css('display', 'block');
                $('.update_apsync').removeClass('disabled');
                $('.update_anchor.collapsed').click();
            });

            testScenarios.updateFail = function() {
                $(document).trigger('update_failed_not_locked');
            };

            /**
             * Run with: $(document).trigger('update_failed_locked')
             */
            $(document).on('update_failed_locked', function() {
                $(".coords_progress").css('display', 'none');
                $('.update_status').html('<i class="icon-cross2 text-danger-400"></i>');

                $('.current_version').html('Update system is used by another process. Please try again later.');

                $('.skip_update_btn').css('display', 'inline-block');
                $('.update_apsync').css('display', 'block');
                $('.update_apsync').removeClass('disabled');
                $('.update_anchor.collapsed').click();
            });

            testScenarios.updateFailLocked = function() {
                $(document).trigger('update_failed_locked');
            };
        });
    }
);