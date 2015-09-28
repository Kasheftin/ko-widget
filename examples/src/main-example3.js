require.config({
    waitSeconds: 0,
    baseUrl: ".",
    paths: {
        "jquery"          : "../../ext/jquery/dist/jquery",
        "knockout-source" : "../../ext/knockout/dist/knockout.debug",
        "domReady"        : "../../ext/requirejs-domready/domReady",
        "EventEmitter"    : "../../ext/EventEmitter/EventEmitter",
        "text"            : "../../ext/requirejs-text/text"
    }
});

require(["domReady!","knockout"],function(doc,ko) {
    var RootContext = function() {
        this.widgetName = ko.observable("test1");
    }
    ko.applyBindings(new RootContext);
});