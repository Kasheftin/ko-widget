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
        this.param1 = ko.observable("value1");
        this.param2 = ko.observable("value2");
        this.nativeNamedTemplateName = ko.observable("nativeNamedTemplate1");
        this.stringTemplateContent = ko.observable("<div>This is string template content</div><div data-bind='text:param1'></div>");
    }
    ko.applyBindings(new RootContext);
});