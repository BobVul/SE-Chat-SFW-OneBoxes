// ==UserScript==
//
// @name           SE Chat SFW OneBoxes
// @description    Prevents oneboxing of potentially NSFW items
// @homepage       https://github.com/Elusive138/SE-Chat-SFW-OneBoxes
// @namespace      http://elu138.com/
// @author         Bob, Elusive138 (http://github.com/elusive138/)
// @license        MIT License (http://opensource.org/licenses/mit-license.php)
//
// @include        http://chat.stackexchange.com/*
//
// @version        1.0.0
//
// @grant          none
//
// ==/UserScript==

// SE Chat Reply Highlight was used as a template for this userscript.
// http://github.com/oliversalzburg/se-chat-reply-highlight/

// jQuery loading from http://erikvold.com/blog/index.cfm/2010/6/14/using-jquery-with-a-user-script
function addJQuery( callback, jqVersion ) {
    jqVersion = jqVersion || "1.8.3";
    var D = document;
    var target = D.getElementsByTagName( "head" )[ 0 ] || D.body || D.documentElement;
    var scriptNode = D.createElement( "script" );
    scriptNode.src = "//ajax.googleapis.com/ajax/libs/jquery/" + jqVersion + "/jquery.min.js";
    scriptNode.addEventListener( "load", function() {
        inject(livequery);
        var scriptNode = D.createElement( "script" );
        scriptNode.textContent = "var gm_jQuery  = jQuery.noConflict(true);\n" +
        "(" + callback.toString() + ")(gm_jQuery);";
        target.appendChild( scriptNode );
    }, false );
    target.appendChild( scriptNode );
}


// Injects functions into the page so they can freely interact with existing code
https://github.com/rchern/StackExchangeScripts/blob/master/SEChatModifications.user.js#L14
function inject() {
    for (var i = 0; i < arguments.length; ++i) {
        if (typeof(arguments[i]) == 'function') {
            var script = document.createElement('script');

            script.type = 'text/javascript';
            script.textContent = '(' + arguments[i].toString() + ')(jQuery)';

            document.body.appendChild(script);
        }
    }
}

// Acts a container for the livequery plugin, which is used by this userscript to perform certain functions
// From https://github.com/rchern/StackExchangeScripts/blob/master/SEChatModifications.user.js#L1700
function livequery($) {
    /*! Copyright (c) 2010 Brandon Aaron (http://brandonaaron.net)
    * Dual licensed under the MIT (MIT_LICENSE.txt)
    * and GPL Version 2 (GPL_LICENSE.txt) licenses.
    *
    * Version: 1.1.1
    * Requires jQuery 1.3+
    * Docs: http://docs.jquery.com/Plugins/livequery
    */

    $.extend($.fn, {
        livequery: function(type, fn, fn2) {
            var self = this, q;

            // Handle different call patterns
            if ($.isFunction(type))
                fn2 = fn, fn = type, type = undefined;

            // See if Live Query already exists
            $.each( $.livequery.queries, function(i, query) {
                if ( self.selector == query.selector && self.context == query.context &&
                    type == query.type && (!fn || fn.$lqguid == query.fn.$lqguid) && (!fn2 || fn2.$lqguid == query.fn2.$lqguid) )
                        // Found the query, exit the each loop
                        return (q = query) && false;
            });

            // Create new Live Query if it wasn't found
            q = q || new $.livequery(this.selector, this.context, type, fn, fn2);

            // Make sure it is running
            q.stopped = false;

            // Run it immediately for the first time
            q.run();

            // Contnue the chain
            return this;
        },

        expire: function(type, fn, fn2) {
            var self = this;

            // Handle different call patterns
            if ($.isFunction(type))
                fn2 = fn, fn = type, type = undefined;

            // Find the Live Query based on arguments and stop it
            $.each( $.livequery.queries, function(i, query) {
                if ( self.selector == query.selector && self.context == query.context &&
                    (!type || type == query.type) && (!fn || fn.$lqguid == query.fn.$lqguid) && (!fn2 || fn2.$lqguid == query.fn2.$lqguid) && !this.stopped )
                        $.livequery.stop(query.id);
            });

            // Continue the chain
            return this;
        }
    });

    $.livequery = function(selector, context, type, fn, fn2) {
        this.selector = selector;
        this.context = context;
        this.type = type;
        this.fn = fn;
        this.fn2 = fn2;
        this.elements = [];
        this.stopped = false;

        // The id is the index of the Live Query in $.livequery.queries
        this.id = $.livequery.queries.push(this)-1;

        // Mark the functions for matching later on
        fn.$lqguid = fn.$lqguid || $.livequery.guid++;
        if (fn2) fn2.$lqguid = fn2.$lqguid || $.livequery.guid++;

        // Return the Live Query
        return this;
    };

    $.livequery.prototype = {
        stop: function() {
            var query = this;

            if ( this.type )
                // Unbind all bound events
                this.elements.unbind(this.type, this.fn);
            else if (this.fn2)
                // Call the second function for all matched elements
                this.elements.each(function(i, el) {
                    query.fn2.apply(el);
                });

            // Clear out matched elements
            this.elements = [];

            // Stop the Live Query from running until restarted
            this.stopped = true;
        },

        run: function() {
            // Short-circuit if stopped
            if ( this.stopped ) return;
            var query = this;

            var oEls = this.elements,
                els = $(this.selector, this.context),
                nEls = els.not(oEls);

            // Set elements to the latest set of matched elements
            this.elements = els;

            if (this.type) {
                // Bind events to newly matched elements
                nEls.bind(this.type, this.fn);

                // Unbind events to elements no longer matched
                if (oEls.length > 0)
                    $.each(oEls, function(i, el) {
                        if ( $.inArray(el, els) < 0 )
                            $.event.remove(el, query.type, query.fn);
                    });
            }
            else {
                // Call the first function for newly matched elements
                nEls.each(function() {
                    query.fn.apply(this);
                });

                // Call the second function for elements no longer matched
                if ( this.fn2 && oEls.length > 0 )
                    $.each(oEls, function(i, el) {
                        if ( $.inArray(el, els) < 0 )
                            query.fn2.apply(el);
                    });
            }
        }
    };

    $.extend($.livequery, {
        guid: 0,
        queries: [],
        queue: [],
        running: false,
        timeout: null,

        checkQueue: function() {
            if ( $.livequery.running && $.livequery.queue.length ) {
                var length = $.livequery.queue.length;
                // Run each Live Query currently in the queue
                while ( length-- )
                    $.livequery.queries[ $.livequery.queue.shift() ].run();
            }
        },

        pause: function() {
            // Don't run anymore Live Queries until restarted
            $.livequery.running = false;
        },

        play: function() {
            // Restart Live Queries
            $.livequery.running = true;
            // Request a run of the Live Queries
            $.livequery.run();
        },

        registerPlugin: function() {
            $.each( arguments, function(i,n) {
                // Short-circuit if the method doesn't exist
                if (!$.fn[n]) return;

                // Save a reference to the original method
                var old = $.fn[n];

                // Create a new method
                $.fn[n] = function() {
                    var jQuery = $;
                    // Call the original method
                    var r = old.apply(this, arguments);

                    // Request a run of the Live Queries
                    jQuery.livequery.run();

                    // Return the original methods result
                    return r;
                }
            });
        },

        run: function(id) {
            if (id != undefined) {
                // Put the particular Live Query in the queue if it doesn't already exist
                if ( $.inArray(id, $.livequery.queue) < 0 )
                    $.livequery.queue.push( id );
            }
            else
                // Put each Live Query in the queue if it doesn't already exist
                $.each( $.livequery.queries, function(id) {
                    if ( $.inArray(id, $.livequery.queue) < 0 )
                        $.livequery.queue.push( id );
                });

            // Clear timeout if it already exists
            if ($.livequery.timeout) clearTimeout($.livequery.timeout);
            // Create a timeout to check the queue and actually run the Live Queries
            $.livequery.timeout = setTimeout($.livequery.checkQueue, 20);
        },

        stop: function(id) {
            if (id != undefined)
                // Stop are particular Live Query
                $.livequery.queries[ id ].stop();
            else
                // Stop all Live Queries
                $.each( $.livequery.queries, function(id) {
                    $.livequery.queries[ id ].stop();
                });
        }
    });

    // Register core DOM manipulation methods
    $.livequery.registerPlugin('append', 'prepend', 'after', 'before', 'wrap', 'attr', 'removeAttr', 'addClass', 'removeClass', 'toggleClass', 'empty', 'remove', 'html');

    // Run Live Queries when the Document is ready
    $(function() { $.livequery.play(); });
}

/**
* Main entry point
* @param $ A reference to jQuery
*/
function main( $ ) {
    // Call cleanup when message added
    // Livequery line from
    // https://github.com/rchern/StackExchangeScripts/blob/master/SEChatModifications.user.js#L334
    $("#chat .message:not(.pending):not(.posted)").livequery(function () {
        $(".ob-image, .ob-youtube").each(function() {
            // get the link of the onebox and replace the displayed
            // part with the link text
            linkElement = $(this).children("a").first();
            imageLink = linkElement.attr("href");
            linkElement.text(imageLink);
            // remove the onebox div entirely by inserting its html contents
            // into the html of its parent
            $(this).parent().html($(this).html());
        });
    });
}

// load jQuery and execute the main function
addJQuery( main );