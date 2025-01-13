// src/dates.ts
var DaysOfTheWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];
function makeEverdayCalenderSource({ name, schedule }) {
  return () => true;
}
function makeRepeatCalenderSource({ name, schedule }) {
  const daysOfTheWeek = DaysOfTheWeek.map((day, id) => schedule.toUpperCase().includes(day.toUpperCase()) ? id : -1);
  return (q) => daysOfTheWeek.includes(q.getDay());
}
function makeSingleDayCalenderSource({ name, schedule }) {
  const { year, month, date } = parseDate(schedule);
  return (q) => q.getFullYear() === year && q.getMonth() === month && q.getDate() == date;
}
function getQuery(props) {
  if (props.schedule.includes("everyday")) {
    return makeEverdayCalenderSource(props);
  } else if (props.schedule.includes("weekday")) {
    return (date) => date.getDay() >= 1 && date.getDay() <= 5;
  } else if (props.schedule.includes("every")) {
    return makeRepeatCalenderSource(props);
  } else {
    return makeSingleDayCalenderSource(props);
  }
}
function makeCalenderSource(props) {
  const query = getQuery(props);
  const { start, end } = parseHours(props.schedule);
  return (q) => {
    if (query(q)) {
      return [{ start, end, ...props }];
    } else {
      return [];
    }
  };
}
function parseDate(schedule) {
  const match = schedule.match(/(\d+)\/(\d+)\/(\d+)/);
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const date = Number(match[3]);
  return { year, month, date };
}
function parseHours(schedule) {
  const match = schedule.match(/(\d+:?\d{2})-(\d+:?\d{2})/);
  const start = parseHour(match[1]);
  const end = parseHour(match[2]);
  return { start, end };
}
function parseHour(hour) {
  const total = Number(hour.replace(":", ""));
  const minutes = total & 100;
  const hours = (total - minutes) / 100;
  return hours + minutes / 60;
}

// src/html.ts
var _ = new Proxy({}, {
  get(na, tag) {
    const el = document.createElement(tag);
    const builder = (...children) => {
      el.replaceChildren(...children.map((child) => {
        if (typeof child === "number") {
          return _.span(String(child));
        } else if (typeof child === "string" && tag !== "span") {
          return _.span(child);
        } else {
          return child;
        }
      }));
      return el;
    };
    builder.with = (t) => {
      t(el);
      return builder;
    };
    builder.withId = (id) => {
      el.id = id;
      return builder;
    };
    builder.withAttr = (name, value) => {
      if (name === "checked" && !value) {
        return builder;
      }
      el.setAttribute(name, value);
      return builder;
    };
    builder.withClass = (...classes) => {
      el.classList.add(...classes);
      return builder;
    };
    builder.withStyle = (style) => {
      for (const [key, val] of Object.entries(style)) {
        el.style.setProperty(
          key,
          typeof val === "number" ? `${val}px` : val
        );
      }
      return builder;
    };
    builder.on = (event, cb) => {
      el.addEventListener(event, cb);
      return builder;
    };
    return builder;
  }
});
function flex(...children) {
  return _.div.withClass("flex")(...children);
}
function col(...children) {
  return _.div.withClass("col")(...children);
}
function row(...children) {
  return _.div.withClass("row")(...children);
}

// src/els/calender.ts
function queryCalender(date = /* @__PURE__ */ new Date()) {
  return MY_CALENDER.flatMap((source) => source(date));
}
function getCurrentCalenderTask() {
  const now = (/* @__PURE__ */ new Date()).getHours();
  return queryCalender().filter((event) => event.start >= now && now <= event.end);
}
var XR_CALENDER = [
  makeCalenderSource({
    name: "XR Nord",
    schedule: "every monday 19:00-22:00",
    background: "#556B2F"
  }),
  makeCalenderSource({
    name: "XR Rive-Gauche",
    schedule: "every thursday 18:00-21:00",
    background: "#556B2F"
  })
];
var LIBRARY_CALENDER = [
  makeCalenderSource({
    name: "Biblio La Villet",
    schedule: "every weekday 1200-1700",
    background: "https://www.pixelstalk.net/wp-content/uploads/2016/08/Old-Library-Wallpaper.jpg"
  })
];
var MY_CALENDER = [
  ...XR_CALENDER,
  ...LIBRARY_CALENDER,
  // Work
  makeCalenderSource({
    name: "EA Meetup",
    schedule: "2025/1/18 1400-1800"
  }),
  // Social
  makeCalenderSource({
    name: "Le Louvre \\w Elise",
    schedule: "2025/1/13 1100-1500",
    background: "#2596be"
  }),
  makeCalenderSource({
    name: "Call \\w Eli",
    schedule: "every Sunday 1700-1900",
    background: "#2596be"
  }),
  // Maintenance
  makeCalenderSource({
    name: "",
    schedule: "everyday 8:00-9:00",
    background: "https://wallpapercave.com/wp/wp5019587.jpg"
  }),
  makeCalenderSource({
    name: "",
    schedule: "everyday 23:00-24:00",
    background: "https://www.naturalbedcompany.co.uk/wp-content/uploads/Bloomsbury-modern-upholstered-bed-side-view-scaled.jpg"
  }),
  makeCalenderSource({
    name: "Go Thrift Shopping",
    schedule: "2025/1/14 9:00-12:00"
  })
];
function CalenderView() {
  return col(
    weekHeaders(),
    row(...getDatesForWeek(0).map(dayView))
  );
}
function weekHeaders() {
  return row(...[
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun"
  ].map((dayName) => _.div.withClass("center", "flex")(dayName)));
}
function dayView(date) {
  const events = queryCalender(date);
  const skipHours = 8;
  const pxPerHour = 550 / (24 - skipHours);
  return _.div.withClass("day")(
    date.getDate(),
    _.div.withStyle({
      height: (25 - skipHours) * pxPerHour,
      padding: "0px 2px"
    })(...events.sort((a, b) => a.start - b.end).map(
      (event) => _.div.withClass("calevent").withStyle({
        height: (event.end - event.start) * pxPerHour,
        top: (event.start - skipHours) * pxPerHour,
        ...bg(event.background)
      })(_.span.withClass("shadow")(event.name))
    ))
  );
}
function bg(background) {
  if (!background) {
    return {};
  } else if (background.includes("http")) {
    return {
      "background-image": `url(${background})`
    };
  } else {
    return {
      "background-color": background
    };
  }
}
function getDatesForWeek(week = 0) {
  const start = /* @__PURE__ */ new Date();
  const dayOfWeek = start.getDay();
  start.setDate(start.getDate() - dayOfWeek + 1);
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(date);
  }
  return dates;
}

// src/main.ts
function NowView() {
  const calenderEvent = getCurrentCalenderTask();
  return box(
    _.label("What should I be doing right now?"),
    pad(
      row(
        flex(`Right now from calender: `, _.span.withClass("underline")(calenderEvent[0].name)),
        button()
      )
    )
  );
}
function button() {
  return _.button("dismiss");
}
function pad(...children) {
  return _.div.withClass("pad")(...children);
}
function box(...children) {
  return _.div.withClass("box")(...children);
}
function main() {
  return col(
    _.h1("My Second Brain"),
    _.br(),
    NowView(),
    _.br(),
    CalenderView()
  );
}
export {
  main as default
};
