define(["knockout"],function(ko) {
	var Test1 = function(o) {
		this.param1 = ko.observable(o.options.param1||"Text from Test1 observable");		
	}
	return Test1;
});