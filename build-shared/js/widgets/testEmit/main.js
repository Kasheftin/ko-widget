define(["knockout"],function(ko) {
	var TestEmit = function(o) {
		var self = this;
		this.eventEmitter = o.core.eventEmitter;
		this.widgetId = o.options.widgetId;
		this.sendTo = ko.observable(o.options.sendTo);
		this.sendData = ko.observable(o.options.sendData);
		this.receivedData = ko.observable("");
		this.eventEmitter.on(this.widgetId,function(data) {
			self.receivedData(data);
		});
		this.send = function() {
			self.eventEmitter.emit(self.sendTo(),self.sendData());
		}
	}

	return TestEmit;
});