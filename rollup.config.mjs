import replace from '@rollup/plugin-replace'
import { terser } from 'rollup-plugin-terser'
import { babel } from '@rollup/plugin-babel'

const configs = ['', 'dom', 'canvas'].map((engine) => {
  const files = ['', 'min'].map((env) =>
    ['danmaku', engine, env, 'js'].filter((x) => x).join('.')
  )
  const formats = [
    { format: 'umd', path: '' },
    { format: 'esm', path: 'esm' },
  ]
  return {
    input: 'src/index.js',
    output: [].concat(
      ...formats.map(({ format, path }) =>
        files.map((file) => ({
          file: ['dist', path, file].filter((x) => x).join('/'),
          format,
          name: 'Danmaku',
          plugins: file.includes('.min') ? [terser()] : [],
        }))
      )
    ),
    plugins: [
      babel({ babelHelpers: 'bundled' }),
      replace({ preventAssignment: true, 'process.env.ENGINE': `"${engine}"` }),
    ],
  }
})

export default configs
