define(["jquery","knockout"],function($,ko) {
	var Debugger = function(o) {
		var self = this;
		this.core = o.core;
		this.isExpanded = ko.observable(o.options.isExpanded||false);
		this.mode = ko.observable("create");
		this.isLoading = ko.observable(false);
		this.widgetContainer = ko.observable(o.options.widgetContainer);
		this.widgetCss = ko.observable(o.options.widgetCss);
		this.widgetOptions = o.options.widgetOptions||{};
		this.widgetOptionsString = ko.computed({read:function() {
			return ko.toJSON(self.widgetOptions);
		},write:function(v) {
			eval(";(function(){self.widgetOptions=" + v + ";})();");
		}});
		this.selectedWidget = ko.observable();
		this.selectedWidgetMethod = ko.observable();
		this.selectedWidgetMethodAttributes = ko.observable();
		this.selectedWidgetMethods = ko.computed(function() {
			var out = [];
			var w = self.selectedWidget();
			if (!w || !w._isWidget) w = self.core;
			var req = function(ar,prefix,level) {
				for (var i in ar) {
					if ((typeof ar[i] == "object") && level<1) {
						console.log("build req",i);
						req(ar[i],prefix+(prefix.length>0?".":"")+i,level+1);
					}
					else if (typeof ar[i] == "function") {
						out.push(prefix+(prefix.length>0?".":"")+i);
					}
				}
			}
			req(w,"",0);
			return out;
		});
	}

	Debugger.prototype.applySelectedWidgetMethod = function() {
		var w = this.selectedWidget();
		if (!w || !w._isWidget) w = this.core;
		var method = w;
		var ar = (this.selectedWidgetMethod()||"").split(/\./);
		for (var i = 0; i < ar.length; i++) {
			if (typeof method[ar[i]] == "object") method = method[ar[i]];
			else if (typeof method[ar[i]] == "function") { method = method[ar[i]]; break; }
			else { method = null; break; }
		}
		if (typeof method == "function") {
			method.apply(w,eval("["+this.selectedWidgetMethodAttributes()+"]"));
		}
	}

	Debugger.prototype.selectWidget = function(widget) {
		this.selectedWidget(widget);
		this.mode("run");
	}

	Debugger.prototype.start = function() {
		var self = this;
		var $container = $(this.widgetContainer()).eq(0);
		if (!$container || $container.length==0) return console.error("appContainer is not defined or not found",this.widgetContainer());
		this.isLoading(true);
		var div = document.createElement("div");
		div.className = this.widgetCss();
		$container.append(div);
		var origCallback = (this.widgetOptions||{}).callback;
		var options = $.extend(true,{},this.widgetOptions,{
			callback: function(o) {
				self.isLoading(false);
				origCallback && (typeof origCallback == "function") && origCallback(o);
			},
		});
		ko.createWidget(div,options,this.core);
	}

	return Debugger;
});