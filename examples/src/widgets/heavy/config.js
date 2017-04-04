define({
	systemUrl: "http://tevai.co",
	appUrl: "http://app.tevai.co",
	dataProvider: {
		api: "http://api.tevai.rag.lt"
	},
	privileges: {
		institution: "admin staff disabled delete",
		group: "teacher staff disabled delete",
		subject: "teacher staff disabled delete",
		member: "user disabled delete",
	},
	dict: {
		hl: "en",
		hls: [
			{value:"en",name_en:"English",name_ru:"Английский",name_lt:"Anglų"},
			{value:"ru",name_en:"Russian",name_ru:"Русский",name_lt:"Rusų"},
			{value:"lt",name_en:"Lithuanian",name_ru:"Литовский",name_lt:"Lietuvų"}
		]
	},
	contactTypes: [
		{value:"phone",wrap:true,wrapPrefix:"tel:",icon:"fa-phone-square"},
		{value:"email",wrap:true,wrapPrefix:"mailto:",icon:"fa-envelope"},
		{value:"website",wrap:true,icon:"fa-external-link"},
		{value:"skype",wrap:true,wrapPrefix:"skype:",icon:"fa-skype"}
	],
	grid: {
		work_days: [0,1,1,1,1,1,0],
		max_lessons: 6,
		zero_lesson: false,
		week_times_equal: 1
	},
	summernote: {
		focus: true,
		toolbar: [
			["style",["bold","italic","underline","clear"]],
			["paragraph",["style","ol","ul","paragraph"]],
			["insert",["table","hr"]]
		],
		minHeight: 100,
		popover: {
			image: [],
			link: [],
			air: []
		}
	},
	markGroup: {
		types: [
			{
				value: "usual",
				name_en: "Usual mark",
				name_ru: "Обычная оценка"
			},
			{
				value: "homework",
				name_en: "Homework",
				name_ru: "Домашняя работа"
			},
			{
				value: "test",
				name_en: "Test",
				name_ru: "Тест",
				short_en: "T",
				short_ru: "Т"
			},
			{
				value: "verification",
				name_en: "Verification work",
				name_ru: "Контрольная работа",
				short_en: "V",
				short_ru: "К"
			},
			{
				value: "final",
				name_en: "Final grade",
				name_ru: "Итоговая оценка",
				short_en: "F",
				short_ru: "И"
			}
		],
//		bgs: ["#ffffff","#7bd148","#5484ed","#a4bdfc","#46d6db","#7ae7bf","#51b749","#fbd75b","#ffb878","#ff887c","#dc2127","#dbadff","#e1e1e1"],
		bgs: [
			"#ffffff","#5e5e5e","#1ab394","#23c8c6","#1c84c6","#f8ac59","#ed5565",
			"#333333","#dddddd","#4de6c7","#bcffff","#4fb7f9","#ffffbf","#ffbbcb"
		],
		colors: ["#666666","#333333","#666666","#999999","#bbbbbb","#dddddd","#ffffff"]
	},
	groupTypes: [
		{
			value: "primary-school",
			priority: 1,
			mname: "student",
			mnames: "students"
		},
		{
			value: "high-school",
			priority: 2,
			mname: "student",
			mnames: "students"
		},
		{
			value: "pre-school",
			priority: 3,
			mname: "child",
			mnames: "children"
		},
		{
			value: "club",
			priority: 4,
			mname: "member",
			mnames: "members"
		}
	],
	modals: {
		"modals/welcome": {
			width: 300,
			css: "-solid-header -no-content-padding -transparent -slide-tiny"
		},
		"modals/login": {
			width: 300,
			css: "-solid-header -no-content-padding -transparent -slide-tiny"
		},
		"modals/register": {
			width: 300,
			css: "-solid-header -no-content-padding -transparent -slide-tiny"
		},
		"modals/confirm": {
			width: 300,
			css: "-solid-header -no-content-padding -transparent -slide-tiny"
		},
		"modals/signin": {
			width: 300,
			css: "-solid-header -no-content-padding -transparent -slide-tiny"
		},

		"forms/postEditor": {
			width: 800,
			css: "-slide-tiny -text-left",
			header: "modals.postEditor.header"
		},
		"forms/postDestroy": {
			width: 420,
			css: "-slide-tiny -text-left",
			header: "modals.postDestroy.header"
		},
		"forms/commentDestroy": {
			width: 420,
			css: "-slide-tiny -text-left",
			header: "modals.commentDestroy.header"
		},

		"modals/alert": {
			width: 300,
			css: "-slide-tiny"
		},
		"modals/userSearch": {
			width: 420,
			header: "modals.userSearch.header",
			css: "-slide-tiny"
		},
		"modals/markGroup": {
			width: 420,
			css: "-slide-tiny -text-left",
			header: "modals.markGroup.commonHeader"
		},
		"modals/mark": {
			width: 420,
			css: "-slide-tiny -text-left",
			header: "modals.mark.header"
		},
		"modals/editWork": {
			width: 800,
			css: "-slide-tiny -text-left",
			header: "modals.work.header"
		},

		"modals/restore": {
			width: 420,
			css: "-solid-header -no-content-top-padding",
			headerH: 3,
			header: "RESTORE PASSWORD"
		},
		"modals/newPassword": {
			width: 420,
			css: "-solid-header -no-content-top-padding -no-content-bottom-padding",
			headerH: 3,
			header: "SET NEW PASSWORD"
		},
		"modals/logout": {
			width: 420,
			header: "Log out",
			css: "-solid-header -no-content-top-padding",
			headerH: 2
		},
		"modals/signup": {
			width: 420,
		},
		"modals/simple": {
			width: 420,
			css: "-solid-header -no-content-top-padding",
			headerH: 3
		},
		"default": {
			width: 800,
			header: null,
			headerH: 4,
			hideDuration: 700,
			showDuration: 700,
			css: "-slide-tiny"
		}
	},
	images: {
		user: {
			sizes: {
				orig: {
					width: 600,
					height: 600,
					resizeBy: "in"
				},
				crop: {
					skipProcessing: true
				}
			}
		},
		member: {
			sizes: {
				orig: {
					width: 600,
					height: 600,
					resizeBy: "in"
				},
				crop: {
					skipProcessing: true
				}
			}
		},
		profile: {
			sizes: {
				orig: {
					width: 600,
					height: 600,
					resizeBy: "in"
				},
				crop: {
					skipProcessing: true
				}
			}
		},
		institution: {
			sizes: {
				orig: {
					width: 600,
					height: 600,
					resizeBy: "in"
				},
				crop: {
					skipProcessing: true
				}
			}
		},
		group: {
			sizes: {
				orig: {
					width: 600,
					height: 600,
					resizeBy: "in"
				},
				crop: {
					skipProcessing: true
				}
			}
		},
		blogImage: {
			sizes: {
				orig: {
					width: 1600,
					height: 1200,
					resizeBy: "in"
				},
				single: {
					width: 900,
					minHeight: 300,
					maxHeight: 900,
					resizeBy: "out",
					extend: "stretch", // fill or stretch, fill by default
					cropX: 1/2,
					cropY: 1/3
				},
				thumb: {
					width: 900,
					height: 560,
					resizeBy: "out",
					extend: "stretch",
					cropX: 1/2,
					cropY: 1/3
				}
			}
		}
	}
});
