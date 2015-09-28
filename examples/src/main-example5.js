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

require(["domReady!","jquery","knockout"],function(doc,$,ko) {
    ko.applyBindings({});
    ko.createWidget($("#widgetBindingContainer").get(0),"test1",this);
    ko.createWidgetInline($("#widgetInlineBindingContainer").get(0),{name:"test1",param1:"This option is set from javascript constructor"},this);
});