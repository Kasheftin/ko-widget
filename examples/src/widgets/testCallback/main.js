define(["knockout"],function(ko) {

	var TestCallback = function(o) {
		this.callbackString = ko.observable("Waiting for rendering inner widget...");
		this.render = ko.observable(false);
	}

	TestCallback.prototype.afterRender = function() {
		var self = this;
		return function(domNodes,widget) {
			console.log("afterRender context:",self,"affected dom nodes:",domNodes,"widget:",widget);
			self.callbackString("Inner widget rendered");
		}
	}

	TestCallback.prototype.domInit = function(o) {
		var self = this;
		setTimeout(function() {
			self.render(true);
		},1000);
	}

	return TestCallback;
});