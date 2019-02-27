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
const keyAliases = require('../utils/key-aliases.json')

// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

const VALID_MODIFIERS = new Set([
  'stop', 'prevent', 'capture', 'self', 'ctrl', 'shift', 'alt', 'meta',
  'native', 'once', 'left', 'right', 'middle', 'passive', 'esc', 'tab',
  'enter', 'space', 'up', 'left', 'right', 'down', 'delete', 'exact'
])
const VERB_MODIFIERS = new Set([
  'stop', 'prevent'
])
// https://www.w3.org/TR/uievents-key/
const KEY_ALIASES = new Set(keyAliases)

function isValidModifier (modifier, customModifiers) {
  return (
    // built-in aliases
    VALID_MODIFIERS.has(modifier) ||
    // keyCode
    Number.isInteger(parseInt(modifier, 10)) ||
    // keyAlias (an Unicode character)
    Array.from(modifier).length === 1 ||
    // keyAlias (special keys)
    KEY_ALIASES.has(modifier) ||
    // custom modifiers
    customModifiers.has(modifier)
  )
}

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'enforce valid `v-on` directives',
      category: 'essential',
      url: 'https://eslint.vuejs.org/rules/valid-v-on.html'
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          modifiers: {
            type: 'array'
          }
        },
        additionalProperties: false
      }
    ]
  },

  create (context) {
    const options = context.options[0] || {}
    const customModifiers = new Set(options.modifiers || [])
    const sourceCode = context.getSourceCode()

    return utils.defineTemplateBodyVisitor(context, {
      "VAttribute[directive=true][key.name='on']" (node) {
        for (const modifier of node.key.modifiers) {
          if (!isValidModifier(modifier, customModifiers)) {
            context.report({
              node,
              loc: node.loc,
              message: "'v-on' 指令不支持修饰符 '{{modifier}}'.",
              data: { modifier }
            })
          }
        }

        if (
          !utils.hasAttributeValue(node) &&
          !node.key.modifiers.some(VERB_MODIFIERS.has, VERB_MODIFIERS)
        ) {
          if (node.value && sourceCode.getText(node.value.expression)) {
            const value = sourceCode.getText(node.value)
            context.report({
              node,
              loc: node.loc,
              message: '避免将JavaScript关键字用作 "v-on" 值：{{value}}.',
              data: { value }
            })
          } else {
            context.report({
              node,
              loc: node.loc,
              message: "'v-on' 指令需要属性值或动词修饰符 (如 'stop' or 'prevent')."
            })
          }
        }
      }
    })
  }
}
