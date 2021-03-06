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
// Helpers
// ------------------------------------------------------------------------------

const VALID_MODIFIERS = new Set(['prop', 'camel', 'sync'])

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'enforce valid `v-bind` directives',
      category: 'essential',
      url: 'https://eslint.vuejs.org/rules/valid-v-bind.html'
    },
    fixable: null,
    schema: []
  },

  create (context) {
    return utils.defineTemplateBodyVisitor(context, {
      "VAttribute[directive=true][key.name='bind']" (node) {
        for (const modifier of node.key.modifiers) {
          if (!VALID_MODIFIERS.has(modifier)) {
            context.report({
              node,
              loc: node.key.loc,
              message: "'v-bind' 指令不支持修饰符 '{{name}}'.",
              data: { name: modifier }
            })
          }
        }

        if (!utils.hasAttributeValue(node)) {
          context.report({
            node,
            loc: node.loc,
            message: "'v-bind' 指令需要一个属性值."
          })
        }
      }
    })
  }
}
