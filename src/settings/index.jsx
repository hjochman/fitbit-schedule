//import { G_CALENDAR_CLIENT_ID, G_CALENDAR_CLIENT_SECRET } from "../common/config";
import { _, setPrefLanguage } from "settingsLocale.js";

let G_CALENDAR_CLIENT_ID = "";
let G_CALENDAR_CLIENT_SECRET = "";

function mySettings(props) {
  try {
    let overrideLanguage = JSON.parse(props.settingsStorage.getItem("language_override"));
    setPrefLanguage(overrideLanguage && overrideLanguage.values[0].value);
  } catch (e) {
    setPrefLanguage("en-US");
    console.log("Malformed language settings: " + e + ", " + props.settingsStorage.getItem("language_override"));
  }

  return (
    <Page>
      <Section title={_("authentication")}>
        <Oauth
          settingsKey="oauth"
          label={_("login_with_google")}
          status={(props.settingsStorage.getItem('oauth_refresh_token') !== undefined) ? _("authorized") : _("unauthorized")}
          authorizeUrl="https://accounts.google.com/o/oauth2/v2/auth"
          requestTokenUrl="https://www.googleapis.com/oauth2/v4/token"
          clientId={G_CALENDAR_CLIENT_ID}
          clientSecret={G_CALENDAR_CLIENT_SECRET}
          scope="https://www.googleapis.com/auth/calendar.readonly"
          pkce
          oAuthParams={{ access_type: 'offline', prompt: 'consent' }}
          onAccessToken={async (data) => {
            if (data.refresh_token !== undefined) {
              props.settingsStorage.setItem('oauth_refresh_token', data.refresh_token);
            }
            return data;
          }}
        />
        <Button
          label={_("log_out")}
          onClick={() => {
            props.settingsStorage.removeItem("oauth_refresh_token");
            props.settingsStorage.removeItem("oauth");
          }}
        />
      </Section>
      <Section
        title={<Text bold align="center">CALDAV/ICS Settings</Text>}>
        <TextInput settingsKey="user" label="User" type="text" />
        <TextInput settingsKey="pass" label="Password" type="text" />
        Configure up to five CALDAV/ICS URLs:
        <TextInput settingsKey="url0" label="URL 1: (e.g.: https://hostname:8443/calendars/__uids__/XXXXXXX-XXXX-XXXX-XXXX-XXXXXX/YYYYYY-YYYY-YYYY-YYYY-YYYYYY/)" type="text" />
        <Toggle settingsKey="url0t" label={`Type: ${props.settings.url0t === 'true' ? 'CALDAV' : 'ICAL'}`}/>
        <TextInput settingsKey="url1" label="URL 2: (e.g.: https://hostname:8443/calendars/__uids__/XXXXXXX-XXXX-XXXX-XXXX-XXXXXX/YYYYYY-YYYY-YYYY-YYYY-YYYYYY/)" type="text" />
        <Toggle settingsKey="url1t" label={`Type: ${props.settings.url1t === 'true' ? 'CALDAV' : 'ICAL'}`}/>
        <TextInput settingsKey="url2" label="URL 3: (e.g.: https://hostname:8443/calendars/__uids__/XXXXXXX-XXXX-XXXX-XXXX-XXXXXX/YYYYYY-YYYY-YYYY-YYYY-YYYYYY/)" type="text" />
        <Toggle settingsKey="url2t" label={`Type: ${props.settings.url2t === 'true' ? 'CALDAV' : 'ICAL'}`}/>
        <TextInput settingsKey="url3" label="URL 4: (e.g.: https://hostname:8443/calendars/__uids__/XXXXXXX-XXXX-XXXX-XXXX-XXXXXX/YYYYYY-YYYY-YYYY-YYYY-YYYYYY/)" type="text" />
        <Toggle settingsKey="url3t" label={`Type: ${props.settings.url3t === 'true' ? 'CALDAV' : 'ICAL'}`}/>
        <TextInput settingsKey="url4" label="URL 5: (e.g.: https://hostname:8443/calendars/__uids__/XXXXXXX-XXXX-XXXX-XXXX-XXXXXX/YYYYYY-YYYY-YYYY-YYYY-YYYYYY/)" type="text" />
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
