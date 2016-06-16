define(["knockout"],function(ko) {
	var Test3 = function(o) {
		this.tname = ko.observable(o.options.val||"main");
		this.templateName = "other";
	}

	return Test3;
});