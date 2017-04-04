define(["knockout","./bundle","./data"],function(ko,models,data) {

	var M = function(o) {
		var self = this;

		this.heavy = [];
		for (var i=0;i<100;i++) {
			var obj = new models.Profile(data);
			this.heavy.push(obj);
		}

	}

	return M;
});
