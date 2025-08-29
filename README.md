![Node Version](https://img.shields.io/badge/node-%3E%3D18.17-brightgreen.svg) ![Unit Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg) ![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)

## Hash Generator — Directus Interface Extension

An interface for Directus that generates random hashes for `string` fields with configurable options (length, allowed characters, auto-generate on create, allow manual regeneration, etc.). Built with the Directus Extensions SDK and Vue 3.

### Features
- **Configurable length**: Choose the number of characters.
- **Character set toggles**: Allow numbers, uppercase, and special characters.
- **Auto-generate on create**: Optionally set the value when a new item is created.
- **Manual regenerate button**: If enabled, users can regenerate the value via a button.
- **Uniqueness-aware generation**: If the field is marked unique in your schema, the component avoids duplicates among existing values in the collection.

---

## Compatibility
- **Directus host**: `^10.10.0`
- **Node.js**: `>= 18.17` (Directus 10 requirement)

---

## Installation

### 1) Build the extension
From the repository root:

```bash
npm ci
npm run build
```

The compiled output is emitted to `dist/` and referenced by Directus.

### 2) Install into Directus
You have two options:

- **Link (recommended for development)**

  In this project:
  ```bash
  npm run link
  ```
  Follow the prompts to link to your local Directus project.

- **Manual install (for deployment)**

  Copy the built files into your Directus project under:
  - `extensions/interfaces/hash-generator/`
  - Ensure `dist/index.js` is present as defined in `package.json`.

Restart Directus after installing the extension.

---

## Usage in Directus
1. In the Directus app, go to `Settings` → `Data Model` and open or create a collection.
2. Add a field of type `string` (Text) or open an existing string field.
3. Under Interface, select `Hash Generator` (icon: `numbers`).
4. Configure the interface options as needed:
   - **length**: Integer slider (0–30). Number of characters to generate.
   - **set_on_create**: Toggle. Auto-generate the value when creating a new item.
   - **can_be_updated**: Toggle. Show a button to regenerate the value manually.
   - **allow_numbers**: Toggle. Include digits `0-9`.
   - **allow_special_characters**: Toggle. Include common special characters.
   - **allow_uppercase**: Toggle. Include uppercase `A-Z`.

### Notes
- If your field is marked as `Unique` in the schema, the interface avoids generating a hash that already exists in the collection.
- When `can_be_updated` is disabled, no regenerate button is shown.

---

## Local Development

### Install dependencies
```bash
npm ci
```

### Start development build (watch mode)
```bash
npm run dev
```
This watches source files and rebuilds the extension into `dist/` on changes.

### Type-check
```bash
npm run type-check
```

### Build (production)
```bash
npm run build
```

### Full extension build with type-check
```bash
npm run build:extension
```

### Validate extension manifest
```bash
npm run validate
```

### Unit tests
```bash
npm run test:unit
```
Tests run with Vitest and JSDOM.

---

## Configuration Options (Reference)
Defined in `src/index.ts` and used by `src/Interface.vue`.

- **length** (`integer`, slider 0–30): Number of characters to generate.
- **set_on_create** (`boolean`): Generate a value automatically when creating a new item.
- **can_be_updated** (`boolean`): Allow manual re-generation via button.
- **allow_numbers** (`boolean`): Include digits `0–9`.
- **allow_special_characters** (`boolean`): Include `!@#$%^&*()-_=+[]{}|;:,.<>?/`.
- **allow_uppercase** (`boolean`): Include uppercase `A–Z`.

The interface targets fields of type `string` and belongs to the `standard` group.

---

## Contributing
Contributions are welcome! Please follow these steps:

1. **Fork** the repository and create a feature branch.
2. **Install** dependencies with `npm ci`.
3. **Develop** with `npm run dev` and link to a local Directus instance using `npm run link`.
4. **Add/Update tests** and run `npm run test:unit`.
5. **Type-check** with `npm run type-check`.
6. **Build** with `npm run build` and ensure the extension works in Directus.
7. **Open a Pull Request** with a clear description of changes.

### Commit and PR Guidelines
- Keep PRs focused and small when possible.
- Include screenshots or short clips for UI changes.
- Update documentation if behavior or options change.

---

## Troubleshooting
- After installing or linking, restart your Directus server so it picks up the extension.
- Ensure your Node.js version meets the requirement (`>= 18.17`).
- If the interface does not appear, run `npm run validate` and check server logs.

---

## License
Licensed under the GNU General Public License (GPL). See the `LICENSE` file for details.


