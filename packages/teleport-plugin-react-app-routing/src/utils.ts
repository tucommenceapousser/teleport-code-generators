import * as types from '@babel/types'
import { UIDLDependency } from '@teleporthq/teleport-types'
import { ASTBuilders, ASTUtils } from '@teleporthq/teleport-plugin-common'

export const createRouteRouterTag = (flavour: string, routeJSXDefinitions: types.JSXElement[]) => {
  const routerTag = ASTBuilders.createJSXTag('Router')

  if (flavour === 'preact') {
    routeJSXDefinitions.forEach((route) => ASTUtils.addChildJSXTag(routerTag, route))
    return routerTag
  }
  const divContainer = ASTBuilders.createJSXTag('div')
  ASTUtils.addChildJSXTag(routerTag, divContainer)
  routeJSXDefinitions.forEach((route) => ASTUtils.addChildJSXTag(divContainer, route))

  return routerTag
}

export const constructRouteJSX = (
  flavour: string,
  componentName: string,
  path: string,
  fallback?: boolean
) => {
  let JSXRoutePrefix: string
  let route: types.JSXElement

  if (flavour === 'preact') {
    JSXRoutePrefix = componentName
    route = ASTBuilders.createSelfClosingJSXTag(JSXRoutePrefix)
    if (fallback) {
      ASTUtils.addAttributeToJSXTag(route, 'default', true)
    } else {
      ASTUtils.addAttributeToJSXTag(route, 'path', path)
    }
  } else {
    JSXRoutePrefix = 'Route'
    route = ASTBuilders.createSelfClosingJSXTag(JSXRoutePrefix)
    ASTUtils.addDynamicAttributeToJSXTag(route, 'component', componentName)
    if (!fallback) {
      ASTUtils.addAttributeToJSXTag(route, 'exact')
    }
    ASTUtils.addAttributeToJSXTag(route, 'path', path)
  }

  return route
}

export const registerReactRouterDeps = (dependencies: Record<string, UIDLDependency>): void => {
  dependencies.React = {
    type: 'library',
    path: 'react',
    version: '16.8.3',
  }

  dependencies.ReactDOM = {
    type: 'library',
    path: 'react-dom',
    version: '16.8.3',
  }

  dependencies.Router = {
    type: 'library',
    path: 'react-router-dom',
    version: '^5.2.0',
    meta: {
      namedImport: true,
      originalName: 'BrowserRouter',
    },
  }

  dependencies.Route = {
    type: 'library',
    path: 'react-router-dom',
    version: '^5.2.0',
    meta: {
      namedImport: true,
    },
  }
}

export const registerPreactRouterDeps = (dependencies: Record<string, UIDLDependency>): void => {
  dependencies.Router = {
    type: 'library',
    path: 'preact-router',
    version: '2.5.7',
    meta: {
      namedImport: true,
    },
  }
}
