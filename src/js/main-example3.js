require.config({
    waitSeconds: 0,
    baseUrl: "js",
    paths: {
        "jquery"          : "../lib/jquery/dist/jquery",
        "knockout-source" : "../lib/knockout/dist/knockout.debug",
        "domReady"        : "../lib/requirejs-domready/domReady",
        "EventEmitter"    : "../lib/EventEmitter/EventEmitter",
        "text"            : "../lib/requirejs-text/text"
    }
});

require(["domReady!","knockout"],function(doc,ko) {
    var RootContext = function() {
        this.widgetName = ko.observable("test1");
    }
    ko.applyBindings(new RootContext);
});