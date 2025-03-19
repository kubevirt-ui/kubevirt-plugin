export const inlined16beta = ({ host, path, port }) => `
<!DOCTYPE html>
<html lang="en" class="noVNC_loading">
<head>

    <!--
    noVNC example: simple example using default UI
    Copyright (C) 2019 The noVNC authors
    noVNC is licensed under the MPL 2.0 (see LICENSE.txt)
    This file is licensed under the 2-Clause BSD license (see LICENSE.txt).

    Connect parameters are provided in query string:
        http://example.com/?host=HOST&port=PORT&encrypt=1
    or the fragment:
        http://example.com/#host=HOST&port=PORT&encrypt=1
    -->
    <title>noVNC</title>

    <link rel="icon" type="image/x-icon" href="http://localhost:9001/app/images/icons/novnc.ico">
    <meta name="theme-color" content="#313131">

    <!-- Apple iOS Safari settings -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

    <!-- @2x -->
    <link rel="apple-touch-icon" sizes="40x40" type="image/png" href="http://localhost:9001/app/images/icons/novnc-ios-40.png">
    <link rel="apple-touch-icon" sizes="58x58" type="image/png" href="http://localhost:9001/app/images/icons/novnc-ios-58.png">
    <link rel="apple-touch-icon" sizes="80x80" type="image/png" href="http://localhost:9001/app/images/icons/novnc-ios-80.png">
    <link rel="apple-touch-icon" sizes="120x120" type="image/png" href="http://localhost:9001/app/images/icons/novnc-ios-120.png">
    <link rel="apple-touch-icon" sizes="152x152" type="image/png" href="http://localhost:9001/app/images/icons/novnc-ios-152.png">
    <link rel="apple-touch-icon" sizes="167x167" type="image/png" href="http://localhost:9001/app/images/icons/novnc-ios-167.png">
    <!-- @3x -->
    <link rel="apple-touch-icon" sizes="60x60" type="image/png" href="http://localhost:9001/app/images/icons/novnc-ios-60.png">
    <link rel="apple-touch-icon" sizes="87x87" type="image/png" href="http://localhost:9001/app/images/icons/novnc-ios-87.png">
    <link rel="apple-touch-icon" sizes="120x120" type="image/png" href="http://localhost:9001/app/images/icons/novnc-ios-120.png">
    <link rel="apple-touch-icon" sizes="180x180" type="image/png" href="http://localhost:9001/app/images/icons/novnc-ios-180.png">

    <!-- Stylesheets -->
    <link rel="stylesheet" href="http://localhost:9001/app/styles/constants.css">
    <link rel="stylesheet" href="http://localhost:9001/app/styles/base.css">
    <link rel="stylesheet" href="http://localhost:9001/app/styles/input.css">

    <!-- Images that will later appear via CSS -->
    <link rel="preload" as="image" href="http://localhost:9001/app/images/info.svg">
    <link rel="preload" as="image" href="http://localhost:9001/app/images/error.svg">
    <link rel="preload" as="image" href="http://localhost:9001/app/images/warning.svg">

    <script type="module" crossorigin="anonymous" src="http://localhost:9001/app/error-handler.js"></script>
    <script type="module" crossorigin="anonymous" src="http://localhost:9001/app/ui.js"></script>
    <script type="module" crossorigin="anonymous" src="http://localhost:9001/core/util/logging.js"></script>

<script type="importmap">
  {
    "imports": {
      "ui": "http://localhost:9001/app/ui.js",
      "logging": "http://localhost:9001/core/util/logging.js"
    }
  }
</script>

    <script type="module">
        import UI from "http://localhost:9001/app/ui.js";
        import * as Log from 'http://localhost:9001/core/util/logging.js';

        let response;

        let defaults = { host: "${host}", path: "${path}", port: ${port} };
        let mandatory = {};

        // Default settings will be loaded from defaults.json. Mandatory
        // settings will be loaded from mandatory.json, which the user
        // cannot change.

        // try {
        //     response = await fetch('./defaults.json');
        //     if (!response.ok) {
        //         throw Error("" + response.status + " " + response.statusText);
        //     }

        //     defaults = await response.json();
        // } catch (err) {
        //     Log.Error("Couldn't fetch defaults.json: " + err);
        // }

        // try {
        //     response = await fetch('./mandatory.json');
        //     if (!response.ok) {
        //         throw Error("" + response.status + " " + response.statusText);
        //     }

        //     mandatory = await response.json();
        // } catch (err) {
        //     Log.Error("Couldn't fetch mandatory.json: " + err);
        // }

        // You can also override any defaults you need here:
        //
        // defaults['host'] = 'vnc.example.com';

        // Or force a specific setting, preventing the user from
        // changing it:
        //
        // mandatory['view_only'] = true;

        // See docs/EMBEDDING.md for a list of possible settings.

        UI.start({ settings: { defaults: defaults,
                               mandatory: mandatory } });
    </script>
</head>

<body>

    <div id="noVNC_fallback_error" class="noVNC_center">
        <div>
            <div>noVNC encountered an error:</div>
            <br>
            <div id="noVNC_fallback_errormsg"></div>
        </div>
    </div>

    <!-- noVNC control bar -->
    <div id="noVNC_control_bar_anchor" class="noVNC_vcenter">

        <div id="noVNC_control_bar">
            <div id="noVNC_control_bar_handle" title="Hide/Show the control bar"><div></div></div>

            <div class="noVNC_scroll">

            <h1 class="noVNC_logo" translate="no"><span>no</span><br>VNC</h1>

            <hr>

            <!-- Drag/Pan the viewport -->
            <input type="image" alt="Drag" src="http://localhost:9001/app/images/drag.svg"
                id="noVNC_view_drag_button" class="noVNC_button noVNC_hidden"
                title="Move/Drag viewport">

            <!--noVNC touch device only buttons-->
            <div id="noVNC_mobile_buttons">
                <input type="image" alt="Keyboard" src="http://localhost:9001/app/images/keyboard.svg"
                    id="noVNC_keyboard_button" class="noVNC_button" title="Show keyboard">
            </div>

            <!-- Extra manual keys -->
            <input type="image" alt="Extra keys" src="http://localhost:9001/app/images/toggleextrakeys.svg"
                id="noVNC_toggle_extra_keys_button" class="noVNC_button"
                title="Show extra keys">
            <div class="noVNC_vcenter">
            <div id="noVNC_modifiers" class="noVNC_panel">
                <input type="image" alt="Ctrl" src="http://localhost:9001/app/images/ctrl.svg"
                    id="noVNC_toggle_ctrl_button" class="noVNC_button" style=" min-width: 25px;"
                    title="Toggle Ctrl">
                <input type="image" alt="Alt" src="http://localhost:9001/app/images/alt.svg"
                    id="noVNC_toggle_alt_button" class="noVNC_button" style=" min-width: 25px;"
                    title="Toggle Alt">
                <input type="image" alt="Windows" src="http://localhost:9001/app/images/windows.svg"
                    id="noVNC_toggle_windows_button" class="noVNC_button" style=" min-width: 25px;"
                    title="Toggle Windows">
                <input type="image" alt="Tab" src="http://localhost:9001/app/images/tab.svg"
                    id="noVNC_send_tab_button" class="noVNC_button" style=" min-width: 25px;"
                    title="Send Tab">
                <input type="image" alt="Esc" src="http://localhost:9001/app/images/esc.svg"
                    id="noVNC_send_esc_button" class="noVNC_button" style=" min-width: 25px;"
                    title="Send Escape">
                <input type="image" alt="Ctrl+Alt+Del" src="http://localhost:9001/app/images/ctrlaltdel.svg"
                    id="noVNC_send_ctrl_alt_del_button" class="noVNC_button" style=" min-width: 25px;"
                    title="Send Ctrl-Alt-Del">
            </div>
            </div>

            <!-- Shutdown/Reboot -->
            <input type="image" alt="Shutdown/Reboot" src="http://localhost:9001/app/images/power.svg"
                id="noVNC_power_button" class="noVNC_button"
                title="Shutdown/Reboot...">
            <div class="noVNC_vcenter">
            <div id="noVNC_power" class="noVNC_panel">
                <div class="noVNC_heading">
                    <img alt="" src="http://localhost:9001/app/images/power.svg"> Power
                </div>
                <input type="button" id="noVNC_shutdown_button" value="Shutdown">
                <input type="button" id="noVNC_reboot_button" value="Reboot">
                <input type="button" id="noVNC_reset_button" value="Reset">
            </div>
            </div>

            <!-- Clipboard -->
            <input type="image" alt="Clipboard" src="http://localhost:9001/app/images/clipboard.svg"
                id="noVNC_clipboard_button" class="noVNC_button"
                title="Clipboard">
            <div class="noVNC_vcenter">
            <div id="noVNC_clipboard" class="noVNC_panel">
                <div class="noVNC_heading">
                    <img alt="" src="http://localhost:9001/app/images/clipboard.svg"> Clipboard
                </div>
                <p class="noVNC_subheading">
                    Edit clipboard content in the textarea below.
                </p>
                <textarea id="noVNC_clipboard_text" rows=5></textarea>
            </div>
            </div>

            <!-- Toggle fullscreen -->
            <input type="image" alt="Full screen" src="http://localhost:9001/app/images/fullscreen.svg"
                id="noVNC_fullscreen_button" class="noVNC_button noVNC_hidden"
                title="Full screen">

            <!-- Settings -->
            <input type="image" alt="Settings" src="http://localhost:9001/app/images/settings.svg"
                id="noVNC_settings_button" class="noVNC_button"
                title="Settings">
            <div class="noVNC_vcenter">
            <div id="noVNC_settings" class="noVNC_panel">
                <div class="noVNC_heading">
                    <img alt="" src="http://localhost:9001/app/images/settings.svg"> Settings
                </div>
                <ul>
                    <li>
                        <label>
                            <input id="noVNC_setting_shared" type="checkbox"
                                   class="toggle">
                            Shared mode
                        </label>
                    </li>
                    <li>
                        <label>
                            <input id="noVNC_setting_view_only" type="checkbox"
                                   class="toggle">
                            View only
                        </label>
                    </li>
                    <li><hr></li>
                    <li>
                        <label>
                            <input id="noVNC_setting_view_clip" type="checkbox"
                                   class="toggle">
                            Clip to window
                        </label>
                    </li>
                    <li>
                        <label for="noVNC_setting_resize">Scaling mode:</label>
                        <select id="noVNC_setting_resize" name="vncResize">
                            <option value="off">None</option>
                            <option value="scale">Local scaling</option>
                            <option value="remote">Remote resizing</option>
                        </select>
                    </li>
                    <li><hr></li>
                    <li>
                        <div class="noVNC_expander">Advanced</div>
                        <div><ul>
                            <li>
                                <label for="noVNC_setting_quality">Quality:</label>
                                <input id="noVNC_setting_quality" type="range" min="0" max="9" value="6">
                            </li>
                            <li>
                                <label for="noVNC_setting_compression">Compression level:</label>
                                <input id="noVNC_setting_compression" type="range" min="0" max="9" value="2">
                            </li>
                            <li><hr></li>
                            <li>
                                <label for="noVNC_setting_repeaterID">Repeater ID:</label>
                                <input id="noVNC_setting_repeaterID" type="text" value="">
                            </li>
                            <li>
                                <div class="noVNC_expander">WebSocket</div>
                                <div><ul>
                                    <li>
                                        <label>
                                            <input id="noVNC_setting_encrypt" type="checkbox"
                                                   class="toggle">
                                            Encrypt
                                        </label>
                                    </li>
                                    <li>
                                        <label for="noVNC_setting_host">Host:</label>
                                        <input id="noVNC_setting_host">
                                    </li>
                                    <li>
                                        <label for="noVNC_setting_port">Port:</label>
                                        <input id="noVNC_setting_port" type="number">
                                    </li>
                                    <li>
                                        <label for="noVNC_setting_path">Path:</label>
                                        <input id="noVNC_setting_path" type="text" value="websockify">
                                    </li>
                                </ul></div>
                            </li>
                            <li><hr></li>
                            <li>
                                <label>
                                    <input id="noVNC_setting_reconnect" type="checkbox"
                                           class="toggle">
                                    Automatic reconnect
                                </label>
                            </li>
                            <li>
                                <label for="noVNC_setting_reconnect_delay">Reconnect delay (ms):</label>
                                <input id="noVNC_setting_reconnect_delay" type="number">
                            </li>
                            <li><hr></li>
                            <li>
                                <label>
                                    <input id="noVNC_setting_show_dot" type="checkbox"
                                           class="toggle">
                                    Show dot when no cursor
                                </label>
                            </li>
                            <li><hr></li>
                            <!-- Logging selection dropdown -->
                            <li>
                                <label>Logging:
                                    <select id="noVNC_setting_logging" name="vncLogging">
                                    </select>
                                </label>
                            </li>
                        </ul></div>
                    </li>
                    <li class="noVNC_version_separator"><hr></li>
                    <li class="noVNC_version_wrapper">
                        <span>Version:</span>
                        <span class="noVNC_version"></span>
                    </li>
                </ul>
            </div>
            </div>

            <!-- Connection controls -->
            <input type="image" alt="Disconnect" src="http://localhost:9001/app/images/disconnect.svg"
                id="noVNC_disconnect_button" class="noVNC_button"
                title="Disconnect">

            </div>
        </div>

    </div> <!-- End of noVNC_control_bar -->

    <div id="noVNC_hint_anchor" class="noVNC_vcenter">
        <div id="noVNC_control_bar_hint">
        </div>
    </div>

    <!-- Status dialog -->
    <div id="noVNC_status"></div>

    <!-- Connect button -->
    <div class="noVNC_center">
        <div id="noVNC_connect_dlg">
            <p class="noVNC_logo" translate="no"><span>no</span>VNC</p>
            <div>
                <button id="noVNC_connect_button">
                    <img alt="" src="http://localhost:9001/app/images/connect.svg"> Connect
                </button>
            </div>
        </div>
    </div>

    <!-- Server key verification dialog -->
    <div class="noVNC_center noVNC_connect_layer">
    <div id="noVNC_verify_server_dlg" class="noVNC_panel"><form>
        <div class="noVNC_heading">
            Server identity
        </div>
        <div>
            The server has provided the following identifying information:
        </div>
        <div id="noVNC_fingerprint_block">
            Fingerprint:
            <span id="noVNC_fingerprint"></span>
        </div>
        <div>
            Please verify that the information is correct and press
            "Approve". Otherwise press "Reject".
        </div>
        <div class="button_row">
            <input id="noVNC_approve_server_button" type="submit" value="Approve">
            <input id="noVNC_reject_server_button" type="button" value="Reject">
        </div>
    </form></div>
    </div>

    <!-- Password dialog -->
    <div class="noVNC_center noVNC_connect_layer">
    <div id="noVNC_credentials_dlg" class="noVNC_panel"><form>
        <div class="noVNC_heading">
            Credentials
        </div>
        <div id="noVNC_username_block">
            <label for="noVNC_username_input">Username:</label>
            <input id="noVNC_username_input">
        </div>
        <div id="noVNC_password_block">
            <label for="noVNC_password_input">Password:</label>
            <input id="noVNC_password_input" type="password">
        </div>
        <div class="button_row">
            <input id="noVNC_credentials_button" type="submit" value="Send credentials">
        </div>
    </form></div>
    </div>

    <!-- Transition screens -->
    <div id="noVNC_transition">
        <div id="noVNC_transition_text"></div>
        <div>
        <input type="button" id="noVNC_cancel_reconnect_button" value="Cancel">
        </div>
        <div class="noVNC_spinner"></div>
    </div>

    <!-- This is where the RFB elements will attach -->
    <div id="noVNC_container">
        <!-- Note that Google Chrome on Android doesn't respect any of these,
             html attributes which attempt to disable text suggestions on the
             on-screen keyboard. Let's hope Chrome implements the ime-mode
             style for example -->
        <textarea id="noVNC_keyboardinput" autocapitalize="off"
            autocomplete="off" spellcheck="false" tabindex="-1"></textarea>
    </div>

    <audio id="noVNC_bell">
        <source src="http://localhost:9001/app/sounds/bell.oga" type="audio/ogg">
        <source src="http://localhost:9001/app/sounds/bell.mp3" type="audio/mpeg">
    </audio>
 </body>
</html>

`;
