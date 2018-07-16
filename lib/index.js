'use strict'

const fs = require('fs')
const glob = require('glob')
const path = require('path')
const doctrine = require('doctrine')
const jsYaml = require('js-yaml')
const parser = require('swagger-parser')

/**
 * Adds the tags property to an OAS object
 * @function
 * @param {object} conf - Flexible configuration
 */
function addTags (conf) {
  const tag = conf.tag
  const tags = conf.oasObject.tags

  for (let i = 0; i < tag.length; i++) {
    if (!tags.map(tag => tag.name).includes(tag[i].name)) {
      tags.push(tag[i])
    }
  }
}

/**
 * Adds the component properties to an OAS object
 * @function
 * @param {object} conf - Configuration
 */
function addComponents (conf) {
  const componentList = [
    'schemas',
    'responses',
    'parameters',
    'examples',
    'requestBodies',
    'headers',
    'securitySchemes',
    'links',
    'callbacks'
  ]
  const component = conf.component
  const oasObject = conf.oasObject

  Object.keys(component).forEach(key => {
    if (!componentList.includes(key)) {
      delete component[key]
      return
    }
    oasObject.components[key] = merge(oasObject.components[key], component[key])
  })
}

/**
 * Merges two objects or arrays
 * @function
 * @param {object|array} obj1 - Object/array 1
 * @param {object|array} obj2 - Object/array 2
 * @returns {object|array} Merged object/array
 */
function merge (obj1, obj2) {
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    return obj1.concat(obj2)
  } else if (!obj1 && Array.isArray(obj2)) {
    return obj2.concat([])
  } else if (!obj2 && Array.isArray(obj1)) {
    return obj1.concat([])
  }

  let obj3 = {}
  for (let attr in obj1) {
    if (obj1.hasOwnProperty(attr)) {
      obj3[attr] = obj1[attr]
    }
  }
  for (let attr in obj2) {
    if (obj2.hasOwnProperty(attr)) {
      obj3[attr] = obj2[attr]
    }
  }
  return obj3
}

/**
 * Handles OpenAPI propertyName in pathObject context for oasObject
 * @function
 * @param {object} oasObject - The OAS object to update
 * @param {object} pathObject - The input context of an item for oasObject
 * @param {string} propertyName - The property to handle
 */
function organizeOASProperties (oasObject, pathObject, propertyName) {
  // Tags
  if (propertyName === 'tags') {
    addTags({
      tag: pathObject[propertyName],
      oasObject
    })
    // Components
  } else if (propertyName === 'components') {
    addComponents({
      component: pathObject[propertyName],
      oasObject
    })
    // Paths
  } else {
    oasObject.paths[propertyName] = merge(
      oasObject.paths[propertyName], pathObject[propertyName]
    )
  }
}

/**
 * Adds the data in to the OpenAPI object
 * @function
 * @param {object} oasObject - OpenAPI object which will be written to
 * @param {object[]} data - objects of parsed oas data from yml or jsDoc
 *                          comments
 */
function addDataToOasObject (oasObject, data) {
  if (!oasObject || !data) {
    throw new Error('oasObject and data are required!')
  }

  for (let i = 0; i < data.length; i++) {
    const pathObject = data[i]
    const propertyNames = Object.getOwnPropertyNames(pathObject)
    // Iterating the properties of the a given pathObject
    for (let j = 0; j < propertyNames.length; j++) {
      const propertyName = propertyNames[j]
      // Do what's necessary to organize the end specification
      organizeOASProperties(oasObject, pathObject, propertyName)
    }
  }
}

/**
 * Parses the provided API file for JSDoc comments
 * @function
 * @param {string} file - File to be parsed
 * @returns {{jsdoc: array, yaml: array}} JSDoc comments and Yaml files
 * @requires doctrine
 */
function parseApiFile (file) {
  const jsDocRegex = /\/\*\*([\s\S]*?)\*\//gm
  const fileContent = fs.readFileSync(file, { encoding: 'utf8' })
  const ext = path.extname(file)
  const yaml = []
  const jsDocComments = []

  if (ext === '.yaml' || ext === '.yml') {
    yaml.push(jsYaml.safeLoad(fileContent))
  } else {
    const regexResults = fileContent.match(jsDocRegex)
    if (regexResults) {
      for (let i = 0; i < regexResults.length; i++) {
        const jsDocComment = doctrine.parse(regexResults[i], { unwrap: true })
        jsDocComments.push(jsDocComment)
      }
    }
  }

  return {
    yaml: yaml,
    jsdoc: jsDocComments
  }
}

/**
 * Filters JSDoc comments for those tagged with '@swagger' or '@openapi'
 * @function
 * @param {array} jsDocComments - JSDoc comments
 * @returns {array} JSDoc comments tagged with '@swagger' or '@openapi'
 * @requires js-yaml
 */
function filterJsDocComments (jsDocComments) {
  const filteredJsDocComments = []

  for (let i = 0; i < jsDocComments.length; i++) {
    const jsDocComment = jsDocComments[i]
    for (let j = 0; j < jsDocComment.tags.length; j++) {
      const tag = jsDocComment.tags[j]
      if (tag.title === 'swagger' || tag.title === 'openapi') {
        filteredJsDocComments.push(jsYaml.safeLoad(tag.description))
      }
    }
  }

  return filteredJsDocComments
}

/**
 * Converts an array of globs to full paths
 * @function
 * @param {array} globs - Array of globs and/or normal paths
 * @return {array} Array of fully-qualified paths
 * @requires glob
 */
function convertGlobPaths (globs) {
  return globs.reduce((acc, globString) => {
    const globFiles = glob.sync(globString)
    return acc.concat(globFiles)
  }, [])
}

/**
 * Adds necessary OpenAPI root object properties
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.1.md#openapi-object
 * @function
 * @param {object} obj - The object to receive properties
 * @returns {object} obj - The updated object
 */
function makeRootDocumentObject (obj) {
  const validProperties = [
    'info', 'servers', 'paths', 'components', 'security', 'tags', 'externalDocs'
  ]

  // Remove unwanted properties
  Object.keys(obj).forEach(key => validProperties.includes(key) || delete obj[key])

  obj.openapi = '3.0.0'
  obj.info = obj.info || {}
  obj.servers = obj.servers || []
  obj.paths = obj.paths || {}
  obj.components = obj.components || {}
  obj.security = obj.security || []
  obj.tags = obj.tags || []
  obj.externalDocs = obj.externalDocs || {}
  return obj
}

/**
 * Generates OpenAPI specification
 * @function
 * @param {object} options - Configuration options
 * @returns {object} OpenAPI specification
 * @requires swagger-parser
 */
module.exports = function (options) {
  if (!options) {
    throw new Error('\'options\' is required.')
  } else if (!options.definition) {
    throw new Error('\'definition\' is required.')
  } else if (!options.apis) {
    throw new Error('\'apis\' is required.')
  }

  let OpenApiObject = makeRootDocumentObject(options.definition)
  const filePaths = convertGlobPaths(options.apis)

  for (let i = 0; i < filePaths.length; i++) {
    let file = parseApiFile(filePaths[i])
    addDataToOasObject(OpenApiObject, file.yaml)
    addDataToOasObject(OpenApiObject, filterJsDocComments(file.jsdoc))
  }

  parser.parse(OpenApiObject, function (err, api) {
    if (!err) {
      OpenApiObject = api
    }
  })

  return OpenApiObject
}
