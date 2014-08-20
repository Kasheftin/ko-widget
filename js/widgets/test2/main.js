define(["knockout"],function(ko) {
	var Test2 = function(o) {
		this.param1 = ko.observable(o.options.param1||"Text from Test2 observable");		
	}

	Test2.prototype.domInit = function() {
		console.log("Test2 widget created");
	}

	Test2.prototype.domDestroy = function() {
		console.log("Test2 widget destroyed");
	}

	return Test2;
});