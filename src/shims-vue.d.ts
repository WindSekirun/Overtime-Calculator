declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type */
  const component: DefineComponent<{}, {}, any>
  export default component
}
