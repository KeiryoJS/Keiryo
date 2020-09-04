<img src="https://repository-images.githubusercontent.com/291619880/8b583d80-eb6d-11ea-8300-3206ef4d5136" />

---

> NeoCord: A powerful and feature-rich discord library.

- **Coverage:** NeoCord covers the Discord Gateway, API, and CDN. 
- **Caching:** You can set a limit for each structure, set different providers, and even disable them.

See [in-depth](#in-depth) for more details on things listed above.

<h2 align="center">Installation and Usage</h2>

As of **09/04/2020** (month/day/year), NeoCord can only be used with node.js v14. This may change in the future.

```shell script
yarn add neocord
```

---

**Basic Usage:**

```ts
import { Client } from "neocord";

const client = new Client();

client
  .on("ready", () => console.log("Now ready!"))
  .on("messageCreate", (message) => {
    if (message.author.bot) return;

    const mentionPrefix = new RegExp(`^<@!${client.user.id}>\s*`);

    let prefix;
    if (message.content.startsWith("!")) prefix = "!"
    else {
      const mentioned = mentionPrefix.exec(message.content);
      if (!mentioned) return;
      prefix = mentioned[0]; 
    }
    
    const [cmd] = message.content.slice(prefix.length).split(/ /g);
    if (cmd.toLowerCase() === "ping") {
      message.reply("**Pong!**");
    }

    return;
  });


client.connect("your token here"); 
```

<h2 align="center">In-Depth</h2>

**Caching**

NeoCord allows the user to limit each structure (Message, Guild, etc...), this does come with some drawbacks.
It also allows for the option of something we call Cache Providers, which allows for external caching.
You can also disable specific structures if you don't want them to be cached.

**Why?**

Are you wondering why NeoCord exists?
If so, lets just say [discord.js](https://discord.js.org) is getting pretty old, it's quite bad in some ways,
and for [eris](https://github.com/abalabahaha/eris): it's bad... like awful, if it had better code quality and wasn't so lack-luster it would be a fantastic choice for any developer.

*work-in-progress, these are mostly concepts - with that in mind, the caching stuff might not happen, we'll have to find out.*

---

<p align="center"><a href="https://github.com/melike2d">melike2d</a> &copy; 2020</p>