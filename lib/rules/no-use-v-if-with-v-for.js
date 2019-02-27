/**
 * @author Yosuke Ota
 *
 * issue        https://github.com/vuejs/eslint-plugin-vue/issues/403
 * Style guide: https://vuejs.org/v2/style-guide/#Avoid-v-if-with-v-for-essential
 *
 * I implemented it with reference to `no-confusing-v-for-v-if`
 */
'use strict'

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const utils = require('../utils')

// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

/**
 * Check whether the given `v-if` node is using the variable which is defined by the `v-for` directive.
 * @param {ASTNode} vIf The `v-if` attribute node to check.
 * @returns {boolean} `true` if the `v-if` is using the variable which is defined by the `v-for` directive.
 */
function isUsingIterationVar (vIf) {
  return !!getVForUsingIterationVar(vIf)
}

function getVForUsingIterationVar (vIf) {
  const element = vIf.parent.parent
  for (var i = 0; i < vIf.value.references.length; i++) {
    const reference = vIf.value.references[i]

    const targetVFor = element.variables.find(variable =>
      variable.id.name === reference.id.name &&
      variable.kind === 'v-for'
    )
    if (targetVFor) {
      return targetVFor.id.parent
    }
  }
  return undefined
}

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow use v-if on the same element as v-for',
      category: 'essential',
      url: 'https://eslint.vuejs.org/rules/no-use-v-if-with-v-for.html'
    },
    fixable: null,
    schema: [{
      type: 'object',
      properties: {
        allowUsingIterationVar: {
          type: 'boolean'
        }
      }
    }]
  },

  create (context) {
    const options = context.options[0] || {}
    const allowUsingIterationVar = options.allowUsingIterationVar === true // default false
    return utils.defineTemplateBodyVisitor(context, {
      "VAttribute[directive=true][key.name='if']" (node) {
        const element = node.parent.parent

        if (utils.hasDirective(element, 'for')) {
          if (isUsingIterationVar(node)) {
            if (!allowUsingIterationVar) {
              const vFor = getVForUsingIterationVar(node)
              context.report({
                node,
                loc: node.loc,
                message: "'v-for' 指令中的'{{iteratorName}}'变量应替换为返回已过滤数组的计算属性。 你不应该把'v-for'和'v-if'混在一起.",
                data: {
                  iteratorName: vFor.right.name
                }
              })
            }
          } else {
            context.report({
              node,
              loc: node.loc,
              message: "这个 'v-if' 应该移动到包装元素."
            })
          }
        }
      }
    })
  }
}
