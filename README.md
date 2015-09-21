Knockout Widget Binding
=======================

This code adds custom widget binding - that's the way to organize code of a usual website to independent modules and include them on demand.
We think about the common website as the collection of rather independent pieces of html blocks supported by js-code.
For example, feedback form, user registration form, search selectors, shop basket could be such piece - each one has html template and some js-logic over it, and this couple we call widget.
There might be several widgets (or event several instances of the same widget) on one page, and they have to be independent, widget has not access to other widgets, and we use common event emitter to support communication. Also we use require.js, and each widget lives in it's own AMD-module.

We use
------

* [Knockout](http://knockoutjs.com)
* [Require.js](http://requirejs.org)
* [Require.js text plugin](http://github.com/requirejs/text) - for loading widget's html templates.
* [JQuery](http://jquery.com) - could be simply switched to underscore or any other utility lib.
* [EventEmitter](http://github.com/Wolfy87/EventEmitter.git) - for communication between widgets.
* [Grunt](http://www.gruntjs.org/), [Almond](http://github.com/jrburke/almond) - for building sample releases.

The code consists of two parts - string template engine and widget binding itself.

String Template Engine
----------------------

[Knockout](http://knockoutjs.com) has two common template engines. They are named template engine and inline template engine. We want to load widget's template from file with [Require.js text plugin](http://github.com/requirejs/text), that's why we need custom template engine that could render template from string of html code. Here it is - [stringTemplateEngine.js](https://github.com/Kasheftin/ko-widget/blob/gh-pages/src/js/ko-widget/stringTemplateEngine.js). We redefined nativeTemplateEngine.makeTemplateSource method, and now native template binding supports optional "html" parameter that should be a (observable) string with html code. Any other template engines and options are also supported the same way as before. Here's the [example 1](http://kasheftin.github.io/ko-widget/src/index-example1.html) that shows that our template engine hasn't broken anything.

Widget binding
--------------

Actually we define two bindings - widget and widgetInline. The first one uses require.js to load JS-code from some AMD module and template from corresponding html file. The second one loads only AMD module and uses inline html code as template (it uses native template engine). Here are some [examples](http://kasheftin.github.io/ko-widget/src/index-example2.html). Let's consider this string: 

    <!-- ko widget: 'test1' --><!-- /ko -->
This case binding uses require.js to load widgets/test1/main.js (AMD module) and widgets/test1/main.html (html template loaded with require text! plugin), and then applies template binding with data property from AMD-module and html property from html string (template binding uses string template engine).

Next, if we want to load only widgets/test1/main.js and use template binding with data property from it without an html property, we should write something like:

	<!-- ko widgetInline: 'test1' -->
	  <div>This is an inline example of widget binging.</div>
	  <div data-bind="text:param1"></div>
	<!-- /ko -->

At last, widget binding supports template object in properties - it's thrown to inner template binding, appended with data property. So here we load widgets/test1/main.js and apply template binding with properties from the template-option, appended by data-property from AMD-module:

	<!-- ko widgetInline: {name: 'test1',template:{name:'template1'}} --><!-- /ko -->
	<script type="text/template" id="template1">
		<div>This is the example of widget binding that uses native named template engine.</div>
		<div data-bind="text:param1"></div>
	</script>

An observable as a widget name
------------------------------
One can use an observable string as a widget name, see [example 3](http://kasheftin.github.io/ko-widget/src/index-example3.html).

Sending options to widget from binding
--------------------------------------
All binding widget options are available from inside widget constructor. In case options are string we set them as widget name, otherwise there should be defined name property, see [example 4](http://kasheftin.github.io/ko-widget/src/index-example4.html):

	<!-- ko widget: {name:'test1',param1:'This parameter is set from widget binding'} --><!-- /ko -->

Creating widget from inside javascript
--------------------------------------
We've defined ko.createWidget and ko.createWidgetInline one can use to create widgets dynamically from javascript, but theese methods are just wrappers for ko.applyBindingToNode, see [example 5](http://kasheftin.github.io/ko-widget/src/index-example5.html).

Communication between widgets
-----------------------------
We don't know what widgets are defined on a page that's why we have some object to be common for all instances. That's up to user to build communication, for example one can send the same observable to all widgets in widget binding options. Usually we use one instance of event emitter among all widgets, that is stored in root context, see [example 6](http://kasheftin.github.io/ko-widget/src/index-example6.html).

Nested widget bindings
----------------------
Nested widgets are also supported. And here's main complexity. In case of destroying a parent widget, all nested widgets should be also destroyed. ~~That's why we keep a widget's tree - every widget has a link to _parentWidget and has an observableArray with _childrenWidgets.~~ Since disposeWhenNodeIsRemoved option works we don't need to keep full widgets tree. Here is the [example 7](http://kasheftin.github.io/ko-widget/src/index-example7.html), where widget might create/destroy subwidgets reqursively, and each instance sends some pings that indicate that it's alive. 

Production builds
-----------------
We created two sample builds - the first one uses [almond](http://github.com/jrburke/almond), includes all widgets and is wrapped in local context, and the second one uses [requirejs](http://requirejs.org) itself, includes several widgets and allows dynamic loading of other ones on demand.

Almond build
------------
Obviously, r.js build tool does not know anything about what widgets are in use on each page. That's why we have to traverse widget's dir by ourselves and manually specify what files we want to include. We use [grunt](http://gruntjs.org), and here is the simple config where we specify files manually: [Gruntfile-almond-simple-example.js](https://github.com/Kasheftin/ko-widget/blob/gh-pages/Gruntfile-almond-simple-example.js). Of course that's possible to use any grunt or node tool for collecting the file list (in our main build config [Grunt.js](https://github.com/Kasheftin/ko-widget/blob/gh-pages/Gruntfile.js) we use node fs and grunt.file.recurse). The working almond-released examples of this repo could be found here: [example 1](http://kasheftin.github.io/ko-widget/build-almond/index-example1.html), [example 2](http://kasheftin.github.io/ko-widget/build-almond/index-example2.html), [example 3](http://kasheftin.github.io/ko-widget/build-almond/index-example3.html), [example 4](http://kasheftin.github.io/ko-widget/build-almond/index-example4.html), [example 5](http://kasheftin.github.io/ko-widget/build-almond/index-example5.html), [example 6](http://kasheftin.github.io/ko-widget/build-almond/index-example6.html), [example 7](http://kasheftin.github.io/ko-widget/build-almond/index-example7.html).

Shared build
------------
We assumed that testEmit widget is not used in common case and removed it from build. Instead of this we just copy testEmit widget folder to the build dir so that requirejs could find them on demand. Here's the sample config: [Gruntfile-almond-simple-example.js](https://github.com/Kasheftin/ko-widget/blob/gh-pages/Gruntfile-shared-simple-example.js).  The working shared-released examples of this repo could be found here: [example 1](http://kasheftin.github.io/ko-widget/build-shared/index-example1.html), [example 2](http://kasheftin.github.io/ko-widget/build-shared/index-example2.html), [example 3](http://kasheftin.github.io/ko-widget/build-shared/index-example3.html), [example 4](http://kasheftin.github.io/ko-widget/build-shared/index-example4.html), [example 5](http://kasheftin.github.io/ko-widget/build-shared/index-example5.html), [example 6](http://kasheftin.github.io/ko-widget/build-shared/index-example6.html), [example 7](http://kasheftin.github.io/ko-widget/build-shared/index-example7.html).
