module.exports = function(grunt) {
	grunt.initConfig({
		requirejs: {
			default: {
				options: {
					baseUrl: "src/js",
					mainConfigFile: "src/js/main.js",
					include: [
						"./main",
						"../lib/almond/almond",
						"./widgets/test1/main","text!./widgets/test1/main.html",
						"./widgets/test2/main","text!./widgets/test2/main.html",
						"./widgets/testEmit/main","text!./widgets/testEmit/main.html",
						"./widgets/testPing/main",
						"./widgets/testReq/main","text!./widgets/testReq/main.html"
					],
					out: "build-almond/main.js",
					optimize: "none",
					wrap: true
				}
			}
		},
		exec: {
			default: {
				cmd: "cp -r src/css build-almond/ & cp -r src/lib build-almond/"
			}
		},
		processhtml: {
			default: {
				files: {
					"build-almond/index-example7.html": ["src/index-example7.html"]
				}
			}
		}
	});
	grunt.loadNpmTasks("grunt-exec");
	grunt.loadNpmTasks("grunt-contrib-requirejs");
	grunt.loadNpmTasks("grunt-processhtml");
	grunt.registerTask("default",["requirejs:default","exec:default","processhtml:default"]);
}
