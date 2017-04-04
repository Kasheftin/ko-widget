define(["jquery","underscore","knockout","./config"],function($,_,ko,config) {

	var Img = function(){}

	Img.prototype.protect = function(img) {
		var ratio = img.width/img.height;
		var maxSquare = 5000000;  // ios max canvas square
		var maxSize = 4096;  // ie max canvas dimensions
		var maxW = Math.floor(Math.sqrt(maxSquare*ratio));
		var maxH = Math.floor(maxSquare/Math.sqrt(maxSquare*ratio));
		if (maxW > maxSize) {
			maxW = maxSize;
			maxH = Math.round(maxW/ratio);
		}
		if (maxH > maxSize) {
			maxH = maxSize;
			maxW = Math.round(ratio*maxH);
		}
		if (img.width > maxW) {
			var canvas = document.createElement("canvas");
			canvas.width = maxW;
			canvas.height = maxH;
			canvas.getContext("2d").drawImage(img,0,0,maxW,maxH);
			img.src = "about:blank";
			img.width = 1;
			img.height = 1;
			img = canvas;
		}
		return img;
	}

	/*
	In certain Android versions (e.g. 4.3) the blob constructor does not work.
	ERROR: new Blob() - Illegal constructor
	To fix it we should use "createBlob()" instead "new Blob()"

	Solution:
	https://github.com/markmarijnissen/cordova-promise-fs/issues/10
	https://github.com/pheinicke/cordova-promise-fs/commit/96fc2bed7ab4a3f52a54780cc930adfa06761376

	Other solutions:
	https://github.com/eligrey/Blob.js
	*/
	Img.prototype.createBlob = function(parts, type) {
		var BlobBuilder,
			bb;
		try {
			return new Blob(parts, { type: type });
		} catch (e) {
			BlobBuilder = window.BlobBuilder ||
				window.WebKitBlobBuilder ||
				window.MozBlobBuilder ||
				window.MSBlobBuilder;
			if (BlobBuilder) {
				bb = new BlobBuilder();
				bb.append(parts);
				return bb.getBlob(type);
			} else {
				throw new Error("Unable to create blob");
			}
		}
	};

	Img.prototype.dataURItoBlob = function(dataURI) {
		// convert base64/URLEncoded data component to raw binary data held in a string
		var byteString;
		if (dataURI.split(',')[0].indexOf('base64') >= 0) {
			byteString = atob(dataURI.split(',')[1]);
		}
		else {
			byteString = unescape(dataURI.split(',')[1]);
		}
		// separate out the mime component
		var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
		// write the bytes of the string to a typed array
		var ia = new Uint8Array(byteString.length);
		for (var i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}
		return this.createBlob([ia],mimeString);
	}

	Img.prototype.getBlobFile = function(fileDataUri) {
		var blobFile = this.dataURItoBlob(fileDataUri);
		blobFile.name = this.name;
		blobFile.lastModifiedDate = new Date();
		return blobFile;
	}

	Img.prototype.imageLoader = function(src,config) {
		var df = $.Deferred();
		_.delay(function() {
			var img = new Image();
			img.onload = function() {
				df.resolve(img,{status:"success"});
			}
			img.onerror = function() {
				df.reject({status:"error",statusText:"Failed preparing resize image."});
			}
			img.src = src;
		},0);
		return df.promise();
	}

	Img.prototype.imageResizer = function(img,config) {
		var self = this;
		var df = $.Deferred();
		_.defer(function() {
			if (!img || !img.width || !img.height || img.width==0 || img.height==0) return df.reject({status:"error",statusText:"Invalid resizing image."});
			img = self.protect(img);
			if (config.resizeBy=="out") {
				if (config.height && config.width && img.width*config.height<img.height*config.width) {
					var newW = Math.min(img.width,config.width);
					var newH = Math.floor(img.height/img.width*newW);
				}
				else if (config.height) {
					var newH = Math.min(img.height,config.height);
					var newW = Math.floor(img.width/img.height*newH);
				}
				else if (config.width) {
					var newW = Math.min(img.width,config.width);
					var newH = Math.floor(img.height/img.width*newW);
				}
			}
			else if (config.resizeBy=="in") {
				if (config.height && config.width && img.width*config.height<img.height*config.width) {
					var newH = Math.min(img.height,config.height);
					var newW = Math.floor(img.width/img.height*newH);
				}
				else if (config.width) {
					var newW = Math.min(img.width,config.width);
					var newH = Math.floor(img.height/img.width*newW);
				}
				else if (config.height) {
					var newH = Math.min(img.height,config.height);
					var newW = Math.floor(img.width/img.height*newH);
				}
			}

			var startSize = {width:img.width,height:img.height};
			var steps = Math.ceil(Math.log(img.width/newW)/Math.LN2);
//			if (steps==0) steps = 1;
			var sW = newW*Math.pow(2,steps-1);
			var sH = newH*Math.pow(2,steps-1);
			var x = 2;

			var run = function() {
				if (!(steps--)) {
					return df.resolve(img,{startSize:startSize,endSize:{width:img.width,height:img.height}});
				}
				_.defer(function() {
					var canvas = document.createElement("canvas");
					canvas.width = sW;
					canvas.height = sH;
					var ctx = canvas.getContext("2d");
					ctx.fillStyle = "#ffffff";
					ctx.fillRect(0,0,canvas.width,canvas.height);
					ctx.drawImage(img,0,0,sW,sH);
					img.src = "about:blank";
					img.width = 1;
					img.height = 1;
					img = canvas;
					sW = Math.round(sW/x);
					sH = Math.round(sH/x);
					run();
				});
			}
			run();
		});
		return df.promise();
	}

	Img.prototype.imageExtender = function(img,config) {
		var self = this;
		var df = $.Deferred();
		_.defer(function() {
			if (!img || !img.width || !img.height || img.width==0 || img.height==0) return df.reject({status:"error",statusText:"Invalid extending image."});
			if (!config.extend) return df.resolve(img,{status:"skipped"});

			var minWidth = config.minWidth||config.width||img.width;
			var maxWidth = config.maxWidth||config.width||img.width;
			var minHeight = config.minHeight||config.height||img.height;
			var maxHeight = config.maxHeight||config.height||img.height;
			var newW = img.width;
			if (newW>maxWidth) newW = maxWidth;
			if (newW<minWidth) newW = minWidth;
			var newH = img.height;
			if (newH>maxHeight) newH = maxHeight;
			if (newH<minHeight) newH = minHeight;
			if (newW==img.width && newH==img.height) return df.resolve(img,{status:"skipped"});

			var zoom = 1;
			if (config.extend=="stretch") {
				zoom = Math.max(1,minWidth/img.width,minHeight/img.height);
			}

			var dx = Math.floor((newW-img.width*zoom)*(config.cropX||1/2));
			var dy = Math.floor((newH-img.height*zoom)*(config.cropY||1/2));
			var dw = Math.floor(img.width*zoom);
			var dh = Math.floor(img.height*zoom);
			var canvas = document.createElement("canvas");
			canvas.width = newW;
			canvas.height = newH;
			var ctx = canvas.getContext("2d");
			ctx.fillStyle = "#ffffff";
			ctx.fillRect(0,0,canvas.width,canvas.height);
			ctx.drawImage(img,0,0,img.width,img.height,dx,dy,dw,dh);

			img.src = "about:blank";
			img.width = 1;
			img.height = 1;
			img = canvas;
			df.resolve(img,{extendSize:{width:img.width,height:img.height}});
		});
		return df;
	}

	Img.prototype.imageCropper = function(img,config) {
		var self = this;
		var df = $.Deferred();
		_.defer(function() {
			if (!img || !img.width || !img.height || img.width==0 || img.height==0) return df.reject({status:"error",statusText:"Invalid cropping image."});
			if (!config.crop) return df.resolve(img,{status:"skipped"});
			var newW = Math.min(config.width,img.width);
			var newH = Math.min(config.height,img.height);
			if (newW==img.width && newH==img.height) return df.resolve(img,{cropSize:{width:img.width,height:img.height,x:0,y:0,tx:0,ty:0}});
			var x = Math.floor(Math.max(img.width-config.width,0)*config.cropX);
			var y = Math.floor(Math.max(img.height-config.height,0)*config.cropY);
			var tx = Math.floor((config.width-newW)/2);
			var ty = Math.floor((config.height-newH)/2);
			var canvas = document.createElement("canvas");
			canvas.width = config.width;
			canvas.height = config.height;
			canvas.getContext("2d").drawImage(img,x,y,newW,newH,tx,ty,newW,newH);
			img.src = "about:blank";
			img.width = 1;
			img.height = 1;
			img = canvas;
			df.resolve(img,{cropSize:{width:img.width,height:img.height,x:x,y:y,tx:tx,ty:ty}});
		});
		return df.promise();
	}

	Img.prototype.imageCopier = function(img,config,keepIncommingImage) {
		var self = this;
		var df = $.Deferred();
		_.defer(function() {
			if (!img || !img.width || !img.height || img.width==0 || img.height==0) return df.reject({status:"error",statusText:"Invalid extending image."});
			var canvas = document.createElement("canvas");
			canvas.width = img.width;
			canvas.height = img.height;
			canvas.getContext("2d").drawImage(img,0,0,img.width,img.height,0,0,img.width,img.height);
			if (!keepIncommingImage) {
				img.src = "about:blank";
				img.width = 1;
				img.height = 1;
				delete img;
			}
			df.resolve(canvas,{extendSize:{width:img.width,height:img.height}});
		});
		return df;
	}

	Img.prototype.runProcessing = function(config,callback) {
		var self = this;
		try {
			if (this.status()!="waitingForProcessing" && this.status()!="waitingForRotating") throw "Incorrect image status for processing/rotating.";
			if (!this.file) throw "No file data for resize.";
			var debug = [];
			var loader = this.origImg?this.imageCopier(this.origImg,config,true):this.imageLoader((window.URL||window.webkitURL).createObjectURL(this.file),config);
			loader.done(function(img,debugInfo) {
				debug.push($.extend(debugInfo,{op:"imageLoader"}));
				var resizer = self.imageResizer(img,config);
				resizer.done(function(img,debugInfo) {
					debug.push($.extend(debugInfo,{op:"imageResizer"}));
					var cropper = self.imageCropper(img,config);
					cropper.done(function(img,debugInfo) {
						debug.push($.extend(debugInfo,{op:"imageCropper"}));
						var extender = self.imageExtender(img,config);
						extender.done(function(img,debugInfo) {
							debug.push($.extend(debugInfo,{op:"imageExtender"}));
							var copier = self.imageCopier(img,config);
							copier.done(function(img,debugInfo) {
								debug.push($.extend(debugInfo,{op:"imageCopier"}));
								return callback && callback({
									status: "resized",
									statusText: "Image successfully processed.",
									img: img,
									debug: debug
								});
							});
							copier.fail(function(result) {
								return callback && callback(result);
							});
						});
						extender.fail(function(result) {
							return callback && callback(result);
						});
					});
					cropper.fail(function(result) {
						return callback && callback(result);
					});
				});
				resizer.fail(function(result) {
					return callback && callback(result);
				});
			});
			loader.fail(function(result) {
				return callback && callback(result);
			});
			loader.always(function(img) {
				img && img.src && URL.revokeObjectURL(img.src);
			});
		}
		catch(e) {
			return callback && callback({status:"error",statusText:e});
		}
	}

	Img.prototype.process = function(callback) {
		var self = this;
		var results = {};
		var run = function(callback) {
			var size = _.findKey(self.config().sizes,function(v,size){return !v.skipProcessing && results[size]!="resized"});
			if (size) {
				self.runProcessing(self.config().sizes[size],function(result) {
					if (result.status=="resized") {
						self.fileDataUris[size] = result.img.toDataURL(self.type(),1);
						if (size=="orig") {
							self.origImg = result.img;
						}
						results[size] = result.status;
						run(callback);
					}
					else {
						self.statusText(result.statusText);
						self.status(result.status);
						callback && callback({status:result.status});
					}
				});
			}
			else {
				self.status("resized");
				self.statusText("All sizes resized.");
				callback && callback({status:"resized"});
			}
		}
		this.loading(true);
		run(function(result) {
			self.loading(false);
			callback && callback(result);
		});
	}

	return Img;
});