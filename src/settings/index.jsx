import { _, setPrefLanguage } from "./settingsLocale.js";


function mySettings(props) {
  try {
  	if (typeof props.settingsStorage.getItem("language_override") !== 'undefined') {
    	let overrideLanguage = JSON.parse(props.settingsStorage.getItem("language_override"));
    	setPrefLanguage(overrideLanguage && overrideLanguage.values[0].value);
   	} else {
   		setPrefLanguage("en-US");
   	}
  } catch (e) {
    setPrefLanguage("en-US");
    console.log("Malformed language settings: " + e + ", " + props.settingsStorage.getItem("language_override"));
  }

//Set default values
 if ( props.settingsStorage.getItem("url0color") === undefined ) props.settingsStorage.setItem("url0color", JSON.stringify("#FF0000"));
 if ( props.settingsStorage.getItem("url1color") === undefined ) props.settingsStorage.setItem("url1color", JSON.stringify("#00FF00"));
 if ( props.settingsStorage.getItem("url2color") === undefined ) props.settingsStorage.setItem("url2color", JSON.stringify("#ffb878"));
 if ( props.settingsStorage.getItem("url3color") === undefined ) props.settingsStorage.setItem("url3color", JSON.stringify("#dbadff"));
 if ( props.settingsStorage.getItem("url4color") === undefined ) props.settingsStorage.setItem("url4color", JSON.stringify("#0000ff"));
 if ( props.settingsStorage.getItem("url0name") === undefined ) props.settingsStorage.setItem("url0name", JSON.stringify({"name":"Calendar 1"}));
 if ( props.settingsStorage.getItem("url1name") === undefined ) props.settingsStorage.setItem("url1name", JSON.stringify({"name":"Calendar 2"}));
 if ( props.settingsStorage.getItem("url2name") === undefined ) props.settingsStorage.setItem("url2name", JSON.stringify({"name":"Calendar 3"}));
 if ( props.settingsStorage.getItem("url3name") === undefined ) props.settingsStorage.setItem("url3name", JSON.stringify({"name":"Calendar 4"}));
 if ( props.settingsStorage.getItem("url4name") === undefined ) props.settingsStorage.setItem("url4name", JSON.stringify({"name":"Calendar 5"}));
 if ( props.settingsStorage.getItem("url0t") === undefined ) props.settingsStorage.setItem("url0t", JSON.stringify('false'));
 if ( props.settingsStorage.getItem("url1t") === undefined ) props.settingsStorage.setItem("url1t", JSON.stringify('false'));
 if ( props.settingsStorage.getItem("url2t") === undefined ) props.settingsStorage.setItem("url2t", JSON.stringify('false'));
 if ( props.settingsStorage.getItem("url3t") === undefined ) props.settingsStorage.setItem("url3t", JSON.stringify('false'));
 if ( props.settingsStorage.getItem("url4t") === undefined ) props.settingsStorage.setItem("url4t", JSON.stringify('false'));
  

  return (
    <Page>
      <Section title={<Text bold align="center">CALDAV User</Text>}>
        <TextInput settingsKey="user" label="User" type="text" />
        <TextInput settingsKey="pass" label="Password" type="password" />
      </Section>
      <Section title={<Text bold align="center">CALDAV/ICS URLs</Text>}>
        <Text>For CLDAV the url has to point to the selected calender not to the server. Example for Ownclod/Nextcloud https://server.com/../remote.php/dav/calendars/user/personal/</Text>

 		<Text bold align="center">Calendar 1</Text>
        <TextInput settingsKey="url0name" label="Name" type="text" />      
        <ColorSelect centered={true} settingsKey="url0color"
  			colors={[{color: '#FF0000'},{color: '#00FF00'},{color: '#ffb878'},{color: '#dbadff'},{color: '#0000ff'},{color: '#ffff00'}]}
  		/>
        <TextInput settingsKey="url0" label="URL" type="text" />
        <Toggle settingsKey="url0t" label={`Type: ${props.settings.url0t === 'true' ? 'CALDAV' : 'ICAL'}`}/>

 		<Text bold align="center">Calendar 2</Text>
        <TextInput settingsKey="url1name" label="Name" type="text" />      
        <ColorSelect centered={true} settingsKey="url1color"
  			colors={[{color: '#FF0000'},{color: '#00FF00'},{color: '#ffb878'},{color: '#dbadff'},{color: '#0000ff'},{color: '#ffff00'}]}
  		/>
        <TextInput settingsKey="url1" label="URL" type="text" />
        <Toggle settingsKey="url1t" label={`Type: ${props.settings.url1t === 'true' ? 'CALDAV' : 'ICAL'}`}/>

 		<Text bold align="center">Calendar 3</Text>
        <TextInput settingsKey="url2name" label="Name" type="text" />      
        <ColorSelect centered={true} settingsKey="url2color"
  			colors={[{color: '#FF0000'},{color: '#00FF00'},{color: '#ffb878'},{color: '#dbadff'},{color: '#0000ff'},{color: '#ffff00'}]}
  		/>
        <TextInput settingsKey="url2" label="URL" type="text" />
        <Toggle settingsKey="url2t" label={`Type: ${props.settings.url2t === 'true' ? 'CALDAV' : 'ICAL'}`}/>

 		<Text bold align="center">Calendar 4</Text>
        <TextInput settingsKey="url3name" label="Name" type="text" />      
        <ColorSelect centered={true} settingsKey="url3color"
  			colors={[{color: '#FF0000'},{color: '#00FF00'},{color: '#ffb878'},{color: '#dbadff'},{color: '#0000ff'},{color: '#ffff00'}]}
  		/>
        <TextInput settingsKey="url3" label="URL" type="text" />
        <Toggle settingsKey="url3t" label={`Type: ${props.settings.url3t === 'true' ? 'CALDAV' : 'ICAL'}`}/>

 		<Text bold align="center">Calendar 5</Text>
        <TextInput settingsKey="url4name" label="Name" type="text" />      
        <ColorSelect centered={true} settingsKey="url4color"
  			colors={[{color: '#FF0000'},{color: '#00FF00'},{color: '#ffb878'},{color: '#dbadff'},{color: '#0000ff'},{color: '#ffff00'}]}
  		/>
        <TextInput settingsKey="url4" label="URL" type="text" />
        <Toggle settingsKey="url4t" label={`Type: ${props.settings.url4t === 'true' ? 'CALDAV' : 'ICAL'}`}/>
      </Section>
 
      <Section title="Options">
        <Toggle
          settingsKey="system_default_font"
          label={_("system_default_font")}
        />
        <Toggle
          settingsKey="hide_countdown"
          label={_("hide_countdown")}
        />
        <Toggle
          settingsKey="countdown_second"
          label={_("countdown_second")}
        />
        <Select
          label={_("language_override")}
          settingsKey="language_override"
          selectViewTitle={_("select_language")}
          options={[
            { name: _("lang_default"), value: "default" },
            { name: _("lang_enUS"), value: "en-US" },
            { name: _("lang_jaJP"), value: "ja-JP" },
            { name: _("lang_zhCN"), value: "zh-CN" },
          ]}
        />
        <Text>{_("language_change_hint")}</Text>
      </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);
