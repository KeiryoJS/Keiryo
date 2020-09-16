<img src="https://repository-images.githubusercontent.com/291619880/8b583d80-eb6d-11ea-8300-3206ef4d5136" />

---

> NeoCord: A powerful and feature-rich discord library.
> See [in-depth](#in-depth) for more details on things listed below.

- **Coverage:** NeoCord covers the Discord Gateway, API, and CDN. 
- **Caching:** You can set a limit for each structure, set different providers, and even disable them.


<h2>Warning:</h2>

NeoCord is currently in alpha, meaning it will probably be broken and might not work.
If you want to contribute, please join our [support server](https://discord.gg/5WD9KhF) - It would be greatly appreciated.

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

```ts
import { Client, Cacheable } from "neocord"; 

new Client({
  caching: {
    disable: [Cacheable.Role],
    limits: new Map().set(Cacheable.Message, 100)
  }
});
```

*work-in-progress, these are mostly concepts - with that in mind, the caching stuff might not happen, we'll have to find out.*

---

<p align="center"><a href="https://github.com/melike2d">melike2d</a> &copy; 2020</p>