import { settingsStorage } from "settings";
import { outbox } from "file-transfer";
import { peerSocket } from "messaging";
import * as cbor from "cbor";
import icsToJson from "../common/icsToJson.js"
import { GC_DATA_FILE, GC_ERROR_FILE, GC_UPDATE_TOKEN, MAX_EVENT_COUNT } from "../common/const";

const colorMapping = {
  "1": {
   "background": "#a4bdfc",
   "foreground": "#1d1d1d"
  },
  "2": {
   "background": "#ffb878",
   "foreground": "#1d1d1d"
  },
  "3": {
   "background": "#dbadff",
   "foreground": "#1d1d1d"
  },
  "4": {
   "background": "#ff887c",
   "foreground": "#1d1d1d"
  },
  "5": {
   "background": "#fbd75b",
   "foreground": "#1d1d1d"
  },
  "6": {
   "background": "#7ae7bf",
   "foreground": "#1d1d1d"
  },
  "7": {
   "background": "#46d6db",
   "foreground": "#1d1d1d"
  },
  "8": {
   "background": "#e1e1e1",
   "foreground": "#1d1d1d"
  },
  "9": {
   "background": "#5484ed",
   "foreground": "#1d1d1d"
  },
  "10": {
   "background": "#51b749",
   "foreground": "#1d1d1d"
  },
  "11": {
   "background": "#dc2127",
   "foreground": "#1d1d1d"
  }
};

export default class gCalendar {
  
  constructor() {
    let self = this;
    this.data = {lastUpdate: 0};
    peerSocket.addEventListener("message", (evt) => {
      console.log(`listening socket heard ${JSON.stringify(evt.data)}`);
      // We are receiving a request from the app
      if (evt.data === undefined) return;
      if (evt.data[GC_UPDATE_TOKEN] == true) {
        console.log("Start loading events");
        self.loadEvents();
      } 
    });
    
  }

  loadEvents() {
	let calURL = [];
	let calType = [];
    if(!this.isLoggedIn()) return;
    for (let index = 0; index < settingsStorage.length; index++) {
      let key = settingsStorage.key(index);
  //    console.log(key + ":" + settingsStorage.getItem(key));
      if (key && key.substring(0, 3) === "url" && key.length === 4) {
    	// We already have an URL
    	let value = JSON.parse(settingsStorage.getItem(key)).name;
   	    if(value && value.length > 0) {
      	  calURL.push(value);
      	  calType.push(settingsStorage.getItem(key+"t"));
   	    }
      }
    }
    if(calURL[0] && calURL[0].length > 0) {
    	// We have at least one URL, trigger Update
    	this.fetchEvents(calURL, calType, true);
    }
  }
  
  isLoggedIn() {
	// TODO: Need to be fixed
	return true;
    // return settingsStorage.getItem('oauth_refresh_token') !== undefined;
  }

  fetchEvents(calURL, calType, retry) {
    const now = new Date().getTime();
    const today = new Date().setHours(0,0,0,0);
    const self = this;
    
    let calendarIDs = [];
    let calendarInfo = [];

      for (var i = 0; i < calURL.length; i++) {
    	  //TODO: Check if ICS or CLDAV => now we only use ICS
    	  console.log(i + calType[i]);
    	  if (calType[i] === "true") {
            calendarIDs.push(getEventsPromiseCALDAV(calURL[i]));    		  
    	  } else {
            calendarIDs.push(getEventsPromiseICS(calURL[i]));
    	  } 
    	  calendarInfo.push(i);
    	}

      if (calendarIDs.length < 0) return;
      
      const promise = calendarIDs[0].constructor;
      
      promise.all(calendarIDs).then((values) => {
        let events = [];
        for (let i in values) {
        	console.log(`cal ${i} is ${values[i].substring(0,20)}`);

        /**  if (values[i].error !== undefined) {
            console.log("Error occurred while fetching calendar " + i +" :");
            console.log(JSON.stringify(values[i].error));
            continue;
          } **/
          	
          let items = icsToJson(values[i])  
          
          for (let event of items) {
            let ev = formatEvent(event, calendarInfo[i]);
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
        events = events.slice(0, MAX_EVENT_COUNT);

        // Send the file out
        outbox.enqueue(GC_DATA_FILE, cbor.encode({lastUpdate: now, events: events}))
              .catch(error => console.log(`Fail to send data: ${error}`));
        self.data = {lastUpdate: now, events: events};
      }).catch(err => {
        console.log('Error occurred while fetching single calendar events: ' + err + err.stack);
      });
   
  }
  
}


function getEventsPromiseCALDAV(calendarURL) {
  let headers = new Headers();
  let loginPass = "";
  let loginUser = "";
  
  let now = new Date();
  now = new Date(now.getTime() - (1 * 60 * 60 * 1000) + now.getTimezoneOffset() * 60000);  
  console.log(`now=${now}`);
  let then = new Date(now.getTime() + (10*24*60*60*1000));
  then = new Date(then.getTime() + then.getTimezoneOffset() * 60000);  
  console.log(`then=${then}`);
  let startDate = `${now.getYear()+1900}${zeroPad(now.getMonth()+1)}${zeroPad(now.getDate())}T${zeroPad(now.getHours())}${zeroPad(now.getMinutes())}${zeroPad(now.getSeconds())}Z`;
  console.log(`now is ${startDate}`)  ;
  let endDate = `${then.getYear()+1900}${zeroPad(then.getMonth()+1)}${zeroPad(then.getDate())}T${zeroPad(then.getHours())}${zeroPad(then.getMinutes())}${zeroPad(then.getSeconds())}Z`;
  console.log(`then is ${endDate}`)  ;    		

  loginPass = JSON.parse(settingsStorage.getItem("pass")).name;
  loginUser = JSON.parse(settingsStorage.getItem("user")).name;
  
  //console.log(loginUser + ":" + loginPass);
  
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
    	     console.log("---------------------- Http sucess ---------------------");
    	     console.log(result.status);
    	     console.log(result.headers.get('Content-Type'));
    	     return result.text();
    	  })
  .catch((err) => {
    console.log(`Failed to fetch calendar withid ${calendarURL} with error ${err}`);
  });
}

function getEventsPromiseICS(calendarURL) { 
  var headers = new Headers();
  //headers.append("Content-Type","VCS/ICS-Kalender ; charset=utf-8");
  //headers.append("Content-Type","text/plain ; charset=utf-8");
  headers.append("User-Agent","Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:21.0) Gecko/20100101 Firefox/21.0");
  
  return fetch(calendarURL, {
	  method: "GET",
      headers}).then((res) => res.text())
  .catch((err) => {
    console.log(`Failed to fetch calendar withid ${calendarURL} with error ${err}`);
  });

 
}

function formatColor(colorID) {
  let color = colorMapping[`${colorID}`];
  if (color === undefined) {
    color = {background: "#00A4Ee", foreground: "#ffffff"};
  }
  return color;
}

function formatEvent(event, calendar) {
	//TODO: ID is only dummy for now
	console.log(`text ${event.summary}`);
	console.log(`formatEvent ${JSON.stringify(event)}`);
	  //console.log(`sartTime ${event.start}`);
	  //console.log(`sartTime ${calenDate(event.start).toString()}`);
	  
	  
  var data = {
    id: "",
    start: calenDate(event.startDate).getTime(),
    end:  event.endDate === undefined ? calenDate(event.startDate).getTime() : calenDate(event.endDate).getTime(),
    allDay: (event.startDate.length == 8 && event.endDate !== undefined && event.endDate.length == 8) ? true : false,
    summary: event.summary,
    location: event.location,
    color: formatColor(calendar),
    calendar: {
      color: formatColor(calendar),
      summary: "Calendar " + calendar,
      id: calendar,
    },
  };
  return data;
}

/**
 * Decode ical dateTime
 * 
 * Arguments: dateTime (string) dateTime string in ical format
 */
function calenDate(icalStr)  {
    // icalStr = '20110914T184000Z'
	var strHour = "00";
    var strMin = "00";
    var strSec = "00";
    
    var strYear = icalStr.substr(0,4);
    var strMonth = icalStr.substr(4,2);
    var strDay = icalStr.substr(6,2);
    if (icalStr.length > 8) {
    	strHour = icalStr.substr(9,2);
    	strMin = icalStr.substr(11,2);
    	strSec = icalStr.substr(13,2);   	
    }
 
    var oDate = new Date(parseInt(strYear),parseInt(strMonth)-1, parseInt(strDay), parseInt(strHour), parseInt(strMin), parseInt(strSec),0);
    
return oDate;
}

function zeroPad(i) {
    
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}