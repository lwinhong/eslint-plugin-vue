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

/**
 * Check whether the given attribute is using the variables which are defined by `v-for` directives.
 * @param {ASTNode} vFor The attribute node of `v-for` to check.
 * @param {ASTNode} vBindKey The attribute node of `v-bind:key` to check.
 * @returns {boolean} `true` if the node is using the variables which are defined by `v-for` directives.
 */
function isUsingIterationVar (vFor, vBindKey) {
  if (vBindKey.value == null) {
    return false
  }
  const references = vBindKey.value.references
  const variables = vFor.parent.parent.variables
  return references.some(reference =>
    variables.some(variable =>
      variable.id.name === reference.id.name &&
            variable.kind === 'v-for'
    )
  )
}

/**
 * Check the child element in tempalte v-for about `v-bind:key` attributes.
 * @param {RuleContext} context The rule context to report.
 * @param {ASTNode} vFor The attribute node of `v-for` to check.
 * @param {ASTNode} child The child node to check.
 */
function checkChildKey (context, vFor, child) {
  const childFor = utils.getDirective(child, 'for')
  // if child has v-for, check if parent iterator is used in v-for
  if (childFor != null) {
    const childForRefs = childFor.value.references
    const variables = vFor.parent.parent.variables
    const usedInFor = childForRefs.some(cref =>
      variables.some(variable =>
        cref.id.name === variable.id.name &&
        variable.kind === 'v-for'
      )
    )
    // if parent iterator is used, skip other checks
    // iterator usage will be checked later by child v-for
    if (usedInFor) {
      return
    }
  }
  // otherwise, check if parent iterator is directly used in child's key
  checkKey(context, vFor, child)
}

/**
 * Check the given element about `v-bind:key` attributes.
 * @param {RuleContext} context The rule context to report.
 * @param {ASTNode} vFor The attribute node of `v-for` to check.
 * @param {ASTNode} element The element node to check.
 */
function checkKey (context, vFor, element) {
  if (element.name === 'template') {
    for (const child of element.children) {
      if (child.type === 'VElement') {
        checkChildKey(context, vFor, child)
      }
    }
    return
  }

  const vBindKey = utils.getDirective(element, 'bind', 'key')

  if (utils.isCustomComponent(element) && vBindKey == null) {
    context.report({
      node: element.startTag,
      loc: element.startTag.loc,
      message: "迭代中的自定义元素需要 'v-bind:key' 指令."
    })
  }
  if (vBindKey != null && !isUsingIterationVar(vFor, vBindKey)) {
    context.report({
      node: vBindKey,
      loc: vBindKey.loc,
      message: "预期'v-bind:key'指令使用'v-for'指令定义的变量."
    })
  }
}

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'enforce valid `v-for` directives',
      category: 'essential',
      url: 'https://eslint.vuejs.org/rules/valid-v-for.html'
    },
    fixable: null,
    schema: []
  },

  create (context) {
    const sourceCode = context.getSourceCode()

    return utils.defineTemplateBodyVisitor(context, {
      "VAttribute[directive=true][key.name='for']" (node) {
        const element = node.parent.parent

        checkKey(context, node, element)

        if (node.key.argument) {
          context.report({
            node,
            loc: node.loc,
            message: "'v-for' 指令不需要参数."
          })
        }
        if (node.key.modifiers.length > 0) {
          context.report({
            node,
            loc: node.loc,
            message: "'v-for' 指令不需要修饰符."
          })
        }
        if (!utils.hasAttributeValue(node)) {
          context.report({
            node,
            loc: node.loc,
            message: "'v-for' 指令需要属性值."
          })
          return
        }

        const expr = node.value.expression
        if (expr == null) {
          return
        }
        if (expr.type !== 'VForExpression') {
          context.report({
            node: node.value,
            loc: node.value.loc,
            message: "'v-for' 指令必须使用指定的语法 '<alias> in <expression>'."
          })
          return
        }

        const lhs = expr.left
        const value = lhs[0]
        const key = lhs[1]
        const index = lhs[2]

        if (value === null) {
          context.report({
            node: value || expr,
            loc: value && value.loc,
            message: "无效别名 ''."
          })
        }
        if (key !== undefined && (!key || key.type !== 'Identifier')) {
          context.report({
            node: key || expr,
            loc: key && key.loc,
            message: "无效别名 '{{text}}'.",
            data: { text: key ? sourceCode.getText(key) : '' }
          })
        }
        if (index !== undefined && (!index || index.type !== 'Identifier')) {
          context.report({
            node: index || expr,
            loc: index && index.loc,
            message: "无效别名 '{{text}}'.",
            data: { text: index ? sourceCode.getText(index) : '' }
          })
        }
      }
    })
  }
}
