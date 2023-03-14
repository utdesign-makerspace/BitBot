const { MOODLE_DB_HOST, MOODLE_DB_USER, MOODLE_DB_PASS, MOODLE_DB_NAME } =
	process.env;

const mariadb = require('mariadb');
const connection = mariadb.createPool({
	host: MOODLE_DB_HOST,
	user: MOODLE_DB_USER,
	password: MOODLE_DB_PASS,
	database: MOODLE_DB_NAME,
	rowsAsArray: true
});
const storage = require('node-persist');

const ldapHelper = require('../lib/ldap');

module.exports = {
	cron: '0 */15 * * * *',
	action: async function () {
		// if env is not production, don't run
		if (process.env.NODE_ENV !== 'production') return;

		await storage.init();
		let newestId = (await storage.getItem('newestId')) || 0;

		let conn;
		try {
			conn = await connection.getConnection().catch((err) => {
				console.log(err);
			});
			const rows = await conn.query(
				'SELECT course_completions.id, course.idnumber, user.username\n' +
					'FROM course_completions\n' +
					'INNER JOIN user ON course_completions.userid=user.id\n' +
					'INNER JOIN course ON course.id=course_completions.course\n' +
					`WHERE user.username <> "admin" AND course.idnumber <> "" AND course_completions.id > ${newestId};`
			);
			if (rows.length === 0) {
				// console.log('No new users');
				return;
			}
			for (let i = 0; i < Math.min(rows.length, 20); i++) {
				try {
					//console.log(rows[i]);
					await ldapHelper
						.addUserToGroup(rows[i][2], rows[i][1])
						.catch((err) => {
							console.log(err);
						});
					if (rows[i][0] > newestId) {
						newestId = Number(rows[i][0]);
					}
				} catch (err) {
					console.log(err);
				}
			}
		} catch (err) {
			console.log(err);
		} finally {
			await storage.setItem('newestId', newestId);
			if (conn) conn.release();
		}
	},
	runOnStart: true
};
