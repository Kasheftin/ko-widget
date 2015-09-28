define(["knockout"],function(ko) {
	var TestPing = function(o) {
		var self = this;
		this.eventEmitter = o.core.eventEmitter;

		this.pings = ko.observableArray();
		this.pingNames = {};

		this.eventEmitter.on("ping",function(name) {
			if (self.pingNames.hasOwnProperty(name))
				var ping = self.pings()[self.pingNames[name]];
			else {
				var ping = {
					name: name,
					cnt: ko.observable(0)
				};
				self.pingNames[name] = self.pings().length;
				self.pings.push(ping);
			}
			ping && ping.cnt(ping.cnt()+1);
		});
	}

	return TestPing;
});