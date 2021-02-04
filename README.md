---

> neocord is currently in alpha, meaning it will probably be broken. If you want to contribute, please join our [support server]() - it would be greatly appreciated.

###### Table of Contents

- [about](#about)
- [installation](#installation)
    - [optional packages](#optional-packages)
    - [example usage](#example-usage)

## About

Neocord is a powerful and feature-rich discord library made for nodejs.

- **Coverage**: Implementations for the Gateway, API, and CDN are present. Voice will come in the near future.
- **Caching**: Boasts the most flexible and powerful caching solution across all nodejs discord libraries.

## Installation

As of 09/04/2020 (month/day/year), NeoCord can only be used with node.js v12 and up.

```bash
> yarn add neocord
```

###### Optional Packages

- **[form-data](https://npmjs.com/form-data)** if you plan on sending files.
- Install **zlib-sync** or **pako** for data compression and inflation
    - **[zlib-sync](https://npmjs.com/zlib-sync/)**
    - **[pako](https://npmjs.com/pako/)**
    - or the native **zlib** module (no installation)
- **[erlpack](https://npmjs.com/erlpack)** for significantly faster websocket (de)serialization.
- **[bufferutil](https://npmjs.com/bufferutil)** for a much faster websocket connection.
    - And **[utf-8-validate](https://npmjs.com/utf-8-validate)** for faster websocket processing.

###### Example Usage

```ts
const { Client } = require("neocord/core");

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

    const [ cmd ] = message.content.slice(prefix.length).split(/ /g);
    if (cmd.toLowerCase() === "ping") {
      message.channel.send("**Pong!**");
    }

    return;
  });

client.connect("your token here"); 
```

For ES6, you just have to change the imports to:

```ts
import { Client } from "neocord/core"
```

## Links

- **Support Server**: [discord.gg/5WD9KhF](https://discord.gg/5WD9KhF)
- **Github**: <https://github.com/neo-cord/neocord>
- **NPM**: <https://npmjs.com/neocord/>

## Acknowledgements

- Big thanks to [TheAkio](https://github.com/theakio), the gateway implementation was inspired by TypeCord, one of their
  projects.
- Thanks to [TeamKKB](https://teamkkb.xyz/) for dedicating some of their development team to get neocord done faster.
