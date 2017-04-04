define(["knockout"],function(ko) {

	var M = function(o) {
		this.heavy = [];
		for(var i=0;i<10000;i++) {
			this.heavy.push(ko.observable(i));
		}
	}

	M.prototype.beforeDomInit = function(o) {
		console.log("heavyDummy beforeDomInit");
	}

	M.prototype.domInit = function(o) {
		console.log("heavyDummy domInit");
	}

	M.prototype.domDestroy = function() {
		console.log("heavyDummy domDestroy");
	}

	M.prototype.afterDomDestroy = function() {
		console.log("heavyDummy afterDomDestroy");
	}

	return M;
});