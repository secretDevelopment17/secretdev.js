export declare class secretDevClient {
	constructor(client: object);

	public getBot(id: string): Promise<secretDevClient.Bot>;
	public botsArray(options: secretDevClient.BotArrayOption): Promise<secretDevClient.Bot[]>;
	public getUser(id: string): Promise<secretDevClient.User>;
}

declare namespace secretDevClient {
	export type Bot = {
		botID: string;
		ownerID: string;
		prefix: string;
		approve: boolean;
	};

	export type BotArrayOption = {
		ownerID?: string;
		prefix?: string;
	}

	export type User = {
		id: string;
		discriminator: string;
		tag: string;
		username: string;
		createdAt: Date;
		createdTimestamp: Date;
		avatar?: object | string;
		avatarURL?: string;
		displayAvatarURL?: string;
		bot: boolean;
		ownedBy?: {
			id?: string;
			discriminator?: string;
			tag?: string;
			username?: string;
			createdAt?: Date;
			createdTimestamp?: Date;
			avatar?: object | string;
			avatarURL?: string;
			displayAvatarURL?: string;
			bot: boolean;
			bots?: Bot[];
		};
		bots?: Bot[];
	}
}