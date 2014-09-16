module.exports = function(grunt) {

	// Loop through all files in js/widgets dir and collect them to allWidgetFiles array
	var allWidgetFiles = [];
	grunt.file.recurse("./src/js/widgets",function(abspath,rootdir,subdir,filename) {
		if (/\.js$/.test(filename)) {
			allWidgetFiles.push("./widgets/"+subdir+"/"+filename.replace(/\.js$/,""));
		}
		else if (/\.html$/.test(filename)) {
			allWidgetFiles.push("text!./widgets/"+subdir+"/"+filename);
		}
	});

	var fs = require("fs");

	// Let's assume that debugger widget is not so necessary and it should be load by demand. Exculude it's files from allWidgetFiles array
	var allWidgetFilesWithoutDebugger = allWidgetFiles.slice().filter(function(path) { return !/debugger/.test(path); });

	// Collect all js/main.. files
	var allMainJsFiles = fs.readdirSync("./src/js").filter(function(path) { return /^main/.test(path); });

	// Collect all index.. files
	var allIndexFiles = fs.readdirSync("./src").filter(function(path) { return /^index/.test(path); });

	var config = {};
	var tasks = {};
	config.requirejs = {};
	config.exec = {};
	config.processhtml = {};




	// Prepare almond config
	tasks.almond = [];

	// Loop through all js/main.. config files and include all widgets and js/main.. itself and almond lib to the build
	// Everything is wrapped to the local context so dynamic loading of additional widgets and AMD libs is not supported
	allMainJsFiles.forEach(function(mainJs) {
		var name = mainJs.replace(/\.js$/,"");
		config.requirejs["almond-"+name] = {
			options: {
				baseUrl: "src/js",
				mainConfigFile: "src/js/" + mainJs,
				include: allWidgetFiles.concat(["./"+name,"../lib/almond/almond"]),
				out: "build-almond/" + mainJs,
				optimize: "none",
				wrap: {
					startFile: "src/almond.start.part",
					endFile: "src/almond.end.part"
				}
			}
		}
		tasks.almond.push("requirejs:almond-"+name);
	});

	config.exec.almond = {
		cmd: "cp -r src/css build-almond/ & cp -r src/lib build-almond/"
	}
	tasks.almond.push("exec:almond");

	config.processhtml.almond = {};
	config.processhtml.almond.files = {};
	allIndexFiles.forEach(function(name) {
		config.processhtml.almond.files["build-almond/"+name] = ["src/"+name];
	});
	tasks.almond.push("processhtml:almond");




	// Prepare shared config
	tasks.shared = [];

	// Loop through all js/main.. config files
	// Let's assume that debugger widget is not so incommon and it should be loaded on demand
	// Include all widgets but debugger, js/main.. itself and requirejs lib to the build
	// Almond does not support loading AMD modules on demand (and we want to have an ability to load debugger widget if it's required) that's why we use requirejs instead of almond
	// Also we don't wrap build because in case of wrap external AMD files (debugger widget) do not see require and define methods from wrapped require.js lib
	allMainJsFiles.forEach(function(mainJs) {
		var name = mainJs.replace(/\.js$/,"");
		config.requirejs["shared-"+name] = {
			options: {
				baseUrl: "src/js",
				mainConfigFile: "src/js/" + mainJs,
				include: allWidgetFilesWithoutDebugger.concat(["./"+name,"../lib/requirejs/require"]),
				out: "build-shared/" + mainJs,
				optimize: "none"
			}
		}
		tasks.shared.push("requirejs:shared-"+name);
	});

	config.exec.shared = {
		cmd: "cp -r src/css build-shared/ & cp -r src/lib build-shared/"
	}
	tasks.shared.push("exec:shared");

	config.exec.sharedWidgets = {
		cmd: "mkdir -p build-shared/js/widgets && cp -r src/js/widgets/debugger build-shared/js/widgets/"
	}
	tasks.shared.push("exec:sharedWidgets");

	config.processhtml.shared = {};
	config.processhtml.shared.files = {};
	allIndexFiles.forEach(function(name) {
		config.processhtml.shared.files["build-shared/"+name] = ["src/"+name];
	});
	tasks.shared.push("processhtml:shared");




	grunt.initConfig(config);
	grunt.loadNpmTasks("grunt-exec");
	grunt.loadNpmTasks("grunt-contrib-requirejs");
	grunt.loadNpmTasks("grunt-processhtml");
	grunt.registerTask("almond",tasks.almond);
	grunt.registerTask("shared",tasks.shared);
}