/** 
 * https://github.com/cwlsn/ics-to-json
 * 
 * Convert the ICS calendar format to JSON data to consume in web apps.
 * 
 * 
 */
import mzone from "./timezone.js"


const NEW_LINE = /\r\n|\n|\r/;

const EVENT = "VEVENT";
const EVENT_START = "BEGIN";
const EVENT_END = "END";
const START_DATE = "DTSTART";
const END_DATE = "DTEND";
const DESCRIPTION = "DESCRIPTION";
const SUMMARY = "SUMMARY";
const LOCATION = "LOCATION";
const ALARM = "VALARM";

const keyMap = {
		[START_DATE]: "startDate",
		[END_DATE]: "endDate",
		[DESCRIPTION]: "description",
		[SUMMARY]: "summary",
		[LOCATION]: "location"
};

const clean = string => unescape(string).replace(/\\n/g," ").trim();

//Unescape Text re RFC 4.3.11
function text(t){
	t = t || "";
	return (t
			.replace(/\\\,/g, ',')
			.replace(/\\\;/g, ';')
			.replace(/\\[nN]/g, '\n')
			.replace(/\\\\/g, '\\')
	)
}

function parseParams(p){
	var out = {};
	for (var i = 0; i<p.length; i++){
		if (p[i].indexOf('=') > -1){
			var segs = p[i].split('=');

			out[segs[0]] = parseValue(segs.slice(1).join('='));

		}
	}
	return out || p
}

function parseValue(val){
	if ('TRUE' === val)
		return true;

	if ('FALSE' === val)
		return false;

	var number = Number(val);
	if (!isNaN(number))
		return number;

	return val;
}

function calenDate(val, params) {
	var newDate = val;
	if (params && params[0] === "VALUE=DATE") {
		// Just Date
		var comps = /^(\d{4})(\d{2})(\d{2})$/.exec(val);
		if (comps !== null) {
			// No TZ info - assume same timezone as this computer
			newDate = new Date(
					comps[1],
					parseInt(comps[2], 10)-1,
					comps[3]
			);

			newDate = addTZ(newDate, params);
			return newDate
		}
	}

	// typical RFC date-time format
	var comps = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/.exec(val);
	if (comps !== null) {
		if (comps[7] == 'Z'){ // GMT
			newDate = new Date(Date.UTC(
					parseInt(comps[1], 10),
					parseInt(comps[2], 10)-1,
					parseInt(comps[3], 10),
					parseInt(comps[4], 10),
					parseInt(comps[5], 10),
					parseInt(comps[6], 10 )
			));
			// TODO add tz
		} else {
			newDate = new Date(
					parseInt(comps[1], 10),
					parseInt(comps[2], 10)-1,
					parseInt(comps[3], 10),
					parseInt(comps[4], 10),
					parseInt(comps[5], 10),
					parseInt(comps[6], 10)
			);
		}
		newDate = addTZ(newDate, params);
	}

	return newDate
}

function addTZ(dt, params) {
	var p = parseParams(params);

	if (params && p && p.TZID){
//		console.log(params);
//		console.log("add TZ: " + p.TZID + " to " + dt);
		dt = mzone.addtz(dt,p.TZID);
//		console.log("new dt: " +dt);
	}
	return dt
}

const icsToJson = icsData => {
	const array = [];
	let currentObj = {};

	//console.log(icsData);	

	const lines = icsData.split(NEW_LINE);

	console.log("ICS Lines: " + lines.length);

	let isAlarm = false;
	let isEvent = false;
	let isAllday = false;

	for (var i = 0, ii = lines.length, l = lines[0]; i<ii; i++, l=lines[i]){
		//Unfold : RFC#3.1
		while (lines[i+1] && /[ \t]/.test(lines[i+1][0])) {
			l += lines[i+1].slice(1);
			i += 1
		}

		var kv = l.split(":");

		if (kv.length < 2){
			// Invalid line - must have k&v
			continue;
		}

		// Although the spec says that vals with colons should be quote wrapped
		// in practise nobody does, so we assume further colons are part of the
		// val
		var value = kv.slice(1).join(":")
		var kp = kv[0].split(";")
		var name = kp[0]
		var params = kp.slice(1)

		//console.log("ICS " + name + " => " + value);    
		switch (name) {
		case EVENT_START:
			if (value === EVENT) {
				isEvent = true;
				isAllday = false;
				currentObj = {};
			} else if (value === ALARM) {
				isAlarm = true;
			}
			break;
		case EVENT_END:
			isAlarm = false;
			if (value === EVENT) {
				currentObj["allDay"] = isAllday;
				array.push(currentObj);
				isEvent = false;
			}
			break;
		case START_DATE:
			if (isEvent) {  
				currentObj[keyMap[START_DATE]] = calenDate(value, params);
//				console.log("s: "+value + " | " + params);	
				if (value.length == 8 || params[0] === "VALUE=DATE" ){
					isAllday = true;
				}
			}
			break;
		case END_DATE:
			if (isEvent) {  
				currentObj[keyMap[END_DATE]] = calenDate(value, params);
//				console.log("e: "+value);	
				if (value.length == 8 || params[0] === "VALUE=DATE" ){
					isAllday = true;
				}
			}
			break;
		case DESCRIPTION:
			if (isEvent && !isAlarm) {  
				currentObj[keyMap[DESCRIPTION]] = clean(value);
			}
			break;
		case SUMMARY:
			if (isEvent) {  
				currentObj[keyMap[SUMMARY]] = clean(value);
//				console.log("t: "+clean(value));	
			}
			break;
		case LOCATION:
			if (isEvent) {  
				currentObj[keyMap[LOCATION]] = clean(value);
//				console.log("l: " + clean(value));	
			}
		default:
			continue;
		}
	}
	return array;
};

export default icsToJson;
