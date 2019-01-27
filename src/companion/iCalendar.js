import { settingsStorage } from "settings";
import { outbox } from "file-transfer";
import { peerSocket } from "messaging";
import * as cbor from "cbor";
import icsToJson from "./icsToJson.js"
import { GC_DATA_FILE, GC_ERROR_FILE, GC_UPDATE_TOKEN, MAX_EVENT_COUNT, MAX_EVENT_MEM, DEBUG } from "../common/const";

export default class gCalendar {

	constructor() {
		let self = this;
		this.data = {lastUpdate: 0};
		peerSocket.addEventListener("message", (evt) => {
			DEBUG && console.log(`listening socket heard ${JSON.stringify(evt.data)}`);
			// We are receiving a request from the app
			if (evt.data === undefined) return;
			if (evt.data[GC_UPDATE_TOKEN] == true) {
				DEBUG && console.log("Start loading events");
				self.loadEvents();
			} 
		});

	}

	loadEvents() {
		try {  
			const now = new Date().getTime();
			const today = new Date().setHours(0,0,0,0);
			const self = this;

			let calendarIDs = [];
			let calendarInfo = [];

//			undefined or null
			for (var i = 0; i < 5 && settingsStorage.getItem(`url${i}`) !== undefined  && settingsStorage.getItem(`url${i}`) !== null; i++) {
				let url = JSON.parse(settingsStorage.getItem(`url${i}`)).name;
				DEBUG && console.log(`cal${i}: ${url}`);
				if (url.length > 0){
					if (JSON.parse(settingsStorage.getItem(`url${i}t`)) == true) {
						calendarIDs.push(getEventsPromiseCALDAV(url));    		  
					} else {
						calendarIDs.push(getEventsPromiseICS(url));
					}
					calendarInfo.push(i);
				}
			}

			DEBUG && console.log("Found " + calendarIDs.length + " calendar");

			if (calendarIDs.length == 0) return;

			const promise = calendarIDs[0].constructor;

			promise.all(calendarIDs).then((values) => {
				let events = [];
				for (let i in values) {
					// DEBUG && console.log(`cal ${i} is ${JSON.stringify(values[i])}`);
					if (values[i].error !== undefined) {
						DEBUG && console.log(`Error occurred while fetching calendar:`);
						DEBUG && console.log(JSON.stringify(values[i].error));
						throw values[i].error
					} 

					DEBUG && console.log(`cal ${i} is ${values[i].substring(0,20)}`);

					let items = icsToJson(values[i])  

					for (let event of items) {
						let ev = formatEvent(event, i);
						if (ev.end >= today) events.push(ev);
					}
				}

				events.sort(function (a, b) {
					let diff = a.start - b.start;
					if (diff != 0) 
						return diff;
					else if (a.allDay != b.allDay)
						return b.allDay - a.allDay;
					else if (a.summary < b.summary)
						return -1;
					else if (a.summary > b.summary)
						return 1;
					else return 0;      
				});

				// We need to cut down the sice and number of events as the api can only
				// habdel an maximum file size
				events = events.slice(0, MAX_EVENT_COUNT);       
				for (var i = (MAX_EVENT_COUNT-1); jsonSize({lastUpdate: now, events: events}) > MAX_EVENT_MEM; i--) {
					events = events.slice(0, i);
				}
				DEBUG && console.log("GC_DATA_FILE size = " + jsonSize({lastUpdate: now, events: events}));
				DEBUG && console.log("event count = " + events.length);

				// Send the file out
				outbox.enqueue(GC_DATA_FILE, cbor.encode({lastUpdate: now, events: events}))
				.catch(error => DEBUG && console.log(`Fail to send data: ${error}`));
				self.data = {lastUpdate: now, events: events};
			}).catch(err => {
				DEBUG && console.log('Error occurred while fetching single calendar events: ' + err + err.stack);
				let error=`${err}`;
				outbox.enqueue(GC_ERROR_FILE, cbor.encode(error))
				.catch(error => DEBUG && console.log(`Fail to send error: ${error}`));
			});

		}
		catch(err) {
			DEBUG && console.log('Error: ' + err + err.stack);
			let error = `${err} ${err.stack}`;
			outbox.enqueue(GC_ERROR_FILE, cbor.encode(error))
			.catch(error => DEBUG && console.log(`Fail to send error: ${error}`));	  
		}

	}

}


function getEventsPromiseCALDAV(calendarURL) {
	let headers = new Headers();
	let loginPass = "";
	let loginUser = "";

	let now = new Date();
	now = new Date(now.getTime() - (1 * 60 * 60 * 1000) + now.getTimezoneOffset() * 60000);  
//	DEBUG && console.log(`now=${now}`);
	let then = new Date(now.getTime() + (10*24*60*60*1000));
	then = new Date(then.getTime() + then.getTimezoneOffset() * 60000);  
//	DEBUG && console.log(`then=${then}`);
	let startDate = `${now.getYear()+1900}${zeroPad(now.getMonth()+1)}${zeroPad(now.getDate())}T${zeroPad(now.getHours())}${zeroPad(now.getMinutes())}${zeroPad(now.getSeconds())}Z`;
//	DEBUG && console.log(`now is ${startDate}`) ;
	let endDate = `${then.getYear()+1900}${zeroPad(then.getMonth()+1)}${zeroPad(then.getDate())}T${zeroPad(then.getHours())}${zeroPad(then.getMinutes())}${zeroPad(then.getSeconds())}Z`;
//	DEBUG && console.log(`then is ${endDate}`) ;

	loginPass = JSON.parse(settingsStorage.getItem("pass")).name;
	loginUser = JSON.parse(settingsStorage.getItem("user")).name;

	// DEBUG && console.log(loginUser + ":" + loginPass);

	headers.append("Depth",1); 
	headers.append("Prefer","return-minimal");
	headers.append("Content-Type","application/xml ; charset=utf-8");

	if(loginUser && loginUser.length > 0 && loginPass && loginPass.length > 0) {
		headers.append("Authorization", "Basic " + btoa(loginUser + ":" + loginPass))
	}

	return fetch(calendarURL, {
		method: "REPORT",
		headers,
		body: `<C:calendar-query xmlns:C=\"urn:ietf:params:xml:ns:caldav\">\
			<D:prop xmlns:D=\"DAV:\">\
			<D:getetag/>\
			<C:calendar-data>\
			<C:comp name=\"VCALENDAR\">\
			<C:comp name=\"VEVENT\">\
			<C:prop name=\"SUMMARY\"/>\
			<C:prop name=\"DTSTART\"/>\
			<C:prop name=\"VTIMEZONE\"/>\
			<C:prop name=\"RRULE\"/>\
			</C:comp>\
			</C:comp>\
			</C:calendar-data>\
			</D:prop>\
			<C:filter>\
			<C:comp-filter name=\"VCALENDAR\">\
			<C:comp-filter name=\"VEVENT\">\
			<C:time-range start=\"${startDate}\" \
			end=\"${endDate}\"/>\
			</C:comp-filter>\
			</C:comp-filter>\
			</C:filter>\
	</C:calendar-query>`}).then(function(result) {  
		DEBUG && console.log("---------------------- Http sucess ---------------------");
		DEBUG && console.log(result.status);
		DEBUG && console.log(result.headers.get('Content-Type'));
		return result.text();
	})
	.catch((err) => {
		var tmp = `Failed to fetch calendar ${calendarURL} with error ${err}`
			DEBUG && console.log(tmp);
		return {"error" : tmp};
	});
}

function getEventsPromiseICS(calendarURL) { 
	var headers = new Headers();
	// headers.append("Content-Type","VCS/ICS-Kalender ; charset=utf-8");
	// headers.append("Content-Type","text/plain ; charset=utf-8");
	headers.append("User-Agent","Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:21.0) Gecko/20100101 Firefox/21.0");

	return fetch(calendarURL, {
		method: "GET",
		headers}).then((res) => res.text())
		.catch((err) => {
			var tmp = `Failed to fetch calendar ${calendarURL} with error ${err}`
				DEBUG && console.log(tmp);
			return {"error" : tmp};
		});
}

function zeroPad(i) {

	if (i < 10) {
		i = "0" + i;
	}
	return i;
}

function formatEvent(event, cal) {
	// DEBUG && console.log(`text ${event.summary}`);
	// DEBUG && console.log(`formatEvent ${JSON.stringify(event)}`);
	// DEBUG && console.log(`sartTime ${event.start}`);
	// DEBUG && console.log(`sartTime ${calenDate(event.start).toString()}`);
	// DEBUG && console.log(JSON.parse(settingsStorage.getItem(`url${cal}color`)));

	var data = {
			start: new Date(event.startDate).getTime(),
			end:  event.endDate === undefined ? new Date(event.startDate).getTime() : new Date(event.endDate).getTime(),
					allDay: event.allDay,
					summary: event.summary,
					location: event.location === undefined ? "" : event.location,
							color: JSON.parse(settingsStorage.getItem(`url${cal}color`)),
							cal: JSON.parse(settingsStorage.getItem(`url${cal}name`)).name
	};
	// DEBUG && console.log(`formatEvent ${JSON.stringify(data)}`);
	return data;
}

//Get byte size of a JSON object
function jsonSize(s) {
	return ~-encodeURI(JSON.stringify(s)).split(/%..|./).length;
}