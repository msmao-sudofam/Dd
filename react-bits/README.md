# React Bits

Source of all React Bits components (JS + CSS variants), copied from
https://github.com/DavidHDev/react-bits at commit b209859. React Bits is not
published to npm — components are meant to be copied into your project.

Folders: `Animations/`, `Backgrounds/`, `Components/`, `TextAnimations/`, `Micro/`.

Usage: copy the component folder you want into your app and import it, e.g.

```jsx
import SplitText from './react-bits/TextAnimations/SplitText/SplitText';
```

Common dependencies (`gsap`, `@gsap/react`, `motion`, `ogl`, `three`, `lenis`)
are installed in the root `package.json`. A few components need extras
(`@react-three/fiber`, `@react-three/drei`, `postprocessing`, `matter-js`,
`@hugeicons/react`, etc.) — install those when you use that component.

License: MIT + Commons Clause, see `LICENSE.md`.
