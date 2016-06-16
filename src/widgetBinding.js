define(function() {
	return {
		attach: function(ko,forceNoCacheMode) {

			var Widget = function() { }
			Widget.prototype.destroy = function(options) {
				// Clearing DOM
				ko.virtualElements.emptyNode(this._widgetElement);
				if (typeof this.domDestroy == "function")
					this.domDestroy();
			}
			Widget.prototype._isWidget = true;

			var _reinitWidget = function(o) {
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
					// Destroying previous widget in case widgetName is observable.
					// Actually this is the only reason why widget update bindingHandler is wrapped to computed and is placed into init-action.
					o.w && o.w._isWidget && o.w.destroy(o);

					// Extending Model with Widget and EventEmitter prototypes
					if (typeof Model == "function") {
						for (var i in Widget.prototype)
							Model.prototype[i] = Widget.prototype[i];
						o.w = new Model(o);
					}
					else o.w = Model;

					// We need _widgetElement in widget.destroy method.
					o.w._widgetElement = o.element;

					// widget now supports templateName property - if it's set it requires specified html template instead of default main.html.
					var templateName = "main";
					if (o.options.hasOwnProperty("templateName")) templateName = ko.utils.unwrapObservable(o.options.templateName);
					if (o.w.hasOwnProperty("templateName")) templateName = ko.utils.unwrapObservable(o.w.templateName);

					require(o.widgetMode=="html"?["text!widgets/"+o.widgetName+"/"+templateName+".html"]:[],function(html) {
						// Generating template value accessor - taking options.template property and appending it with data as current widget and html string from file.
						var templateValueAccessor = function() {
							var value = ko.utils.unwrapObservable(o.valueAccessor());
							value = (value||{}).template||{};
							value.data = o.w;
							if (o.widgetMode=="html") value.html = html;
							return value;
						}

						ko.bindingHandlers.template.init(o.element,templateValueAccessor);
						ko.bindingHandlers.template.update(o.element,templateValueAccessor,o.allBindingsAccessor,o.viewModel,o.bindingContext);

						// Very often we want to have a link to affected DOM in widget domInit.
						o.firstDomChild = ko.virtualElements.firstChild(o.element);
						while (o.firstDomChild && o.firstDomChild.nodeType != 1)
							o.firstDomChild = ko.virtualElements.nextSibling(o.firstDomChild);

						o.w.domInit && (typeof o.w.domInit == "function") && o.w.domInit(o);

						if (ko.bindingHandlers.hasOwnProperty("widget")) {
							if (ko.bindingHandlers.widget.hasOwnProperty("callback") && (typeof ko.bindingHandlers.widget.callback == "function")) {
								ko.bindingHandlers.widget.callback(o);
							}
						}
						o.options.callback && (typeof o.options.callback == "function") && o.options.callback(o);
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
					parentWidget: null,
					options: null
				}
				// Actually, we don't user parentWidget anymore.
				// In knockout>=3.0.0 viewModel is deprecated, instead of this bindingContext.$data should be used.
				// But widget binding could be called inside foreach or while cycle, and $data context is not necessary a (parent) widget.
				// Here we try to find the first parent context that is widget. If there's no such contest, we set $root as parentWidget.
				o.parentWidget = bindingContext.$data;
				if (!o.parentWidget._isWidget && bindingContext.$parents.length>0) {
					for (var i = 0; i < bindingContext.$parents.length; i++) {
						o.parentWidget = bindingContext.$parents[i];
						if (o.parentWidget._isWidget) break;
					}
				}
				if (!o.parentWidget._isWidget)
					o.parentWidget = bindingContext.$root;

				ko.utils.domNodeDisposal.addDisposeCallback(element,function() {
					o.w && o.w._isWidget && o.w.destroy();
				});

				ko.computed(function() {
					o.options = ko.utils.unwrapObservable(valueAccessor())||{};
					if (typeof o.options == "string") {
						o.widgetName = o.options;
						o.options = {name:o.widgetName};
					}
					else o.widgetName = ko.utils.unwrapObservable(o.options.name);
					// Registering templateName in recompute in case it's an observable
					if (o.options.hasOwnProperty("templateName") && ko.isObservable(o.options.templateName)) o.options.templateName(); 
					// We don't want any other observables affect recomputing widget binging.
					setTimeout(function() {
						_reinitWidget(o);
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