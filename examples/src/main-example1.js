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
        this.param1 = ko.observable("value1");
        this.param2 = ko.observable("value2");
        this.nativeNamedTemplateName = ko.observable("nativeNamedTemplate1");
        this.stringTemplateContent = ko.observable("<div>This is string template content</div><div data-bind='text:param1'></div>");
    }
    ko.applyBindings(new RootContext);
});