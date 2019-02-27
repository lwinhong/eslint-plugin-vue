/**
 * @fileoverview Enforces that a return statement is present in computed property (return-in-computed-property)
 * @author Armano
 */
'use strict'

const utils = require('../utils')

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'enforce that a return statement is present in computed property',
      category: 'essential',
      url: 'https://eslint.vuejs.org/rules/return-in-computed-property.html'
    },
    fixable: null, // or "code" or "whitespace"
    schema: [
      {
        type: 'object',
        properties: {
          treatUndefinedAsUnspecified: {
            type: 'boolean'
          }
        },
        additionalProperties: false
      }
    ]
  },

  create (context) {
    const options = context.options[0] || {}
    const treatUndefinedAsUnspecified = !(options.treatUndefinedAsUnspecified === false)

    const forbiddenNodes = []

    // ----------------------------------------------------------------------
    // Public
    // ----------------------------------------------------------------------

    return Object.assign({},
      utils.executeOnFunctionsWithoutReturn(treatUndefinedAsUnspecified, node => {
        forbiddenNodes.push(node)
      }),
      utils.executeOnVue(context, properties => {
        const computedProperties = utils.getComputedProperties(properties)

        computedProperties.forEach(cp => {
          forbiddenNodes.forEach(el => {
            if (cp.value && cp.value.parent === el) {
              context.report({
                node: el,
                message: '预计在 "{{name}}" 计算属性中返回一个值.',
                data: {
                  name: cp.key
                }
              })
            }
          })
        })
      })
    )
  }
}
