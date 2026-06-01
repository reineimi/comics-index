// Note: Function args with underscore at the
// beginning are optional, ex: func(a, _b)
"use strict";
const va2 = {
	data: { sess:{} }, // Storage for accessible userdata (storage.loc/sess)
	ver: '1.92.104.237', // rebase(major) . changes(minor) . additions . fixes
	verTips: [
		"Va2 info: This project is using an old verion of Va2 library. You can check the new version here: <a href='https://github.com/reineimi/va2' target='_blank'>Va2 at GitHub</a>",
		"Va2 info: There's a new minor release. It's recommended to check your project for compatibility issues. "+
			"Please head over here: <a href='https://github.com/reineimi/va2' target='_blank'>Va2 at GitHub</a>",
		"Va2 info: There has been new additions to the library. You can take a look at them here: <a href='https://github.com/reineimi/va2' target='_blank'>Va2 at GitHub</a>"
	],
	verTipsStyle: 'color: #fb9; background: #321; padding: 0.5rem 1rem; border-radius: 1rem',
	env: { // "Global environment"
		init: [],
		v: { meta: { ver:'(unset)' } }, // Storage for vars
		proto: 0, // Enable Prototypes
		mods: 1, // Enable additional (Va2) or external modules
		preserve: {opt:1,data:1}, // Va2 keys to save to local/session storage
		date: { // Date localization (currently not used)
			month: [
				'January', 'February', 'March',
				'April', 'May', 'June',
				'July', 'August', 'September',
				'October', 'November', 'December'
			],
			weekday: [
				'Monday', 'Tuesday', 'Wednesday',
				'Thursday', 'Friday', 'Saturday', 'Sunday'
			]
		},
	},
	opt: { // Frontend options/settings, check {hints.opt} for info
		load_data_on_init: 1,
		verbose: 1,
		info: 1,
		dnd: 0,
		lang: 'EN',
		langs: { EN:1, ES:1, FR:1, RU:1, CN:1, KR:1, JP:1, },
		notif_time_mult: 0.025,
		maximize: 0,
		anicons: 0,
		twemoji: 0
	},
	mod: {}, // Modules (including module functions and non-accessible data)
	em: {}, // Storage for quick-access elements
	cl: {}, // Storage for sets of element classes
	f: {}, // Storage for re-usable/embeddable functions
	e: {}, // Storage for enums
	n: { // Storage for "magic numbers"
		loglvl: ['STDOUT', 'INFO', 'WARN', 'ERROR', 'CRASH'],
		loglvl_em: [
			"<x class='cskyblue'>STDOUT</x>",
			"<x class='cgreen'>INFO</x>",
			"<x class='corange'>WARN</x>",
			"<x class='cred'>ERROR</x>",
			"<x class='cpurple'>CRASH</x>"],
		display: ['block', 'flex', 'grid', 'table']
	},
	sess: {}, // Session info and data
	cur: { // Cursor: mouse/touch
		x: 0, y: 0,
		holding: 0,
		type: 'mouse',
		event: 'up',
		up: {x: 0, y: 0},
		down: {x: 0, y: 0},
		move: {x: 0, y: 0}
	},
	key: { // Keyboard
		name: '',
		id: 0,
		held: 0,
		event: 'up'
	},
	temp: { // Storage for temporary data
		history: [],
		clock: { global: 0 },
		extern: {},
		intervals: {},
		timeouts: {},
		fullscreen: 0,
		sort: {},
		inspect: {},
		slide: {},
		toggle: {},
		caret: {},
		em_root: {},
		enter: {},
		files: [],
		rawdata: [],
		term: []
	},
	hints: { // Text information about something
		opt: {
			load_data_on_init: 'Load your previous data on start if found',
			verbose: 'Prints and on-screen notifications for a lot of things',
			info: 'Shows various information in various places',
			dnd: 'Notifications: Do Not Disturb',
			lang: 'Current content language',
			langs: 'A list of available languages',
			notif_time_mult: 'Notification duration multiplier based on amount of text',
			maximize: 'Maximize <b>created</b> windows by default (on Va2 init or after creation)',
		},
	},
};

// Initial variables
va2.sess.id = uid();
va2.sess.date = date('-')+'_'+time('-');

// Accessible data handling
va2.f.saveData = ()=>{
	const data = {}
	va2.data.sess.id = va2.sess.id;
	va2.data.sess.date = va2.sess.date;
	loop(va2.env.preserve, (i)=>{
		data[i] = va2[i];
	});
	storage.loc.set('va2data', data);
}
va2.f.loadData = ()=>{
	const data = storage.loc.get('va2data');
	loop(data, (i,v)=>{
		if (va2.env.preserve[i]) {
			if (typeof(v)==='object') {
				loop(v, (i2,v2)=>{
					va2[i][i2] = v2;
				});
			} else {
				va2[i] = v;
			}
		}
	});
	if (va2.data.sess.id) {
		va2.sess.id = va2.data.sess.id;
	}
}
va2.f.exportData = ()=>{
	const data = storage.loc.get('va2data');
	mkfile(va2.sess.date+'_'+va2.sess.id+'.va2.data.json', JSON.stringify(data));
}
va2.f.importData = ()=>{
	getfile((_,data)=>{
		loop(data, (i,v)=>{
			if (va2.env.preserve[i]) {
				va2[i] = v;
			}
		});
		if (va2.data.sess.id) {
			va2.sess.id = va2.data.sess.id;
			va2.sess.date = va2.data.sess.date;
		}
		va2.f.saveData();
		window.location.reload();
	}, 'json');
}
if (qem('meta[name="va2meta"]')[0]) {
	va2.env.v.meta = JSON.parse(qem('meta[name="va2meta"]')[0].content);
}


	// ENVIRONMENT

// Compare current version with the metatag [va2meta]
function checkver() {
	console.log('Va2 version:		'+va2.ver);
	if (va2.env.v.meta.ver !== '(unset)') {
		const ver = va2.env.v.meta.ver;
		console.log('Va2 local version:	' + ver);
		const ver_numbers = [];
		loop(va2.ver.matchAll(/[0-9]+/g), (i,v)=>{ ver_numbers[i] = Number(v); });
		loop(ver.matchAll(/[0-9]+/g), (i,v)=>{
			if (Number(v) < ver_numbers[i]) {
				if (va2.verTips[i]) {
					console.log('%c'+va2.verTips[i], va2.verTipsStyle);
					if (va2.opt.verbose) {
						notify(va2.verTips[i], 'cwhite brown ul-a');
					}
				}
				return 1;
			}
		});
	}
}

// A batch of Promises
async function promises(...awaitable) {
	await Promise.all(awaitable).then((data)=>{
		return data;
	});
}

/* Initiate the script;  args:
	proto
	anicons
	twemoji
*/
function init(_args) {
	const args = (_args || {});
	loop(va2.env.init, (_,f)=>{ f(); });

	// Enable Prototypes
	if (args.proto || va2.env.proto) {
		enable_prototypes();
	}

	// Add anicons/twemoji
	if (args.anicons || va2.opt.anicons) {
		extern.css('https://res.cloudinary.com/dr6lvwubh/raw/upload/v1581441981/Anicons/anicons-regular.css', 'anicons');
	}
	if (args.twemoji || va2.opt.twemoji) {
		extern.js('https://unpkg.com/twemoji@latest/dist/twemoji.min.js" crossorigin="anonymous', 'twemoji');
	}
}

// Load external JS/CSS/File
// Note 1: Working dir path is: './' or ''
// Note 2: JS/CSS returns style element, File returns file data
const extern = {
	js: async function(data_or_path_or_url, _id) {
		const str = data_or_path_or_url;
		const id = _id || '(generic)';
		const em = document.createElement('script');
		let UID;
		em.async = true;

		//--> URL/PATH
		if (str.match(/https:/g) || str.match(/[.]js[o]?[n]?$/g)) {
			UID = 'ext.JS:' + id;
			em.src = str;
			log(1, 'extern.js:loaded :: '+UID);
		}
		else { //--> DATA
			UID = 'ext.JS:' + id;
			em.innerHTML = `"use strict"; try{ ${str} } catch(err) { log(3, err); }`;
		}

		if (emi(UID)) { rm(UID); }
		em.id = UID;
		document.head.append(em);
		return em;
	},
	css: function (data_or_path_or_url, _id) {
		const str = data_or_path_or_url;
		const id = _id || '(generic)';
		const root = document.head;
		let UID, em;

		if (str.match(/^https:/g) || str.match(/^(.*?)\.css$/g)) { //--> URL/PATH
			UID = 'ext.CSS:' + id;
			em  = document.createElement('link');
			em.rel = 'stylesheet';
			em.href = str;
		}
		else { //--> DATA
			UID = 'ext.CSS:' + id;
			em = document.createElement('style');
			em.innerHTML = str;
		}

		if (emi(UID)) { rm(UID); }
		em.id = UID;
		root.appendChild(em);
		log(1, 'extern.css:loaded :: '+UID);
		return em;
	},
	file: async function(path_or_url_or_emiToReplace, _callback_func, _is_json) {
		let targ = path_or_url_or_emiToReplace;
		let filedata;

		if (emi(targ)) { // Upload to element
			const fr = new FileReader();
			const inp = create('input', {type: 'file'});
			inp.style.display = 'none';
			inp.click();
			inp.onchange = async ()=>{
				let fdata = fr.result;
				fr.onload = ()=>{
					let r = fr.result;
					emi(targ).innerHTML = r;
					va2.temp.extern.file = r;
					if (_callback_func) { _callback_func(r); }
				}
				await fr.readAsText(inp.files[0]);
			};
			rm(inp); return 1;
		}

		try {
			await fetch(targ)
			.then((r_file)=>{
				let f;
				if (_is_json) {
					f = r_file.json();
				} else {
					f = r_file.text();
				}
				return f;
			}).then((data)=>{
				filedata = data;
			});
		} catch {
			log(3, 'extern.file :: URL response failure');
			return 0;
		}
		return filedata;
	}
}

/* Select and upload external file(s)
	(func) _fn: Function to put results to;
		header includes: (filename, result)
	(str) _mode: What to process data as:
		em: Element
		json: JSON
		raw: Plain text
	(str) _multiple: Can select multiple files
*/
function getfile(fn, _mode, _multiple) {
	if (!fn || type(fn) !== 'function') {
		log(2, 'getfile :: File header does not include a function');
		return false;
	}
	const mode = _mode || 'em';
	const em = create('input', {
		className: 'hide',
		type: 'file',
		multiple: _multiple,
		onchange: ()=>{
			loop(em.files, (i,v)=>{
				const reader = new FileReader();
				// Pass output to function
				reader.addEventListener('load', ()=>{
					if (mode === 'em') {
						const obj = document.createElement('object');
						obj.data = reader.result;
						fn(i, obj);
					}
					else if (mode === 'json') {
						if (JSON.parse(reader.result)) {
							fn(i, JSON.parse(reader.result));
						}  else {
							log(3, 'The specified data cannot be processed.');
						}
					}
					else { fn(i, reader.result); }
				});
				// Set output format
				if (mode === 'em') {
					reader.readAsDataURL(v);
				} else {
					reader.readAsText(v);
				}
			});
			em.remove();
		},
		oncancel: ()=>{ em.remove(); }
	});
	em.click();
}

// Make and download a file
function mkfile(filename, str_or_obj_or_blob) {
	const rel = document.createElement('a');
	let blob = str_or_obj_or_blob;

	if (typeof blob === 'string') {
		blob = new Blob([blob], {type: 'text/plain'});
	}
	else if ((typeof blob === 'object') && !(blob instanceof Blob)) {
		let json_str = JSON.stringify(blob);
		blob = new Blob([json_str], {type: 'application/json'});
	}

	let url = URL.createObjectURL(blob);
	rel.href = url;
	rel.download = filename;
	document.body.appendChild(rel);
	rel.click();  rel.remove();
	URL.revokeObjectURL(url);
}

// Precise typeof call
function type(item) {
	if (item === 0) { return 'number'; }
	if (item !== null) {
		if (typeof item === 'object') {
			if (Array.isArray(item)) {
				return 'array';
			}
			return 'object';
		}
		return (typeof item);
	} else {
		return 'null';
	}
}

// Stringify anything
function tostring(any) {
	if (typeof any === 'undefined') {
		return 'undefined';
	} else if (any === null) {
		return 'null';
	} else {
		try {
			return any.toString();
		} catch {
			return 'unknown_type';
		}
	}
}

// Toggle the state of anything (0 or 1)
function toggle(id, _func) {
	if (va2.temp.toggle[id]) {
		va2.temp.toggle[id] = 0;
	} else {
		va2.temp.toggle[id] = 1;
	}
	if (_func) {
		_func(va2.temp.toggle[id]);
	}
}

// Get file name from PATH
function getfname(path, _withExt) {
	if (_withExt) {
		return path.match(/[^/]*$/gm)[0]
	} else {
		return path.replace(/\.[^.]*$/gm, '').match(/[^/]*$/gm)[0];
	}
}

// Sub a string or number
function cut(val, start, _plus) {
	let end = _plus || val.length;
	let it = val.toString().substring(start, end);
	if (typeof val === 'number') {
		return Number(it);
	}
	return it;
}

// Get length of anything
function len(item) {
	if (typeof item === 'number') {
		return item.toString().length;
	} else if (typeof item === 'string') {
		return item.length;
	} else if (typeof item === 'object') {
		if (Array.isArray(item)) {
			return item.length;
		}
		// Compatibility variant
		const _items = [];
		for (const [i,v] of Object.entries(item)) {
			_items.push(i);
		}
		return _items.length;
	}
}

// Regular expr. from string
function regex(str, _arg) {
	return new RegExp(str, _arg);
}

// Merge two identical variables (overwrite first)
function merge(a, b) {
	try {
		if (typeof a === 'string') {
			a = a+' '+b;
		} else if (typeof a === 'number') {
			let A = a.toString();
			let B = b.toString();
			a = Number(a+b);
		} else if (typeof a === 'object') {
			loop(b, (i,v)=>{ a[i] = v; });
		}
	} catch {
		log(3, 'merge :: Variables are not identical');
		return 0;
	}
	return a;
}

// Add metadata to variable's prototype
function mdata(Var, metadata) {
	merge(Var.prototype, metadata);
}

// Create a new object with prototype metadata
// ex:  const cat = Obj('cat');
function Obj(name, _data, _addmeta) {
	let new_obj;
	let metadata = {
		Name: name,
		Type: 'Object',
		Created: time()
	};
	if (_addmeta) { merge(metadata, _addmeta); }
	if (_data) { merge(new_obj, _data); }
	loop(metadata, (i,v)=>{
		new_obj.prototype[i] = v;
	});
}
// ex:  const cat = Arr('cat', 0, {Info: 'It meows'});
function Arr(name, _data, _addmeta) {
	const metadata = { Type: 'Array' };
	if (_addmeta) { merge(metadata, _addmeta); }
	Obj(name, _data, metadata);
}

// Strip data from base64 URL
function url64(url) {
	return url.replace(/^data:[A-z]+\/?[A-z]+;base64,[ ]?/g, '');
}

// Generate a simple unique id, optionally put a string in the front
function uid(_str) {
	return (_str || '')+
	Math.floor(Math.random() * 0xFFFFFFFFFFFF).toString(16).padEnd(12, '0');
}

// Convert array to enum
function enumerate(arr) {
	const new_enum = {};
	loop(arr, (i,v)=>{
		new_enum[v] = i+1;
	});
	return new_enum;
}


	// TIMERS & ITERATIONS

// A timer in ticks, returns 1 (true) if passed
// Set a unique id if the timer is not global
function clock(tick, _id) {
	let t;
	if (uid && !va2.temp.clock[_id]) {
		va2.temp.clock[_id] = 0;
	}
	if (va2.temp.clock[_id]) {
		va2.temp.clock[_id]++;
		t = va2.temp.clock[_id];
		if (t === tick) {
			va2.temp.clock[_id] = 0;
			return 1;
		}
	} else {
		va2.temp.clock.global++;
		t = va2.temp.clock.global;
		if (t === tick) {
			va2.temp.clock.global = 0;
			return 1;
		}
	}
}

// Intervals with IDs and seconds
const interval = {};
interval.set = function(id, func, sec) {
	let ms = sec*1000;
	va2.temp.intervals[id] = {
		self: setInterval(func, ms),
		func: func,
		ms: ms
	};
}
// Check if interval exists
interval.get = function(id) {
	if (va2.temp.intervals[id]) {
		return va2.temp.intervals[id];
	}
	return false;
}
// Remove the interval
interval.del = function(id) {
	if (va2.temp.intervals[id]) {
		clearInterval(va2.temp.intervals[id].self);
		delete va2.temp.intervals[id];
	}
}
// Update and restart the interval
interval.reset = function(id, _func, _sec) {
	let it = va2.temp.intervals[id];
	let func = _func || it.func;
	let ms = _sec || it.ms;
	clearInterval(it.self);
	delete it.self;
	it.self = setInterval(func, ms*1000);
	return it;
}

// Timeouts with IDs and seconds
const timeout = {};
timeout.set = function(id, func, sec) {
	let ms = sec*1000;
	va2.temp.timeouts[id] = {
		self: setTimeout(func, ms),
		func: func,
		ms: ms
	};
}
// Check if timeout exists
timeout.get = function(id) {
	if (va2.temp.timeouts[id]) {
		return va2.temp.timeouts[id];
	}
	return false;
}
// Remove the timeout
timeout.del = function(id) {
	if (va2.temp.timeouts[id]) {
		clearTimeout(va2.temp.timeouts[id].self);
		delete va2.temp.timeouts[id];
	}
}
// Update and restart the timeout
timeout.reset = function(id, _func, _sec) {
	let it = va2.temp.timeouts[id];
	let func = _func || it.func;
	let ms = _sec || it.ms;
	clearTimeout(it.self);
	delete it.self;
	it.self = setTimeout(func, ms*1000);
	return it;
}

// Return current time/date/timeElapsed as a string
va2.env.sessionStart = new Date();
function time(_separator) {
	let x = (_separator || ':');
	if (_separator === '') { x = ''; }
	let now = new Date();
	let h = now.getHours();
	let m = now.getMinutes();
	let s = now.getSeconds();
	if (h.toString().length==1) {h = '0'+h;}
	if (m.toString().length==1) {m = '0'+m;}
	if (s.toString().length==1) {s = '0'+s;}
	return h+x+m+x+s;
}
function date(_separator) {
	let x = (_separator || '/');
	if (_separator === '') { x = ''; }
	let now = new Date();
	let dd = now.getDate();
	let mm = now.getMonth()+1;
	let yyyy = now.getFullYear();
	if (dd.toString().length==1) {dd = '0'+dd;}
	if (mm.toString().length==1) {mm = '0'+mm;}
	return yyyy+x+mm+x+dd;
}
function timedate() { return date()+', '+time(); }
function elapsed() {
	const current = new Date();
	const dif = (current - va2.env.sessionStart)/1000;
	const s = Math.floor(dif%60);
	const m = Math.floor((dif/60)%60);
	const h = Math.floor((dif/60)/60)%24;
	return h+'h '+m+'m '+s+'s';
}

// Promise simplified
// ex:  await wait(0.5, ()=>{}, ()=>{});
function wait(sec, _func_before, _func_after) {
	return new Promise((done) => {
		if (_func_before) { _func_before(); }
		setTimeout(() => {
			done(1);
		}, sec*1000);
	}).then((finalize) => {
		if (_func_after) { _func_after(); }
	});
}

// Flexible iteration loop (awaitable)
// target - Array, Object or Number
// ex:  loop(myArr, (i,v)=>{ console.log(i,v) });
function loop(target, func) {
	let item = target;
	let n = 0;
	if (tostring(target).match('RegExp')) {
		item = [...item];
	}
	return new Promise((r) => {
		if (type(item) === 'number') {
			for (let i=0; i<item; i++) { func(i); }
		}
		else if (type(item) === 'object') {
			for (const [i,v] of Object.entries(item)) {
				let f = func(i,v,n);
				if (f==true) { return f; }
				n++;
			}
		} else if (type(item) === 'array') {
			for (let i=0; i<item.length; i++) {
				let v = item[i];
				let f = func(i,v);
				if (f==true) { return f; }
			}
		}
	}).then((done) => {
		return 1;
	});
}

// Recursive object pairs loop
function rloop(obj, func) {
	loop(obj, (i,v)=>{
		func(i,v);
		if (typeof v === 'object') {
			rloop(v, func);
		}
	});
}

// Find a value in object recursively
function oseek(obj, ind_or_val) {
	let r = ind_or_val;
	let found;
	rloop(obj, (i,v)=>{
		if ((i === r) || (v === r)) {
			found = [i,v];
		}
	});
	return found;
}

// Replace a value in object recursively
function orep(obj, ind_or_val, _newval) {
	loop(obj, (i,v)=>{
		if ((i===ind_or_val) || (v===ind_or_val)) {
			if (_newval || _newval === 0) {
				obj[i] = _newval;
			}
		} else if (typeof v === 'object') {
			orep(v, ind_or_val, _newval);
		}
	});
}

// Copy contents of one obj/arr to another (for elements use merge())
function oclone(from_obj, to_obj) {
	if (!from_obj || !to_obj) {
		return 0;
	}
	loop(from_obj, (i,v)=>{
		//to_obj[i] = v;
		if (type(v) === 'object') {
			if (type(to_obj[i]) !== 'object') {
				to_obj[i] = {};
			}
			oclone(v, to_obj[i]);
		} else if (type(v) === 'array') {
			if (type(to_obj[i]) !== 'array') {
				to_obj[i] = [];
			}
			oclone(v, to_obj[i]);
		} else {
			to_obj[i] = v;
		}
	});
}

// Sort object keys in alphabet order
// Returns an array of two indexes -> [int, str]
// For example: [1: 'a', 2: 'b'] or {a: 0, b: 0}
function osort(obj) {
	const _index = [],
		_clone = {};

	_clone.merge(obj);

	loop(obj, (i,v)=>{
		_index.push(i);
		delete obj[i];
	});
	_index.sort();

	loop(_index, (_,i)=>{
		obj[i] = _clone[i];
	});

	return _index;
}


	// CONSOLE

// Push a log entry in the console and the terminal
// lvl: 0=stdout 1=info 2=warn 3=error 4=crash
function log(lvl, ...data) {
	loop(data, (_,msg)=>{
		const entry = `[<x class='cfx'>${time()}</x>][${va2.n.loglvl_em[lvl]}]: ${(msg || 0).toString()}<br>`;
		va2.temp.term.push(entry);
		loop(qem('.va2term'), (_,em)=>{
			em.innerHTML = em.innerHTML + entry;
		});
		console.log(`[${time()}][${va2.n.loglvl[lvl]}]:`, msg);
		if (notify && va2.opt.verbose) {
			if (lvl===2) {
				notify(msg, 'cwhite orange');
			} else if (lvl===3) {
				notify(msg, 'cwhite red');
			}
		}
	});
}

// Print any data in the console and the terminal
function print(...data) {
	loop(data, (_,msg)=>{
		const entry = `[${time()}]: ${(msg || 0).toString()}<br>`;
		va2.temp.term.push(entry);
		loop(qem('.va2term'), (_,em)=>{
			em.innerHTML = em.innerHTML + entry;
		});
		console.log(`[${time()}]:`, msg);
		if (va2.opt.verbose) {
			notify(`[${time()}]: ${msg}`);
		}
	});
}

// Print formatted with CSS data in the console and the terminal
function printf(data, css_style) {
	const entry = `[${time()}]:<div style="${css_style}">${tostring(data)}</div>`;
	va2.temp.term.push(entry);
	loop(qem('.va2term'), (_,em)=>{
		em.innerHTML = em.innerHTML + entry;
	});
	console.log('%c'+data, css_style);
}

// Throw a WARN per func_name that element does not exist
function em_err(func_name, em_id) {
	va2.opt.verbose = false;
	log(2, `${func_name} :: Element "${em_id}" does not exist`);
	va2.opt.verbose = true;
}


	// ELEMENTS

// Return element (or) by id (emi = em or id)
// (Now also supports em.dataset.uid)!
// This function will be represented as arguments [em_i] and [root_em_i] further on
function emi(em_or_id) {
	if (typeof em_or_id === 'object') {
		return em_or_id;
	} else if (typeof em_or_id === 'string') {
		if (em_or_id.match(' ')) { // No spaces for id/uid
			log(2, 'emi :: Found spaces in the string argument');
		} else if (document.getElementById(em_or_id)) {
			return document.getElementById(em_or_id);
		} else if (document.querySelector(`[data-uid="${em_or_id}"]`)) {
			return document.querySelector(`[data-uid="${em_or_id}"]`);
		}
	}
}

// A shortcut for .querySelectorAll
function qem(css_path) { return document.querySelectorAll(css_path); }

// Get a list of elements with the specified CSS class:
// emcl('').loop((i,em)=>{ ... });
function emcl(classname) {
	if (document.getElementsByClassName(classname)) {
		return document.getElementsByClassName(classname);
	}
}

// Return all children of the element by tag
function tags(tag, root_em_i) {
	const root = root_em_i || document.body;
	if (emi(root)) {
		return [...emi(root).querySelectorAll(tag.toUpperCase())];
	} else {
		em_err('tags',  root);
	}
}

// Toggle the state of an element (0 or 1)
function emtoggle(em_i, _func) {
	let em = emi(em_i);
	if (em) {
		if (em.dataset.condition === '1') {
			em.dataset.condition = 0;
		} else {
			em.dataset.condition = 1;
		}
		if (_func) {
			_func(Number(em.dataset.condition));
		}
	} else {
		em_err('em_toggle', tostring(em_i));
	}
}

// Return nth: parent (root) / child (item)
function emroot(em_i, _level) {
	let em = emi(em_i);
	let lvl = _level || 1;
	if (em && em.tagName) {
		let str = '.parentNode';
		return eval('em'+str.repeat(lvl));
	} else {
		log(2, 'emroot :: Element not found');
	}
}
function emitem(em_i, _number) {
	let em = emi(em_i);
	let num = _number || 1;
	if (em && em.tagName) {
		return em.children[num-1];
	} else {
		log(2, 'emitem :: Element not found');
	}
}

// Do something with all children of an element
function emitems(em_i, _func) {
	const em = emi(em_i),
		_items = [];
	for (const child of em.children) {
		if (_func) { _func(child); }
		_items.push(child);
	}
	return _items;
}

// Change root of an element or return it back
function emchroot(em_i, root_em_i, _switch_between) {
	let em = emi(em_i);
	let root = emi(root_em_i);
	if (em) {
		let oldroot = va2.temp.em_root[em.dataset.uid];
		if (!oldroot) {
			em.dataset.uid = uid('em_');
			va2.temp.em_root[em.dataset.uid] = emroot(em, 1);
		}
		if (!root) {
			if (oldroot) { oldroot.appendChild(em); }
		} else {
			if (_switch_between && (root === emroot(em, 1))) {
				if (oldroot) {
					oldroot.appendChild(em);
				} else {
					log(2, 'em_chroot :: Specified root is the same as current');
				}
			} else {
				root.appendChild(em);
			}
		}
	} else {
		em_err('em_chroot', tostring(em_i));
	}
}

// Set CSS style property for the element; args: [[prop,val],]
function emprop(em_i, args) {
	const em = emi(em_i);
	if (!em || !args) {return 0;}
	loop(args, (_,props)=>{
		em.style.setProperty(props[0], props[1], 'important');
	});
}

// Return calculated properties of the element
function embox(em_i) {
	const em = emi(em_i),
		rect = em.getBoundingClientRect();
	const box = {
		x: rect.left,
		x2: rect.right,
		y: rect.top,
		y2: rect.bottom,
		w: em.offsetWidth,
		h: em.offsetHeight
	};
	box.cx = box.x + (box.w/2);
	box.cy = box.y + (box.h/2);
	return box;
}

// Change tag name of an element
function retag(em_i, new_tag) {
	const em = emi(em_i);
	const root = emroot(em);
	const it = create(new_tag.toUpperCase(), {}, root);
	loop(em.attributes, (i,v)=>{
		it.setAttribute(v.name, v.value);
	});
	while (em.firstChild) {
		it.appendChild(em.firstChild);
	}
	em.replaceWith(it);
	return it;
}

// Find all elements, ids of which contains...
function idmatch(str) {
	return document.querySelectorAll(`[id*="${str}"]`);
}

// Check if element is at position of the cursor
function findem(em_i) {
	let em = emi(em_i);
	let found = false;
	loop(inspect(), (_,em)=>{
		if (em.id == id) {
			found = true;
		}
	});
	return found;
}

// List all elements at the specified coords or cursor position
function inspect(_x, _y) {
	const box = {};
	let x = _x, y = _y;
	if (!_x) { x = va2.cur.x; }
	if (!_y) { y = va2.cur.y; }

	if (document.elementsFromPoint) {
		let queue = document.elementsFromPoint(x, y);
		loop(queue, (i,v)=>{
			if ((v.tagName!=='HTML') && (v.tagName!=='BODY') && (v.tagName!=='MAIN')
			&& (!v.id || !v.id.match('va2')) && (!v.className.match('va2'))) {
				box[queue.indexOf(v)] = v;
			}
		});
	} else {
		alert('Your browser does not support "document.elementsFromPoint()".');
	}

	return box;
}

// Create a new element
function create(tag, _data, _root_em_i) {
	let em = document.createElement(tag || 'div');
	let _root = _root_em_i || document.body;
	if (_data) {
		loop(_data, (i,v)=>{
			em[i] = v;
		});
	}
	emi(_root).appendChild(em);
	return em;
}

// Make element(s) within the specified root element
// (Set [root_em_i] to 0 to use document.body)
function mk(root_em_i, ...html_or_em) {
	let em;

	if (emi(root_em_i)) {
		em = emi(root_em_i);
	} else {
		em = document.body;
	}

	loop(html_or_em, (i,v)=>{
		if (typeof v === 'object') {
			em.appendChild(v);
		} else if (typeof v === 'string') {
			em.insertAdjacentHTML('beforeend',v);
		}
	});
}

// Remove element(s)
function rm(...em_i) {
	loop(em_i, (_, em)=>{
		if (emi(em)) { emi(em).remove(); }
	});
}

// Make element(s) empty
function wipe(...em_i) {
	loop(em_i, (_, em)=>{
		if (emi(em)) {
			emi(em).innerHTML = '';
		} else {
			em_err('wipe',  em);
		}
	})
}

// Add/remove class of an element
function addclass(em_i, ...classnames) {
	let em = emi(em_i);
	if (em) {
		loop(classnames, (_,cl)=>{
			if (!em.classList.contains(cl)) {
				em.classList.add(cl);
			}
		});
	} else {
		em_err('setclass', em_i);
	}
}
function rmclass(em_i, ...classnames) {
	let em = emi(em_i);
	if (em) {
		loop(classnames, (_,cl)=>{
			if (em.classList.contains(cl)) {
				em.classList.remove(cl);
			}
		});
	} else {
		em_err('setclass', em_i);
	}
}
// Same but switch between add and rm per call
function setclass(em_i, ...classnames) {
	let em = emi(em_i);
	if (em) {
		loop(classnames, (_,cl)=>{
			if (em.classList.contains(cl)) {
				em.classList.remove(cl);
			} else {
				em.classList.add(cl);
			}
		});
	} else {
		em_err('setclass', em_i);
	}
}
// Check if element has a specified class
function getclass(em_i, classname) {
	return emi(em_i).classList.contains(classname);
}

// Add class to an element on hover
// Optionally trigger on- and off- hover funcs
function hover(em_i, css_class, _func_on, _func_off) {
	const em = emi(em_i);
	if (em) {
		em.onmouseover = ()=>{
			if (css_class) { addclass(em, css_class); }
			if (_func_on) { _func_on(em); }
		}
		em.onmouseout = ()=>{
			if (css_class) { rmclass(em, css_class); }
			if (_func_off) { _func_off(em); }
		}
	} else {
		em_err('hover', em_i);
	}
}

// Show/hide element(s)
function show(...em_i) {
	loop(em_i, (_, id)=>{
		if (emi(id)) {
			rmclass(emi(id), 'hide');
		} else {
			em_err('show',  id);
		}
	});
}
function hide(...em_i) {
	loop(em_i, (_, id)=>{
		if (emi(id)) { addclass(emi(id), 'hide'); }
		else { em_err('hide',  id); }
	});
}

// Toggle visibility (display) of an element
function tshow(...em_i) {
	loop(em_i, (_, id)=>{
		if (emi(id)) {
			setclass(emi(id), 'hide');
		} else {
			em_err('tshow', id);
		}
	});
}

// Show any element on hover
function hshow(root, ...em_i) {
	emi(root).onmouseover = ()=>{
		loop(em_i, (_, id)=>{ show(id); });
	}
	emi(root).onmouseout = ()=>{
		loop(em_i, (_, id)=>{ hide(id); });
	}
}

// Move element by dragging
function dragmove(em_i, _method) {
	const method = _method || 'position';
	let em = emi(em_i);
	em.addEventListener('mouseover', ()=>{
		if (((va2.cur.type == 'touch') && (va2.cur.event == 'move'))
		|| ((va2.cur.type == 'mouse') && va2.cur.held)) {
			let x = -em.dataset.startX - -va2.cur.x;
			let y = -em.dataset.startY - -va2.cur.y;
			em.dataset.x = x;
			em.dataset.y = y;
			if (method === 'transform' || method === 'translate') {
				em.style.transform = `translate(${x}px, ${y}px)`;
			} else if (method === 'position') {
				em.style.left = `${x}px`;
				em.style.top = `${y}px`;
			}
		} else {
			em.dataset.startX = va2.cur.x - (Number(em.dataset.x) || 0);
			em.dataset.startY = va2.cur.y - (Number(em.dataset.y) || 0);
		}
	});
}
// Reset drag position
function dragreset(em_i) {
	let em = emi(em_i);
	em.style.transform = null;
	em.style.left = null;
	em.style.top = null;
	em.dataset.x = '0';
	em.dataset.y = '0';
}

// Format links in text
function links(html_str) {
	const reg = /(http[s]?\:((\/\/)|(&#47;&#47;))(.*?))([ ,:\[\]'"\<\>\n]|$)/gm;
	const links = html_str.matchAll(reg);
	loop(links, (_,v)=>{
		html_str = html_str.replace(v[1],
			`<a href='${v[1]}' target='_blank'>${v[1]}</a>`);
	});
	return html_str;
}

// Format hexadecimals into coloured inline elements
function hexcol(str_or_hex) {
	const hex = tostring(str_or_hex).match(/((0x|(?<!&)#)[0-9a-fA-F]{3,8})/gm);
	loop(hex, (_,v)=>{
		let cssv = v.replace('0x', '#');
		str_or_hex = str_or_hex.replaceAll(v, `<i style='color: ${cssv}'>${v}</i>`);
	});
	return str_or_hex;
}

// Input: On Enter key press event (passes em to func)
function enter(em_i, func) {
	const em = emi(em_i);
	if (em) {
		// Assign UID for later use in va2.temp
		if (!em.dataset.uid) {
			em.dataset.uid = uid('__input::');
		}
		// Clear previous event
		let data = va2.temp.enter[em.dataset.uid];
		if (data) {
			em.removeEventListener('keydown', data);
			delete va2.temp.enter[em.dataset.uid];
		}
		// Assign new event
		data = (e)=>{
			if (e.keyCode === 13) { func(em); }
		}
		em.addEventListener('keydown', data);
		va2.temp.enter[em.dataset.uid] = data;
	}
}

// Scroll to coordinates or element
function scrollto(em_i_or_x_coord, _y_coord) {
	const dest = em_i_or_x_coord;
	if (emi(dest)) {
		emi(dest).scrollIntoView();
	} else if (type(dest) === 'number') {
		scrollTo(dest, _y_coord || 0);
	}
}

// Animate an element, optionally set a timer to clear the animation
function ani(em_i, animation, _timer_sec, _hide) {
	const em = emi(em_i);
	if (em) {
		if (!em.dataset.ani) {
			em.dataset.ani = uid('ani_');
		}
		em.style.animation = null;
		void em.offsetWidth; // Animation reflow
		em.style.animation = animation;
		if (_timer_sec) {
			timeout.del(em.dataset.ani);
			timeout.set(em.dataset.ani, ()=>{
				em.style.animation = null;
				if (_hide) { hide(em); }
			}, _timer_sec);
		}
	} else { em_err('ani', em_i); }
}

// Change context menu of an element
function ctxt(em_i, func) {
	const em = emi(em_i);
	em.addEventListener('contextmenu', function(e) {
		e.preventDefault();
		func(em);
		return false;
	}, false);
}

// Scroll element horizontally
function scrollx(em_i) {
	const em = emi(em_i);
	if (!em) {return 0;}
	em.addEventListener('wheel', (e)=>{
		e.preventDefault();
		em.scrollLeft += e.deltaY;
	});
	addclass(em, 'scrollx');
}

// Set global CSS theme
const themes = { light:1, dark:1 }
function themeset(_theme_name) {
	const root = document.body;
	if (_theme_name) {
		const id = 'theme-'+_theme_name;
		loop(themes, (i,v)=>{
			if ('theme-'+i === id) {
				addclass(root, 'theme-'+i);
			} else {
				rmclass(root, 'theme-'+i);
			}
		});
	} else {
		if (!getclass(root, 'theme-light') && !getclass(root, 'theme-dark')) {
			addclass(root, 'theme-light');
		}
		setclass(root, 'theme-light');
		setclass(root, 'theme-dark');
	}
	va2.data.theme = _theme_name || root.className.match(/theme-([a-z]+)/)[1];
}

// Make all images full-screenable on click (within class/id/tag if specified, otherwise global)
function imgfs(_css_type) {
	loop(qem((_css_type || '')+' img'), (i,v)=>{
		if (!v.onclick) {
			v.onclick = ()=>{ setclass(v, 'fs'); }
		}
	});
}

// Get favicon of the website from Google DB, optionally specify icon size
// Returns: {url, src, em (html string)}
function gfavicon(url, _size) {
	const domain = url.replaceAll(/http[s]?:\/\//g, '').replaceAll(/\/.+/g, '');
	const size = _size || 64;
	const icon = `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=${size}`;
	return {
		url: icon,
		src: `url(${icon})`,
		em:`<img class='gfavicon' src='${icon}' alt='${url}'>`
	};
}

// Slider widget function ('n': Next, 'p': Previous), ex:
// <p onclick="va2slide('cat', 'n')">cats</p>
// <img id='cat1'> <img id='cat2'>
function va2slide(id, dir) {
	const slides = va2.temp.slide;

	// Create slides[id] array if not found
	if (typeof slides[id] === 'undefined') {
		slides[id]=[];
		loop(qem(`[id^=${id}]`), (i,v)=>{
			let n = Number(i) + 1;
			//print(id+n);
			slides[id].push(n);
			if (i>1 && emi(id+n)) { emi(id+n).classList.add('slided'); }
			if (!emi(id+n)) { em_err('slide', id+n); }
		});
	}

	// Change class for this [id] and switch to next
	if (dir=='n') {
		if (emi(id+slides[id][0])) {
			emi(id+slides[id][0]).classList.remove("slide", "slideN", "slideP");
			emi(id+slides[id][0]).style.animation = null;
			emi(id+slides[id][0]).classList.add("slided");
		}
		slides[id][0] = slides[id][0]+1;
		if (emi(id+slides[id][0])) {
		// Change class for the new [id]
			emi(id+slides[id][0]).classList.remove("slided");
			emi(id+slides[id][0]).classList.add("slide", "slideN");
		} else {
		// If next [id] doesn't exist, set index to 1 and change class
			slides[id][0] = 1;
			emi(id+slides[id][0]).classList.remove("slided");
			emi(id+slides[id][0]).classList.add("slide", "slideN");
		}
	}

	// Change class for this [id] and switch to previous
	if (dir=='p') {
		if (emi(id+slides[id][0])) {
			emi(id+slides[id][0]).classList.remove("slide", "slideP", "slideN");
			emi(id+slides[id][0]).style.animation = null;
			emi(id+slides[id][0]).classList.add("slided");
		}
		slides[id][0] = slides[id][0]-1;
		if (emi(id+slides[id][0])) {
		// Change class for the new [id]
			emi(id+slides[id][0]).classList.remove("slided");
			emi(id+slides[id][0]).classList.add("slide", "slideP");
		} else {
		// If previous [id] doesn't exist, set index to [max] and change class
			slides[id][0] = slides[id].length;
			emi(id+slides[id][0]).classList.remove("slided");
			emi(id+slides[id][0]).classList.add("slide", "slideP");
		}
	}

	// Change classes for this and selected [id]
	if (typeof dir=='number' && emi(id+dir)) {
		if (emi(id+slides[id][0])) {
			emi(id+slides[id][0]).classList.remove("slide", "slideN", "slideP");
			emi(id+slides[id][0]).style.animation = null;
			emi(id+slides[id][0]).classList.add("slided");
		}
		slides[id][0] = dir;
		emi(id+slides[id][0]).classList.remove("slided");
		emi(id+slides[id][0]).classList.add("slide");
	}
}

// Switch existing languages (see va2.opt.langs) based on corresponding CSS classes
// ex: <p class'EN'>(hidden)</p> <p onclick='va2lang("EN")'>show .EN</p>
function va2lang(_lang_short) {
	const rules = [];
	let L = _lang_short || va2.opt.lang;
	L = L.toUpperCase();
	// Set document lang and variable
	if (va2.opt.langs[L]) {
		va2.opt.lang = L;
		document.documentElement.lang = L.toLowerCase();
	}
	// Write CSS rules
	loop(va2.opt.langs, (lang)=>{
		if (lang !== L) {
			rules.push(`.${lang} { display: none !important; }`);
		}
	});
	// (Re-)Generate embedded style
	extern.css(rules.join(' '), 'va2langs');
}


	// WINDOW & SESSION

// Local (loc) & Session (sess) storage management: set/get/del
// ex:  storage.sess.set('param', val_or_obj);
const storage = {
	loc: {
		['set']: function(id, val) {
			if (typeof val === 'object') {
				try {
					window.localStorage.setItem(id, JSON.stringify(val));
				} catch(err) {
					log(3, 'Data is too large for the local storage.');
				}
			} else {
				window.localStorage.setItem(id, val);
			}
		},
		['get']: function(id) {
			let item;
			try { item = JSON.parse(window.localStorage.getItem(id)); }
			catch { item = window.localStorage.getItem(id); }
			return item;
		},
		del: function(id) { window.localStorage.removeItem(id); }
	},
	sess: {
		['set']: function(id, val) {
			if (typeof val === 'object') {
				window.sessionStorage.setItem(id, JSON.stringify(val));
			} else {
				window.sessionStorage.setItem(id, val);
			}
		},
		['get']: function(id) {
			let item;
			try { item = JSON.parse(window.sessionStorage.getItem(id)); }
			catch { item = window.sessionStorage.getItem(id); }
			return item;
		},
		del: function(id) { window.sessionStorage.removeItem(id); }
	},
	wipe: ()=>{ localStorage.clear(); sessionStorage.clear(); }
}

// Get/Set a global CSS variable
function cssvar(css_var, _val) {
	if (_val) {
		document.body.style.setProperty('--'+css_var, _val);
	} else {
		return window.getComputedStyle(document.body).getPropertyValue(css_var);
	}
}

// Request full screen mode
function fullscreen() {
	let em = document.documentElement;
	if (!va2.temp.fullscreen) {
		if (em.requestFullscreen) { em.requestFullscreen(); }
		else if (em.webkitRequestFullscreen) { em.webkitRequestFullscreen(); }
		else if (em.msRequestFullscreen) { em.msRequestFullscreen(); }
		va2.temp.fullscreen = 1;
	} else {
		if (document.exitFullscreen) { document.exitFullscreen(); }
		else if (document.webkitExitFullscreen) { document.webkitExitFullscreen(); }
		else if (document.msExitFullscreen) { document.msExitFullscreen(); }
		va2.temp.fullscreen = 0;
	}
}

// Open URL, ex:  href('...', 1);
function href(https, _openInNewTab) {
	if (_openInNewTab) { window.open(https, '_blank'); }
	else { window.open(https, '_self'); }
}

// Set functions for device type (call on init once)
function vport(func_desktop, func_mobile, _percentage) {
	// Height > width by >74%
	let p = (_percentage || 74);
	let h = window.innerHeight;
	let w = window.innerWidth;
	if (Math.per(h, w) > p) { func_mobile(); }
	else { func_desktop(); }

	window.addEventListener('resize', ()=>{
		let h = window.innerHeight;
		let w = window.innerWidth;
		if (Math.per(h, w) > p) { func_mobile(); }
		else { func_desktop(); }
	});
}

// Copy text from the selected input or string
function copy(em_i_or_str) {
	let data;
	if (emi(em_i_or_str)) {
		const em = emi(em_i_or_str);
		em.select();
		em.setSelectionRange(0, 99999);
		data = em.value;
	} else {
		data = em_i_or_str;
	}
	navigator.clipboard.writeText(data);
}

// Retrieve data from clipboard
async function paste() {
	let txt;
	await navigator.clipboard.readText()
		.then((str) => { txt=str; });
	return txt;
}


	// CALCULATIONS

// Resize item while keeping aspect ratio
function resize(h, w, max, _maxW) {
	let r;
	if (!_maxW) { r = Math.min(max/h, max/w); }
	else { r = Math.min(max/h, _maxW/w); }
	return {
		h: Math.round(h*r),
		w: Math.round(w*r)
	};
}

// Return {int} with {max} limit
function intmax(int, max) {
	return Math.min(max, Math.max(0, int));
}

// Invert a float (ex: 0.9=90% to 0.9=10%)
function invfloat(float) {
	return 1 - (1 * float);
}

// Calculate percentage
Math.per = function(this_num, of_the) {
	return Math.round( (100 * this_num) / of_the );
}

// Get polarity (1, -1, 0) of a number in comparison to other or 0
Math.pol = function(this_n, _to_n) {
	let x = (_to_n || 0);
	if (this_n>x) { return 1; }
	else if (this_n<x) { return -1; }
	else { return 0; }
}

// Get random integer
function rand(_max) {
	return Math.floor(Math.random() * (_max || 100));
}

// Generate a random hexadecimal color
function hexrand() {
	return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16);
}


	// PROTOTYPES (enable on init)

function enable_prototypes() {
	String.prototype.toraw = function() { return String.raw`${this}`; }
	String.prototype.len = function() { return len(this); }
	String.prototype.cut = function(start, _plus) {
		return cut(this, start, _plus);
	}

	Number.prototype.len = function() { return len(this); }
	Number.prototype.cut = function(start, _plus) {
		return cut(this, start, _plus);
	}

	Object.prototype.len = function() { return len(this); }
	Object.prototype.clone = function(to) { oclone(this, to); }
	Object.prototype.sort = function() { return osort(this); }
	Object.prototype.toggle = function(func) { return emtoggle(this, func); }
	Object.prototype.box = function() { return embox(this); }
	Object.prototype.root = function(lvl) { return emroot(this, lvl); }
	Object.prototype.chroot = function(root_em_i, _switch_between) {
		return emchroot(this, root_em_i, _switch_between);
	}
	Object.prototype.item = function(number) { return emitem(this, number); }
	Object.prototype.items = function(func) { return emitems(this, func); }
	Object.prototype.hover = function(css_class, _func_on, _func_off) {
		return hover(this, css_class, _func_on, _func_off);
	}
	Object.prototype.seek = function(what) { return oseek(this, what); }
	Object.prototype.rep = function(item, _newitem) {
		return orep(this, item, _newitem);
	}
	Object.prototype.merge = function(o) {
		merge(this, o);
	};
	// Loop / async loop, ex:  myArr.loop((i,v)=>{ print(i,v); });
	Object.prototype.loop = function(func) {
		loop(this, func);
	};
	Object.prototype.aloop = async function(func) {
		await loop(this, func);
	};

	Array.prototype.len = function() { return len(this); }
	// Return last item of array
	Array.prototype.last = function() { return this[this.length-1]; }
	// Remove specific item from array
	Array.prototype.rm = function(value) {
		const index = this.indexOf(value);
		if (index > -1) {
			this.splice(index, 1);
		}
	}
}


	// Va2:Templates (va2.temp.js) [embedded]

va2.mod.temp = {};

// Shows a popup with specified content
function popup(content, _title) {
	if (!content) { return false; }
	let em = emi('va2popup');
	if (!em) {
		mk(0, `
		<div id='va2popupWrap' class='fillx f p2'>
			<div class='fill transparent' onclick='hide(emroot(this))'></div>
			<div class='m w1-3 vh80-m p2 fgc bfgi b1px br shadow scroll ani-popUp ani05'>
				<div class='btn gicon fs1-2 px1 abs topR m2 z2' onclick='hide(emroot(this, 2))'>close</div>
				<div id='va2popupTitle' class='tc pb2 pt05 px5 mb05 lh12 fs1-2'></div>
				<div id='va2popup' class='tc'></div>
			</div>
		</div>`);
		em = emi('va2popup');
	}
	const title = _title || '<gicon class="cblue pr05 scale14">info</gicon> Information';
	emi('va2popupTitle').innerHTML = title;
	wipe(em); mk(em, content);
	show('va2popupWrap');
}

/* Shows an input prompt with specified text
	Accepts multiple fields: [[field_id, description, placeholder],]
	Examples:
		stdin((v)=>{ print(v); });
		stdin((inp)=>{ loop(inp, (id,em)=>{ print(id,em.value); }); }, 0, [['email','Your E-mail'], ['phone','Your phone']]);
*/
function stdin(func, _text, _fields) {
	if (!func) { return false; }
	// Create prompt if not found
	let em = emi('va2prompt');
	if (!em) {
		mk(0, `
		<div id='va2promptWrap' class='fillx f p3'>
			<div class='va2 fill transparent' onclick='hide(emroot(this))'></div>
			<div id='va2prompt' class='m p2 th_windowFg round w1-3 ani-popUp ani05'>
				<p class='va2 tc pb3 fs1-2'></p>
				<div class='va2 center g1 a-c'></div>
			</div>
		</div>`);
		em = emi('va2prompt');
	}
	const text = emitem(em, 1);
	const area = emitem(em, 2);
	area.innerHTML = '';
	// Prompt text
	text.innerHTML = _text || "User input prompt<br>"+
	"<x class='fs08 fcx'>(This data will be processed by the associated function)";
	// A single input
	const inp_cl = 'input i tc bgc wr20';
	if (!_fields) {
		const inp = create('input', {
			className: inp_cl,
			type: 'text',
			name: 'stdin',
			placeholder: '(input area)'
		}, area);
		enter(inp, ()=>{ func(inp.value); hide('va2promptWrap'); });
	}
	// Multiple inputs
	else {
		const inputs = {};
		loop(_fields, (_,v)=>{
			mk(area, "<p class='w tc'>"+v[1]+'</p>'); // Name
			const inp = create('input', {
				className: inp_cl,
				type: 'text',
				name: v[0],
				placeholder: v[2] || '. . .'
			}, area);
			inputs[v[0]] = inp;
		});
		mk(area, "<p class='ln'></p>");
		create('p', {
			className: 'mt2 btnc',
			innerHTML: 'Process data',
			onclick: ()=>{
				const name_val_pair = {};
				loop(inputs, (name,em)=>{
					name_val_pair[name] = em.value;
				});
				func(name_val_pair);
				hide('va2promptWrap');
			}
		}, area);
	}
	show('va2promptWrap');
}

// Shows a notification with specified text; args:
// (bool) silent: Do not show in the tray
// (int) sec: Show for N seconds
// (func) func: Function to trigger on click
function notify(text, _classes, _args) {
	const args = _args || {};
	if (!va2.opt.dnd) {
		let sec = args.sec || 3 + (text.length * va2.opt.notif_time_mult);
		const id = 'va2notif';
		const em = emi(id) || create(0, {id: id, className: 'w f fix py2'}, document.body);
		show(em);
		ani(em, `slideout 0.5s forwards, moveT 0.5s ${sec}s forwards`, sec+1, 1);
		em.innerHTML =
		`<div class='m shadow py2 px3 th_windowBg round text f pt border ${_classes}' onclick='notifs.show()'>`+
		`<div class='m pt1-g'>${text}</div></div>`;
	}
	if (!args.silent) { notifs.add(text, _classes, args.func); }
}

// Notification tray logic
const notifs = {
	list: {},
	nav: [
		"<p class='va2 btn gicon-hov btn_dnd' onclick='va2.f.dnd()' title='Do Not Disturb'>notifications_off</p>",
		"<p class='va2 btn gicon-hov' onclick='windows.terminal()' title='Open terminal'>terminal</p>",
		"<p class='va2 btn gicon-hov' onclick='fullscreen()' title='Fullscreen mode'>open_in_full</p>",
		"<p class='va2 btn gicon-hov btn_noani' onclick='va2.f.noani()' title='Disable animations'>motion_mode</p>",
		"<p class='va2 btn gicon-hov' onclick='themeset()' title='Switch theme'>contrast</p>",
		"<p class='va2 btn gicon-hov' onclick='windows.settings()' title='Settings'>settings</p>",
	],
	clear_texts: [
		'The list is empty.',
		'Wow! Such emptiness...',
		'The void is staring back at you.',
		'Blank like empty canvas.',
		'Silence is golden.',
		'Looks like nothing\'s happening lately.',
		'No data to display.',
		'Suddenly, everything\'s gone...',
		'This empty space looks depressing.',
		'No news for today.',
		'Good weather today, isn\'t it?',
		'It\'s pretty vacant here.',
		'Isn\'t it time to throw a party?',
		'Just take a look at these stars...',
		'So, what\'s for dinner today?'
	],
	init: function() {
		let showinfo = '';
		if (va2.opt.info) {
			showinfo =
				`<div class='w f p1 m-g fcx bT'>
					<div class='ml0 fontCode fw5 lh11'>
						<p class='pre'>ver:   ${va2.ver}</p>
						<p>local: ${va2.env.v.meta.ver}</p>
					</div>
					<div class='mr0 tr lh12'>
						<p class='time fs1-2 fw5'></p>
						<p class='date fs09'></p>
					</div>
				</div>`;
		}
		mk(document.body,
		`<div id='va2notifs_wrap' class='fillx f pt1 pb6 hide spx'>
			<div class='fillx transparentX' onclick='notifs.show()'></div>
			<div class='w th_windowBg border m p2 round h fh'>
				<div class='f w pb2 bB m-g fs1-5 tc'>
					<p class=''>Notifications</p>
				</div>
				<div id='va2notifs' class='scroll my2-g w z1 f1 ul-a'></div>
				${showinfo}
				<div id='va2notifs_nav' class='m f pt2 px1-g g1 bT fs1-4 w jce'>
					${notifs.nav.join('')}
					<div class='w f p0'>
						<p class='btn fs1-2 cred m ml0' onclick='notifs.clear()' title='Clear notifications'><gicon>delete</gicon> Clear</p>
						<p class='btn fs1-2 m mr0' onclick='notifs.show()' title='Close notification tray'><gicon>close</gicon> Close</p>
					</div>
				</div>
			</div>
		</div>`);
		notifs.clear();
	},
	show: function() {
		tshow('va2notifs_wrap');
		if (emi('va2notif')) { hide('va2notif'); }
		if (qem('.btn_notifs')[0]) {
			loop(qem('.btn_notifs'), (i,v)=>{
				setclass(v, 'cyellow');
			});
		}
	},
	hide: function() {
		hide('va2notifs_wrap');
		if (qem('.btn_notifs')[0]) {
			loop(qem('.btn_notifs'), (i,v)=>{
				rmclass(v, 'cyellow');
			});
		}
	},
	add: function(text, _classes, _action) {
		const em = emi('va2notifs');
		if (em && emitem(em, 1) && (emitem(em, 1).tagName === 'P')) { rm(emitem(em, 1)); }
		const _notif = create(0, {
			innerHTML: `<div class='m p2 th_windowFg border round f text ts-hover1 ani-slideFromT ts02 ${_classes}'>`+
				`<div class='mb1 mt1-g'>${text}</div>`+
				"<p class='botR btn center fc' onclick='notifs.del(emroot(this,2))'>Close</p></div>",
		}, em);
		if (_action) {
			addclass(_notif, 'pt');
			_notif.onclick = ()=>{
				_action(_notif);
				notifs.del(_notif);
			}
		}
		const _uid = uid();
		_notif.dataset.notif = _uid;
		notifs.list[_uid] = _notif;
		imgfs('#va2notifs');
	},
	del: function(em_notif) {
		const em = emi('va2notifs');
		delete notifs.list[em_notif.dataset.notif];
		rm(em_notif);
		if (em.innerHTML === '') { notifs.clear(); }
	},
	clear: function() {
		loop(notifs.list, (i)=>{
			delete notifs.list[i];
		});
		emi('va2notifs').innerHTML = `<p class="tc fcx">${notifs.clear_texts[rand(notifs.clear_texts.length)]}</p>`;
	}
}
va2.f.dnd = function() {
	va2.opt.dnd = !va2.opt.dnd;
	if (qem('.btn_dnd')[0]) {
		loop(qem('.btn_dnd'), (i,v)=>{
			setclass(v, 'cred');
		});
	}
}
va2.f.noani = function() {
	setclass(document.body, 'noani');
	if (qem('.btn_noani')[0]) {
		loop(qem('.btn_noani'), (i,v)=>{
			setclass(v, 'cred');
		});
	}
}

// Window logic
const windows = {
	recent: null, all: [],
	/* Create a window, returns: [window, windowBody];  args:
		(str_html) info: display "Window details" button with a popup
		(binary_bool) btns: [minimize, maximize, close]
	*/
	add: function(_title, _content, _args) {
		const args = _args || {};
		const the_uid = args.uid || uid();
		const em = create(0, {
			className: 'va2window m mx0 w1-3 h50 p1 ani03 ani-slideFromB',
			innerHTML: `
			<div class='int w h th_windowFg br bounded borderFg shadowX'>
				<div class='w f py1 px2 th_windowFg bB shadowS'>
					<div class='w1-2 fs1-2 m ml0 tl tnowrap scrollx nosel'>${_title || "Window ID: "+the_uid}</div>
					<div class='w1-2 fs1-2 f m mr0 g05 end'>
						<div class='gicon btn px1 i1' title='Minimize' onclick='hide(emroot(this, 4))'>remove</div>
						<div class='gicon btn px1 i1' title='Maximize' onclick='setclass(emroot(this, 4), "fillx", "z2")'>check_box_outline_blank</div>
						<div class='gicon btn px1 i1' title='Close' onclick='windows.close(emroot(this, 4))'>close</div>
					</div>
				</div>
				<div class='windowBody w p2 scroll'>${_content || ''}</div>
			</div>`,
		}, 'va2windowArea');
		em.dataset.uid = the_uid;
		windows.recent = em;
		windows.all.push(em);
		const btns = emitem(emitem(emitem(em, 1), 1), 2);
		if (args.info) {
			create('p', {
				className: 'gicon btn px1 i0',
				innerHTML: 'info_i',
				title: 'Window details',
				onclick: ()=>{ popup(args.info, `Window details<br><x class='c fs08'>${the_uid}</x>`); }
			}, btns);
		}
		loop(args.btns, (i,v)=>{
			if (!v) { rm(emitem(btns, i+1)); }
		});
		if (va2.opt.maximize) { addclass(em, "fillx", "z2"); }
		return [em, emitem(emitem(em, 1), 2)];
	},
	close: function(em_or_windowId_or_null) {
		let it = em_or_windowId_or_null || windows.recent;
		// If specified ID instead of element, find it
		if (type(it) === 'string') {
			loop(windows.all, (i,v)=>{
				if (v.dataset.windowId === it) {
					it = v;
				}
			});
		}
		if (getclass(it, 'va2window')) {
			windows.recent = null;
			loop(windows.all, (i,v)=>{
				if (v === it) {
					windows.all.splice(i, 1);
				}
			});
			rm(it);
		}
	},
	closeAll: ()=>{
		loop(windows.all, (i,v)=>{ rm(v); });
		windows.all.splice(0, windows.all.length);
	},
	openAll: ()=>{ loop(windows.all, (_,w)=>{ show(w); }); },
}

// Terminal window
va2.temp.termHist = [];
va2.temp.termHistPos = 0;
windows.terminal = function() {
  hide("va2ctxt"); notifs.hide();
  if (!emi('va2term')) {
	windows.add('Terminal', 0, {btns:[1,1,0]});
	const root = windows.recent;
	const em = emitem(emitem(root, 1), 2);
	windows.recent = null;
	windows.all.pop();
	root.id = 'va2term';
	addclass(em, 'va2term', 'text', 'fontCode', 'tl', 'lh12', 'bgc');
	const wrap = create(0, {className: 'w f shadowS'}, emitem(root, 1));

	// Print some info
	log(1, "va2_ver: <c class='cgreen'>"+va2.ver+'</c>');
	log(1, "local_ver: <c class='cgreen'>"+va2.env.v.meta.ver+'</c>');
	log(1, "session_id: <c class='cgreen'>"+va2.sess.id+'</c>');
	log(1, "session_date: <c class='cgreen'>"+va2.sess.date+'</c>');

	// Input field
	em.innerHTML = va2.temp.term.join('');
	const inp = create('input', {
		className: 'input br0 py0 hr3 th_windowBg f1',
		placeholder: '(javascript input area)'
	}, wrap);

	// Input field logic
	inp.addEventListener('keydown', (e)=>{
		const H = va2.temp.termHist;
		const P = va2.temp.termHistPos;
		if ((e.keyCode===13) && (inp.value!=='')) { // Enter
			va2.temp.termHist.push(inp.value);
			if (va2.temp.termPrintMode) {
				eval('print('+inp.value+')');
			} else {
				eval(inp.value);
			}
			inp.value = '';
			va2.temp.termHistPos = va2.temp.termHist.length+1;
		} else if (e.keyCode === 38) { // Up
			if (P <= H.length) {
				va2.temp.termHistPos += 1;
				inp.value = H[va2.temp.termHistPos-1] || '';
			}
		} else if (e.keyCode === 40) { // Down
			if (P > 0) {
				va2.temp.termHistPos -= 1;
				inp.value = H[va2.temp.termHistPos-1] || '';
			}
		}
	});

	// History scroll buttons
	const btnUp = create('p', {
		className: 'gicon btn p2 br0 b1px bbgi fgc bgic-hov',
		innerHTML: 'arrow_upward',
		title: 'History forward',
		onclick: ()=>{
			if (va2.temp.termHistPos <= va2.temp.termHist.length) {
				va2.temp.termHistPos++;
				inp.value = va2.temp.termHist[va2.temp.termHistPos-1] || '';
			}
		}
	}, wrap);
	const btnDown = create('p', {
		className: 'gicon btn p2 br0 b1px bbgi fgc bgic-hov',
		innerHTML: 'arrow_downward',
		title: 'History backward',
		onclick: ()=>{
			if (va2.temp.termHistPos > 0) {
				va2.temp.termHistPos--;
				inp.value = va2.temp.termHist[va2.temp.termHistPos-1] || '';
			}
		}
	}, wrap);

	// Menu with other options
	const theMenu = create('div', {
		innerHTML: 'More options:',
		className: 'abs botR mb5 p2 fgc br b1px bbgi brRB0 mt1-g tc hide ani-expandLT ani015'
	}, wrap);
	const btnMenu = create('p', {
		className: 'gicon btn p2 br0 b1px bbgi fgc bgic-hov',
		innerHTML: 'more_vert',
		title: 'More options',
		onclick: ()=>{ tshow(theMenu); }
	}, wrap);
	em.onclick = ()=>{ hide(theMenu); }
	inp.onclick = ()=>{ hide(theMenu); }

	// Get history
	create('p', {
		className: 'btn',
		innerHTML: '<gicon>history_2</gicon> Show history',
		onclick: ()=>{
			popup(
			`<div class='fontCode p2 br bfgi b1px bgc lh13 tl'>${va2.temp.termHist.join('<br>')}</div>
			<div class='center mt3'>
				<p class='btn red cwhite' onclick="va2.temp.termHist=[]; `+
				`va2.temp.termHistPos=0; hide(emroot(this, 4)); wipe(emroot(this, 2))">Clear</p>
			</div>`,
			'Terminal input history');
		}
	}, theMenu);
	// Print mode
	create('p', {
		className: 'btn',
		innerHTML: '<gicon>output</gicon> Print mode',
		onclick: function(){
			setclass(this, 'bga', 'bga-hov', 'cwhite');
			va2.temp.termPrintMode = va2.temp.termPrintMode ? false : true;
		}
	}, theMenu);
	// Script mode
	create('p', {
		className: 'btn',
		innerHTML: '<gicon>data_object</gicon> Script mode',
		onclick: ()=>{
			popup(`<div class='f'><textarea class='w bgc bbgi b1px vh60 mb2 p2 fontCode fs09'></textarea>
			<div class='m btn bga cwhite' onclick='eval(emitem(emroot(this),1).value)'>Run script</div></div>`,
			`<p class='pb05'>JavaScript runner</p>
			<p class='fs08 fcx'>(If you close this window, the progress will disappear.
			<br>Clicking "Run script" does not erase the text.)</p>`);
			hide(theMenu);
		}
	}, theMenu);

  } else { show('va2term'); }
}

// Settings window
windows.settings = function(_custom_elements) {
  hide('va2ctxt'); notifs.hide();
  if (!emi('va2settings')) {
	// Create a permanent window
	windows.add('Settings', 0, {btns:[1,1,0]});
	const root = windows.recent;
	const win = emitem(emitem(root, 1), 2);
	windows.recent = null;
	windows.all.pop();
	root.id = 'va2settings';
	addclass(win, 'mb1-g', 'tc');

	// Top texts
	mk(win, `
		<p class='abs topR py1 px2 fcx fs07 tr'>
			Va2 ver: ${va2.ver}<br>
			local ver: ${va2.env.v.meta.ver}
		</p>
		<p class='abs topL py1 px2 fcx fs07 tl'>
			session id: ${va2.sess.id}<br>
			session date: ${va2.sess.date}
		</p>
		<p class='fs2-5 pb1 pt5 fontFancy'>General</p>`);

	// Custom
	loop(_custom_elements, (_,em)=>{ mk(win, em); });

	// Theme picker
	mk(win, `
	<p class='w fs1-2'>Theme</p>
	<div class='w f pb2'>
		<div class='va2themeList f br scroll m m-g bgc g1px bbg b1px'></div>
	</div>`);
	loop(themes, (th)=>{
		mk(qem('.va2themeList')[0],
		`<p class='btn br0 fw4 fs08 ls1' onclick='themeset("${th}")'>${th.toUpperCase()}</p>`);
	});

	// Color picker
	const colors = create(0, {
		className:'w w1-5-4 m mt2 center border b02 bc br pb1 bga g05',
		innerHTML: "<p class='w py05 fs1-2 fw6 c'>Color</p>"
	}, win);
	const colorList = ['crimson', 'red','orange','yellow','green','teal','cyan','skyblue','blue','purple','pink','brown'];
	loop(colorList, (_,color)=>{
		const em = create('p', {
			className: 'center ch2 brc scale15-hov z1-hov ts01 pt '+color,
			innerHTML: `<p class='m ch1 p05 brc' style='background:var(--${color})'></p>`,
			onclick: ()=>{
				cssvar('accent', `var(--${color})`);
				cssvar('accentBg', `var(--dark${color})`);
				va2.data.accentColor = color;
			}
		}, colors);
	});

	// Data handling
	mk(win, "<p class='w fs1-2 mt3 pb1'>Data handling</p>");
	const btnList = create(0, {className: 'w center g2 btn-g'}, win);
		// Save
	mk(btnList, "<p class='green cwhite' onclick='va2.f.saveData()'>Save data</p>");
		// Export
	mk(btnList, "<p class='skyblue cwhite' onclick='va2.f.exportData(); notify(\"Data exported to your Downloads directory.\", \"skyblue cwhite\")'>Export data</p>");
		// Import
	mk(btnList, "<p class='yellow cwhite' onclick='va2.f.importData()'>Import data</p>");
		// Erase
	create('P', {
		className: 'red cwhite',
		innerHTML: 'Erase data',
		onclick: ()=>{
			stdin((v)=>{ if (v==='yes'){ storage.wipe(); location.reload(); } },
			'To erase all data, write "<x class="cred">yes</x>" in the field below. The application will reload in the process.');
		}
	}, btnList);

	// CONFIG: Add input fields for variables
	mk(win, "<p class='w fs2-5 pt4 pb1 lh09 fontFancy'>Configuration<br><x class='fs08 fcx font'>(va2.opt)</x></p>");
	loop(va2.opt, (i,v)=>{
		const wrap = create(0, {className: 'f m-g pb1 bB'}, win);
		const title = create(0, {
			className: 'i1 w1-2 ml0 tl f',
			innerHTML: `<p class='i1 m ml0'>${i}:</p>`,
		}, wrap);

		// Hint button
		if (va2.hints.opt[i]) {
			create('p', {
				className: 'i0 gicon btn p1 mr1',
				innerHTML: 'info_i',
				title: va2.hints.opt[i],
				onclick: ()=>{ popup(
					'<p class="tc">'+va2.hints.opt[i]+'.</p>',
					'Parameter: <b>'+i+'</b>'); }
			}, title);
		}

		// Input types:
		// Text
		if (type(v)==='string' || ((type(v)==='number') && (v!==0) && (v!==1))) {
			const inp = create('input', {
				className: 'i1 m mr0 borderFg pl1 w1-2 br05',
				value: v,
				onblur: function (){
					va2.opt[i] = this.value;
				}
			}, wrap);
		}
		// Button
		else if ((type(v)==='boolean') || (v===0) || (v===1)) {
			const btn = create('p', {
				className: 'i1 btn m ml0 bgc b02 bold fontCode',
				innerHTML: v,
				onclick: ()=>{
					va2.opt[i] ^= 1;
					btn.innerHTML = va2.opt[i];
					if (va2.opt[i]) {
						addclass(btn, 'cgreen', 'bgreen');
						rmclass(btn, 'cred', 'bred');
					} else {
						rmclass(btn, 'cgreen', 'bgreen');
						addclass(btn, 'cred', 'bred');
					}
				}
			}, wrap);
			// Change colors on init
			if (va2.opt[i]) {
				addclass(btn, 'cgreen', 'bgreen');
				rmclass(btn, 'cred', 'bred');
			} else {
				rmclass(btn, 'cgreen', 'bgreen');
				addclass(btn, 'cred', 'bred');
			}
		}
		// Textbox
		else if (type(v)==='array' || type(v)==='object') {
			const inp = create('textarea', {
				className: 'i1 m mr0 borderFg pl1 w1-2 br05',
				value: JSON.stringify(v)
					.replaceAll('{', '{\n	')
					.replaceAll('}', '\n}')
					.replaceAll(',', ',\n	'),
				onblur: function (){
					va2.opt[i] = JSON.parse(this.value);
				}
			}, wrap);
		}
	});

	// CSS params
	mk(win, "<p class='fs2-5 py2 fontFancy'>Styling</p>");
	const css_var_str = [];
		// Get and sort variables from BODY
	loop(window.getComputedStyle(document.body), (i,v)=>{
		if (v.match('--')) {
			css_var_str.push(
				v.replace('--', '')+':'+
				window.getComputedStyle(document.body).getPropertyValue(v)
			);
		}
	});
	css_var_str.sort();
		// Create input fields
	loop(css_var_str, (_,str)=>{
		const i = str.match(/^[^:]+/g);
		const v = str.match(/[^:]+$/g);
		const wrap = create(0, {className: 'f m-g pb1 bB'}, win);
		const title = create(0, {
			className: 'i1 w1-2 ml0 tl f',
			innerHTML: `<p class='i1 m ml0'>${i}:</p>`,
		}, wrap);
		const inp = create('input', {
			className: 'i1 m mr0 borderFg pl1 w1-2 br05',
			value: v,
			onblur: function (){
				cssvar(i, this.value);
			}
		}, wrap);
	});

	// Contact
	mk(win, `
	<div class='pt4 fs08'>
		<div class='tc fcx'>Found bugs or issues? Wanna offer suggestions? Contact me by:</div>
		<div class='f g2 m-a center'>
			<a href='https://github.com/reineimi/va2/issues' target='_blank'>GitHub</a>
			<a class='c' href='mailto:reineimi.dev@gmail.com' target='_blank'>E-mail</a>
			<a class='cblue' href='https://discord.com/invite/rGMZ7GkxKu' target='_blank'>Discord</a>
			<a class='cskyblue' href='https://bsky.app/profile/reineimi.bsky.social' target='_blank'>Bluesky</a>
		</div>
	</div>`);
  } else { show('va2settings'); }
}

va2.mod.temp.init = ()=>{
	// Set styles (va2.temp.css)
	mk(document.head, `
	<style>
	#va2ctxt { z-index: 85; }
	#va2popupWrap { z-index: 86; }
	#va2notif { z-index: 87; top: var(--headerH); left: 0px; transform: translateY(-150%); }
	#va2notifs_wrap { z-index: 88; }
	#va2promptWrap { z-index: 89; }
	#va2notif > div, #va2prompt > * { max-width: 90vmin; }
	#va2notif img { display: block; width: 10rem; }
	#va2notifs_wrap > div:first-child { animation: fadeout 0.35s; }
	#va2notifs img { display: block; width: 80vmin; border-radius: var(--cornersS); }
	div:has(> #va2notifs) { animation: appearFromT 0.5s; }
	#va2ctxtMenu { max-width: 80vmin; max-height: 40rem; animation: slideFromB 0.2s; }
	#va2ctxtMenu hr { margin: 0.5rem 0px; border-color: var(--itemBg); }
	.va2window .windowBody { height: calc(100% - 3rem); }
	.va2term { height: calc(100% - 6rem) !important; }
	</style>`);

	// Create core elements
	mk(document.body, `
		<div id='va2windowArea' class='fillx center z1 scroll nil'></div>
		<div id='va2ctxt' class='nosel fillx hide f'>
			<div id='va2ctxtEsc' class='fill ani ani-fadeout transparent' onclick='hide(emroot(this))'></div>
			<div id='va2ctxtMenu' class='w1-3 m p1 th_windowBg border br scroll shadow'>
				<div class='va2 w center mx05-g my1-g br05-g py1-g px2-g'>
					<p class='va2 btn gicon-hov' onclick='window.location.reload()' title='Refresh page'>refresh</p>
					<p class='va2 btn gicon-hov btn_notifs' onclick='notifs.show(); hide("va2ctxt")' title='Notifications'>notifications</p>
				</div>
			</div>
		</div>
	`);
	if (qem('main')[0]) { emchroot('va2windowArea', qem('main')[0]); }

	// Context menu: Add general buttons
	loop(notifs.nav, (_,em)=>{ mk(emitem('va2ctxtMenu', 1), em); });
	mk('va2ctxtMenu', "<hr><div id='va2ctxtItems' class='w hr20-m scroll tc btn-g block-g m1-g py1-g br05-g'></div>");

	// Context menu: Overwrite #Main
	ctxt(qem('main')[0], ()=>{ show('va2ctxt'); });
	ctxt('va2ctxt', ()=>{ hide(emi('va2ctxt')); });
}


	// SCRIPT EVENTS

{
document.addEventListener('keydown', (e)=>{
	va2.key.id = e.keyCode;
	va2.key.event = 'down';
	va2.key.held = 1;
	va2.key.name = e.code
		.replace('Key', '')
		.replace('Digit', '')
		.toLowerCase();
});
document.addEventListener('keyup', (e)=>{
	va2.key.id = e.keyCode;
	va2.key.event = 'up';
	va2.key.held = 0;
	va2.key.name = e.code
		.replace('Key', '')
		.replace('Digit', '')
		.toLowerCase();
});

document.addEventListener('mousedown', (e)=>{
	let x = e.clientX, y = e.clientY;
	va2.cur.event = 'down';
	if (va2.cur.type !== 'touch') {
		va2.cur.type = 'mouse';
	}
	va2.cur.x = x;
	va2.cur.y = y;
	va2.cur.down = {x: x, y: y};
	va2.cur.held = 1;
});
document.addEventListener('mousemove', (e)=>{
	let x = e.clientX, y = e.clientY;
	va2.cur.event = 'move';
	//va2.cur.type = 'mouse';
	va2.cur.x = x;
	va2.cur.y = y;
	va2.cur.move = {x: x, y: y};

	// Get cursor polarity in comparison to screen center
	va2.cur.pol = {
		x: Math.pol(x, window.innerWidth / 2),
		y: Math.pol(y, window.innerHeight / 2)
	};
});
document.addEventListener('mouseup', (e)=>{
	let x = e.clientX, y = e.clientY;
	va2.cur.event = 'up';
	//va2.cur.type = 'mouse';
	va2.cur.x = x;
	va2.cur.y = y;
	va2.cur.up = {x: x, y: y};
	va2.cur.held = 0;
});

document.addEventListener('touchstart', (e)=>{
	let x = e.touches[0].clientX,
		y = e.touches[0].clientY;
	va2.cur.event = 'down';
	va2.cur.type = 'touch';
	va2.cur.x = x;
	va2.cur.y = y;
	va2.cur.down = {x: x, y: y};
	va2.cur.held = 1;
});
document.addEventListener('touchmove', (e)=>{
	let x = e.touches[0].clientX,
		y = e.touches[0].clientY;
	va2.cur.event = 'move';
	//va2.cur.type = 'touch';
	va2.cur.x = x;
	va2.cur.y = y;
	va2.cur.move = {x: x, y: y};

	// Get cursor polarity in comparison to screen center
	va2.cur.pol = {
		x: Math.pol(x, window.innerWidth / 2),
		y: Math.pol(y, window.innerHeight / 2)
	};
});
document.addEventListener('touchend', (e)=>{
	va2.cur.event = 'up';
	//va2.cur.type = 'touch';
	va2.cur.held = 0;
});
}

// Script init
va2.env.init[0] = ()=>{
	if (va2.opt.load_data_on_init) { va2.f.loadData(); }
	notifs.init(); // TODO: Move to va2.mod.temp.init when fixed styles
	checkver();
	va2lang(va2.opt.lang || 'en');

	// CSS inits
	if (!CSS.supports('height: 100dvh')) {
		document.documentElement.style.setProperty('--dvh', window.innerHeight+'px');
	}
	if (typeof twemoji !== 'undefined') {
		twemoji.parse(document.documentElement, {folder: 'svg', ext: '.svg'});
	}

	// Disable spellchecks
	loop(tags('input'), (_,em)=>{ em.spellcheck = false; });
	loop(tags('textarea'), (_,em)=>{ em.spellcheck = false; });

	// Page slide effect
	const pageMin = emi('va2_page_content_min');
	const pageWrap = emi('va2_page_content_wrap');
	loop(tags('a'), (_, a)=>{
		if (a.target !== '__blank') {
			a.onclick = ()=>{
				let _min = emi('va2_page_content_min');
				if (_min) { _min.style.animation = 'none'; }
				if (pageWrap) {
					ani(pageWrap, 'slideL 0.5s forwards', 0.5, 1);
					setTimeout(()=>{ href(a.href); }, 300);
					return false;
				}
			}
		}
	});

	// Theme init
		// On system theme change
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
		let theme = event.matches ? 'dark' : 'light';
		themeset(theme);
		print('Theme has been adapted to: '+theme);
	});
		// On init
	if (va2.data.theme) {
		themeset(va2.data.theme);
	} else {
		if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			rmclass(document.body, 'theme-light');
			addclass(document.body, 'theme-dark');
		} else {
			addclass(document.body, 'theme-light');
			rmclass(document.body, 'theme-dark');
		}
	}

	// Color init
	if (va2.data.accentColor) {
		cssvar('accent', `var(--${va2.data.accentColor})`);
		cssvar('accentBg', `var(--dark${va2.data.accentColor})`);
	}

	// Timedate init
	interval.set('va2.update_1s', ()=>{
		loop(qem('.time'), (_,em)=>{ em.innerHTML=time(); });
		loop(qem('.date'), (_,em)=>{ em.innerHTML=date(); });
		loop(qem('.timedate'), (_,em)=>{ em.innerHTML=timedate(); });
		loop(qem('.elapsed'), (_,em)=>{ em.innerHTML=elapsed(); });
	}, 1);

	// Modules init
	if (va2.env.mods) {
		loop(va2.mod, (_,M)=>{
			if (M.init) { M.init(); }
		});
	}
}

/*	: Code above is licensed under VPCDP  :
	: by Eimi Rein (霊音 永旻) - @reineimi  :
	:. https://github.com/reineimi/VPCDP .:  */
