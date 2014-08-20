define(["knockout-source","./ko-widget/stopBinding","./ko-widget/stringTemplateEngine","./ko-widget/widgetBinding"],function(ko,stopBinding,stringTemplateEngine,widgetBinding) {
	stopBinding.attach(ko);
	stringTemplateEngine.attach(ko);
	widgetBinding.attach(ko);
	return ko;
});