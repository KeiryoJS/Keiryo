<img align="center" src="https://repository-images.githubusercontent.com/291619880/8b583d80-eb6d-11ea-8300-3206ef4d5136" />

---

> NeoCord is currently in alpha, meaning it will probably be broken and might not work.
  If you want to contribute, please join our [support server](https://discord.gg/5WD9KhF) - It would be greatly appreciated.

###### Table of Contents

- [about](#about)
- [installation](#installation)
    - [optional packages](#optional-packages)
    - [basic usage](#basic-usage) 

## About

Neocord is a powerful and feature-rich discord library.

- **Flexible**: Gives you the ability to extend specific structures, customize caching to your needs.
- **Coverage**: Covers the Discord Gateway, RestHandler, CDN, and in the near future, Voice.

NeoCord will be fairly customizable but when it comes to User Accounts/Self Bots we will **not** take any responsibility for any damages or consequences you may receive.
As per the Discord ToS we will not endorse the use of a self bot, therefore any requested support will be ignored.

## Installation

As of **09/04/2020** (month/day/year), neocord can only be used with node.js v12 and up.

```shell script
yarn add neocord
```

##### Optional Packages

These are some optional packages you can install.

- **[form-data](https://npmjs.com/form-data)** if you plan on sending files. 
- Install **zlib-sync** or **pako** for data compression and inflation 
    > - **[zlib-sync](https://npmjs.com/zlib-sync/)**    
    > - **[pako](https://npmjs.com/pako/)**
    > - or the native **zlib** module (no installation)


- **[etf.js](https://npmjs.com/erlpack)** for significantly faster websocket (de)serialization. 
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
- **NPM**: <https://npmjs.com/neocord/>

## Acknowledgements

- Big thanks to [TheAkio](https://github.com/theakio), the gateway was inspired by TypeCord, one of their projects. 
- [Dirigeants](https://github.com/dirigeants)
- Thanks to [TeamKKB](https://teamkkb.xyz/) for dedicating some of their development team to get neocord done faster.
---

<p align="center"><a href="https://github.com/melike2d">melike2d</a> &copy; 2020</p>