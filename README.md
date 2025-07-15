<p align="center">
  <samp>_ Work in progress _</samp>
</p>

<br />

<h2 align="center">☝🏻</h2>

```
pnpm i -D eslint @jynxio/eslint-plugin
```

<br />

<h2 align="center">✌🏻</h2>

Copy the following content into `eslint.config.mjs`.

```
import jynxio from '@jynxio/eslint-plugin';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    plugins: { jynxio },
    rules: { 'jynxio/underscore-file-pattern': 'error' },
  },
]);
```
