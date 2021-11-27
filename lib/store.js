const {
	AIRTABLE_API_KEY,
	AIRTABLE_BASE,
	AIRTABLE_STORE_TABLE_NAME,
	AIRTABLE_STORE_VIEW
} = process.env;
const Airtable = require('airtable-plus');
const { giveUserPoints } = require('./bits');
const store = new Airtable({
	baseID: AIRTABLE_BASE,
	apiKey: AIRTABLE_API_KEY,
	tableName: AIRTABLE_STORE_TABLE_NAME
});
const orders = new Airtable({
	baseID: AIRTABLE_BASE,
	apiKey: AIRTABLE_API_KEY,
	tableName: 'Orders'
});

async function getStoreItems() {
	try {
		const inventory = (
			await store.read({
				maxRecords: 100,
				view: AIRTABLE_STORE_VIEW
			})
		).map(({ id, fields }) => {
			return {
				id,
				...fields
			};
		});
		return inventory;
	} catch (error) {
		return null;
	}
}

async function getStoreItemByID(id) {
	try {
		const data = await store.find(id);
		console.log(data);
		return { id: data.id, ...data.fields };
	} catch (e) {
		return null;
	}
}

async function buyItem(id, userID) {
	try {
		const item = (await store.find(id)).fields;
		const usersPoints = await getUserPoints(userID);
		if (item.price > usersPoints) {
			return {
				success: false,
				message: 'You do not have enough points to purchase this item.'
			};
		}

		giveUserPoints(userID, -item.price);

		const code = Math.random()
			.toString(36)
			.replace(/[^a-z]+/g, '')
			.substr(0, 8);
		await orders.create({
			'Item Name': item.Title,
			Delivered: false,
			User: userID,
			'Redeem Code': code
		});
		await store.update(id, {
			Qty: item.Qty - 1
		});
		return {
			status: true,
			code
		};
	} catch (error) {
		return null;
	}
}

module.exports = {
	getStoreItems,
	buyItem,
	getStoreItemByID
};
