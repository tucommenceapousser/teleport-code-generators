import * as types from '@babel/types'
import { UIDLUtils } from '@teleporthq/teleport-shared'
import { ASTBuilders, ASTUtils } from '@teleporthq/teleport-plugin-common'
import { UIDLConditionalNode, UIDLRouteDefinitions } from '@teleporthq/teleport-types'

export const createClassDeclaration = (
  routes: UIDLConditionalNode[],
  routeDefinitions: UIDLRouteDefinitions,
  t = types
) => {
  const stencilRouterTag = ASTBuilders.createJSXTag('stencil-router')
  const stencilRouteSwitchTag = ASTBuilders.createJSXTag('stencil-route-switch')
  ASTUtils.addChildJSXTag(stencilRouterTag, stencilRouteSwitchTag)

  routes.forEach((routeNode) => {
    const pageKey = routeNode.content.value.toString()
    const pageDefinition = routeDefinitions.values.find((route) => route.value === pageKey)
    const { componentName, navLink, fallback } = pageDefinition.pageOptions

    const stencilRouteTag = ASTBuilders.createJSXTag('stencil-route')
    if (!fallback) {
      ASTUtils.addAttributeToJSXTag(stencilRouteTag, 'url', navLink)
    }

    if (navLink === '/') {
      ASTUtils.addAttributeToJSXTag(stencilRouteTag, 'exact', true)
    }

    ASTUtils.addAttributeToJSXTag(
      stencilRouteTag,
      'component',
      UIDLUtils.createWebComponentFriendlyName(componentName)
    )
    ASTUtils.addChildJSXTag(stencilRouteSwitchTag, stencilRouteTag)
  })

  const mainTag = ASTBuilders.createJSXTag('main')
  ASTUtils.addChildJSXTag(mainTag, stencilRouterTag)
  const divTag = ASTBuilders.createJSXTag('div')
  ASTUtils.addChildJSXTag(divTag, mainTag)

  const returnAST = divTag as types.JSXElement

  const classBodyAST = t.classBody([
    t.classMethod(
      'method',
      t.identifier('render'),
      [],
      t.blockStatement([t.returnStatement(returnAST)])
    ),
  ])

  const exportClass = t.exportNamedDeclaration(
    t.classDeclaration(t.identifier('AppRoot'), null, classBodyAST, null),
    [],
    null
  )
  return exportClass
}
