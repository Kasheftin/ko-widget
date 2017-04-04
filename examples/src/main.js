require.config({
    waitSeconds: 0,
    baseUrl: ".",
    paths: {
        "jquery"          : "../../ext/jquery/dist/jquery",
        "knockout-source" : "../../ext/knockout/dist/knockout.debug",
        "domReady"        : "../../ext/requirejs-domready/domReady",
        "EventEmitter"    : "../../ext/EventEmitter/EventEmitter",
        "text"            : "../../ext/requirejs-text/text",
        "underscore"      : "../../ext/underscore/underscore",
        "moment"          : "../../ext/moment/moment"
    }
});

require(["domReady!","knockout","EventEmitter"],function(doc,ko,EventEmitter) {
    var RootContext = function() {
        this.eventEmitter = new EventEmitter();
    }
    ko.applyBindings(new RootContext);
});
