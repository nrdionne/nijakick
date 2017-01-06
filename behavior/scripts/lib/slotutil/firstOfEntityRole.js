'use strict'

module.exports = function firstOfEntityRole(message, entity, role) {
  role = role || 'generic'

  let entityValues = message.slots[entity]
  let valsForRole = entityValues ? entityValues.values_by_role[role] : null

  return valsForRole ? valsForRole[0] : null
}
