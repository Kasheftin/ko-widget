module.exports = function(grunt) {

	var config = {
		pkg: grunt.file.readJSON("package.json"),
		uglify: {
			options: {
				banner: "/*!\n\t<%= pkg.name %> v<%= pkg.version %>\n\t<%= pkg.description %>\n\t<%= pkg.homepage %>\n\t<%= pkg.author %> <%= pkg.email %>\n\tcompiled on <%= grunt.template.today('yyyy-mm-dd hh:mm:ss') %>\n*/",
				preserveComments: "some"
			}
		},
		requirejs: {
			build2: {
				options: {
					baseUrl: "./",
					name: "lib/almond/almond",
					mainConfigFile: "js/main.js",
					include: "js/main",
					insertRequire: ["js/main"],
					out: "main-built.js",
					wrap: true
				}
			},
			build: {
				options: {
					appDir: "js",
					baseUrl: "js",
					dir: "dist",
					mainConfigFile: "js/main.js",
					optimize: "none",
					optimizeAllPluginsResources: true,
					inlineText: true,
					paths: {
						"requireLib": "lib/requirejs/require",
						"text": "lib/requirejs-text/text"
					},
					modules: [{
						name: "main",
						include: ["requireLib","text"]
					}]
				}
			}
		}
	}

	grunt.initConfig(config);
	grunt.loadNpmTasks("grunt-contrib-requirejs");
		grunt.registerTask("default",["requirejs:build"]);
}
 
