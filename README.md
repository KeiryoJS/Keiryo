<img src="https://repository-images.githubusercontent.com/291619880/8b583d80-eb6d-11ea-8300-3206ef4d5136" />

---

> NeoCord: A powerful and feature-rich discord library.
> See [in-depth](#in-depth) for more details on things listed below.

- **Coverage:** NeoCord covers the Discord Gateway, API/CDN, and in the near future, Voice. 
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

> This is a very very ambitious concept, which may not come to life but would be really cool

NeoCord allows the user to have multiple [data engines](#data-engines) which would control the caching for specific structures.
There will be options for limiting the amount of items that can be cached, an option for sweeping structures from the cache, and disabling certain structures.

```ts
import { Client, DiscordStructure } from "neocord";
import { RedisDataEngine, Sweepers } from "@neocord/engines";

const client = new Client({
  data: {
    engines: [
      new RedisDataEngine({
        handles: new Set()
          .add(DiscordStructure.Message)
          .add(DiscordStructure.Presence),
        sweepers: {
          [DiscordStructure.Message]: Sweepers.Message({
            lifetime: "30m",
            interval: "5m"
          })
        }
      })
    ]
  }
});
```

###### Data Engines

A data engine is what handles each aspect of neocord structures like limiting, caching and sweeping. 

*work-in-progress, these are mostly concepts - with that in mind, the caching stuff might not happen, we'll have to find out.*

---

<p align="center"><a href="https://github.com/melike2d">melike2d</a> &copy; 2020</p>