# DefenseBioscope

**Interactive Military Systems Coverage Visualizer**

Explore missile ranges, air defense zones, fighter jet operational radii, and naval weapon coverage on an interactive 3D globe — powered by real-time Wikipedia data extraction.

## Features

- **3D Globe & 2D Map** — Toggle between globe projection and flat Mercator view
- **120+ Military Systems** — Pre-loaded missiles, SAMs, aircraft, drones, and warships from 15+ nations
- **Live Wikipedia Search** — Real-time weapon data extraction with infobox validation
- **Drag & Deploy** — Place systems on the map and visualize coverage circles
- **Blast Impact Zones** — Simulate detonation with heavy, thermal, and light damage radii
- **Dark / Light Theme** — Instant theme switching with zero flash or lag
- **Custom Systems** — Add your own defense hardware with custom range values
- **Mobile Responsive** — Full-featured bottom sheet UI for mobile devices

## Tech Stack

- **React 19** + **Vite 8** — Lightning-fast dev and build
- **MapLibre GL** + **react-map-gl** — High-performance WebGL map rendering
- **Tailwind CSS 4** — Utility-first styling
- **Wikipedia API** — Zero-cost client-side military data extraction

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Deployment

This project is configured for **Vercel** deployment:

1. Push to GitHub
2. Import in Vercel
3. Framework: **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`

## License

This project is for educational and research purposes only. All military system data is sourced from publicly available Wikipedia articles.
