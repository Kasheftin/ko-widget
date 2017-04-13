define(function() {
	return {
		attach: function(ko,forceNoCacheMode) {

			var destroyWidget = function(o) {
				if (!o.w) return;
				if (typeof(o.w.domDestroy)=="function") {
					o.w.domDestroy.apply(o.w);
				}
				if (o.w._isWidget && o.w._widgetElement) {
					ko.virtualElements.emptyNode(o.w._widgetElement);
				}
				if (typeof(o.w.afterDomDestroy)=="function") {
					o.w.afterDomDestroy.apply(o.w);
				}
			}

			var reinitWidget = function(o) {
				if (!o.widgetName) return;
				var rnd = (forceNoCacheMode?"-rnd"+Math.round(Math.random()*10000):"");
				/* Force no cache mode should be supported in nginx like this:
					location / {
						rewrite ^(.*?)-rnd\d+(.*)$ $1$2 break;
						try_files $uri =404;
						expires 0;
					}
				*/
				require(["widgets/"+o.widgetName+"/main"+rnd],function(Model) {
					// Destroying previous widget in case widgetName or widget template name is observable.
					// Actually this is the only reason why widget update bindingHandler is wrapped to computed and placed into the init-action.
					if (o.w && o.w._isWidget) {
						destroyWidget(o);
					}

					if (typeof(Model)=="function") {
						o.w = new Model(o);
					}
					else {
						o.w = Model;
					}

					o.w._isWidget = true;
					o.w._widgetElement = o.element;

					// widget supports templateName property - if it's set it requires specified html template instead of default main.html.
					var templateName = "main";
					if (o.options.hasOwnProperty("templateName")) templateName = ko.utils.unwrapObservable(o.options.templateName);
					if (o.w.hasOwnProperty("templateName")) templateName = ko.utils.unwrapObservable(o.w.templateName);

					require(o.widgetMode=="html"?["text!widgets/"+o.widgetName+"/"+templateName+".html"]:[],function(html) {
						var afterRenderCallback = function(elements,callback) {
							// Very often we want to have a link to affected DOM in widget domInit.
							o.firstDomChild = ko.virtualElements.firstChild(o.element);
							while (o.firstDomChild && o.firstDomChild.nodeType != 1) {
								o.firstDomChild = ko.virtualElements.nextSibling(o.firstDomChild);
							}
							if (o.w && typeof(o.w.domInit)=="function") {
								o.w.domInit.apply(o.w,[o]);
							}
							if (typeof(callback)=="function") {
								callback.apply(o.bindingContext.$data,[elements,o.w]);
							}
						}
						if (o.w && typeof(o.w.beforeDomInit)=="function") {
							o.w.beforeDomInit.apply(o.w,[o]);
						}

						// Generating template value accessor - taking options.template property and appending it with data as current widget and html string from file.
						var customAfterRenderEnabled = false;
						var templateValueAccessor = function() {
							var value = ko.utils.unwrapObservable(o.valueAccessor());
							value = (value||{}).template||{};
							value.data = o.w;
							if (o.widgetMode=="html") value.html = html;
							if (customAfterRenderEnabled) {
								var origAfterRender = value.afterRender;
								value.afterRender = function(elements) {
									afterRenderCallback(elements,origAfterRender);
								}
							}
							return value;
						}
						ko.bindingHandlers.template.init(o.element,templateValueAccessor);
						customAfterRenderEnabled = true;
						ko.bindingHandlers.template.update(o.element,templateValueAccessor,o.allBindingsAccessor,o.viewModel,o.bindingContext);
					});
				});
			}


			var init = function(element,valueAccessor,allBindingsAccessor,viewModel,bindingContext,widgetMode) {
				var o = {
					element: element,
					valueAccessor: valueAccessor,
					allBindingsAccessor: allBindingsAccessor,
					viewModel: viewModel,
					bindingContext: bindingContext,
					widgetMode: widgetMode,
					core: bindingContext.$root,
					w: null,
					options: null
				}
				ko.utils.domNodeDisposal.addDisposeCallback(element,function() {
					if (o.w && o.w._isWidget) {
						destroyWidget(o);
					}
				});
				ko.computed(function() {
					o.options = ko.utils.unwrapObservable(valueAccessor())||{};
					if (typeof(o.options)=="string") {
						o.widgetName = o.options;
						o.options = {name:o.widgetName};
					}
					else o.widgetName = ko.utils.unwrapObservable(o.options.name);
					// Registering templateName in recompute in case it's an observable
					if (o.options.hasOwnProperty("templateName") && ko.isObservable(o.options.templateName)) o.options.templateName();
					// We don't want any other observables affect recomputing widget binging.
					setTimeout(function() {
						reinitWidget(o);
					},0);
				},null,{disposeWhenNodeIsRemoved:element});
				return {controlsDescendantBindings:true};
			}

			if (!ko.bindingHandlers.hasOwnProperty("widget")) {
				ko.bindingHandlers.widget = {};
			}
			if (!ko.bindingHandlers.hasOwnProperty("widgetInline")) {
				ko.bindingHandlers.widgetInline = {};
			}
			ko.bindingHandlers.widget.init = function(element,valueAccessor,allBindingsAccessor,viewModel,bindingContext) {
				return init(element,valueAccessor,allBindingsAccessor,viewModel,bindingContext,"html");
			}
			ko.bindingHandlers.widgetInline.init = function(element,valueAccessor,allBindingsAccessor,viewModel,bindingContext) {
				return init(element,valueAccessor,allBindingsAccessor,viewModel,bindingContext,"inline");
			}

			ko.virtualElements.allowedBindings.widget = true;
			ko.virtualElements.allowedBindings.widgetInline = true;

			ko.createWidget = function(node,widgetOptions,viewModel) {
				var r = ko.applyBindingsToNode(node,{widget: widgetOptions},viewModel);
			}
			ko.createWidgetInline = function(node,widgetOptions,viewModel) {
				var r = ko.applyBindingsToNode(node,{widgetInline: widgetOptions},viewModel);
			}
		}
	}
});