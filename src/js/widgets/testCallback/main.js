define(["knockout"],function(ko) {

	var TestCallback = function(o) {
		this.callbackString = ko.observable("Waiting for rendering inner widget...");
		this.render = ko.observable(false);
	}

	TestCallback.prototype.afterRender = function(context,innerWidget) {
		console.log(this);
		this.callbackString("Inner widget rendered");
	}

	TestCallback.prototype.domInit = function(o) {
		var self = this;
		setTimeout(function() {
			self.render(true);
		},1000);
	}

	return TestCallback;
});