/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import Nedb from '@seald-io/nedb'

// Convert string-based $where queries to functions (intentionally supports NoSQL injection for challenge purposes)
function preprocessQuery (query: Record<string, any>): Record<string, any> {
  if (query != null && typeof query.$where === 'string') {
    const whereStr = query.$where
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
    return { ...query, $where: new Function(`return (${whereStr})`) }
  }
  return query
}

function createCollection () {
  const db = new Nedb({ inMemoryOnly: true, autoload: true })
  return {
    async find (query: Record<string, any> = {}) {
      return await db.findAsync(preprocessQuery(query))
    },
    async findOne (query: Record<string, any>) {
      return await db.findOneAsync(preprocessQuery(query))
    },
    async insert (doc: Record<string, any>) {
      return await db.insertAsync(doc)
    },
    async update (query: Record<string, any>, update: Record<string, any>, options: Record<string, any> = {}) {
      const result = await db.updateAsync(preprocessQuery(query), update, { ...options, returnUpdatedDocs: true })
      const docs = result.affectedDocuments
      return {
        modified: result.numAffected,
        original: Array.isArray(docs) ? docs : docs != null ? [docs] : []
      }
    },
    async count (query: Record<string, any> = {}) {
      return await db.countAsync(preprocessQuery(query))
    }
  }
}

export const reviewsCollection = createCollection()
export const ordersCollection = createCollection()
