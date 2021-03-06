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
      description: 'enforce valid `v-pre` directives',
      category: 'essential',
      url: 'https://eslint.vuejs.org/rules/valid-v-pre.html'
    },
    fixable: null,
    schema: []
  },

  create (context) {
    return utils.defineTemplateBodyVisitor(context, {
      "VAttribute[directive=true][key.name='pre']" (node) {
        if (node.key.argument) {
          context.report({
            node,
            loc: node.loc,
            message: "'v-pre' 指令不需要参数."
          })
        }
        if (node.key.modifiers.length > 0) {
          context.report({
            node,
            loc: node.loc,
            message: "'v-pre' 指令不需要修饰符."
          })
        }
        if (node.value) {
          context.report({
            node,
            loc: node.loc,
            message: "'v-pre' 指令不需要属性值."
          })
        }
      }
    })
  }
}
