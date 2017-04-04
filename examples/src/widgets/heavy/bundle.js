//define(["knockout","underscore","moment","config","models/image"],function(ko,_,moment,config,Image) {
define(["knockout","underscore","moment","./config","./image"],function(ko,_,moment,config,Image) {

	var anticache = {};

	var camelize = function(s) {
		return (s||"").replace(/((^|\_).)/g,function(match,index) {
			return match.replace(/^\_/,"").toUpperCase();
		});
	}

	var modelStructures = {
		"access": {
			fieldsStr: "id:i,user:Profile,type:s,privilege:s,position:s,is_active:b,user_email:s,user_phone:s,activated_at:dt,created_at:dt,data_type:s,data_id:i,user_id:i",
			initialize: function(self,rw) {
				self.inputPrivilege = ko.observable(self.privilege());
				self.inputPosition = ko.observable(self.position());
				self.userExists = self.user.exists;
				self.printEmail = ko.computed(function() {
					if (self.user.exists()) return self.user.email();
					else return self.user_email();
				});
				self.printPhone = ko.computed(function() {
					if (self.user.exists()) return self.user.phone();
					else return self.user_phone();
				});
				self.nonact = ko.computed(function() {
					if (!self.is_active()) return true;
					if (self.privilege()=="disabled") return true;
					return false;
				});
				/*
				if (rw.data && rw.data.hasOwnProperty("sys_type")) {
					var modelName = camelize(rw.data.sys_type);
					if (modelName && definedModels[modelName]) {
						self.data = new definedModels[modelName](rw.data,self);
					}
				}
				*/
				self.printTitle = ko.computed(function() {
					var out = "";
					var add = [];
					if (!self.data) return out;
					if (self.data.hasOwnProperty("name")) {
						out += ko.utils.unwrapObservable(self.data.name);
					}
					if (self.data.hasOwnProperty("data") && self.data.data.hasOwnProperty("name")) {
						add.push(ko.utils.unwrapObservable(self.data.data.short_name)||ko.utils.unwrapObservable(self.data.data.name));
					}
					if (self.data.hasOwnProperty("group") && self.data.group.hasOwnProperty("name")) {
						add.push(ko.utils.unwrapObservable(self.data.group.short_name)||ko.utils.unwrapObservable(self.data.group.name));
					}
					if (self.data.hasOwnProperty("institution") && self.data.institution.hasOwnProperty("name")) {
						add.push(ko.utils.unwrapObservable(self.data.institution.short_name)||ko.utils.unwrapObservable(self.data.institution.name));
					}
					if (add.length==0) return out;
					if (out.length==0) return add.join(", ");
					return out+" ("+add.join(", ")+")";
				});
			},
			update: function(self,rw) {
				self.inputPrivilege(self.privilege());
				self.inputPosition(self.position());
				if (self.hasOwnProperty("data") && self.data && typeof(self.data.update)=="function") {
					self.data.update(rw.data);
				}
			},
			export: function(self,result,exportMode) {
				if (self.hasOwnProperty("data") && self.data && typeof(self.data.export)=="function") {
					result.data = self.data.export(exportMode);
				}
				return result;
			}
		},
		"comment": {
			fieldsStr: "id:i,obj_type:s,obj_id:i,parent_id:i,user:Profile,text:s,textPrint:s,editable:b,destroyable:b,updated_at:dt",
			saveStr: "id:i,obj_type:s,obj_id:i,parent_id:i,text:s",
			initialize: function(self) {
				self.mode = ko.observable("view");
				self.textRows = ko.computed(function() {
					return (self.textPrint()||"").split(/\n/);
				});
				self.textFocused = ko.observable(false);
				self._modeSubscribe = self.mode.subscribe(function(mode) {
					if (mode=="edit") {
						_.defer(function() {
							self.textFocused(true);
						});
					}
				});
				self.cancel = function() {
					self.textFocused(false);
					self.mode("view");
				}
				self.sort = ko.computed(function() {
					return moment(self.updated_at()).utc();
				});
			}
		},
		"contact": {
			fieldsStr: "type:s,value:s,note:s,verified:b,show_verified:b",
			saveStr: "type:s,value:s,note:s",
			initialize: function(self) {
				self.config = ko.computed(function() {
					return _.find(config.contactTypes,{value:self.type()});
				});
			}
		},
		"file": {
			fieldsStr: "id:i,name:s,size:i,type:s,status:s",
			initialize: function(self,rw) {
				if (!self.status()) self.status("uploaded");
				self.file = rw.file||null;
				self.url = ko.computed(function() {
					if (!self.exists()) return "";
					return config.dataProvider.api+"/utils/getFile/"+self.id()+"/"+self.name();
				});
			},
			update: function(self,rw) {
				self.file = rw.file||null;
			}
		},
		"grid": {
			fieldsStr: "id:i,name:s,settings:GridSettings,editable:b,data_type:s,data_id:i"
		},
		"grid_settings": {
			fieldsStr: "max_lessons:i,zero_lesson:b,holidays:a:Holiday:0,grade_type:i,week_times_equal:i",
			defaultValues: config.grid,
			initialize: function(self,rw) {
				self.work_days = ko.observableArray();
				var wd = rw.work_days||config.grid.work_days;
				var names = window.$tvRoot.dict.datesConfig().daysMin;
				var fullNames = window.$tvRoot.dict.datesConfig().days;
				for (var i=1;i<8;i++) {
					self.work_days.push({enabled:ko.observable(wd[i==7?0:i]==1),name:names[i==7?0:i],fullName:fullNames[i==7?0:i],i:i==7?0:i});
				}
				self.foreachLessons = ko.computed(function() {
					var out = [];
					if (self.zero_lesson()) out.push(0);
					for (var i=1;i<=self.max_lessons();i++) {
						out.push(i);
					}
					return out;
				});
				self.enabledWorkDaysCnt = ko.computed(function() {
					var out = 0;
					self.work_days().forEach(function(rw){
						if (rw.enabled()) out++;
					});
					return out;
				});
				self.holidaySorter = ko.computed(function() {
					self.holidays().forEach(function(rw){rw.from()});
					self.holidays.sort(function(rw1,rw2) {
						var d1 = moment(rw1.from(),"YYYY-MM-DD");
						var d2 = moment(rw2.from(),"YYYY-MM-DD");
						if (!d1.isValid()&&!d2.isValid()) return 0;
						if (!d1.isValid()) return -1;
						if (!d2.isValid()) return 1;
						return d1.utc()-d2.utc();
					});
				});
				self.timesFields = {};
				self.gf = function(ind) {
					if (!self.timesFields.hasOwnProperty(ind)) {
						self.timesFields[ind] = ko.observable();
					}
					return self.timesFields[ind];
				}
				self.updateTimes = function(times) {
					if (!times) times = {};
					if (self.week_times_equal()==1) {
						self.foreachLessons().forEach(function(i) {
							self.gf("1-"+i+"-from")(((times[1]||{})[i]||{}).from||"");
							self.gf("1-"+i+"-to")(((times[1]||{})[i]||{}).to||"");
						});
					}
					else {
						self.work_days().forEach(function(rw) {
							if (rw.enabled()) {
								self.foreachLessons().forEach(function(i) {
									self.gf(rw.i+"-"+i+"-from")(((times[rw.i]||{})[i]||{}).from||"");
									self.gf(rw.i+"-"+i+"-to")(((times[rw.i]||{})[i]||{}).to||"");
								});
							}
						});
					}
				}
				self.copyTime = function(i) {
					var fromDay = (self.work_days()[0]||{}).i||0;
					var toDay = (self.work_days()[i]).i||0;
					if (self.week_times_equal()==1 || i==0 || fromDay==toDay) return;
					self.foreachLessons().forEach(function(l) {
						var f = self.gf(fromDay+"-"+l+"-from")();
						var t = self.gf(fromDay+"-"+l+"-to")();
						self.gf(toDay+"-"+l+"-from")(f);
						self.gf(toDay+"-"+l+"-to")(t);
					});
				}
				self.addHol = function() {
					self.holidays.unshift(new definedModels.Holiday());
				}
				self.remHol = function(i) {
					self.holidays.splice(i,1);
				}
				self.updateTimes(rw.times);
			},
			update: function(self,rw) {
				if (rw.hasOwnProperty("work_days")) {
					self.work_days().forEach(function(d) {
						d.enabled(rw.work_days[d.i]==1);
					});
				}
				if (rw.hasOwnProperty("times")) {
					self.updateTimes(rw.times);
				}
			},
			export: function(self,result,exportMode) {
				var ar = _.map(self.work_days(),function(rw){return{i:rw.i,enabled:rw.enabled()}});
				result.work_days = _.map(ar.sort(function(rw1,rw2){return rw1.i-rw2.i;}),function(rw){return rw.enabled?1:0});
				result.times = {};
				if (self.week_times_equal()==1) {
					result.times[1] = {};
					self.foreachLessons().forEach(function(i) {
						var f = self.gf("1-"+i+"-from")();
						var t = self.gf("1-"+i+"-to")();
						result.times[1][i] = {from:f,to:t};
					});
				}
				else {
					self.work_days().forEach(function(rw) {
						if (rw.enabled()) {
							result.times[rw.i] = {};
							self.foreachLessons().forEach(function(i) {
								var f = self.gf(rw.i+"-"+i+"-from")();
								var t = self.gf(rw.i+"-"+i+"-to")();
								result.times[rw.i][i] = {from:f,to:t};
							});
						}
					});
				}
				return result;
			}
		},
		"group": {
			fieldsStr: "id:i,name:s,type:s,image:Image,institution:Institution,contacts:a:Contact:0,access:a:Access:1,is_active:b,editable:b,feedCommentable:b,feedReadable:b,feedWritable:b,access_mode:s,settings:GroupSettings,subjects:a:Subject:0",
			saveStr: "id:i,name:s,type:s,institution_id:i,contacts:a:Contact:0,is_active:b,settings:GroupSettings",
			initialize: function(self) {
				self.institution_id = ko.computed(function() {
					return self.institution.exists()?self.institution.id():null;
				});
				self.groupTypeRw = ko.computed(function() {
					return _.find(config.groupTypes,{value:self.type()})||{};
				});
				self.mname = ko.computed(function() {
					if (self.groupTypeRw()) {
						return self.groupTypeRw().mname;
					}
					return null;
				});
			}
		},
		"group_settings": {
			fieldsStr: "date_start:s,date_end:s",
			initialize: function(self,rw) {
				var default_year = (new Date).getFullYear();
				if (moment(default_year+"-05-31","YYYY-MM-DD").utc()>moment().utc()) default_year--;
				self.default_date_start = default_year+"-09-01";
				self.default_date_end = (default_year+1)+"-05-31";
				self.date_start(rw.date_start||self.default_date_start);
				self.date_end(rw.date_end||self.default_date_end);
			},
			update: function(self,rw) {
				self.date_start(rw.date_start||self.default_date_start);
				self.date_end(rw.date_end||self.default_date_end);
			}
		},
		"holiday": {
			fieldsStr: "from:s,to:s,note:s"
		},
		"image": {
			fieldsStr: "id:s,name:s,path:s,type:s,configType:s,status:s,statusText:s",
			initialize: function(self,rw,parent) {
				self.crop = rw.crop||{};
				self.paths = rw.paths||{};
				self.sizes = rw.sizes||{};
				self.fileDataUris = rw.fileDataUris||{};
				self.file = rw.file||null;
				self.origImg = rw.origImg||null;
				if (!self.status()) self.status("uploaded");
				self.loading = ko.observable(false);
				self.config = ko.computed(function() {
					return config.images[self.configType()]||{};
				});
				self.pathUpdater = ko.observable(0);
				self.readPaths = ko.computed(function() {
					self.id();
					self.pathUpdater();
					var out = {};
					_.each(self.paths,function(path,name) {
						out[name] = path+(anticache.hasOwnProperty(path)?"?rand="+anticache[path]:"");
					});
					return out;
				});
				self.readBackgroundPaths = ko.computed(function() {
					var out = {};
					_.each(self.readPaths(),function(path,name) {
						out[name] = path?"url("+path+")":"none";
					});
					return out;
				})
				self.existsUpdater = ko.observable(0);
				self.exists = ko.computed(function() {
					self.existsUpdater();
					return self.id()||self.file;
				});
				self.runAnticacheFix = function() {
					_.each(self.paths,function(path) {
						anticache[path] = Math.floor(Math.random()*1000);
					});
					self.updatePaths();
				};
				self.updatePaths = function() {
					self.pathUpdater(Math.floor(Math.random()*1000));
				}
				self.updateExists = function() {
					self.existsUpdater(Math.floor(Math.random()*1000));
				}
			},
			update: function(self,rw) {
				if (rw.hasOwnProperty("crop")) self.crop = rw.crop;
				if (rw.hasOwnProperty("paths")) self.paths = rw.paths;
				if (rw.hasOwnProperty("sizes")) self.sizes = rw.sizes;
				if (rw.hasOwnProperty("fileDataUris")) self.fileDataUris = rw.fileDataUris;
				if (rw.hasOwnProperty("file")) self.file = rw.file;
				if (rw.hasOwnProperty("origImg")) self.origImg = rw.origImg;
				self.updatePaths();
				self.updateExists();
			},
			export: function(self,result,exportMode) {
				result.crop = self.crop;
				result.paths = self.paths;
				result.sizes = self.sizes;
				return result;
			}
		},
		"institution": {
			fieldsStr: "id:i,name:s,short_name:s,country_id:i,city_id:i,address:s,hl:s,access_mode:s,is_active:b,editable:b,feedCommentable:b,feedReadable:b,feedWritable:b,gridEditable:b,access:a:Access:1,contacts:a:Contact:0,settings:InstitutionSettings,image:Image",
			saveStr: "id:i,name:s,short_name:s,country_id:i,city_id:i,address:s,hl:s,contacts:a:Contact:0,settings:InstitutionSettings"
		},
		"institution_settings": {
			fieldsStr: "admin_only_group_create:b"
		},
		"mark": {
			fieldsStr: "id:i,mark:s,description:s,data_type:s,data_id:i,subject_id:i,member_id:i,date:s"
		},
		"mark_group": {
			fieldsStr: "id:i,type:s,description:s,importance:b,bg:s,color:s,date:s,data_type:s,data_id:i,subject_id:i",
			initialize: function(self,rw) {
				if (!self.type()) self.type("usual");
				self.style = ko.computed(function() {
					return {
						backgroundColor: self.bg()||"",
						color: self.color()||"",
						fontWeight: self.importance()?"bold":"normal"
					};
				});
				self.rwType = ko.computed(function() {
					return _.find(config.markGroup.types,{value:self.type()});
				});
			}
		},
		"member": {
			fieldsStr: "id:i,first_name:s,last_name:s,code:s,gender:i,image:Image,access:a:Access:1,data_type:s,data_id:i,institution:Institution,group:Group",
			saveStr: "id:i,first_name:s,last_name:s,data_type:s,data_id:i",
			initialize: function(self,rw) {
				self.mtype = ko.computed(function() {
					return self.group.exists()?(self.group.groupTypeRw()||{}).mname:"member";
				});
				self.fullName = ko.computed(function() {
					var ar = [];
					ar.push(self.first_name());
					ar.push(self.last_name());
					return _.compact(ar).join(" ");
				});
				self.fullNameRev = ko.computed(function() {
					var ar = [];
					ar.push(self.last_name());
					ar.push(self.first_name());
					return _.compact(ar).join(" ");
				});
				self.name = self.fullName;
				self.enabledAccess = ko.computed(function() {
					var out = [];
					self.access().forEach(function(a) {
						if (!a.nonact()) {
							out.push(a);
						}
					});
					return out;
				});
			}
		},
		"post": {
			fieldsStr: "id:i,commentable:b,target:PostTarget,user:Profile,text:s,html:s,files:a:File:0,images:a:Image:0,comments:a:Comment:1,editable:b,destroyable:b,created_at:dt,updated_at:dt",
			saveStr: "id:i,target:PostTarget,text:s",
			initialize: function(self) {
				self.sort = ko.computed(function() {
					return -self.id();
				});
			}
		},
		"post_list": {
			fieldsStr: "posts:a:Post:1"
		},
		"post_target": {
			fieldsStr: "id:i,type:s,name:s"
		},
		"profile": {
			fieldsStr: "id:i,first_name:s,last_name:s,code:s,email:s,email_verified:b,phone:s,phone_verified:b,editable:b,image:Image,is_admin:b,is_banned:b,is_online:b,lastonline_at:dt,settings:ProfileSettings,contacts:a:Contact:0,access:a:Access:0,enabledResources:a",
			saveStr: "id:i,first_name:s,last_name:s,code:s,settings:ProfileSettings,contacts:a:Contact:0",
			initialize: function(self) {
				self.fullName = ko.computed(function() {
					var ar = [];
					ar.push(self.first_name());
					ar.push(self.last_name());
					return _.compact(ar).join(" ");
				});
				self.fullNameRev = ko.computed(function() {
					var ar = [];
					ar.push(self.last_name());
					ar.push(self.first_name());
					return _.compact(ar).join(" ");
				});
				self.name = ko.computed(function() {
					if (self.fullName().length>0) return self.fullName();
					if (self.email().length>0) return self.email();
					if (self.phone().length>0) return self.phone();
					if (self.id()>0) return "#"+self.id();
					return "";
				});
				self.contactsAppended = ko.computed(function() {
					out = [];
					(self.contacts()||[]).forEach(function(c) {
						out.push(c);
					});
					if (self.email()) {
						out.unshift(new definedModels.Contact({type:"email",value:self.email(),verified:self.email_verified(),show_verified:true}));
					}
					if (self.phone()) {
						out.unshift(new definedModels.Contact({type:"phone",value:self.phone(),verified:self.phone_verified(),show_verified:true}));
					}
					return out;
				});
			}
		},
		"profile_settings": {
			fieldsStr: "contacts_visible:b"
		},
		"subject": {
			fieldsStr: "id:i,name:s,short_name:s,editable:b,access:a:Access:0,teachers:a:Profile,institution:Institution,group:Group",
			saveStr: "id:i,name:s,short_name:s,institution_id:i,group_id:i",
			initialize: function(self,rw) {
				self.institution_id = ko.computed(function() {
					return self.institution.exists()?self.institution.id():null;
				});
				self.group_id = ko.computed(function() {
					return self.group.exists()?self.group.id():null;
				});
			}
		},
		"work": {
//			fieldsStr: "id:i,type:s,text:s,textPrint:s,date:s,subject_id:i,editable:b,data_type:s,data_id:i,files:a:File:0",
			fieldsStr: "id:i,type:s,text:s,date:s,subject_id:i,editable:b,data_type:s,data_id:i,files:a:File:0",
			saveStr: "id:i,type:s,text:s,date:s,classDate:s,homeDate:s,homeDateSwitch:s,subject_id:i,data_type:s,data_id:i",
			initialize: function(self,rw) {
				if (!self.type()) self.type("home");
				/*self.textRows = ko.computed(function() {
					return (self.textPrint()||"").split(/\n/);
				});*/
				self.classDate = ko.observable(self.date()||moment().format("YYYY-MM-DD"));
				self.homeDate = ko.observable(self.date()||moment().format("YYYY-MM-DD"));
				self.homeDateSwitch = ko.observable(self.date()?"manual":"next");
			}
		}
	}

	var definedModels = {};

	var Model = function(){};

	Model.prototype.initialize = function(rw,modelStructure,parent) {
		var self = this;
		if (!rw) rw = {};
		this.modelStructure = _.extend({},modelStructure);
		if (this.modelStructure.hasOwnProperty("defaultValues")) {
			rw = _.extend({},this.modelStructure.defaultValues,rw);
		}
		this.modelStructure.fields = this.modelStructure.fieldsStr.split(/,/);
		this.modelStructure.fields.forEach(function(str) {
			var ar = str.split(/:/);
			var name = ar[0];
			var type = ar[1];
			var opt = ar[2];
			if (type=="i") {
				self[name] = ko.observable(Math.floor(rw[name])||0);
			}
			else if (type=="s"||type=="dt") {
				self[name] = ko.observable(rw[name]||"");
			}
			else if (type=="b") {
				self[name] = ko.observable(rw[name]==1);
			}
			else if (type=="a" && !opt) {
				self[name] = ko.observableArray(rw[name]||[]);
			}
			else if (type=="a") {
				var subdata = [];
				if (_.isArray(rw[name]) && rw[name].length>0) {
					rw[name].forEach(function(subRw) {
						var item = null;
						if (definedModels[opt]) {
							subdata.push(new definedModels[opt](subRw,self));
						}
						else console.error("Model "+self.sys_type+" array property of subtype "+opt+" is not defined.");
					});
				}
				subdata.sort(function(item1,item2) {
					if (item1.hasOwnProperty("sort") && item2.hasOwnProperty("sort")) {
						if (item1.sort()<item2.sort()) return -1;
						if (item1.sort()>item2.sort()) return 1;
						return 0;
					}
					return 0;
				});
				self[name] = ko.observableArray(subdata);
			}
			else if (type && definedModels[type]) {
				self[name] = new definedModels[type](rw[name],self);
			}
			else console.error("Model "+self.sys_type+" property "+name+" of type "+type+" is not defined.");
		});
		if (!this.hasOwnProperty("exists") && this.hasOwnProperty("id")) {
			this.exists = ko.computed(function() {
					return !!self.id();
			});
		}
		if (!this.hasOwnProperty("highlight") && !this.hasOwnProperty("highlighted")) {
			this.highlighted = ko.observable(false);
			this.highlight = function() {
				_.defer(function() {
					self.highlighted(true);
					_.delay(function() {
						self.highlighted(false);
					},2000);
				});
			}
		}
		this.modelStructure.fields.forEach(function(str) {
			var ar = str.split(/:/);
			var name = ar[0];
			var type = ar[1];
			if (type=="dt") {
				var nname = name.replace(/((\_).)/g,function(match) {
					return match.replace(/^\_/,"").toUpperCase();
				});
				self["_"+nname+"Trigger"] = ko.observable(0);
				self[nname+"Print"] = ko.computed(function() {
					self["_"+nname+"Trigger"]();
					(parent&&parent.hasOwnProperty("_"+nname+"Trigger"))?parent["_"+nname+"Trigger"]():null;
					var m = moment(self[name]());
					if (m.isValid()) return m.calendar();
					return "";
				});
				self[nname+"Trigger"] = function() {
					self["_"+nname+"Trigger"](Math.round(Math.random()*1000));
				}
			}
		});
		if (this.modelStructure.initialize && typeof(this.modelStructure.initialize)=="function") this.modelStructure.initialize(this,rw,parent);
	}

	Model.prototype.update = function(rw,force) {
		var self = this;
		if (!rw) rw = {};
		this.modelStructure.fields.forEach(function(str) {
			var ar = str.split(/:/);
			var name = ar[0];
			var type = ar[1];
			var opt = ar[2];
			var updateArrayPropertyById = (ar[3]>0);
			var updateArrayPropertyMode = rw.hasOwnProperty("$"+name+"UpdateMode")?rw["$"+name+"UpdateMode"]:"replace";
			if (!rw.hasOwnProperty(name)&&!force) return;
			if (!self.hasOwnProperty(name)) console.error("Model "+self.sys_type+" property "+name+" of type "+type+" is not defined during update.");
			else if (type=="i") {
				self[name](Math.floor(rw[name])||0);
			}
			else if (type=="s"||type=="dt") {
				self[name](rw[name]||"");
			}
			else if (type=="b") {
				self[name](rw[name]==1);
			}
			else if (type=="a" && !opt) {
				self[name](rw[name]||[]);
			}
			else if (type=="a") {
				if (updateArrayPropertyMode=="append") {
					if (_.isArray(rw[name]) && rw[name].length>0) {
						rw[name].forEach(function(subRw) {
							var item = null;
							if (updateArrayPropertyById) {
								item = _.find(self[name](),function(item){return item.id()==subRw.id});
							}
							if (item) {
								item.update(subRw);
							}
							else if (definedModels[opt]) {
								self[name].push(new definedModels[opt](subRw,self));
							}
							else console.error("Model "+self.sys_type+" array property of subtype "+opt+" is not defined.");
						});
					}
				}
				else {
					if (updateArrayPropertyById && self[name]().length>0) {
						// Update goes by id field that considered to be observable
						if (_.isArray(rw[name]) && rw[name].length>0) {
							var ind = {};
							self[name]().forEach(function(currentItem,i) {
								ind[currentItem.id()] = i;
							});
							var keep = {};
							rw[name].forEach(function(subRw) {
								if (ind.hasOwnProperty(subRw.id)) {
									self[name]()[ind[subRw.id]].update(subRw);
								}
								else if (definedModels[opt]) {
									self[name].push(new definedModels[opt](subRw,self));
								}
								else console.error("Model "+self.sys_type+" array property of subtype "+opt+" is not defined.");
								keep[subRw.id] = true;
							});
							for(var i=0;i<self[name]().length;i++) {
								if (!keep[self[name]()[i].id()]) {
									if (typeof(self[name]()[i].dispose)=="function") {
										self[name]()[i].dispose();
									}
									self[name].splice(i,1);
									i--;
								}
							}
						}
						else {
							self[name]().forEach(function(subObj) {
								if (subObj && typeof(subObj.dispose)=="function") {
									subObj.dispose();
								}
							});
							self[name]([]);
						}
					}
					else {
						// Rebuild everything
						self[name]().forEach(function(subObj) {
							if (subObj && typeof(subObj.dispose)=="function") {
								subObj.dispose();
							}
						});
						self[name]([]);
						if (_.isArray(rw[name]) && rw[name].length>0) {
							newData = [];
							rw[name].forEach(function(subRw) {
								if (definedModels[opt]) {
									newData.push(new definedModels[opt](subRw,self));
								}
								else console.error("Model "+self.sys_type+" array property of subtype "+opt+" is not defined.");
							});
							self[name](newData);
						}
					}
					self[name].sort(function(item1,item2) {
						if (item1.hasOwnProperty("sort") && item2.hasOwnProperty("sort")) {
							if (item1.sort()<item2.sort()) return -1;
							if (item1.sort()>item2.sort()) return 1;
							return 0;
						}
						return 0;
					});
				}
			}
			else if (self[name].update && typeof(self[name].update)=="function") {
				self[name].update(rw[name]);
			}
		});
		if (this.modelStructure.update && typeof(this.modelStructure.update)=="function") this.modelStructure.update(this,rw);
	}

	Model.prototype.export = function(exportMode) {
		var self = this;
		var out = {sys_type:self.sys_type};
		((exportMode=="save"&&this.modelStructure.saveStr)?this.modelStructure.saveStr.split(/,/):this.modelStructure.fields).forEach(function(str) {
			var ar = str.split(/:/);
			var name = ar[0];
			var type = ar[1];
			var opt = ar[2];
			if (!self.hasOwnProperty(name)) console.error("Model "+self.sys_type+" property "+name+" of type "+type+" is not defined during export.");
			else if (type=="i") {
				out[name] = Math.floor(self[name]());
			}
			else if (type=="s"||type=="dt") {
				out[name] = self[name]()||"";
			}
			else if (type=="b") {
				out[name] = self[name]()?1:0;
			}
			else if (type=="a" && !opt) {
				out[name] = self[name]()||[];
			}
			else if (type=="a") {
				out[name] = [];
				self[name]().forEach(function(subObj) {
					if (subObj && subObj.export && typeof(subObj.export)=="function") {
						out[name].push(subObj.export(exportMode));
					}
					else console.error("Model "+self.sys_type+" array property "+name+" includes object without export method defined.");
				});
			}
			else if (self[name].export && typeof(self[name].export)=="function") {
				out[name] = self[name].export(exportMode);
			}
		});
		if (this.modelStructure.export && typeof(this.modelStructure.export)=="function") out = this.modelStructure.export(this,out,exportMode);
		return out;
	}

	Model.prototype.dispose = function() {
		var self = this;
		_.each(this,function(property,i) {
			if (property) {
				if (ko.isObservable(property)) {
					if (_.isArray(property())) {
						property().forEach(function(subObj) {
							if (subObj && typeof(subObj.dispose)=="function") {
								subObj.dispose();
							}
						});
						if (ko.isWriteableObservable(property)) {
							property([]);
						}
					}
					if (property() && typeof(property().dispose)=="function") {
						property().dispose();
						if (ko.isWriteableObservable(property)) {
							property(null);
						}
					}
				}
				else {
					if (_.isArray(property)) {
						property.forEach(function(subObj) {
							if (subObj && typeof(subObj.dispose)=="function") {
								subObj.dispose();
							}
						});
					}
					if (property && typeof(property.dispose)=="function") {
						property.dispose();
					}
				}
			}
		});
/*
		this.modelStructure.fields.forEach(function(str) {
			var ar = str.split(/:/);
			var name = ar[0];
			var type = ar[1];
			var opt = ar[2];
			if (self.hasOwnProperty(name)) {
				if (self[name] && typeof(self[name].dispose)=="function") {
					self[name].dispose();
				}
				if (type=="a") {
					self[name]().forEach(function(subObj) {
						if (subObj && typeof(subObj.dispose)=="function") {
							subObj.dispose();
						}
					});
				}
			}
		});
*/
	}

	_.each(modelStructures,function(modelStructure,sys_type) {
		var modelName = camelize(sys_type);
		definedModels[modelName] = function(rw,parent) {
			this.sys_type = sys_type;
			this.class_name = modelName;
			this.initialize(rw,modelStructure,parent);
			this.isReady = true;
		}
		_.extend(definedModels[modelName].prototype,Model.prototype);
	});

	$.extend(definedModels.Image.prototype,Image.prototype);

	definedModels.clone = function(data,class_name) {
		if (definedModels[data.class_name||class_name]) {
			return new definedModels[data.class_name||class_name](data?data.export("clone"):null);
		}
		else {
			console.error("Model clone failed: model "+data.class_name+" is not defined in the bundle.");
			return null;
		}
	}

	return definedModels;
});