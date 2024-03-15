import uglify from 'uglify-js'
import glob from 'fast-glob'
import fs from 'fs-extra'
import { resolve } from 'path'

const build = async (options = { input: '', output: '', cwd: '' }) => {
  const { input, output = 'dist', cwd } = options
  const globData = await glob(input, { cwd })
  const outputPath = resolve(cwd, output)
  for (const item of globData) {
    const code = (await fs.readFile(resolve(cwd, item))).toString()
    const codeOutPathPath = resolve(outputPath, item)
    await fs.ensureFile(codeOutPathPath)
    const res = uglify.minify(code)
    fs.writeFile(codeOutPathPath, res.code)
  }
}

const cwd = process.cwd()

build({ input: ['index.js'], cwd })
