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
      description: 'enforce valid `v-else-if` directives',
      category: 'essential',
      url: 'https://eslint.vuejs.org/rules/valid-v-else-if.html'
    },
    fixable: null,
    schema: []
  },

  create (context) {
    return utils.defineTemplateBodyVisitor(context, {
      "VAttribute[directive=true][key.name='else-if']" (node) {
        const element = node.parent.parent

        if (!utils.prevElementHasIf(element)) {
          context.report({
            node,
            loc: node.loc,
            message: "'v-else-if' 指令要求前面带有 'v-if' 或 'v-else-if' 指令的元素."
          })
        }
        if (utils.hasDirective(element, 'if')) {
          context.report({
            node,
            loc: node.loc,
            message: "'v-else-if' 和 'v-if' 指令不能存在于同一元素上."
          })
        }
        if (utils.hasDirective(element, 'else')) {
          context.report({
            node,
            loc: node.loc,
            message: "'v-else-if' 和 'v-else' 指令不能存在于同一个元素上."
          })
        }
        if (node.key.argument) {
          context.report({
            node,
            loc: node.loc,
            message: "'v-else-if' 指令不需要参数."
          })
        }
        if (node.key.modifiers.length > 0) {
          context.report({
            node,
            loc: node.loc,
            message: "'v-else-if' 指令不需要修饰符."
          })
        }
        if (!utils.hasAttributeValue(node)) {
          context.report({
            node,
            loc: node.loc,
            message: "'v-else-if' 指令需要属性值."
          })
        }
      }
    })
  }
}
