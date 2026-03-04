# magnetic-elements

React hook & components for magnetic hover interactions. Elements that attract toward the cursor — like on Apple.com and Awwwards sites.

<!-- TODO: Add GIF demo here -->

## Features

- **`useMagnetic` hook** — full control, works with any element
- **`<Magnetic>` component** — drop-in wrapper for quick integration
- **Accessibility-first** — respects `prefers-reduced-motion` by default
- **SSR-safe** — no DOM access until hydration, works with Next.js App Router
- **Zero dependencies** — just React as peer dependency
- **Tiny** — ~1KB gzipped

## Install

```bash
npm install magnetic-elements
```

## Quick Start

### Hook

```tsx
import { useMagnetic } from 'magnetic-elements';
import { useRef } from 'react';

function MagneticButton() {
  const ref = useRef<HTMLButtonElement>(null);
  const { isActive } = useMagnetic(ref, { strength: 0.3 });

  return (
    <button ref={ref} className={isActive ? 'active' : ''}>
      Hover me
    </button>
  );
}
```

### Component

```tsx
import { Magnetic } from 'magnetic-elements';

function App() {
  return (
    <Magnetic as="button" strength={0.3} range={150}>
      Hover me
    </Magnetic>
  );
}
```

## API

### `useMagnetic(ref, options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `strength` | `number` | `0.3` | Attraction strength (0-1) |
| `range` | `number` | `200` | Trigger radius in px |
| `ease` | `number` | `0.1` | Lerp smoothing factor (0-1, lower = smoother) |
| `maxDisplacement` | `number` | `range * strength` | Max movement in px |
| `respectMotionPreference` | `boolean` | `true` | Honor `prefers-reduced-motion` |
| `triggerArea` | `'self' \| 'parent'` | `'self'` | Element that triggers the effect |
| `onEnter` | `() => void` | — | Called when cursor enters range |
| `onLeave` | `() => void` | — | Called when cursor leaves range |

**Returns:** `{ isActive: boolean, x: number, y: number }`

### `<Magnetic>`

Accepts all hook options as props, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `as` | `keyof HTMLElementTagNameMap` | `'div'` | HTML tag to render |
| `className` | `string` | — | CSS class |
| `style` | `CSSProperties` | — | Inline styles |
| `children` | `ReactNode` | — | Content |

## Accessibility

By default, `magnetic-elements` disables the effect when the user has `prefers-reduced-motion: reduce` enabled. This respects users with vestibular motion disorders. You can override this with `respectMotionPreference={false}`.

## Browser Support

Works in all modern browsers (Chrome 55+, Firefox 59+, Safari 13+, Edge 79+).

## License

MIT
