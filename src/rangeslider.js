/*
 RangeSlider v1.1 (https://github.com/danielcebrian/rangeslider-videojs)
 Copyright (C) 2014 Daniel Cebrián Robles
 License GNU: https://github.com/danielcebrian/rangeslider-videojs/blob/master/License-GNU.rst
 License Apache: https://github.com/danielcebrian/rangeslider-videojs/blob/master/License-Apache.rst

 - GNU

 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; either version 2
 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

 - APACHE

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
//----------------Load Plugin----------------//
(function () {
    //-- Load RangeSlider plugin in videojs
    function RangeSlider_(options) {
        var player = this;
        player.rangeslider = new RangeSlider(player, options);
        //When the DOM and the video media is loaded
        function initialVideoFinished(event) {
            var plugin = player.rangeslider;
            //All components will be initialize after they have been loaded by videojs
            for (var index in plugin.components) {
                plugin.components[index].init_();
            }

            if (plugin.options.hidden)
                plugin.hide(); //Hide the Range Slider

            if (plugin.options.locked)
                plugin.lock(); //Lock the Range Slider

            if (plugin.options.panel == false)
                plugin.hidePanel(); //Hide the second Panel

            if (plugin.options.controlTime == false)
                plugin.hideControlTime(); //Hide the control time panel

            plugin._reset();
            player.trigger('loadedRangeSlider'); //Let know if the Range Slider DOM is ready
        }
        if (player.techName == 'Youtube') {
            //Detect youtube problems
            player.one('error', function (e) {
                switch (player.error) {
                    case 2:
                        alert("The request contains an invalid parameter value. For example, this error occurs if you specify a video ID that does not have 11 characters, or if the video ID contains invalid characters, such as exclamation points or asterisks.");
                    case 5:
                        alert("The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.");
                    case 100:
                        alert("The video requested was not found. This error occurs when a video has been removed (for any reason) or has been marked as private.");
                        break;
                    case 101:
                        alert("The owner of the requested video does not allow it to be played in embedded players.");
                        break;
                    case 150:
                        alert("The owner of the requested video does not allow it to be played in embedded players.");
                        break;
                    default:
                        alert("Unknown Error");
                        break;
                }
            });
            player.on('firstplay', initialVideoFinished);
        } else {
            player.one('playing', initialVideoFinished);
        }
    }
    videojs.plugin('rangeslider', RangeSlider_);



    //-- Plugin
    function RangeSlider(player, options) {
        var player = player || this;

        this.player = player;

        this.components = {}; // holds any custom components we add to the player

        options = options || {}; // plugin options

        if (!options.hasOwnProperty('locked'))
            options.locked = false; // lock slider handles

        if (!options.hasOwnProperty('hidden'))
            options.hidden = true; // hide slider handles

        if (!options.hasOwnProperty('panel'))
            options.panel = true; // Show Second Panel

        if (!options.hasOwnProperty('controlTime'))
            options.controlTime = true; // Show Control Time to set the arrows in the edition

        this.options = options;

        this.init();
    }

    //-- Methods
    RangeSlider.prototype = {
        /*Constructor*/
        init: function () {
            var player = this.player || {};

            this.updatePrecision = 3;

            //position in second of the arrows
            this.start = 0;
            this.end = 0;

            //components of the plugin
            this.components.RSTimeBar = player.controlBar.progressControl.seekBar.addChild('RSTimeBar');
            this.components.ControlTimePanel = player.controlBar.addChild('ControlTimePanel');
            //Save local component
            this.rstb = this.components.RSTimeBar;
            this.box = this.components.SeekRSBar = this.rstb.SeekRSBar;
            this.bar = this.components.SelectionBar = this.box.SelectionBar;
            this.left = this.components.SelectionBarLeft = this.box.SelectionBarLeft;
            this.right = this.components.SelectionBarRight = this.box.SelectionBarRight;
            this.tp = this.components.TimePanel = this.box.TimePanel;
            this.tpl = this.components.TimePanelLeft = this.tp.TimePanelLeft;
            this.tpr = this.components.TimePanelRight = this.tp.TimePanelRight;
            this.ctp = this.components.ControlTimePanel;
            this.ctpl = this.components.ControlTimePanelLeft = this.ctp.ControlTimePanelLeft;
            this.ctpr = this.components.ControlTimePanelRight = this.ctp.ControlTimePanelRight;

        },
        lock: function () {
            this.options.locked = true;
            this.ctp.enable(false);
            if (typeof this.box != 'undefined')
                videojs.addClass(this.box.el_, 'locked');
        },
        unlock: function () {
            this.options.locked = false;
            this.ctp.enable();
            if (typeof this.box != 'undefined')
                videojs.removeClass(this.box.el_, 'locked');
        },
        show: function () {
            this.options.hidden = false;
            if (typeof this.rstb != 'undefined') {
                this.rstb.show();
                if (this.options.controlTime)
                    this.showControlTime();
            }
        },
        hide: function () {
            this.options.hidden = true;
            if (typeof this.rstb != 'undefined') {
                this.rstb.hide();
                this.ctp.hide();
            }
        },
        showPanel: function () {
            this.options.panel = true;
            if (typeof this.tp != 'undefined')
                videojs.removeClass(this.tp.el_, 'disable');
        },
        hidePanel: function () {
            this.options.panel = false;
            if (typeof this.tp != 'undefined')
                videojs.addClass(this.tp.el_, 'disable');
        },
        showControlTime: function () {
            this.options.controlTime = true;
            if (typeof this.ctp != 'undefined')
                this.ctp.show();
        },
        hideControlTime: function () {
            this.options.controlTime = false;
            if (typeof this.ctp != 'undefined')
                this.ctp.hide();
        },
        setValue: function (index, seconds, writeControlTime) {
            //index = 0 for the left Arrow and 1 for the right Arrow. Value in seconds
            var writeControlTime = typeof writeControlTime != 'undefined' ? writeControlTime : true;

            var percent = this._percent(seconds);
            var isValidIndex = (index === 0 || index === 1);
            var isChangeable = !this.locked;
            if (isChangeable && isValidIndex)
                this.box.setPosition(index, percent, writeControlTime);
        },
        setValues: function (start, end, writeControlTime) {
            //index = 0 for the left Arrow and 1 for the right Arrow. Value in seconds
            var writeControlTime = typeof writeControlTime != 'undefined' ? writeControlTime : true;

            this._reset();

            this._setValuesLocked(start, end, writeControlTime);
        },
        getValues: function () { //get values in seconds
            var start, end;
            start = this.start || this._getArrowValue(0);
            end = this.end || this._getArrowValue(1);
            return {start: start, end: end};
        },
        playBetween: function (start, end, showRS) {
            showRS = typeof showRS == 'undefined' ? true : showRS;
            this.player.currentTime(start);
            this.player.play();
            if (showRS) {
                this.show();
                this._reset();
            } else {
                this.hide();
            }
            this._setValuesLocked(start, end);

            this.bar.activatePlay(start, end);
        },
        loop: function (start, end, show) {
            var player = this.player;

            if (player) {
                player.on("pause", videojs.bind(this, function () {
                    this.looping = false;
                }));

                show = typeof show === 'undefined' ? true : show;

                if (show) {
                    this.show();
                    this._reset();
                }
                else {
                    this.hide();
                }
                this._setValuesLocked(start, end);

                this.timeStart = start;
                this.timeEnd = end;
                this.looping = true;

                this.player.currentTime(start);
                this.player.play();

                this.player.on("timeupdate", videojs.bind(this, this.bar.process_loop));
            }
        },
        _getArrowValue: function (index) {
            var index = index || 0;

            var percentage = this[index === 0 ? "left" : "right"].el_.style.left.replace("%", "");
            if (percentage == "")
                percentage = index === 0 ? 0 : 100;

            return (this._seconds(percentage / 100), this.updatePrecision - 1).toFixed();
        },
        _percent: function (seconds) {
            var duration = this.player.duration();
            if (isNaN(duration)) {
                return 0;
            }
            return Math.min(1, Math.max(0, seconds / duration));
        },
        _seconds: function (percent) {
            var duration = this.player.duration();
            if (isNaN(duration)) {
                return 0;
            }
            return Math.min(duration, Math.max(0, percent * duration));
        },
        _reset: function () {
            var duration = this.player.duration();
            this.tpl.el_.style.left = '0%';
            this.tpr.el_.style.left = '100%';
            this._setValuesLocked(0, duration);
        },
        _setValuesLocked: function (start, end, writeControlTime) {
            var triggerSliderChange = typeof writeControlTime != 'undefined';
            var writeControlTime = typeof writeControlTime != 'undefined' ? writeControlTime : true;
            if (this.options.locked) {
                this.unlock();//It is unlocked to change the bar position. In the end it will return the value.
                this.setValue(0, start, writeControlTime);
                this.setValue(1, end, writeControlTime);
                this.lock();
            } else {
                this.setValue(0, start, writeControlTime);
                this.setValue(1, end, writeControlTime);
            }

            // Trigger slider change
            if (triggerSliderChange) {
                this._triggerSliderChange();
            }
        },
        _checkControlTime: function (index, TextInput, timeOld) {
            var h = TextInput[0],
                m = TextInput[1],
                s = TextInput[2],
                newHour = h.value,
                newMin = m.value,
                newSec = s.value,
                obj, objNew, objOld;
            index = index || 0;

            if (newHour != timeOld[0]) {
                obj = h;
                objNew = newHour;
                objOld = timeOld[0];
            } else if (newMin != timeOld[1]) {
                obj = m;
                objNew = newMin;
                objOld = timeOld[1];
            } else if (newSec != timeOld[2]) {
                obj = s;
                objNew = newSec;
                objOld = timeOld[2];
            } else {
                return false;
            }

            var duration = this.player.duration() || 0,
                durationSel;

            var intRegex = /^\d+$/;//check if the objNew is an integer
            if (!intRegex.test(objNew) || objNew > 60) {
                objNew = objNew == "" ? "" : objOld;
            }

            newHour = newHour == "" ? 0 : newHour;
            newMin = newMin == "" ? 0 : newMin;
            newSec = newSec == "" ? 0 : newSec;
            durationSel = this._parseTimeStamp(newHour + ":" + newMin + ":" + newSec);
            if (durationSel > duration) {
                obj.value = objOld;
                obj.style.border = "1px solid red";
            } else {
                obj.value = objNew;
                h.style.border = m.style.border = s.style.border = "1px solid transparent";
                this.setValue(index, durationSel, false);

                // Trigger slider change
                this._triggerSliderChange();
            }
            if (index === 1) {
                var oldTimeLeft = this.ctpl.el_.children,
                    durationSelLeft = this._parseTimeStamp(oldTimeLeft[0].value + ":" + oldTimeLeft[1].value + ":" + oldTimeLeft[2].value);
                if (durationSel < durationSelLeft) {
                    obj.style.border = "1px solid red";
                }
            } else {

                var oldTimeRight = this.ctpr.el_.children,
                    durationSelRight = this._parseTimeStamp(oldTimeRight[0].value + ":" + oldTimeRight[1].value + ":" + oldTimeRight[2].value);
                if (durationSel > durationSelRight) {
                    obj.style.border = "1px solid red";
                }
            }
        },
        _triggerSliderChange: function () {
            this.player.trigger("sliderchange");
        },
        _parseTimeStamp: function (input) {
            var m = input.match(/^(\d+):(\d{0,2})(:\d{0,2})?/);
            if (!m) {
                return null;
            }
            return (m[1] | 0) * 3600 + (m[2] | 0) * 60 + (m[3].replace(":", "") | 0);
        }
    };

    //-- Design the new components
    (function(){
        var VjsSeekBar = videojs.getComponent('SeekBar');
        var VjsProgressControl = videojs.getComponent('ProgressControl');
        var VjsComponent = videojs.getComponent('Component');

        // RS Time Bar
        (function(){
            /**
             * Range Slider Time Bar
             * @param {videojs.Player|Object} player
             * @param {Object=} options
             * @constructor
             */
            var RSTimeBar = videojs.extend(VjsProgressControl, {
                /** @constructor */
                constructor: function (player, options) {
                    VjsProgressControl.call(this, player, options);
                }
            });

            RSTimeBar.prototype.init_ = function () {
                this.rs = this.player_.rangeslider;
            };

            RSTimeBar.prototype.options_ = {
                children: {
                    'SeekRSBar': {}
                }
            };

            RSTimeBar.prototype.createEl = function () {
                return VjsComponent.prototype.createEl.call(this, 'div', {
                    className: 'vjs-timebar-RS',
                    innerHTML: ''
                });
            };

            videojs.registerComponent('RSTimeBar', RSTimeBar);
        })();

        // Seek RS Bar
        (function(){
            /**
             * Seek Range Slider Bar and holder for the selection bars
             * @param {videojs.Player|Object} player
             * @param {Object=} options
             * @constructor
             */
            var SeekRSBar = videojs.extend(VjsSeekBar,{
                /** @constructor */
                constructor: function (player, options) {
                    VjsSeekBar.call(this, player, options);
                    this.on('mousedown', this.onMouseDown);
                    this.on('touchstart', this.onMouseDown);
                }
            });

            SeekRSBar.prototype.init_ = function () {
                this.rs = this.player_.rangeslider;
            };

            SeekRSBar.prototype.options_ = {
                children: {
                    'LoadProgressBar': {},
                    'PlayProgressBar': {},
                    'SelectionBar': {},
                    'SelectionBarLeft': {},
                    'SelectionBarRight': {},
                    'TimePanel': {},
                }
            };

            SeekRSBar.prototype.createEl = function () {
                return VjsComponent.prototype.createEl.call(this, 'div', {
                    className: 'vjs-rangeslider-holder'
                });
            };


            SeekRSBar.prototype.onMouseDown = function (event) {
                event.preventDefault();
                blockTextSelection();

                if (!this.rs.options.locked) {
                    videojs.on(document, "mousemove", videojs.bind(this, this.onMouseMove));
                    videojs.on(document, "mouseup", videojs.bind(this, this.onMouseUp));
                    videojs.on(document, "touchmove", videojs.bind(this, this.onMouseMove));
                    videojs.on(document, "touchend", videojs.bind(this, this.onMouseUp));
                }
            };

            SeekRSBar.prototype.onMouseUp = function (event) {
                videojs.off(document, "mousemove", this.onMouseMove, false);
                videojs.off(document, "mouseup", this.onMouseUp, false);
                videojs.off(document, "touchmove", this.onMouseMove, false);
                videojs.off(document, "touchend", this.onMouseUp, false);
            };

            SeekRSBar.prototype.onMouseMove = function (event) {
                var left = this.calculateDistance(event);

                if (this.rs.left.pressed)
                    this.setPosition(0, left);
                else if (this.rs.right.pressed)
                    this.setPosition(1, left);

                this.player_.currentTime(this.rs._seconds(left));

                // Trigger slider change
                if (this.rs.left.pressed || this.rs.right.pressed) {
                    this.rs._triggerSliderChange();
                }
            };

            SeekRSBar.prototype.setPosition = function (index, left, writeControlTime) {
                var writeControlTime = typeof writeControlTime != 'undefined' ? writeControlTime : true;
                //index = 0 for left side, index = 1 for right side
                var index = index || 0;

                // Position shouldn't change when handle is locked
                if (this.rs.options.locked)
                    return false;

                // Check for invalid position
                if (isNaN(left))
                    return false;

                // Check index between 0 and 1
                if (!(index === 0 || index === 1))
                    return false;

                // Alias
                var ObjLeft = this.rs.left.el_,
                    ObjRight = this.rs.right.el_,
                    Obj = this.rs[index === 0 ? 'left' : 'right'].el_,
                    tpr = this.rs.tpr.el_,
                    tpl = this.rs.tpl.el_,
                    bar = this.rs.bar,
                    ctp = this.rs[index === 0 ? 'ctpl' : 'ctpr'].el_;

                //Check if left arrow is passing the right arrow
                if ((index === 0 ? bar.updateLeft(left) : bar.updateRight(left))) {
                    Obj.style.left = (left * 100) + '%';
                    index === 0 ? bar.updateLeft(left) : bar.updateRight(left);

                    this.rs[index === 0 ? 'start' : 'end'] = this.rs._seconds(left);

                    //Fix the problem  when you press the button and the two arrow are underhand
                    //left.zIndex = 10 and right.zIndex=20. This is always less in this case:
                    if (index === 0) {
                        if ((left) >= 0.9)
                            ObjLeft.style.zIndex = 25;
                        else
                            ObjLeft.style.zIndex = 10;
                    }

                    //-- Panel
                    var TimeText = videojs.formatTime(this.rs._seconds(left)),
                        tplTextLegth = tpl.children[0].innerHTML.length;
                    var MaxP, MinP, MaxDisP;
                    if (tplTextLegth <= 4) //0:00
                        MaxDisP = this.player_.isFullScreen ? 3.25 : 6.5;
                    else if (tplTextLegth <= 5)//00:00
                        MaxDisP = this.player_.isFullScreen ? 4 : 8;
                    else//0:00:00
                        MaxDisP = this.player_.isFullScreen ? 5 : 10;
                    if (TimeText.length <= 4) { //0:00
                        MaxP = this.player_.isFullScreen ? 97 : 93;
                        MinP = this.player_.isFullScreen ? 0.1 : 0.5;
                    } else if (TimeText.length <= 5) {//00:00
                        MaxP = this.player_.isFullScreen ? 96 : 92;
                        MinP = this.player_.isFullScreen ? 0.1 : 0.5;
                    } else {//0:00:00
                        MaxP = this.player_.isFullScreen ? 95 : 91;
                        MinP = this.player_.isFullScreen ? 0.1 : 0.5;
                    }

                    if (index === 0) {
                        tpl.style.left = Math.max(MinP, Math.min(MaxP, (left * 100 - MaxDisP / 2))) + '%';

                        if ((tpr.style.left.replace("%", "") - tpl.style.left.replace("%", "")) <= MaxDisP)
                            tpl.style.left = Math.max(MinP, Math.min(MaxP, tpr.style.left.replace("%", "") - MaxDisP)) + '%';
                        tpl.children[0].innerHTML = TimeText;
                    } else {
                        tpr.style.left = Math.max(MinP, Math.min(MaxP, (left * 100 - MaxDisP / 2))) + '%';

                        if (((tpr.style.left.replace("%", "") || 100) - tpl.style.left.replace("%", "")) <= MaxDisP)
                            tpr.style.left = Math.max(MinP, Math.min(MaxP, tpl.style.left.replace("%", "") - 0 + MaxDisP)) + '%';
                        tpr.children[0].innerHTML = TimeText;
                    }
                    //-- Control Time
                    if (writeControlTime) {
                        var time = TimeText.split(":"),
                            h, m, s;
                        if (time.length == 2) {
                            h = 00;
                            m = time[0];
                            s = time[1];
                        } else {
                            h = time[0];
                            m = time[1];
                            s = time[2];
                        }
                        ctp.children[0].value = h;
                        ctp.children[1].value = m;
                        ctp.children[2].value = s;
                    }
                }
                return true;
            };

            SeekRSBar.prototype.calculateDistance = function (event) {
                var rstbX = this.getRSTBX();
                var rstbW = this.getRSTBWidth();
                var handleW = this.getWidth();

                // Adjusted X and Width, so handle doesn't go outside the bar
                rstbX = rstbX + (handleW / 2);
                rstbW = rstbW - handleW;

                // Percent that the click is through the adjusted area
                //during touch event.pageX is not present
                if(event.pageX){
                    return Math.max(0, Math.min(1, (event.pageX - rstbX) / rstbW));
                }
                else{
                    //this is a touch event
                    return Math.max(0, Math.min(1, (event.touches[0].pageX - rstbX) / rstbW));
                }
            };

            SeekRSBar.prototype.getRSTBWidth = function () {
                return this.el_.offsetWidth;
            };
            SeekRSBar.prototype.getRSTBX = function () {
                return this.findPosition(this.el_).left;//@TODO findPosition was removed, maybe find other way than redeclaring it
            };
            SeekRSBar.prototype.getWidth = function () {
                return this.rs.left.el_.offsetWidth;//does not matter left or right
            };
            SeekRSBar.prototype.findPosition = function(el) {
                var box, docEl, body, clientLeft, scrollLeft, left, clientTop, scrollTop, top;
                if (el.getBoundingClientRect && el.parentNode) {
                    box = el.getBoundingClientRect();
                }
                if (!box) {
                    return {
                        left: 0,
                        top: 0
                    };
                }
                docEl = document.documentElement;
                body = document.body;
                clientLeft = docEl.clientLeft || body.clientLeft || 0;
                scrollLeft = window.pageXOffset || body.scrollLeft;
                left = box.left + scrollLeft - clientLeft;
                clientTop = docEl.clientTop || body.clientTop || 0;
                scrollTop = window.pageYOffset || body.scrollTop;
                top = box.top + scrollTop - clientTop;
                return {
                    left: left,
                    top: top
                };
            }

            videojs.registerComponent('SeekRSBar', SeekRSBar);
        })();

        // Selection Bar
        (function(){
            /**
             * This is the bar with the selection of the RangeSlider
             * @param {videojs.Player|Object} player
             * @param {Object=} options
             * @constructor
             */
            var SelectionBar = videojs.extend(VjsSeekBar,{
                /** @constructor */
                constructor: function (player, options) {
                    VjsSeekBar.call(this, player, options);
                    this.on('mouseup', this.onMouseUp);
                    this.on('touchend', this.onMouseUp);
                    this.fired = false;
                }
            });

            SelectionBar.prototype.init_ = function () {
                this.rs = this.player_.rangeslider;
            };

            SelectionBar.prototype.createEl = function () {
                return VjsComponent.prototype.createEl.call(this, 'div', {
                    className: 'vjs-selectionbar-RS'
                });
            };

            SelectionBar.prototype.onMouseUp = function () {
                var start = this.rs.left.el_.style.left.replace("%", ""),
                    end = this.rs.right.el_.style.left.replace("%", ""),
                    duration = this.player_.duration(),
                    precision = this.rs.updatePrecision,
                    segStart = (start * duration / 100, precision).toFixed(),
                    segEnd = (end * duration / 100, precision).toFixed();
                this.player_.currentTime(segStart);
                this.player_.play();
                this.rs.bar.activatePlay(segStart, segEnd);
            };

            SelectionBar.prototype.updateLeft = function (left) {
                var rightVal = this.rs.right.el_.style.left != '' ? this.rs.right.el_.style.left : 100;
                var right = parseFloat(rightVal) / 100;
                var width = (right - left).toFixed(this.rs.updatePrecision); //round necessary for not get 0.6e-7 for example that it's not able for the html css width
                //(right+0.00001) is to fix the precision of the css in html
                if (left <= (right + 0.00001)) {
                    this.rs.bar.el_.style.left = (left * 100) + '%';
                    this.rs.bar.el_.style.width = (width * 100) + '%';
                    return true;
                }
                return false;
            };

            SelectionBar.prototype.updateRight = function (right) {
                var leftVal = this.rs.left.el_.style.left != '' ? this.rs.left.el_.style.left : 0;
                var left = parseFloat(leftVal) / 100;
                var width = (right - left).toFixed(this.rs.updatePrecision);//round necessary for not get 0.6e-7 for example that it's not able for the html css width
                //(right+0.00001) is to fix the precision of the css in html
                if ((right + 0.00001) >= left) {
                    this.rs.bar.el_.style.width = (width * 100) + '%';
                    this.rs.bar.el_.style.left = ((right - width) * 100) + '%';
                    return true;
                }
                return false;
            };

            SelectionBar.prototype.activatePlay = function (start, end) {
                this.timeStart = start;
                this.timeEnd = end;

                this.suspendPlay();

                this.player_.on("timeupdate", videojs.bind(this, this._processPlay));
            };

            SelectionBar.prototype.suspendPlay = function () {
                this.fired = false;
                this.player_.off("timeupdate", videojs.bind(this, this._processPlay));
            };

            SelectionBar.prototype._processPlay = function () {
                //Check if current time is between start and end
                if (this.player_.currentTime() >= this.timeStart && (this.timeEnd < 0 || this.player_.currentTime() < this.timeEnd)) {
                    if (this.fired) { //Do nothing if start has already been called
                        return;
                    }
                    this.fired = true; //Set fired flag to true
                } else {
                    if (!this.fired) { //Do nothing if end has already been called
                        return;
                    }
                    this.fired = false; //Set fired flat to false
                    this.player_.pause(); //Call end function
                    this.player_.currentTime(this.timeEnd);
                    this.suspendPlay();
                }
            };

            SelectionBar.prototype.process_loop = function () {
                var player = this.player;

                if (player && this.looping) {
                    var current_time = player.currentTime();

                    if (current_time < this.timeStart || this.timeEnd > 0 && this.timeEnd < current_time) {
                        player.currentTime(this.timeStart);
                    }
                }
            };

            videojs.registerComponent('SelectionBar', SelectionBar);

            /**
             * This is the left arrow to select the RangeSlider
             * @param {videojs.Player|Object} player
             * @param {Object=} options
             * @constructor
             */
            var SelectionBarLeft = videojs.extend(VjsComponent, {
                /** @constructor */
                constructor: function (player, options) {
                    VjsComponent.call(this, player, options);
                    this.on('mousedown', this.onMouseDown);
                    this.on('touchstart', this.onMouseDown);
                    this.pressed = false;
                }
            });

            SelectionBarLeft.prototype.init_ = function () {
                this.rs = this.player_.rangeslider;
            };

            SelectionBarLeft.prototype.createEl = function () {
                return VjsComponent.prototype.createEl.call(this, 'div', {
                    className: 'vjs-rangeslider-handle vjs-selectionbar-left-RS',
                    innerHTML: '<div class="vjs-selectionbar-arrow-RS"></div><div class="vjs-selectionbar-line-RS"></div>'
                });
            };

            SelectionBarLeft.prototype.onMouseDown = function (event) {
                event.preventDefault();
                blockTextSelection();
                if (!this.rs.options.locked) {
                    this.pressed = true;
                    videojs.on(document, "mouseup", videojs.bind(this, this.onMouseUp));
                    videojs.on(document, "touchend", videojs.bind(this, this.onMouseUp));
                    videojs.addClass(this.el_, 'active');
                }
            };

            SelectionBarLeft.prototype.onMouseUp = function (event) {
                videojs.off(document, "mouseup", this.onMouseUp, false);
                videojs.off(document, "touchend", this.onMouseUp, false);
                videojs.removeClass(this.el_, 'active');
                if (!this.rs.options.locked) {
                    this.pressed = false;
                }
            };

            videojs.registerComponent('SelectionBarLeft', SelectionBarLeft);

            /**
             * This is the right arrow to select the RangeSlider
             * @param {videojs.Player|Object} player
             * @param {Object=} options
             * @constructor
             */
            var SelectionBarRight = videojs.extend(VjsComponent, {
                /** @constructor */
                constructor: function (player, options) {
                    VjsComponent.call(this, player, options);
                    this.on('mousedown', this.onMouseDown);
                    this.on('touchstart', this.onMouseDown);
                    this.pressed = false;
                }
            });

            SelectionBarRight.prototype.init_ = function () {
                this.rs = this.player_.rangeslider;
            };

            SelectionBarRight.prototype.createEl = function () {
                return VjsComponent.prototype.createEl.call(this, 'div', {
                    className: 'vjs-rangeslider-handle vjs-selectionbar-right-RS',
                    innerHTML: '<div class="vjs-selectionbar-arrow-RS"></div><div class="vjs-selectionbar-line-RS"></div>'
                });
            };


            SelectionBarRight.prototype.onMouseDown = function (event) {
                event.preventDefault();
                blockTextSelection();
                if (!this.rs.options.locked) {
                    this.pressed = true;
                    videojs.on(document, "mouseup", videojs.bind(this, this.onMouseUp));
                    videojs.on(document, "touchend", videojs.bind(this, this.onMouseUp));
                    videojs.addClass(this.el_, 'active');
                }
            };

            SelectionBarRight.prototype.onMouseUp = function (event) {
                videojs.off(document, "mouseup", this.onMouseUp, false);
                videojs.off(document, "touchend", this.onMouseUp, false);
                videojs.removeClass(this.el_, 'active');
                if (!this.rs.options.locked) {
                    this.pressed = false;
                }
            };

            videojs.registerComponent('SelectionBarRight', SelectionBarLeft);
        })();

        // Time Panel
        (function(){
            /**
             * This is the time panel
             * @param {videojs.Player|Object} player
             * @param {Object=} options
             * @constructor
             */
            var TimePanel = videojs.extend(VjsComponent, {
                /** @constructor */
                constructor: function (player, options) {
                    VjsComponent.call(this, player, options);
                }
            });

            TimePanel.prototype.init_ = function () {
                this.rs = this.player_.rangeslider;
            };

            TimePanel.prototype.options_ = {
                children: {
                    'TimePanelLeft': {},
                    'TimePanelRight': {},
                }
            };

            TimePanel.prototype.createEl = function () {
                return VjsComponent.prototype.createEl.call(this, 'div', {
                    className: 'vjs-timepanel-RS'
                });
            };

            videojs.registerComponent('TimePanel', TimePanel);
            /**
             * This is the left time panel
             * @param {videojs.Player|Object} player
             * @param {Object=} options
             * @constructor
             */
            var TimePanelLeft = videojs.extend(VjsComponent, {
                /** @constructor */
                constructor: function (player, options) {
                    VjsComponent.call(this, player, options);
                }
            });

            TimePanelLeft.prototype.init_ = function () {
                this.rs = this.player_.rangeslider;
            };

            TimePanelLeft.prototype.createEl = function () {
                return VjsComponent.prototype.createEl.call(this, 'div', {
                    className: 'vjs-timepanel-left-RS',
                    innerHTML: '<span class="vjs-time-text">00:00</span>'
                });
            };

            videojs.registerComponent('TimePanelLeft', TimePanelLeft);

            /**
             * This is the right time panel
             * @param {videojs.Player|Object} player
             * @param {Object=} options
             * @constructor
             */
            var TimePanelRight = videojs.extend(VjsComponent, {
                /** @constructor */
                constructor: function (player, options) {
                    VjsComponent.call(this, player, options);
                }
            });

            TimePanelRight.prototype.init_ = function () {
                this.rs = this.player_.rangeslider;
            };

            TimePanelRight.prototype.createEl = function () {
                return VjsComponent.prototype.createEl.call(this, 'div', {
                    className: 'vjs-timepanel-right-RS',
                    innerHTML: '<span class="vjs-time-text">00:00</span>'
                });
            };

            videojs.registerComponent('TimePanelRight', TimePanelRight);
        })();

        // Control Time Panel
        (function(){
            /**
             * This is the control time panel
             * @param {videojs.Player|Object} player
             * @param {Object=} options
             * @constructor
             */
            var ControlTimePanel = videojs.extend(VjsComponent, {
                /** @constructor */
                constructor: function (player, options) {
                    VjsComponent.call(this, player, options);
                }
            });

            ControlTimePanel.prototype.init_ = function () {
                this.rs = this.player_.rangeslider;
            };


            ControlTimePanel.prototype.options_ = {
                children: {
                    'ControlTimePanelLeft': {},
                    'ControlTimePanelRight': {},
                }
            };

            ControlTimePanel.prototype.createEl = function () {
                return VjsComponent.prototype.createEl.call(this, 'div', {
                    className: 'vjs-controltimepanel-RS vjs-control',
                });
            };

            ControlTimePanel.prototype.enable = function (enable) {
                var enable = typeof enable != 'undefined' ? enable : true;
                this.rs.ctpl.el_.children[0].disabled = enable ? "" : "disabled";
                this.rs.ctpl.el_.children[1].disabled = enable ? "" : "disabled";
                this.rs.ctpl.el_.children[2].disabled = enable ? "" : "disabled";
                this.rs.ctpr.el_.children[0].disabled = enable ? "" : "disabled";
                this.rs.ctpr.el_.children[1].disabled = enable ? "" : "disabled";
                this.rs.ctpr.el_.children[2].disabled = enable ? "" : "disabled";
            };

            videojs.registerComponent('ControlTimePanel', ControlTimePanel);

            /**
             * This is the control left time panel
             * @param {videojs.Player|Object} player
             * @param {Object=} options
             * @constructor
             */
            var ControlTimePanelLeft = videojs.extend(VjsComponent, {
                /** @constructor */
                constructor: function (player, options) {
                    VjsComponent.call(this, player, options);
                    this.on('keyup', this.onKeyUp);
                    this.on('keydown', this.onKeyDown);
                }
            });

            ControlTimePanelLeft.prototype.init_ = function () {
                this.rs = this.player_.rangeslider;
                this.timeOld = {};
            };

            ControlTimePanelLeft.prototype.createEl = function () {
                return VjsComponent.prototype.createEl.call(this, 'div', {
                    className: 'vjs-controltimepanel-left-RS',
                    innerHTML: 'Start: <input type="text" id="controltimepanel" maxlength="2" value="00"/>:<input type="text" id="controltimepanel" maxlength="2" value="00"/>:<input type="text" id="controltimepanel" maxlength="2" value="00"/>'
                });
            };

            ControlTimePanelLeft.prototype.onKeyDown = function (event) {
                this.timeOld[0] = this.el_.children[0].value;
                this.timeOld[1] = this.el_.children[1].value;
                this.timeOld[2] = this.el_.children[2].value;
            };

            ControlTimePanelLeft.prototype.onKeyUp = function (event) {
                this.rs._checkControlTime(0, this.el_.children, this.timeOld);
            };

            videojs.registerComponent('ControlTimePanelLeft', ControlTimePanelLeft);

            /**
             * This is the control right time panel
             * @param {videojs.Player|Object} player
             * @param {Object=} options
             * @constructor
             */
            var ControlTimePanelRight = videojs.extend(VjsComponent, {
                /** @constructor */
                constructor: function (player, options) {
                    VjsComponent.call(this, player, options);
                    this.on('keyup', this.onKeyUp);
                    this.on('keydown', this.onKeyDown);
                }
            });

            ControlTimePanelRight.prototype.init_ = function () {
                this.rs = this.player_.rangeslider;
                this.timeOld = {};
            };

            ControlTimePanelRight.prototype.createEl = function () {
                return VjsComponent.prototype.createEl.call(this, 'div', {
                    className: 'vjs-controltimepanel-right-RS',
                    innerHTML: 'End: <input type="text" id="controltimepanel" maxlength="2" value="00"/>:<input type="text" id="controltimepanel" maxlength="2" value="00"/>:<input type="text" id="controltimepanel" maxlength="2" value="00"/>'
                });
            };

            ControlTimePanelRight.prototype.onKeyDown = function (event) {
                this.timeOld[0] = this.el_.children[0].value;
                this.timeOld[1] = this.el_.children[1].value;
                this.timeOld[2] = this.el_.children[2].value;
            };

            ControlTimePanelRight.prototype.onKeyUp = function (event) {
                this.rs._checkControlTime(1, this.el_.children, this.timeOld);
            };

            videojs.registerComponent('ControlTimePanelRight', ControlTimePanelRight);
        })();

        function blockTextSelection() {
            document.body.focus();
            document.onselectstart = function () { return false; };
        }
    })();
})();
