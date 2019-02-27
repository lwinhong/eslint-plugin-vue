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
      description: 'enforce valid `v-if` directives',
      category: 'essential',
      url: 'https://eslint.vuejs.org/rules/valid-v-if.html'
    },
    fixable: null,
    schema: []
  },

  create (context) {
    return utils.defineTemplateBodyVisitor(context, {
      "VAttribute[directive=true][key.name='if']" (node) {
        const element = node.parent.parent

        if (utils.hasDirective(element, 'else')) {
          context.report({
            node,
            loc: node.loc,
            message: "'v-if' 和 'v-else' 指令不能存在于同一个元素上。 您可能需要 'v-else-if' 指令."
          })
        }
        if (utils.hasDirective(element, 'else-if')) {
          context.report({
            node,
            loc: node.loc,
            message: "'v-if' 和 'v-else-if' 指令不能存在于同一个元素上."
          })
        }
        if (node.key.argument) {
          context.report({
            node,
            loc: node.loc,
            message: "'v-if' directives require no argument."
          })
        }
        if (node.key.modifiers.length > 0) {
          context.report({
            node,
            loc: node.loc,
            message: "'v-if' directives require no modifier."
          })
        }
        if (!utils.hasAttributeValue(node)) {
          context.report({
            node,
            loc: node.loc,
            message: "'v-if' directives require that attribute value."
          })
        }
      }
    })
  }
}
