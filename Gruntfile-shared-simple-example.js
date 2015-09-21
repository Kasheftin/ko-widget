module.exports = function(grunt) {
	grunt.initConfig({
		requirejs: {
			default: {
				options: {
					baseUrl: "src/js",
					mainConfigFile: "src/js/main.js",
					include: [
						"./main",
						"../lib/requirejs/require",
						"./widgets/test1/main","text!./widgets/test1/main.html",
						"./widgets/test2/main","text!./widgets/test2/main.html",
//						"./widgets/testEmit/main","text!./widgets/testEmit/main.html",
						"./widgets/testPing/main",
						"./widgets/testReq/main","text!./widgets/testReq/main.html"
					],
					out: "build-shared/main.js",
					optimize: "none",
					wrap: false
				}
			}
		},
		exec: {
			default: {
				cmd: "cp -r src/css build-shared/ & cp -r src/lib build-shared/ & mkdir -p build-shared/js/widgets & cp -r src/js/widgets/testEmit build-shared/js/widgets/"
			}
		},
		processhtml: {
			default: {
				files: {
					"build-shared/index-example7.html": ["src/index-example7.html"]
				}
			}
		}
	});
	grunt.loadNpmTasks("grunt-exec");
	grunt.loadNpmTasks("grunt-contrib-requirejs");
	grunt.loadNpmTasks("grunt-processhtml");
	grunt.registerTask("default",["requirejs:default","exec:default","processhtml:default"]);
}
