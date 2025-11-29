import swc from 'unplugin-swc'

export default {
  test: {
    global: true,
    environment: "node",
    include: ['**/*.spec.ts', '**/*test.ts']
  },
  plugins: [
    swc.vite(),
    swc.rollup(),
  ],
}
