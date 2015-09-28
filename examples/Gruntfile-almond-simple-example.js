module.exports = function(grunt) {
	grunt.initConfig({
		requirejs: {
			default: {
				options: {
					baseUrl: "src",
					mainConfigFile: "src/main.js",
					include: [
						"./main",
						"../../ext/almond/almond",
						"./src/widgets/test1/main","text!./src/widgets/test1/main.html",
						"./src/widgets/test2/main","text!./src/widgets/test2/main.html",
						"./src/widgets/testEmit/main","text!./src/widgets/testEmit/main.html",
						"./src/widgets/testPing/main",
						"./src/widgets/testReq/main","text!./src/widgets/testReq/main.html"
					],
					out: "build-almond/main.js",
					optimize: "none",
					wrap: true
				}
			}
		},
		processhtml: {
			default: {
				files: {
					"build-almond/index-example1.html": ["src/index-example1.html"],
					"build-almond/index-example2.html": ["src/index-example2.html"],
					"build-almond/index-example3.html": ["src/index-example3.html"],
					"build-almond/index-example4.html": ["src/index-example4.html"],
					"build-almond/index-example5.html": ["src/index-example5.html"],
					"build-almond/index-example6.html": ["src/index-example6.html"],
					"build-almond/index-example7.html": ["src/index-example7.html"],
					"build-almond/index-example8.html": ["src/index-example8.html"],
					"build-almond/index-example9.html": ["src/index-example9.html"]
				}
			}
		}
	});
	grunt.loadNpmTasks("grunt-exec");
	grunt.loadNpmTasks("grunt-contrib-requirejs");
	grunt.loadNpmTasks("grunt-processhtml");
	grunt.registerTask("default",["requirejs:default","exec:default","processhtml:default"]);
}
