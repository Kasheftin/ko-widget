define(["jquery","knockout","EventEmitter","text"],function($,ko,EventEmitter,Widget) {

	/* 
        - Файл виджета находится в widgets/имявиджета/main.js, файл шаблона - в widgets/имявиджета/main.html
        - После загрузки кода в виджет примешивается прототип eventEmitter
		- Свойства и параметры виджета
			_widgetElement - DOM-элемент, к которому прибинден виджет
			_childrenWidgets - массив внутренних подвиджетов
			_parentWidget - виджет, для которого данный является внутренним
			destroy - метод (options: {keepDom:true|false}), который вызывается при удалении виджета:
				- рекурсивно выполняет destroy для внутренних подвижетов
				- удаляет себя из ._parentWidget._childrenWidgets
				- удаляет биндинг к дому и свой DOM
	*/


	var Widget = function() { }
	Widget.prototype.destroy = function(options) {
		if (this._childrenWidgets)
			while (this._childrenWidgets.length > 0)
				this._childrenWidgets[0].destroy();
		if (this._parentWidget && this._parentWidget._childrenWidgets)
			while (this._parentWidget._childrenWidgets.indexOf(this) != -1)
				this._parentWidget._childrenWidgets.splice(this._parentWidget._childrenWidgets.indexOf(this),1);
		ko.removeNode(this._widgetElement);
		if (typeof this.domDestroy == "function")
			this.domDestroy();
	}
	Widget.prototype._isWidget = true;


	var init = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext, widgetMode) {
		console.log("init",element,bindingContext);
		return ko.bindingHandlers.template.init(element,function() {
			var value = ko.utils.unwrapObservable(valueAccessor());
			return (value||{}).template||{};
		});
	}


	var update = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext, widgetMode) {
		// В knockout>=3.0.0 viewModel is deprecated, вместо нее нужно использовать bindingContext.$data
		// Однако виджеты могли создаваться в цикле foreach или with, и $data может не быть на parent-виджетом
		// Нужно пробежать по парентам и найти первый контекст, который является виджетом, если такого нет - в качестве parentWidget-а установить $root
		var parentWidget = bindingContext.$data;
		if (!parentWidget._isWidget && bindingContext.$parents.length>0) {
			for (var i = 0; i < bindingContext.$parents.length; i++) {
				parentWidget = bindingContext.$parents[i];
				if (parentWidget._isWidget) break;
			}
		}
		if (!parentWidget._isWidget)
			parentWidget = bindingContext.$root;

		var value = valueAccessor();
		var options = ko.utils.unwrapObservable(value);
        if (typeof options == "string") {
            widgetName = value;
            options = {};
        } 
        else {
            widgetName = options.name;
        }
        widgetName = ko.utils.unwrapObservable(widgetName);

		var requireParams = widgetMode=="html"?["widgets/"+widgetName+"/main","text!widgets/"+widgetName+"/main.html"]:["widgets/"+widgetName+"/main"];
		require(requireParams,function(Model,html) {
			if (typeof Model == "function") {
				$.extend(Model.prototype,EventEmitter.prototype);
				$.extend(Model.prototype,Widget.prototype);
			}
			// инициализация объекта виджета, засовываем туда параметров по максимуму
			var o = {
				element: element,
				options: options,
				parentWidget: parentWidget,
				core: bindingContext.$root,
				valueAccessor: valueAccessor,
				allBindingsAccessor: allBindingsAccessor,
				viewModel: viewModel,
				bindingContext: bindingContext,
				html: html
			}

			// _parentWidget и _widgetElement проставляем в модели, чтобы ссылаться на них при уничтожении виджета
			// TODO: я не знаю, что будет, если модель не будет функцией
			var w = typeof Model == "function" ? new Model(o) : Model;
			w._parentWidget = parentWidget;
			w._widgetElement = element;

			// регистрируем виджет в childrenWidgets у парента, чтобы из парента к нему был доступ 
			// здесь трюк: при инициализации виджета можно определить _childrenWidgets как observableArray и подписаться на изменения
			if (!parentWidget._childrenWidgets)
				parentWidget._childrenWidgets = [];
			parentWidget._childrenWidgets.push(w);

			ko.bindingHandlers.template.update(element,function() {
				var value = ko.utils.unwrapObservable(valueAccessor());
				value = (value||{}).template||{};
				value.data = w;
				if (widgetMode=="html") value.html = html;
				return value;
			},allBindingsAccessor,viewModel,bindingContext);

			// часто нужна ссылка на dom шаблона, пытаемся получить хотя бы dom первого тега
			// если шаблон виджета обернут в div, первый тег и есть весь html шаблона
			var firstDomChild = ko.virtualElements.firstChild(element);
			while (firstDomChild && firstDomChild.nodeType != 1)
				firstDomChild = ko.virtualElements.nextSibling(firstDomChild);

			// domInit - инициализация, которая живет внутри создаваемого виджета
			if (w.domInit && typeof w.domInit == "function")
				w.domInit(w,element,firstDomChild);

			// callback - метод, который может быть указан в паренте
			// иначе никак не получить ссылку на создаваемый виджет
			if (options.callback && typeof options.callback == "function")
				options.callback(w,element,firstDomChild);
		});
	}

	ko.bindingHandlers.widget = {
		init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			return init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext, "html");
		},
		update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			return update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext, "html");
		}
	}
	ko.bindingHandlers.widgetInline = {
		init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			return init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext, "inline");
		},
		update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			return update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext, "inline");
		}
	}

	ko.virtualElements.allowedBindings.widget = true;
	ko.virtualElements.allowedBindings.widgetInline = true;

	ko.createWidget = function(node,widgetOptions,viewModel) {
		var r = ko.applyBindingsToNode(node,{widget: widgetOptions},viewModel);
	}
	ko.createWidgetInline = function(node,widgetOptions,viewModel) {
		var r = ko.applyBindingsToNode(node,{widgetInline: widgetOptions},viewModel);
	}

});