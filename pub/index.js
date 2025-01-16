// src/core/html.ts
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
    builder.c = (...classes) => {
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
  return _.div.c("flex")(...children);
}
function col(...children) {
  return _.div.c("col")(...children);
}

// src/core/update.ts
var hooks = /* @__PURE__ */ new Set();
function update() {
  hooks.forEach((hook) => hook());
}
function listen(hook) {
  hooks.add(hook);
  return hook;
}
function use(data, hook) {
  const start = data();
  hook(start);
  let memory = JSON.stringify(start);
  listen(() => {
    const newData = data();
    const newText = JSON.stringify(newData);
    if (newText !== memory) {
      memory = newText;
      hook(newData);
    }
  });
}
function dyn(data, view) {
  const parent = _.div();
  use(data, (d) => parent.replaceChildren(view(d)));
  return parent;
}

// src/core/navigation.ts
var nav = ["My_Second_Brain.md", "Get_A_Job.md"];
function goTo(page) {
  nav[1] = page;
  update();
}

// src/plugins/tasks.ts
function todoBox(props) {
  return _.div.c("box", props.color).style({
    flex: props.flex ? String(props.flex) : void 0,
    "display": "flex",
    "flex-direction": "column",
    "min-height": props.label == "Done" ? 0 : void 0
  })(
    _.label(props.label),
    _.div.style({
      "overflow": "scroll",
      "display": "flex",
      "flex-direction": "column"
    })(
      ...props.data.map((todo) => _.div.c("row", "flex", "pad", "press").on("click", () => {
        if (todo.link) {
          goTo(todo.link);
        }
      })(
        flex(todo.id)
      ))
    )
  );
}
function TaskView(todos) {
  return _.div.c("row").style({ height: 300 })(
    todoBox({
      label: "Todo",
      color: "red",
      data: todos.filter((todo) => todo.status === "todo"),
      flex: 3
    }),
    _.div.c("col").style({ flex: String(2) })(
      todoBox({
        label: "Today",
        color: "blue",
        data: todos.filter((todo) => todo.status === "active")
      }),
      todoBox({
        label: "Done",
        color: "green",
        data: todos.filter((todo) => todo.status === "done")
      })
    )
  );
}

// src/main.ts
var cache = /* @__PURE__ */ new Map();
function Router() {
  return dyn(() => nav, () => _.div.c("stack")(...nav.map(Document)));
}
function parseDocument(path, text) {
  const title = path.slice(0, -3).replaceAll("_", " ");
  const blocks = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("- [")) {
      blocks.push({
        kind: "checkbox",
        text: lines[i].substring(6)
      });
    } else if (lines[i].trim().startsWith("-")) {
      blocks.push({
        kind: "list",
        text: lines[i].trim().substring(2)
      });
    } else if (lines[i].startsWith("```")) {
      const end = getNextLine(i);
      const data = JSON.parse(lines.slice(i + 1, end).join("\n"));
      blocks.push({
        kind: "todo",
        todos: data
      });
      i = end + 1;
    } else {
      blocks.push({
        kind: "text",
        text: lines[i]
      });
    }
  }
  function getNextLine(start) {
    for (let i = start + 1; i < lines.length; i++) {
      if (lines[i] === "```") {
        return i;
      }
    }
  }
  return { title, blocks };
}
function Document(path) {
  if (cache.has(path)) {
    return _.div.c("document")(DocumentView(cache.get(path)));
  }
  const container = _.div.c("document")();
  fetch(path).then((file) => file.text()).then((text) => parseDocument(path, text)).then((data) => cache.set(path, data).get(path)).then((data) => DocumentView(data)).then((view) => container.replaceChildren(view));
  return container;
}
function DocumentView(document2) {
  return col(
    _.h1(document2.title),
    ...document2.blocks.map((block) => {
      if (block.kind === "text") {
        return _.p(buildText(block.text));
      } else if (block.kind === "list") {
        return _.ul(_.li(buildText(block.text)));
      } else if (block.kind === "todo") {
        return TaskView(block.todos);
      } else if (block.kind === "checkbox") {
        return _.div.c("line")(
          _.input.withAttr("type", "checkbox")(
            _.div()
          ),
          _.label(buildText(block.text))
        );
      }
    })
  );
}
function buildText(text) {
  if (text.startsWith("[")) {
    const matches = text.match(/\[(.*)\]\((.*)\)/);
    return _.a.withAttr("href", matches[2])(matches[1]);
  } else {
    return text;
  }
}
async function main() {
  document.getElementById("main").replaceChildren(Router());
}
export {
  Router,
  main as default
};
