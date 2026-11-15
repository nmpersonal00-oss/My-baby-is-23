# Generate the remaining cinematic animated matching GIFs

The game contains 350 unique exact answers in seven categories, stored in
`assets/memory-gif-inventory.json`. Original **Hollow Knight is excluded**.

## What is already installed?
10 Sanrio Round 1 GIFs and the Lies of P Pinocchio GIF are already installed.

## Generate all remaining artwork through GitHub

1. Configure a paid OpenAI **API key** in the repository's
   **Settings → Secrets and variables → Actions → New repository secret**.
   Name the secret `OPENAI_API_KEY`. ChatGPT subscription billing and API billing
   are separate. Generation consumes paid API credits.
2. Open **Actions → Generate cinematic memory GIFs → Run workflow**.
3. Pick category `all` (35 batches of 10), or a single category (5 batches).
   Tick the explicit checkbox authorizing paid image generation. Runs with the
   box unchecked do nothing.
4. The workflow requests six-frame cinematic CGI GIFs from GPT Image 2.6
   Sunburst, independently checks visual subject identity with a vision model,
   checks GIF frame geometry, and resizes each animation to **480×210**.
   Uncertain results are rejected instead of being assigned to unrelated names.
5. When generation finishes, it creates a **review pull request** with the
   verified animated files and exact-name mappings. Inspect the visuals before
   merging. After merging, GitHub Pages serves the new clips.

Visual fidelity is not guaranteed solely by an AI check. Obscure characters
benefit from reference art placed at
`assets/memory-gif-references/<category>/<slug>.png`; the renderer then uses
image editing with that reference to retain canonical character features.

The workflow never touches `assets/hollow-knight/` or the original Hollow
Knight answer map, and it never fills spaces with generic placeholder GIFs.

The existing workflow `.github/workflows/link-memory-gifs.yml` also links any
manually uploaded GIFs at the paths in the inventory. Use
`python scripts/install-memory-gifs.py` to validate and connect manually
uploaded assets locally.

The `scripts/generate-memory-gifs.py` command defaults to a **dry run**. To
actually spend API credits and generate, provide `--generate` explicitly.
