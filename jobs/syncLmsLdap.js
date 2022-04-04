const { MOODLE_DB_HOST, MOODLE_DB_USER, MOODLE_DB_PASS, MOODLE_DB_NAME } =
	process.env;

const mariadb = require('mariadb');
const storage = require('node-persist');

const ldapHelper = require('../lib/ldap');

const connection = mariadb.createPool({
	host: MOODLE_DB_HOST,
	user: MOODLE_DB_USER,
	password: MOODLE_DB_PASS,
	database: MOODLE_DB_NAME,
	rowsAsArray: true
});

module.exports = {
	cron: '0 * * * * *',
	action: async () => {
		await storage.init();
		let newestId = (await storage.getItem('newestId')) || 0;
		let conn;
		try {
			conn = await connection.getConnection();
			const rows =
				await conn.query(`SELECT course_completions.id, course.idnumber, user.username
          FROM course_completions
          INNER JOIN user ON course_completions.userid=user.id
          INNER JOIN course ON course.id=course_completions.course
          WHERE user.username <> "admin" AND course.idnumber <> "" AND course_completions.id > ${newestId};`);
			if (rows.length === 0) {
				//console.log('No new users');
				return;
			}
			for (let i = 0; i < rows.length; i++) {
				try {
					//console.log(rows[i]);
					await ldapHelper.addUserToGroup(rows[i][2], rows[i][1]);
					if (rows[i][0] > newestId) {
						newestId = Number(rows[i][0]);
					}
				} catch (err) {
					console.log(err);
				}
			}
		} finally {
			await storage.setItem('newestId', newestId);
			if (conn) conn.release();
		}
	},
	runOnStart: true
};
