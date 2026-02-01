# Northstar Education — Informational Website

Informational website for **Northstar Education**, a hockey company that helps Korean athletes into Jr. Pre, Pre, and Club hockey team programs.

## Tech

- **Tailwind CSS** (via CDN) for layout and styling
- Single-page HTML with responsive design

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

Then open the URL shown (e.g. http://localhost:3000).

## Sections

- **Hero** — Headline and intro
- **Programs** — Jr. Pre, Pre, Club
- **About** — Northstar mission and “Why Korean Athletes”
- **Contact** — Email and call-to-action
- **Footer** — Links and copyright

## Customization

- Brand colors are in the `tailwind.config` block in `index.html` under `theme.extend.colors.northstar`.
- Fonts: **Bebas Neue** (headings), **Outfit** (body), loaded from Google Fonts.

Replace placeholder email/links (e.g. “Schedule a Call”) with your real contact details when needed. Contact email: kkchung21@gmail.com.

## Deploy on Fly.io

The project includes a `Dockerfile`, `nginx.conf`, and `fly.toml` for deployment to [Fly.io](https://fly.io).

1. **Install the Fly CLI** (if needed):

   ```bash
   # macOS / Linux
   curl -L https://fly.io/install.sh | sh
   ```

   Or install via Homebrew: `brew install flyctl`

2. **Log in** (opens browser):

   ```bash
   fly auth login
   ```

3. **Launch the app** (creates the app on Fly.io if needed):

   ```bash
   fly launch
   ```

   When prompted, choose your org and region; you can accept defaults for the rest. If the app name `northstar-education` is taken, pick a different name or edit `app` in `fly.toml`.

4. **Deploy**:

   ```bash
   fly deploy
   ```

After deploy, your site will be live at `https://northstar-education.fly.dev` (or the app name you used). Use `fly open` to open it in the browser.
