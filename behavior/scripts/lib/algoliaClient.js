'use strict'

const algoliasearch = require('algoliasearch')

exports.create = function create(a, secret) {
	return algoliasearch(a, secret)
}
