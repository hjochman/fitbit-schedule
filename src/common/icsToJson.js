/** 
 * https://github.com/cwlsn/ics-to-json
 * 
 * Convert the ICS calendar format to JSON data to consume in web apps.
 * 
 * 
 */


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

const icsToJson = icsData => {
  const array = [];
  let currentObj = {};
  let lastKey = "";

  //console.log(icsData);	
  
  const lines = icsData.split(NEW_LINE);

  console.log("ICS Lines: " + lines.length);
  
  let isAlarm = false;
  let isEvent = false;
  for (let i = 0, iLen = lines.length; i < iLen; ++i) {
    const line = lines[i];
    const pos = line.indexOf(":");
    
    if (pos < 0) {
        if (line.startsWith(" ") && lastKey !== undefined && lastKey.length) {
            currentObj[lastKey] += line.substr(1);
          }
          continue;    	
    } else {
    	 lastKey = keyMap[key];
    	 let key = line.substring(0,pos);
    	 const value = line.substring(pos+1);
    }
    
   
    if (key.indexOf(";") !== -1) {
      const keyParts = key.split(";");
      key = keyParts[0];
      // Maybe do something with that second part later
    }

    //console.log("ICS " + key + " => " + value);    
    switch (key) {
      case EVENT_START:
        if (value === EVENT) {
          isEvent = true;
          currentObj = {};
        } else if (value === ALARM) {
          isAlarm = true;
        }
        break;
      case EVENT_END:
        isAlarm = false;
        if (value === EVENT) {
        	array.push(currentObj);
        	isEvent = false;
        }
        break;
      case START_DATE:
    	if (isEvent) {  
    		currentObj[keyMap[START_DATE]] = value;
//    		console.log("s: "+clean(value));	
    	}
        break;
      case END_DATE:
      	if (isEvent) {  
        currentObj[keyMap[END_DATE]] = value;
//        console.log("e: "+clean(value));	
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
//      		console.log("t: "+clean(value));	
    	}
        break;
      case LOCATION:
      	if (isEvent) {  
      		currentObj[keyMap[LOCATION]] = clean(value);
//      		console.log("l: " + clean(value));	
    	}
      default:
        continue;
    }
  }
  return array;
};

export default icsToJson;
