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

require(["domReady!","jquery","knockout"],function(doc,$,ko) {
    ko.applyBindings({});
    ko.createWidget($("#widgetBindingContainer").get(0),"test1",this);
    ko.createWidgetInline($("#widgetInlineBindingContainer").get(0),{name:"test1",param1:"This option is set from javascript constructor"},this);
});