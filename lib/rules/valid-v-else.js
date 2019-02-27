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
      description: 'enforce valid `v-else` directives',
      category: 'essential',
      url: 'https://eslint.vuejs.org/rules/valid-v-else.html'
    },
    fixable: null,
    schema: []
  },

  create (context) {
    return utils.defineTemplateBodyVisitor(context, {
      "VAttribute[directive=true][key.name='else']" (node) {
        const element = node.parent.parent

        if (!utils.prevElementHasIf(element)) {
          context.report({
            node,
            loc: node.loc,
            message: "'v-else' 指令要求前面带有 'v-if' 或 'v-else' 指令的元素."
          })
        }
        if (utils.hasDirective(element, 'if')) {
          context.report({
            node,
            loc: node.loc,
            message: "'v-else' 和 'v-if' 指令不能存在于同一个元素上。 您可能需要'v-else-if'指令."
          })
        }
        if (utils.hasDirective(element, 'else-if')) {
          context.report({
            node,
            loc: node.loc,
            message: "'v-else' and 'v-else-if' directives can't exist on the same element."
          })
        }
        if (node.key.argument) {
          context.report({
            node,
            loc: node.loc,
            message: "'v-else' directives require no argument."
          })
        }
        if (node.key.modifiers.length > 0) {
          context.report({
            node,
            loc: node.loc,
            message: "'v-else' directives require no modifier."
          })
        }
        if (utils.hasAttributeValue(node)) {
          context.report({
            node,
            loc: node.loc,
            message: "'v-else' directives require no attribute value."
          })
        }
      }
    })
  }
}
