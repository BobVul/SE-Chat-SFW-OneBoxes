// ==UserScript==
//
// @name           SE Chat SFW OneBoxes
// @description    Prevents oneboxing of potentially NSFW items
// @homepage       http://github.com/elusive138/se-chat-worksafe-oneboxes/
// @namespace      http://elu138.com/
// @author         Bob Rao, Elusive138 (http://github.com/elusive138/)
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
        var scriptNode = D.createElement( "script" );
        scriptNode.textContent = "var gm_jQuery  = jQuery.noConflict(true);\n" +
        "(" + callback.toString() + ")(gm_jQuery);";
        target.appendChild( scriptNode );
    }, false );
    target.appendChild( scriptNode );
}

function cleanOneboxesFromMessages(oneboxTypes) {
    $(oneboxTypes).each(function(index) {
    // get the link of the onebox and replace the displayed
    // part with the link text
    linkElement = $(this).children("a").first();
    imageLink = linkElement.attr("href");
    linkElement.text(imageLink);
    // remove the onebox div entirely by inserting its html contents
    // into the html of its parent
    $(this).parent().html($(this).html());
});
}

// Catch DOM changes
// http://stackoverflow.com/a/14570614/1030702
var observeDOM = (function(){
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
        eventListenerSupported = window.addEventListener;

    return function(obj, callback){
        if( MutationObserver ){
            // define a new observer
            var obs = new MutationObserver(function(mutations, observer){
                if( mutations[0].addedNodes.length || mutations[0].removedNodes.length )
                    callback();
            });
            // have the observer observe foo for changes in children
            obs.observe( obj, { childList:true, subtree:true });
        }
        else if( eventListenerSupported ){
            obj.addEventListener('DOMNodeInserted', callback, false);
            obj.addEventListener('DOMNodeRemoved', callback, false);
        }
    }
})();

/**
* Main entry point
* @param $ A reference to jQuery
*/
function main( $ ) {
    // Call cleanup when message added
    observeDOM(document.body, function() {
        cleanOneboxesFromMessages(".ob-image, .ob-youtube");
    });
}

// load jQuery and execute the main function
addJQuery( main );