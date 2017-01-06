'use strict'

exports.searchForDatapoint = function searchForDatapoint(algoliaClient, query, callback) {
	const datapointIndex = algoliaClient.initIndex('staging_FinChat-DataPoints')

	datapointIndex.search(query, (err, content) => {
		if (err) {
			console.log('Error searching algolia:', err)
			return
		}

		let hits = []

		content.hits.forEach(hit => {
			hits.push({
				name: hit.name,
				nicknames: hit.nicknames,
				format: hit.format,
				tag: hit.tag,
			})
		})

		callback(hits)
	})
}
