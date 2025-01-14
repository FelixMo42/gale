// client/dates.ts
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
function makeSingleDayCalenderSource({ schedule }) {
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

// client/html.ts
var _ = new Proxy({}, {
  get(_target, tag) {
    const el = document.createElement(tag);
    const builder = (...children) => {
      el.replaceChildren(...children.map((child) => {
        if (typeof child === "number") {
          return String(child);
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
    builder.style = (style) => {
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

// client/els/calender.ts
function queryCalender(date = /* @__PURE__ */ new Date()) {
  const events = MY_CALENDER.flatMap((source) => source(date));
  const withoutOverlaps = [];
  function overlaps(a, b) {
    return b.start >= a.start && b.start < a.end || a.start > b.start && a.start < b.end;
  }
  for (const event of events) {
    if (!withoutOverlaps.some((e) => overlaps(event, e))) {
      withoutOverlaps.push(event);
    }
  }
  withoutOverlaps.sort((a, b) => a.start - b.start);
  const emptyBlocks = [];
  for (let i = 0; i < withoutOverlaps.length - 1; i++) {
    const diff = withoutOverlaps[i + 1].start - withoutOverlaps[i].end;
    if (withoutOverlaps[i].end !== withoutOverlaps[i + 1].start) {
      emptyBlocks.push({
        name: diff < 1 ? "" : "Empty",
        start: withoutOverlaps[i].end,
        end: withoutOverlaps[i + 1].start,
        background: "#4C4E52"
      });
    }
  }
  return [
    ...withoutOverlaps,
    ...emptyBlocks
  ].sort((a, b) => a.start - b.start);
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
    background: `url("img/bed.png")`
  }),
  makeCalenderSource({
    name: "Go Thrift Shopping",
    schedule: "2025/1/14 9:00-12:00"
  }),
  // Import other calenders
  ...XR_CALENDER,
  ...LIBRARY_CALENDER
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
    _.div.style({
      height: (25 - skipHours) * pxPerHour,
      padding: "0px 2px"
    })(...events.sort((a, b) => a.start - b.end).map(
      (event) => _.div.withClass("calevent").style({
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
  } else if (background.includes("url")) {
    return {
      "background-image": `${background}`
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

// client/main.ts
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
    row(
      _.div.withClass("box", "red").style({ flex: 2 })(
        _.label("To Do"),
        _.div.style({ height: 300, overflow: "scroll" })(
          pad("Grocery Shopping \u{1F374}"),
          pad("Clean my room \u{1F3E0}"),
          pad("Do Laundry \u{1F392}"),
          pad("Camping Solution \u{1F392}"),
          pad("Global Charging Solution \u{1F392}"),
          pad("Fix my Pants \u{1F392}"),
          pad("Get a Keffiyeh \u{1F392}"),
          pad("Get a folder for papers \u{1F392}"),
          pad("Univenting the Gun \u270D\u{1F3FB}"),
          pad("Life Design \u270D\u{1F3FB}"),
          pad("Visit Temp Agency \u{1F454}"),
          pad("Verify on LinkedIn \u{1F454} #short"),
          pad("Edit Resume \u{1F454}"),
          pad("Reply to Miles \u{1F465} #short"),
          pad("Reply to Papa \u{1F465} #short"),
          pad("Make Tacocat Album \u{1F465}"),
          pad("Work on Gale \u2699\uFE0F")
        )
      ),
      _.div.withClass("col").style({ flex: 1 })(
        _.div.withClass("box", "blue")(
          _.label("Today (3/3)"),
          pad("New Pants \u{1F392}"),
          pad("SSN Paperwork \u{1F454}"),
          pad("Reply to Julie \u{1F465}")
        ),
        _.div.withClass("box", "green", "flex")(
          _.label("Done"),
          _.br()
        )
      )
    ),
    _.br(),
    CalenderView()
  );
}
export {
  main as default
};
