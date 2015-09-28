define(["knockout"],function(ko) {
	var Test1 = function(o) {
		this.param1 = ko.observable(o.options.param1||"Text from Test1 observable");		
	}

	Test1.prototype.domInit = function() {
		console.log("Test1 widget created");
	}
	
	Test1.prototype.domDestroy = function() {
		console.log("Test1 widget destroyed");
	}

	return Test1;
});