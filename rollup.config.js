import replace from '@rollup/plugin-replace'
import { terser } from 'rollup-plugin-terser'
import { babel } from '@rollup/plugin-babel'

const isDev = process.env.NODE_ENV === 'development'

const files = (isDev ? [''] : ['', 'min']).map((env) =>
  ['danmaku', env, 'js'].filter((x) => x).join('.')
)
const formats = [
  { format: 'umd', path: '' },
  { format: 'esm', path: 'esm' },
]

export default {
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
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      preventAssignment: true,
    }),
  ],
}
