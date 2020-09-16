"use strict";

const EventEmitter = require("events");
const https = require("https");
const qs = require("querystring");

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
		 * @param {Object} authClient Object bots was authorize
		 */

		/**
		 * Event that fires when authorize is fail to load
		 * @event error
		 * @param {NodeJS.Error} e This audit log for fail the load
		 */

		client.on("ready", async () => {
			try {
				const authClient = await this.authorizeClient();

				this.emit("authorize", authClient);
			} catch (e) {
				this.emit("error", e);
			}
		});
	}

	/**
	 * Create the request point
	 * @param {String} method Https method for to the use api wrapper
	 * @param {String} endpoint API endpoint for to the use api wrapper
	 * @param {?Object} [data] Data to send with the requests
	 * @private
	 * @return {Promise<object>}
	 */
	_request(method, endpoint, data) {
		return new Promise((resolve, reject) => {
			const response = {
				raw: "",
				body: null,
				status: null,
				headers: null
			};

			const options = {
				hostname: `api.secretdev.tech`,
				endpoint: `/api/${endpoint}`,
				method,
				headers: {}
			};

			if (this.client) options.headers.authorizeClient = this.client;
			else console.error(
				"[secretdev.js] Warning: No provide someone for client packages."
			);

			if (data && method === "post") options.headers['content-type'] = "application/json";
			if (data && method === "get") options.path += `?${qs.encode(data)}`;

			const request = https.request(options, res => {
				response.status = res.statusCode;
				response.headers = res.headers;
				response.ok = res.statusCode >= 200 && res.statusCode < 300;

				res.on("data", chunk => response.raw += chunk);

				res.on("end", () => {
					response.body = res.headers['content-type'].includes("application/json") ? JSON.parse(response.raw) : response.raw;

					if (response.ok) resolve(response);
					else {
						const error = new Error(`${res.statusCode} ${res.statusMessage}`);

						Object.assign(error, response);

						reject(error);
					}
				});
			});

			request.on("error", err => reject(err));

			if (data && method === "post") request.write(JSON.stringify(data));

			request.end();
		});
	}

	/**
	 * Authorization Client with package to connect api Wrapper
	 * @private
	 * @return {Promise<object>}
	 */
	async authorizeClient() {
		const { body: res } = await this._request("post", "authorizeClient", this.client);

		return res;
	}

	/**
	 * Get information about a bot with jsons.
	 * @param {?String} id This ID of the bot you want to get the informations
	 * @return {Promise<object>}
	 */
	async getBot(id) {
		if (!id && !this.client) throw new Error("[getBot] No provide someone for bot IDs.");
		if (!id || isNaN(id)) id = this.client.user.id;

		const { body: bots } = await this._request("get", `bots/${id}`);

		if (bots.error === "not_found") return {
			error: { message: "This Bot is Not Found", code: 404 }
		};

		const result = {
			botID: bots.botID,
			ownerID: bots.ownerID,
			prefix: bots.prefix,
			approve: bots.approve
		};

		return result;
	}

	/**
	 * Get Array in object find the api
	 * @param {Object} obj this a when object the find
	 * @param {?String} [obj.ownerID] this a when object with owner developer
	 * @param {?String} [obj.prefix] this a when object with same the prefix many bots.
	 * @return {Promise<object>}
	 */
	async botsArray(obj = {}) {
		const blockedTypeof = ["number", "string", "boolean"];

		if (blockedTypeof.includes(typeof obj)) throw new Error("[botsArray] No provide some with object structures.");

		const { body } = await this._request("get", "botsArray");

		if (obj.ownerID !== undefined && obj.prefix !== undefined) {
			if (!obj.ownerID || isNaN(obj.ownerID)) throw new Error("[botsArray] No provide someone for developer IDs.");
			else if (!obj.prefix) throw new Error("[botsArray] No provide someone for prefix Bots.");

			const bots = body.filter(x => x.ownerID.includes(obj.ownerID) && x.prefix.includes(obj.prefix));

			if (!bots.length) return {
				error: { message: "This bots array is not found.", code: 404 }
			};

			return bots;
		} else if (obj.ownerID !== undefined) {
			if (!obj.ownerID || isNaN(obj.ownerID)) throw new Error("[botsArray] No provide someone for developer IDs.");

			const bots = body.filter(x => x.ownerID.includes(obj.ownerID));

			if (!bots.length) return {
				error: { message: "This bots array is not found.", code: 404 }
			};

			return bots;
		} else if (obj.prefix !== undefined) {
			if (!obj.prefix) throw new Error("[botsArray] No provide someone for prefix bots.");

			const bots = body.filter(x => x.prefix.includes(obj.prefix));

			if (!bots.length) return {
				error: { message: "This bots array is not found.", code: 404 }
			};

			return bots;
		} else throw new Error("[botsArray] Invalid a Object Structures.");
	}

	/**
   * Get fetchUser api with discord api of client
   * @param {?String} id This ID of users on discord ID
   * @return {Promise<object>}
	 */
	async getUser(id) {
		if (!id || isNaN(id)) throw new Error("[getUser] No provide someone for discord IDs.");

		const { body: botsArray } = await this._request("get", "botsArray");

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
