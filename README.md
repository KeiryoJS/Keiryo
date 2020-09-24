<img align="center" src="https://repository-images.githubusercontent.com/291619880/8b583d80-eb6d-11ea-8300-3206ef4d5136" />

---

> NeoCord is currently in alpha, meaning it will probably be broken and might not work.
  If you want to contribute, please join our [support server](https://discord.gg/5WD9KhF) - It would be greatly appreciated.

###### Table of Contents

- [about](#about)
- [installation](#installation)
    - [optional packages](#option-packages)
    - [basic usage](#basic-usage) 

<h2 align="center">About</h2>

Neocord is a powerful and feature-rich discord library.

- **Flexible**: Gives you the ability to extend specific structures, customize caching to your needs.
- **Coverage**: Covers the Discord Gateway, API, CDN, and in the near future, Voice.
- **Caching**: Boasts the most powerful and flexible caching solution across most discord libraries.

## Installation

As of **09/04/2020** (month/day/year), NeoCord can only be used with node.js v12 and up.

```shell script
yarn add neocord
```

##### Optional Packages

These are some optional packages you can install.

- Install **zlib-sync** or **pako** for data compression and inflation 
    > - **[zlib-sync](https://npmjs.com/zlib-sync/)**    
    > - **[pako](https://npmjs.com/pako/)**
    > - or the native **zlib** module (no installation)


- **[erlpack](https://npmjs.com/erlpack)** for significantly faster websocket (de)serialization. 
- **[bufferutil](https://npmjs.com/bufferutil)** for a much faster websocket connection.
    > And **[utf-8-validate](https://npmjs.com/utf-8-validate)** for faster websocket processing.


##### Basic Usage

`(typescript)` 
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
      message.channel.send("**Pong!**");
    }

    return;
  });


client.connect("your token here"); 
```

## Links

- **Support Server**: [discord.gg/5WD9KhF](https://discord.gg/5WD9KhF)
- **Github**: <https://github.com/neo-cord/neocord>
- **NPM**: <https://npmjs.com/neocord/

---

<p align="center"><a href="https://github.com/melike2d">melike2d</a> &copy; 2020</p>