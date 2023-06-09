import * as types from '@babel/types'

import { ASTUtils } from '@teleporthq/teleport-plugin-common'
import { UIDLStateDefinition, UIDLPropDefinition } from '@teleporthq/teleport-types'

export const createClassDeclaration = (
  name: string,
  propDefinitions: Record<string, UIDLPropDefinition>,
  stateDefinitions: Record<string, UIDLStateDefinition>,
  jsxTagTree: types.JSXElement,
  t = types
) => {
  const propDeclaration = Object.keys(propDefinitions).map((propKey) => {
    const { defaultValue, type } = propDefinitions[propKey]
    return t.classProperty(
      t.identifier(propKey),
      type === 'func'
        ? types.arrowFunctionExpression([], types.blockStatement([]))
        : ASTUtils.convertValueToLiteral(defaultValue),
      types.tsTypeAnnotation(ASTUtils.getTSAnnotationForType(type)),
      [t.decorator(t.callExpression(t.identifier('Prop'), []))]
    )
  })

  const stateDeclaration = Object.keys(stateDefinitions).map((stateKey) =>
    t.classProperty(
      t.identifier(stateKey),
      ASTUtils.convertValueToLiteral(stateDefinitions[stateKey].defaultValue),
      t.tsTypeAnnotation(ASTUtils.getTSAnnotationForType(stateDefinitions[stateKey].type)),
      [t.decorator(t.callExpression(t.identifier('State'), []))]
    )
  )

  const classBody = t.classBody([
    ...propDeclaration,
    ...stateDeclaration,
    types.classMethod(
      'method',
      t.identifier('render'),
      [],
      t.blockStatement([t.returnStatement(jsxTagTree)])
    ),
  ])

  const classDeclaration = t.classDeclaration(t.identifier(name), null, classBody, [])
  return t.exportNamedDeclaration(classDeclaration, [])
}

export const createDOMInjectionNode = (content: string, t = types) => {
  return t.jsxElement(
    t.jsxOpeningElement(
      t.jsxIdentifier('span'),
      [t.jsxAttribute(t.jsxIdentifier('innerHTML'), t.stringLiteral(content))],
      true
    ),
    null,
    [],
    true
  )
}
