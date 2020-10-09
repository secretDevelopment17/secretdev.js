"use strict";

const request = require("node-superfetch");

/**
 * Rest API with npm instance registry
 * @class secretDevClient
 */
class secretDevClient {
	/**
   * Create a new Api Wrapper instance.
   * @param {any} [client] You client instance for package discord
	 */
	constructor(client) {
		if (typeof client !== "object") throw new Error("Please provide for client packages.");
		
		this.client = client;
	}

	/**
	 * Get information about a bot with jsons.
	 * @param {String} id This ID of the bot you want to get the informations
	 * @return {Promise<object>}
	 */
	async getBot(id) {
		if (!id && !this.client) throw new Error("[getBot] No provide someone for bot IDs.");
		else if (!id || isNaN(id)) id = this.client.user.id;
		else if (typeof id !== "string") throw new Error("[getBot] Typeof for getBot is only a string.");

		const { body } = await request.get(`https://api.secretdev.tech/api/bots/${id}`);

		return body;
	}

	/**
	 * Get Array in object find the api
	 * @param {Object} options this a when object the find
	 * @param {String} [options.ownerID] this a when object with owner developer
	 * @param {String} [options.prefix] this a when object with same the prefix many bots.
	 * @return {Promise<object>}
	 */
	async botsArray(options = {}) {
		if (!options) throw new Error("[botsArray] No provide someone for object.");
		if (typeof options !== "object") throw new Error("[botsArray] Typeof for botsArray is only a object.");

		const { body } = await request.get("https://api.secretdev.tech/api/botsArray");

		if (options.ownerID !== undefined && options.prefix !== undefined) {
			if (typeof options.prefix !== "string") throw new Error("[botsArray] Typeof for botsArray for prefix is only a string.");

			const bots = body.filter(x => x.ownerID.includes(options.ownerID) && x.prefix.includes(options.prefix));

			return bots;
		} else if (options.ownerID !== undefined) {
			if (typeof options.ownerID !== "string") throw new Error("[botsArray] Typeof for botsArray for ownerID is only a string.");

			const bots = body.filter(x => x.ownerID.includes(options.ownerID));

			return bots;
		} else if (options.prefix !== undefined) {
			if (typeof options.prefix !== "string") throw new Error("[botsArray] Typeof for botsArray for prefix is only a string.");

			const bots = body.filter(x => x.prefix.includes(options.prefix));

			return bots;
		} else return undefined;
	}

	/**
   * Get fetchUser api with discord api of client
   * @param {String} id This ID of users on discord ID
   * @return {Promise<object>}
	 */
	async getUser(id) {
		if (!id || isNaN(id)) throw new Error("[getUser] No provide someone for discord IDs.");
		else if (typeof id !== "string") throw new Error("[getUser] Typeof for getUser is only a string.");

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
					sd: user.displayAvatarURL({ dynamic: true, size: 512 }),
					hd: user.displayAvatarURL({ dynamic: true, size: 1024 }),
					fhd: user.displayAvatarURL({ dynamic: true, size: 2048 })
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
		} else return undefined;
	}
}

module.exports = secretDevClient;
