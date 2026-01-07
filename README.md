# Cardiac Digital Twin Webpage

Static landing page for the Left Atrium interactive N-body cardiac simulation. This site summarizes the project, links to the published paper, and showcases simulation media (videos and images) produced from the CUDA/OpenGL codebase.

## Upstream project
- Core simulation code: https://github.com/TSUParticleModelingGroup/New-Left-Atrium-Model
- Publication: https://doi.org/10.1016/j.jelectrocard.2024.153762

## Preview locally
- Open `index.html` in your browser, or use a lightweight server such as the VS Code Live Server extension.
- All assets are local; no build step is required.

## Project structure
- `index.html`: Page content, including overview, results, publication links, and the media gallery.
- `style.css`: Layout, responsive rules, and theming (light/dark toggle).
- `script.js`: Navigation toggle, dark-mode persistence, and scroll animations.
- `assets/`: Simulation media used across the page and in the gallery (1D/2D/3D/idealized/patient-specific runs plus the GUI snapshot).

## Media gallery
The gallery (at the bottom of the page) lets visitors browse images and play videos directly in the browser: 1D strands, 2D rings, 3D spheres, idealized atria, patient-specific models, and flutter/ablation sequences.

## Attribution
Content and figures derive from the TSU Particle Modeling Group’s Left Atrium N-body simulation work. Media files included here remain with their respective authors.
