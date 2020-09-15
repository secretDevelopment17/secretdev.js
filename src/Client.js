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
			authorizeClient(client).then(authorize => {
				if (authorize.notFound !== undefined && authorize.notFound.code == 404) throw new Error(
					"This client is not Registered yet on Secret Development."
				);
				
				if (authorize.unAuthorize !== undefined && authorize.unAuthorize.code == 401) throw new Error(
					"This client is now Un-Authorize please change the client packages."
				);

				this.emit("authorize", authorize);
			});
		});
	}

	/**
	 * Get information about a bot with jsons.
	 * @param {String} id This ID of the bot you want to get the informations
	 * @return {Promise<object>}
	 */
	async getBot(id) {
		if (!id && !this.client) throw new Error("[getBot] No provide someone for bot IDs.");
		if (!id || isNaN(id)) id = this.client.user.id;

		const { body } = await request.get(`https://api.secretdev.tech/api/bots`);

		const botObject = body[id];

		if (botObject === undefined) return {
			error: { message: "This Bot is Not Found", code: 404 }
		};

		return {
			botID: botObject.botID,
			ownerID: botObject.ownerID,
			prefix: botObject.prefix,
			approve: botObject.approve
		};
	}

	/**
	 * Get Array in object find the api
	 * @param {Object} obj this a when object the find
	 * @param {?String} [obj.ownerID] this a when object with owner developer
	 * @param {?String} [obj.prefix] this a when object with same the prefix many bots.
	 * @return {Promise<object>}
	 */
	async botsArray(obj) {
		const blockedTypeof = ["number", "string", "boolean"];

		if (blockedTypeof.includes(typeof obj)) throw new Error("[botsArray] No provide some with object structures.");

		const { body } = await request.get("https://api.secretdev.tech/api/botsArray");

		if (obj.ownerID !== undefined && obj.prefix !== undefined) {
			if (!obj.ownerID || isNaN(obj.ownerID)) throw new Error("[botsArray] No provide someone for developer IDs.");
			if (!obj.prefix) throw new Error("[botsArray] No provide someone for prefix bots.");

			const botsArray = body.filter(x => x.ownerID.includes(obj.ownerID) && x.prefix.includes(obj.prefix));

			if (!botsArray.length) return {
				error: { message: "This bots array is not found.", code: 404 }
			};

			const bots = [];

			for (const bot of botsArray) {
				const getBots = {
					botID: bot.botID,
					ownerID: bot.ownerID,
					prefix: bot.prefix,
					approve: bot.approve
				};

				bots.push(getBots);
			}

			return bots;
		} else if (obj.ownerID !== undefined) {
			if (!obj.ownerID || isNaN(obj.ownerID)) throw new Error("[botsArray] No provide someone for developer IDs.");

			const botsArray = body.filter(x => x.ownerID.includes(obj.ownerID));

			if (!botsArray.length) return {
				error: { message: "This bots array is not found.", code: 404 }
			};

			const bots = [];

			for (const bot of botsArray) {
				const getBots = {
					botID: bot.botID,
					ownerID: bot.ownerID,
					prefix: bot.prefix,
					approve: bot.approve
				};

				bots.push(getBots);
			}

			return bots;
		} else {
			if (!obj.prefix) throw new Error("[botsArray] No provide someone for prefix bots.");

			const botsArray = body.filter(x => x.prefix.includes(obj.prefix));

			if (!botsArray.length) return {
				error: { message: "This bots array is not found.", code: 404 }
			};

			const bots = [];

			for (const bot of botsArray) {
				const getBots = {
					botID: bot.botID,
					ownerID: bot.ownerID,
					prefix: bot.prefix,
					approve: bot.approve
				};

				bots.push(getBots);
			}

			return bots;
		}
	}

	/**
   * Get fetchUser api with discord api of client
   * @param {String} id This ID of users on discord ID
   * @return {Promise<object>}
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

	const result = body.filter(x => x.botID.includes(client.user.id))[0];

	if (!result) return { notFound: { code: 404 } };

	const botOwn = body.filter(x => x.ownerID.includes(result.ownerID));

	const bots = [];

	for (const bot of botOwn) {
		if (client.users.fetch !== undefined) {
			const botFetch = await client.users.fetch(bot.botID);

			bots.push(botFetch.id);
		} else if (client.fetchUser !== undefined) {
			const botFetch = await client.fetchUser(bot.botID);

			bots.push(botFetch.id);
		} else throw new Error("This library for authorize client is not yet a supported.");
	}

	if (!bots.includes(client.user.id)) return { unAuthorize: { code: 401 } };

	return {
		botID: result.botID,
		ownerID: result.ownerID,
		prefix: result.prefix,
		approve: result.approve
	};
}
