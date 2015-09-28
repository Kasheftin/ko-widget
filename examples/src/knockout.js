define(["knockout-source","../../src/stringTemplateEngine","../../src/widgetBinding","../../src/stopBinding"],function(ko,stringTemplateEngine,widgetBinding,stopBinding) {
	stringTemplateEngine.attach(ko);
	widgetBinding.attach(ko);
	stopBinding.attach(ko);
	return ko;
});
