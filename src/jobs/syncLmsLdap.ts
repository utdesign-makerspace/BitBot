const { MOODLE_DB_HOST, MOODLE_DB_USER, MOODLE_DB_PASS, MOODLE_DB_NAME } =
	process.env;

import mariadb = require('mariadb');
const connection =
	process.env.NODE_ENV == 'production'
		? mariadb.createPool({
				host: MOODLE_DB_HOST,
				user: MOODLE_DB_USER,
				password: MOODLE_DB_PASS,
				database: MOODLE_DB_NAME,
				rowsAsArray: true
		  })
		: null;
import storage = require('node-persist');

import ldapHelper = require('../lib/ldap');

module.exports = {
	cron: '0 */15 * * * *',
	action: async function () {
		// if env is not production, don't run
		if (connection == null) return;

		await storage.init({
			forgiveParseErrors: true
		});
		let latestCompletion = (await storage.getItem('latestCompletion')) || 0;

		let conn: mariadb.PoolConnection | null;
		conn = null;
		try {
			conn = (await connection.getConnection().catch((err: any) => {
				console.log(err);
				return;
			})) as mariadb.PoolConnection;
			const rows = await conn.query(
				'SELECT course_completions.timecompleted, course.idnumber, user.username\n' +
					'FROM course_completions\n' +
					'INNER JOIN user ON course_completions.userid=user.id\n' +
					'INNER JOIN course ON course.id=course_completions.course\n' +
					`WHERE user.username <> "admin" AND course.idnumber <> "" AND course_completions.timecompleted IS NOT NULL AND course_completions.timecompleted > ${latestCompletion}\n` +
					'ORDER BY course_completions.timecompleted ASC\n' +
					'LIMIT 20;'
			);
			if (rows.length === 0) {
				// console.log('No new users');
				return;
			}
			for (let i = 0; i < Math.min(rows.length, 20); i++) {
				if (rows[i][0] === null) continue;
				try {
					await ldapHelper
						.addUserToGroup(rows[i][2], rows[i][1])
						.catch((err: any) => {
							console.log(err);
						});
					if (rows[i][0] > latestCompletion) {
						latestCompletion = Number(rows[i][0]);
					}
				} catch (err) {
					console.log(err);
				}
			}
		} catch (err) {
			console.log(err);
		} finally {
			await storage.setItem('latestCompletion', latestCompletion);
			conn?.release();
		}
	},
	runOnStart: true
};
