<img src="https://repository-images.githubusercontent.com/291619880/8b583d80-eb6d-11ea-8300-3206ef4d5136" />

---

> NeoCord: A powerful and feature-rich discord library.

- **Coverage:** neocord covers the Discord Gateway, API/CDN, and in the near future, Voice. 
- **Caching:** neocord has the most flexible and powerful caching out of all discord libraries (unless you're an eris fanboy).


*Join our discord server for updates!*

**[discord.gg/5WD9KhF](https://discord.gg/5WD9KhF)**

<h2>Warning:</h2>

NeoCord is currently in alpha, meaning it will probably be broken and might not work.
If you want to contribute, please join our [support server](https://discord.gg/5WD9KhF) - It would be greatly appreciated.

###### Missing Things

- Invites
- Guild Audit Logs
- Guild Emojis

These things will come soon.

<h2 align="center">Installation and Usage</h2>

As of **09/04/2020** (month/day/year), NeoCord can only be used with node.js v12 and up.

```shell script
yarn add neocord
```

---

**Basic Usage:**

> Support: **[discord.gg/5WD9KhF](https://discord.gg/5WD9KhF)**
>
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

*Nothing until full-release.*

---

<p align="center"><a href="https://github.com/melike2d">melike2d</a> &copy; 2020</p>