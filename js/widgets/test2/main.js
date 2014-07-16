define(["knockout"],function(ko) {
	var Test2 = function(o) {
		this.param1 = ko.observable(o.options.param1||"Text from Test2 observable");		
	}
	return Test2;
});