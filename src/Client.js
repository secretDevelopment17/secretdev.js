"use strict";

const request = require("node-superfetch");
const EventEmitter = require("events");

class SecretDevClient extends EventEmitter {
	/**
   * Create a new Api Wrapper instance.
   * @param {any} [client] You client instance for package discord
	 */
	constructor(client) {
		super();

		const blockedTypeof = ["number", "string", "boolean"];

		if (blockedTypeof.includes(typeof client)) throw new Error("Please provide for client packages.");
		
		this.client = client;

		/**
		 * Event that fires when has been authorize is successful to load
		 * @event authorize
		 * @param {message} this message send a Authorize
		 * @param {code} this code send for Authorize
		 */

		/**
		 * Event to notify for authorize is fail to load
		 * @event unAuthorize
		 * @param {message} this message send a un-Authorize
		 * @param {code} this code send for un-Authorize
		 */

		client.on("ready", () => {
			authorizeClient(client).then(x => {
				if (x.error !== undefined && x.error.code == 404) return this.emit("unAuthorize", {
					message: "This client is not Registered yet on Secret Development.",
					code: x.error.code
				});
				else if (x.error !== undefined && x.error.code == 403) return this.emit("unAuthorize", {
					message: "This client is now Forbidden or Un-Authorize.",
					code: x.error.code
				});

				this.emit("authorize", {
					message: "This client has been authorize and connected to the Api Wrapper.",
					code: x.authorize.code
				});
			});
		});
	}

	/**
	 * Get information about a bot with jsons.
	 * @param {String} id This ID of the bot you want to get the informations
	 * @returns {Promise<Object>}
	 */
	async getBot(id) {
		if (!id && !this.client) throw new Error("[getBot] No provide someone for bot IDs.");
		if (!id || isNaN(id)) id = this.client.user.id;

		const { body } = await request.get(`https://api.secretdev.tech/api/bots/${id}`);

		if (body.error === "not_found") return {
			error: { message: "This Bot is Not Found", code: 404 }
		};

		return {
			botID: body.botID,
			ownerID: body.ownerID,
			prefix: body.prefix,
			approve: body.approve
		};
	}

	/**
   * Get fetchUser api with discord api of client
   * @param {String} id This ID of users on discord ID
   * @return {Promise<Object>}
	 */
	async getUser(id) {
		if (!id || isNaN(id)) throw new Error("[getUser] No provide someone for discord IDs.");

		const { body: botsArray } = await request.get("https://api.secretdev.tech/api/botsArray");

		if (this.client.users.fetch !== undefined) {
			const user = await this.client.users.fetch(id);

			if (!user) return {
				error: { message: "Invalid discord IDs", code: 404 }
			};

			const body = {
				id: user.id,
				discriminator: user.discriminator,
				tag: user.tag,
				username: user.username,
				createdAt: new Date(user.createdTimestamp).toString(),
				createdTimestamp: user.createdTimestamp,
				avatar: {
					sd: { uri: user.displayAvatarURL({ dynamic: true, size: 512 }) },
					hd: { uri: user.displayAvatarURL({ dynamic: true, size: 1024 }) },
					fhd: { uri: user.displayAvatarURL({ dynamic: true, size: 2048 }) }
				},
				bot: user.bot
			};

			if (!user.bot) body.bots = botsArray.filter(x => x.ownerID === user.id) || [];

			return body;
		} else if (this.client.fetchUser !== undefined) {
			const user = await this.client.fetchUser(id);

			if (!user) return {
				error: { message: "Invalid discord IDs", code: 404 }
			};

			const body = {
				id: user.id,
				discriminator: user.discriminator,
				tag: user.tag,
				username: user.username,
				createdAt: new Date(user.createdTimestamp).toString(),
				createdTimestamp: user.createdTimestamp,
				avatar: user.avatar,
				avatarURL: user.avatarURL,
				displayAvatarURL: user.displayAvatarURL,
				bot: user.bot
			};

			if (!user.bot) body.bots = botsArray.filter(x => x.ownerID === user.id) || [];

			return body;
		} else throw new Error("[getUser] this library for fetchUser is not yet a supported.");
	}
}

module.exports = SecretDevClient;

async function authorizeClient(client) {
	const { body } = await request.get("https://api.secretdev.tech/api/botsArray");

	const result = body.filter(x => x.botID === client.user.id)[0];

	if (!result) return { error: { code: 404 } };

	const botOwn = body.filter(x => x.ownerID === result.ownerID);

	const bots = [];

	for (const bot of botOwn) {
		if (client.users.fetch !== undefined) {
			const botFetch = await client.users.fetch(bot.botID);

			bots.push(botFetch.id);
		} else if (client.fetchUser !== undefined) {
			const botFetch = await client.fetchUser(bot.botID);

			bots.push(botFetch.id);
		} else throw new Error("This library for register is not yet a supported.");
	}

	if (!bots.includes(client.user.id)) return { error: { code: 403 } };

	return { authorize: { code: 201 } };
}
