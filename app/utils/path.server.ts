import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url) // prod: build/server/index.js | dev: app/utils/path.server.ts
const __dirname = dirname(__filename) // prod: build/server | dev: app/utils

export const rootPath = resolve(__dirname, '../../')
