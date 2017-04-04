define(["knockout"],function(ko) {

	var M = function(o) {
		this.heavy = [];
		for(var i=0;i<10000;i++) {
			this.heavy.push(ko.observable(i));
		}
		this.isReady = ko.observable(true);
	}

	M.prototype.afterRenderHeavyDummy = function() {
		console.log("afterRenderHeavyDummy");
	}

	return M;
});