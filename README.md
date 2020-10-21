# secretdev.js

An Official module for interacting with the API

## Installation

# with Node Package Manager ( NPM )
```bash
$ npm i secretDevelopment17/secretdev.js --save
```

# with Yarn
```bash
$ yarn add secretDevelopment17/secretdev.js
```

## Example
# Example for async/await
```js
const { Client } = require("discord.js");
const { Client: secretDevClient } = require("@secretDevelopment17/secretdev.js");

const client = new Client({ disableMentions: true });
const secretDev = new secretDevClient(client);

client.on("ready", () => console.log(`This client has been the ready.`));

client.on("message", async message => {
	const prefix = "!";

	if (message.author.bot || message.author === client.user || !message.guild || !message.content.startsWith(prefix)) return;

	const args = message.content.substring(prefix.length).trim().split(" ");
	const command = args.shift().toLowerCase();

	if (command === "botinfo") {
		try {
			const body = await secretDev.getBot(args[0]);
			const botUser = await secretDev.getUser(body.botID);

			return message.channel.send(
				`**${botUser.tag}** by \`${botUser.ownedBy.tag}\` with prefixes: **\`${body.prefix}\`**.`
			);
		} catch (e) {
			return message.channel.send("This bot is not **Registered**!");
		}
	}
});

client.login("token here");
```

# Example for then()/promise
```js
const { Client } = require("discord.js");
const { Client: secretDevClient } = require("@secretDevelopment17/secretdev.js");

const client = new Client({ disableMentions: true });
const secretDev = new secretDevClient(client);

client.on("ready", () => console.log(`This client has been the ready.`));

client.on("message", message => {
	const prefix = "!";

	if (message.author.bot || message.author === client.user || !message.guild || !message.content.startsWith(prefix)) return;

	const args = message.content.substring(prefix.length).trim().split(" ");
	const command = args.shift().toLowerCase();

	if (command === "botinfo") {
		secretDev.getBot(args[0]).then(body => {
			secretDev.getUser(body.botID).then(botUser => {
				return message.channel.send(
					`**${botUser.tag}** by \`${botUser.ownedBy.tag}\` with prefixes: **\`${body.prefix}\`**.`
				);
			});
		}).catch(e => message.channel.send("This bot is not **Registered**!"));
	}
});

client.login("token here");
```