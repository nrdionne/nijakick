'use strict'

exports.searchForCompanyByTicker = function searchForCompanyByTicker(algoliaClient, ticker, callback) {
	const upperTicker = ticker.trim().toUpperCase()
	const companyIndex = algoliaClient.initIndex('FinChat-Companies-Staging')

	companyIndex.search(upperTicker, {getRankingInfo: true}, (err, content) => {
		if (err) {
			return
		}

		for (let i = 0; i < content.hits.length; i++) {
			let hit = content.hits[i]
			const hitTicker = hit.ticker.toUpperCase()

			if (hitTicker === upperTicker) {
				return callback({
					ticker: hit.ticker,
					name: hit.name,
					cik: hit.cik,
				})
			}
		}

		callback(null)
	})
}

exports.searchForCompany = function searchForCompany(algoliaClient, query, callback) {
	const companyIndex = algoliaClient.initIndex('FinChat-Companies-Staging')

	companyIndex.search(query, {getRankingInfo: true}, (err, content) => {
		if (err) {
			return
		}

		let hits = []

		content.hits.forEach(hit => {
			hits.push({
				ticker: hit.ticker,
				name: hit.name,
				cik: hit.cik,
			})
		})

		callback(hits)
	})
}
