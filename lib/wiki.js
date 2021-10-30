const axios = require('axios');
module.exports = {
	getListOfWikiPages: async function () {
		let pageQuery;
		try {
			pageQuery = await axios({
				method: 'post',
				url: 'https://wiki.utdmaker.space/graphql',
				data: JSON.stringify({
					query: `{
                    pages {
                      list(limit: 100) {
                        id
                        path
                        title
                        description
                        isPublished
                        isPrivate
                      }
                    }
                  }`,
					variables: {}
				}),
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + process.env.WIKI_TOKEN
				}
			});
		} catch (error) {
			return null;
		}
		return pageQuery.data.data.pages.list;
	},
	getWikiPage: async function (pageId) {
		let pageQuery;
		try {
			pageQuery = await axios({
				method: 'post',
				url: 'https://wiki.utdmaker.space/graphql',
				data: JSON.stringify({
					query: `  {
                        pages {
                          single(id: ${pageId}) {
                              title
                              path
                              hash
                              description
                              isPublished
                              isPrivate
                              updatedAt
                              editor
                              authorName
                              content
                          }
                        }
                      }`,
					variables: {}
				}),
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + process.env.WIKI_TOKEN
				}
			});
		} catch (error) {
			return null;
		}
		return pageQuery.data.data.pages.single;
	}
};
