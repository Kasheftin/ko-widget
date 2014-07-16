require.config({
    waitSeconds: 0,
    baseUrl: "js",
    paths: {
        "jquery"       : "../lib/jquery/dist/jquery",
        "knockout"     : "../lib/knockout/dist/knockout.debug",
        "domReady"     : "../lib/requirejs-domready/domReady",
        "EventEmitter" : "../lib/EventEmitter/EventEmitter",
        "text"         : "../lib/requirejs-text/text"
    }
});

require(["domReady!","knockout","stringTemplateEngine","widgetBinding"],function(doc,ko) {
    var App = function() {
        this.widgetName = ko.observable("test1");
    }
    ko.applyBindings(new App);
});