/**
 * @author Toru Nagashima
 * @copyright 2017 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
'use strict'

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const utils = require('../utils')

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'require `v-bind:is` of `<component>` elements',
      category: 'essential',
      url: 'https://eslint.vuejs.org/rules/require-component-is.html'
    },
    fixable: null,
    schema: []
  },

  create (context) {
    return utils.defineTemplateBodyVisitor(context, {
      "VElement[name='component']" (node) {
        if (!utils.hasDirective(node, 'bind', 'is')) {
          context.report({
            node,
            loc: node.loc,
            message: "预期的 '<component>' 元素具有 'v-bind：is' 属性."
          })
        }
      }
    })
  }
}
