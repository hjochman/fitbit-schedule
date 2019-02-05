# Schedule caldav/ical

A schedule viewer for Fitbit OS 2.

## Install

1. Tap [here](https://gam.fitbit.com/gallery/app/e7246ff0-37c9-4709-9ecb-20c322137295) to redirect to Fitbit App gallery. (Mobile only).
2. Add your CALDAV/iCAL calendars in the app settings (inside the Fitbit App).

## Features
- [x] Support Fitbit Versa and Fitbit Ionic.
- [x] Support ICAL and CALDAV Calendar
    - [x] Show up to 5 calendars (from one caldav account and multiple ical links) together
- [x] Detail page showing event title, time and location.
- [x] Countdown to the end of current event
- [x] Countdown to the start of next event
- [x] East Asian text support
- [x] On/Off switch for countdowns
- [x] Multilingual support (English (US), 简体中文（中国）, 日本語)

## Screenshots

| Versa | | |
| - | - | - |
| ![Screenshot 0](screenshots/Versa-0.png?raw=true) | ![Screenshot 1](screenshots/Versa-1.png?raw=true) | ![Screenshot 2](screenshots/Versa-2.png?raw=true) |
| ![Screenshot 3](screenshots/Versa-3.png?raw=true) | ![Screenshot 4](screenshots/Versa-4.png?raw=true) | |

| Ionic | |
| - | - |
| ![Screenshot 1](screenshots/Ionic-1.png?raw=true) | ![Screenshot 2](screenshots/Ionic-2.png?raw=true) |
| ![Screenshot 3](screenshots/Ionic-3.png?raw=true) | ![Screenshot 4](screenshots/Ionic-4.png?raw=true) |

## Usage
- Tap event block to show details
- Swipe to the right to show countdowns
- Tap the status bar to force refresh

To adjust 12h/24h settings, go to your Fitbit web profile page.

## Note

In 12h mode, `0:00` midnight is shown as `12:00m`, and `12:00` noon is shown as `12:00n`, other time is followed by `a` or `p` as normal.


Or if you want to help develop it, send a pull request!

## License

    Schedule, a schedule viewer for Fitbit OS 2.
    Copyright (C) 2018 Eana Hufwe

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
