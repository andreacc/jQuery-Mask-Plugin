/**
 * jquery.mask.js
 * @version: v1.13.8
 * @author: Igor Escobar
 *
 * Created by Igor Escobar on 2012-03-10. Please report any bug at http://blog.igorescobar.com
 *
 * Copyright (c) 2012 Igor Escobar http://blog.igorescobar.com
 *
 * The MIT License (http://www.opensource.org/licenses/mit-license.php)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

/* jshint laxbreak: true */
/* global define, jQuery, Zepto */

'use strict';

// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/jqueryPluginCommonjs.js
(function (factory) {

    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery || Zepto);
    }

}(function ($) {

	var NATIVE_SUPPORT = ('placeholder' in document.createElement('input'));
	var CSS_PROPERTIES = [
		'-moz-box-sizing', '-webkit-box-sizing', 'box-sizing',
		'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
		'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
		'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
		'line-height', 'font-size', 'font-family', 'width', 'height', 'top', 'left', 'right', 'bottom'
	];

    var Mask = function (el, mask, options) {

        var p = {
            invalid: [],
            getCaret: function () {
                try {
                    var sel,
                        pos = 0,
                        ctrl = el.get(0),
                        dSel = document.selection,
                        cSelStart = ctrl.selectionStart;

                    // IE Support
                    if (dSel && navigator.appVersion.indexOf('MSIE 10') === -1) {
                        sel = dSel.createRange();
                        sel.moveStart('character', -p.val().length);
                        pos = sel.text.length;
                    }
                    // Firefox support
                    else if (cSelStart || cSelStart === '0') {
                        pos = cSelStart;
                    }

                    return pos;
                } catch (e) {}
            },
            setCaret: function(pos) {
                try {
                    if (el.is(':focus')) {
                        var range, ctrl = el.get(0);

                        range = ctrl.createTextRange();
                        range.collapse(true);
                        range.moveEnd('character', pos);
                        range.moveStart('character', pos);
                        range.select();
                    }
                } catch (e) {}
            },
            events: function() {
                el
                .on('keydown.mask', function(e) {
                    el.data('mask-keycode', e.keyCode || e.which);
                })
                .on($.jMaskGlobals.useInput ? 'input.mask' : 'keyup.mask', function(e) {
                        e = e || window.event;
                        p.invalid = [];
                        var keyCode = el.data('mask-keycode');
                        if ($.inArray(keyCode, jMask.byPassKeys) === -1) {
                        	p.behaviour(e, keyCode);
                        	return p.callbacks(e);
                        }
                })
                .on('paste.mask drop.mask', function() {
                    setTimeout(function() {
                        el.keydown().keyup();
                    }, 50);
                })
                .on('change.mask', function(){
                    el.data('changed', true);
                })
                .on('blur.mask', function(){
                    if (oldValue !== p.val() && !el.data('changed')) {
                        el.trigger('change');
                    }
                    el.data('changed', false);
                    /*$placeholder.toggle(!$.trim(p.val()).length);*/
                })
                // it's very important that this callback remains in this position
                // otherwhise oldValue it's going to work buggy
                .on('blur.mask', function() {
                    oldValue = p.val();
                })
                // select all text on focus
                .on('focus.mask', function (e) {
                    if (options.selectOnFocus === true) {
                        $(e.target).select();
                    }
                })
                // clear the value if it not complete the mask
                .on('focusout.mask', function() {
                    if (options.clearIfNotMatch && !regexMask.test(p.val())) {
                       p.val('');
                   }
                });
                if ($placeholder) {
	                $placeholder
	                .on('mousedown', function() {
	        			if (!el.is(':enabled'))
	        				return;
	        			window.setTimeout(function(){
	        				el.trigger('focus');
	        			}, 1);
	        		});
                }
            },
            getRegexMask: function() {
                var maskChunks = [], translation, pattern, optional, recursive, oRecursive, r;

                for (var i = 0; i < mask.length; i++) {
                    translation = jMask.translation[mask.charAt(i)];

                    if (translation) {

                        pattern = translation.pattern.toString().replace(/.{1}$|^.{1}/g, '');
                        optional = translation.optional;
                        recursive = translation.recursive;

                        if (recursive) {
                            maskChunks.push(mask.charAt(i));
                            oRecursive = {digit: mask.charAt(i), pattern: pattern};
                        } else {
                            maskChunks.push(!optional && !recursive ? pattern : (pattern + '?'));
                        }

                    } else {
                        maskChunks.push(mask.charAt(i).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
                    }
                }

                r = maskChunks.join('');

                if (oRecursive) {
                    r = r.replace(new RegExp('(' + oRecursive.digit + '(.*' + oRecursive.digit + ')?)'), '($1)?')
                         .replace(new RegExp(oRecursive.digit, 'g'), oRecursive.pattern);
                }

                return new RegExp(r);
            },
            destroyEvents: function() {
                el.off(['input', 'keydown', 'keyup', 'paste', 'drop', 'blur', 'focusout', ''].join('.mask '));
            },
            val: function(v) {
                var isInput = el.is('input'),
                    method = isInput ? 'val' : 'text',
                    r;

                if (arguments.length > 0) {
                    if (el[method]() !== v) {
                        el[method](v);
                    }
                    r = el;
                } else {
                    r = el[method]();
                }

                return r;
            },
            getMCharsBeforeCount: function(index, onCleanVal) {
                for (var count = 0, i = 0, maskL = mask.length; i < maskL && i < index; i++) {
                    if (!jMask.translation[mask.charAt(i)]) {
                        index = onCleanVal ? index + 1 : index;
                        count++;
                    }
                }
                return count;
            },
            caretPos: function (originalCaretPos, oldLength, newLength, maskDif) {
                var translation = jMask.translation[mask.charAt(Math.min(originalCaretPos - 1, mask.length - 1))];

                return !translation ? p.caretPos(originalCaretPos + 1, oldLength, newLength, maskDif)
                                    : Math.min(originalCaretPos + newLength - oldLength - maskDif, newLength);
            },
            behaviour: function(e, keyCode) {
                   var caretPos = p.getCaret(),
                        currVal = p.val(),
                        currValL = currVal.length,
                        newVal = p.getMasked(),
                        newValL = newVal.length,
                        maskDif = p.getMCharsBeforeCount(newValL - 1) - p.getMCharsBeforeCount(currValL - 1),
                        changeCaret = caretPos < currValL;

                    p.val(newVal);

                    if (changeCaret) {
                        // Avoid adjusting caret on backspace or delete
                        if (!(keyCode === 8 || keyCode === 46)) {
                            caretPos = p.caretPos(caretPos, currValL, newValL, maskDif);
                        }
                        p.setCaret(caretPos);
                    }

                    //Redo placeholder
                    p.setPlaceholder();

                    // if there is maxlength and autoTab enabled
                    if (jMask.autoTab && options.maxlength &&
                    		(newVal.length >= options.maxlength) && // if newval reaches maxlength, autoTab
	                    	(caretPos >= options.maxlength) && // only if caret at end
	                    	(keyCode !== 35 && keyCode !== 39 && keyCode !== 40)) { //not if got at end with END, RIGHT or DOWN keys
                    	setTimeout(function () {
		                	p.autoTab();
		                }, 50);
                    }
            },
            autoTab: function() {
                var newI = el;
                var hasAttr = function(attr) {
                	return (typeof attr != "undefined" && attr != false);
                }

                do {
                	newI = p.next(newI); //get next input
                	if (newI == null || typeof newI == "undefined")
                		break;
                } while ((hasAttr(newI.attr("disabled"))) // If disabled...
                		|| (hasAttr(newI.attr("readonly"))) // ...or readonly...
                        || ! newI.is(":visible")) //... or not visible... then go next


	            if (newI && newI.length && newI.is('input, select'))
	                newI.focus().select();
            },
            next: function(current) {
            	var nextI = current.next(); // get next element on the same DOM node
            	var parent = current.parent();

            	if (nextI && nextI.length) { // if there is next element...
        	        if (nextI.is('input') || nextI.is('select')) // ...and it is input or select, return it
        	        	return nextI;
        	    	var inputs = nextI.find('input, select');
        	        if (inputs && inputs.length) // ...and it has inputs, return first input
        	            return inputs.first();
        	        else // if there isn't inputs, try next on DOM node
        	        	return p.next(nextI);
        	    } else { // if no element left on node, go one level up the DOM tree
        	    	if (parent.is('form') || parent.is('body') || parent.is('html')) // unless it reaches html/body/form, then it is last iteration
        	    		return null;
                    else
                    	return p.next(parent);
        	    }
            },
            createPlaceholder: function() { /* Source for this method: https://github.com/diy/jquery-placeholder */
            	$placeholder = p.getPlaceholder();
            	if ($placeholder) { //placeholder already exists
            		p.setPlaceholder();
            		return;
            	}
            	if (!options.placeholder && !el.prop('placeholder') && !el.prop('data-mask-placeholder')) //no placeholder defined
        			return;
            	if (NATIVE_SUPPORT && !jMask.forcePlaceholder) {
            		//if there is native support and script not forced, use native
            		if (options.placeholder || el.prop('data-mask-placeholder'))
 	                	el.prop('placeholder', options.placeholder ? options.placeholder : el.prop('data-mask-placeholder'));
            		return;
            	}
            	//If no native support (or if forced)...
            	//remove native
            	el.prop('data-mask-placeholder', el.prop('data-mask-placeholder') ? el.prop('data-mask-placeholder') : el.prop('placeholder'));
            	el.prop('placeholder', '');
            	//set placeholder to be used (options.placeholder > el.prop('data-mask-placeholder') > el.prop('placeholder'))
            	options.placeholder = options.placeholder ? options.placeholder : el.prop('data-mask-placeholder');

        		// create the placeholder
        		$placeholder = $('<span>').addClass('placeholder');
        		p.setPlaceholder();

            	// enumerate textbox styles for mimicking
        		var styles = {};
        		for (var i = 0; i < CSS_PROPERTIES.length; i++) {
        			styles[CSS_PROPERTIES[i]] = el.css(CSS_PROPERTIES[i]);
        		}
        		var zIndex = parseInt(el.css('z-index'), 10);
        		if (isNaN(zIndex) || !zIndex) zIndex = 1;

        		// Set style
        		$placeholder.css(styles);
        		$placeholder.css({
        			'cursor': 'text',
        			'display': 'block',
        			'position': 'absolute',
        			'overflow': 'hidden',
        			'z-index': zIndex + 1,
        			'background': 'none',
        			'border-style': 'solid',
        			'border-color': 'transparent',
        		});
        		$placeholder.insertBefore(el);

        		// compensate for y difference caused by absolute / relative difference (line-height factor)
        		var dy = el.offset().top - $placeholder.offset().top;
        		var marginTop = parseInt($placeholder.css('margin-top'));
        		if (isNaN(marginTop)) marginTop = 0;
        		$placeholder.css('margin-top', marginTop + dy);
            },
            setPlaceholder: function() {
            	$placeholder = p.getPlaceholder();
            	if ($placeholder) { //if there is placeholder
            		$placeholder.html(p.val() + options.placeholder.substr(p.val().length));
            	}
            },
            getPlaceholder: function() {
            	if ($placeholder) {
            		return $placeholder;
            	} else {
            		var findPlaceholder = el.prevAll('span.placeholder');
            		if (findPlaceholder.length > 0) {
            			return $(findPlaceholder[0]);
            		}
            	}
            	return null;
            },
            getMasked: function(skipMaskChars) {
                var buf = [],
                    value = p.val(),
                    m = 0, maskLen = mask.length,
                    v = 0, valLen = value.length,
                    offset = 1, addMethod = 'push',
                    resetPos = -1,
                    lastMaskChar,
                    check;

                if (options.reverse) {
                    addMethod = 'unshift';
                    offset = -1;
                    lastMaskChar = 0;
                    m = maskLen - 1;
                    v = valLen - 1;
                    check = function () {
                        return m > -1 && v > -1;
                    };
                } else {
                    lastMaskChar = maskLen - 1;
                    check = function () {
                        return m < maskLen && v < valLen;
                    };
                }

                while (check()) {
                    var maskDigit = mask.charAt(m),
                        valDigit = value.charAt(v),
                        translation = jMask.translation[maskDigit];

                    if (translation) {
                        if (valDigit.match(translation.pattern)) {
                            buf[addMethod](valDigit);
                             if (translation.recursive) {
                                if (resetPos === -1) {
                                    resetPos = m;
                                } else if (m === lastMaskChar) {
                                    m = resetPos - offset;
                                }

                                if (lastMaskChar === resetPos) {
                                    m -= offset;
                                }
                            }
                            m += offset;
                        } else if (translation.optional) {
                            m += offset;
                            v -= offset;
                        } else if (translation.fallback) {
                            buf[addMethod](translation.fallback);
                            m += offset;
                            v -= offset;
                        } else {
                          p.invalid.push({p: v, v: valDigit, e: translation.pattern});
                        }
                        v += offset;
                    } else {
                        if (!skipMaskChars) {
                            buf[addMethod](maskDigit);
                        }

                        if (valDigit === maskDigit) {
                            v += offset;
                        }

                        m += offset;
                    }
                }

                var lastMaskCharDigit = mask.charAt(lastMaskChar);
                if (maskLen === valLen + 1 && !jMask.translation[lastMaskCharDigit]) {
                    buf.push(lastMaskCharDigit);
                }

                return buf.join('');
            },
            callbacks: function (e) {
                var val = p.val(),
                    changed = val !== oldValue,
                    defaultArgs = [val, e, el, options],
                    callback = function(name, criteria, args) {
                        if (typeof options[name] === 'function' && criteria) {
                            options[name].apply(this, args);
                        }
                    };

                callback('onChange', changed === true, defaultArgs);
                callback('onKeyPress', changed === true, defaultArgs);
                callback('onComplete', val.length === mask.length, defaultArgs);
                callback('onInvalid', p.invalid.length > 0, [val, e, el, p.invalid, options]);
            }
        }; //end var p

        el = $(el);
        var jMask = this, oldValue = p.val(), regexMask;
        var $placeholder = null;

        mask = typeof mask === 'function' ? mask(p.val(), undefined, el,  options) : mask;


        // public methods
        jMask.mask = mask;
        jMask.options = options;
        jMask.remove = function() {
            var caret = p.getCaret();
            p.destroyEvents();
            p.val(jMask.getCleanVal());
            p.setCaret(caret - p.getMCharsBeforeCount(caret));
            return el;
        };

        // get value without mask
        jMask.getCleanVal = function() {
           return p.getMasked(true);
        };

        // refresh field
        jMask.refresh = function() {
    		setTimeout(function(){
    			p.behaviour();
    		}, 1);
        };

       jMask.init = function(onlyMask) {
            onlyMask = onlyMask || false;
            options = options || {};

            jMask.clearIfNotMatch  = $.jMaskGlobals.clearIfNotMatch;
            jMask.byPassKeys = $.jMaskGlobals.byPassKeys;
            jMask.translation = $.extend({}, $.jMaskGlobals.translation, options.translation);
            jMask.aliases = $.jMaskGlobals.aliases;
            //jMask.aliases = $.extend({}, jMask.aliases, options.aliases);
            jMask.autoTab = $.extend({}, $.jMaskGlobals.autoTab, options.autoTab);
            jMask.forcePlaceholder = $.extend({}, $.jMaskGlobals.forcePlaceholder, options.forcePlaceholder);

            jMask = $.extend(true, {}, jMask, options);

            regexMask = p.getRegexMask();

            if (onlyMask === false) {
            	//if no placeholder defined on mask, but one was requested, create it
            	p.createPlaceholder();

                if (options.maxlength) {
                    el.prop('maxlength', options.maxlength);
                } else if (el.prop('maxlength')) {
                	options.maxlength = el.prop('maxlength');
                }

            	// this is necessary, otherwise if the user submit the form
                // and then press the "back" button, the autocomplete will erase
                // the data. Works fine on IE9+, FF, Opera, Safari.
                if (el.data('mask')) {
                  el.attr('autocomplete', 'off');
                }

                p.destroyEvents();
                p.events();

                var caret = p.getCaret();
                p.val(p.getMasked());
                p.setCaret(caret + p.getMCharsBeforeCount(caret, true));

            } else {
                p.events();
                p.val(p.getMasked());
            }
        };

        jMask.init(!el.is('input'));
    }; //end var mask

    $.maskWatchers = {};
    var HTMLAttributes = function () {
            var input = $(this),
                options = {},
                prefix = 'data-mask-',
                mask = input.attr('data-mask');

            if (input.attr(prefix + 'reverse')) {
                options.reverse = true;
            }

            if (input.attr(prefix + 'clearifnotmatch')) {
                options.clearIfNotMatch = true;
            }

            if (input.attr(prefix + 'selectonfocus') === 'true') {
               options.selectOnFocus = true;
            }

            if (input.attr(prefix + 'autoTab') === 'true') {
                options.autoTab = true;
            }

            if (input.attr(prefix + 'forcePlaceholder') === 'true') {
                options.forcePlaceholder = true;
            }

            //See if is alias, and if is, create mask
            var maskAlias = getMaskForAlias(mask, options);
            mask = maskAlias.mask;
            options = maskAlias.options;

            if (notSameMaskObject(input, mask, options)) {
                return input.data('mask', new Mask(this, mask, options));
            }
        },
        notSameMaskObject = function(field, mask, options) {
            options = options || {};
            var maskObject = $(field).data('mask'),
                stringify = JSON.stringify,
                value = $(field).val() || $(field).text();
            try {
                if (typeof mask === 'function') {
                    mask = mask(value);
                }
                return typeof maskObject !== 'object' || stringify(maskObject.options) !== stringify(options) || maskObject.mask !== mask;
            } catch (e) {}
        },
        eventSupported = function(eventName) {
            var el = document.createElement('div');
            eventName = 'on' + eventName;

            var isSupported = (eventName in el);
            if ( !isSupported ) {
                el.setAttribute(eventName, 'return;');
                isSupported = typeof el[eventName] === 'function';
            }
            el = null;

            return isSupported;
        };


    $.fn.mask = function(mask, options) {
        options = options || {};
        var selector = this.selector,
            globals = $.jMaskGlobals,
            interval = $.jMaskGlobals.watchInterval,
            maskFunction = function() {
                if (notSameMaskObject(this, mask, options)) {
                    return $(this).data('mask', new Mask(this, mask, options));
                }
            };

        //See if is alias, and if is, create mask
        var maskAlias = getMaskForAlias(mask, options);
        mask = maskAlias.mask;
        options = maskAlias.options;

        $(this).each(maskFunction);

        if (selector && selector !== '' && globals.watchInputs) {
            clearInterval($.maskWatchers[selector]);
            $.maskWatchers[selector] = setInterval(function(){
                $(document).find(selector).each(maskFunction);
            }, interval);
        }
        return this;
    };

    $.fn.unmask = function() {
        clearInterval($.maskWatchers[this.selector]);
        delete $.maskWatchers[this.selector];
        return this.each(function() {
            var dataMask = $(this).data('mask');
            if (dataMask) {
                dataMask.remove().removeData('mask');
            }
        });
    };

    $.fn.cleanVal = function() {
        return this.data('mask').getCleanVal();
    };

    $.applyDataMask = function(selector) {
        selector = selector || $.jMaskGlobals.maskElements;
        var $selector = (selector instanceof $) ? selector : $(selector);
        $selector.filter($.jMaskGlobals.dataMaskAttr).each(HTMLAttributes);
    };

    $.jMaskRefresh = function(field) {
    	if (!(field && field.length > 0)) { //refresh all
    		$("input").filter(function() {
    			if ($(this).data('mask'))
    				$(this).data('mask').refresh();
    		})
    	} else if ($.isArray(field) && field.length) {
	    	$.each(field, function(i,v) {
	    		$(v).data('mask').refresh();
	    	});
    	} else {
    		$(field).data('mask').refresh();
    	}
    };

    var globals = {
        maskElements: 'input,td,span,div',
        dataMaskAttr: '*[data-mask]',
        dataMask: true,
        watchInterval: 300,
        watchInputs: true,
        useInput: eventSupported('input'),
        watchDataMask: false,
        autoTab: true,
        forcePlaceholder: true,
        byPassKeys: [9, 16, 17, 18, 36, 37, 38, 39, 40, 91],
        translation: {
            '0': {pattern: /\d/},
            '9': {pattern: /\d/, optional: true},
            '#': {pattern: /\d/, recursive: true},
            'A': {pattern: /[a-zA-Z0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]/},
            'S': {pattern: /[a-zA-Z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]/}
        },
        aliases: {
        	"numeric": {mask: "0#"}
        }
    };

    var getMaskForAlias = function(mask, options) {
    	for (var alias in $.jMaskGlobals.aliases) {
        	if ($.jMaskGlobals.aliases.hasOwnProperty(alias)) {
        		if (mask.indexOf(alias) != -1) {
        			//console.log(el.prop("name"));
        			var propsAlias = $.jMaskGlobals.aliases[alias];
                	if (propsAlias.mask) mask = propsAlias.mask;
                	if (propsAlias.options) options = $.extend({}, options, propsAlias.options);
                }
        	}
        }
    	return {mask: mask, options: options};
    };

    $.jMaskRun = function() {
    	$.jMaskGlobals = $.jMaskGlobals || {};
        globals = $.jMaskGlobals = $.extend(true, {}, globals, $.jMaskGlobals);

        // looking for inputs with data-mask attribute
        if (globals.dataMask) { $.applyDataMask(); }

        if($.jMaskGlobals.watchDataMask){
	        setInterval(function(){
	            $.applyDataMask();
	        }, globals.watchInterval);
        }
    };

}));
