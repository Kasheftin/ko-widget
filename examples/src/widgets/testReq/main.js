define(["jquery","knockout"],function($,ko) {
	var TestReq = function(o) {
		this.subwidgets = ko.observableArray();
		this.eventEmitter = o.core.eventEmitter;
		this.widgetName = o.widgetName;
		this.id = "widget-"+Math.floor(Math.random()*100);
	}

	TestReq.prototype.addSubWidget = function() {
		this.subwidgets.push("testReq");
	}

	TestReq.prototype.addHeavySubWidget = function() {
		this.subwidgets.push("heavy");
	}

	TestReq.prototype.remSubWidget = function() {
		var  l = this.subwidgets().length;
		(l>0) && this.remSubWidgetByI(l-1);
	}

	TestReq.prototype.remSubWidgetByI = function(i) {
		this.subwidgets.splice(i,1);
	}

	TestReq.prototype.runPing = function() {
		var self = this;
		this.eventEmitter.emit("ping",this.id);
		this.pingTimeout && clearTimeout(this.pingTimeout);
		this.pingTimeout = setTimeout(function() {
			self.runPing();
		},1000);
	}

	TestReq.prototype.domInit = function(w,element,dom) {
		var self = this;
		this.runPing();
	}

	TestReq.prototype.domDestroy = function() {
		clearTimeout(this.pingTimeout);
	}

	return TestReq;
});
