define(["knockout"],function(ko) {

	var TestCallback = function(o) {
		this.IAm = "TestCallback";
		this.callbackString = ko.observable("Waiting for rendering inner widget...");
		this.render = ko.observable(false);
	}

	TestCallback.prototype.afterRender = function(elements,widget) {
		var self = this;
		console.log("afterRender trigger",elements,this,widget);
//		return function(domNodes,widget) {
//			console.log("afterRender context:",self,"affected dom nodes:",domNodes,"widget:",widget);
//			self.callbackString("Inner widget rendered");
//		}
	}

	TestCallback.prototype.domInit = function(o) {
		var self = this;
		console.log("domInit",this);
		setTimeout(function() {
			self.render(true);
		},1000);
	}

	TestCallback.prototype.beforeDomInit = function(o) {
		console.log("beforeDomInit",o);
	}

	return TestCallback;
});