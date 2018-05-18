# Cloudy

Cloudy is a P2P NoSQL database. It is designed to be an isomorphic JavaScript library that can be used across web browsers, servers and mobile phone applications.

An application demonstrating its usage is available as **RunNumber**. Its library lives here (`src/RunNumber.js` / `src/RunNumberStreamify.js`) and its GUI interface lives at

Visit [README-RunNumber.md](https://github.com/cloudy-db/js/blob/master/README-RunNumber.md) for more information on its background.

## API Reference

Reference generated from JSDoc is available [here](https://cloudy-db.github.io/js/).

## Quickstart

```js
import { Cloudy } from "@cloudy-db/js";
const cloudy = await Cloudy.create({
	namespace: "", // Shared namespace
});

const toDoDb = await cloudy.store("todo");
await toDoDb.put({content: "Create my first todo list application"});
toDoDb.query((todo) => todo.content.startsWith("Create")); // => [{content: "...", _id: "random-id-here"}]
```