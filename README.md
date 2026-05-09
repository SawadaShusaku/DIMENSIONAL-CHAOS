# DIMENSIONAL CHAOS

A cinematic, high-performance scroll-driven 3D web experience built with React Three Fiber.

## Overview

Dimensional Chaos is an immersive 3D web experiment that leverages the power of WebGL and React to create a seamless, cinematic scrolling experience. As the user scrolls, they navigate through a "multiverse" of 3D entities, culminating in a dramatic warp singularity effect and a comprehensive CC0 3D model library.

### Features
- **Scroll-Driven 3D Layers:** Declarative, high-performance scroll animations using `@react-three/drei`'s `ScrollControls`.
- **Cinematic Camera Work:** Dynamic Field of View (FOV) adjustments and Dolly Zoom effects tied to scroll progress.
- **Optimized Rendering:** Uses `SkeletonUtils` for efficient instancing and cloning of animated models (e.g., the Fox Stampede) while maintaining steady frame rates on mobile and ultrawide displays.
- **CC0 Multiverse Archives:** An integrated library page fetching and displaying a curated collection of open-source 3D assets.

## Tech Stack
- **React** (Vite)
- **React Three Fiber** (R3F)
- **Three.js**
- **@react-three/drei**

## Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/SawadaShusaku/DIMENSIONAL-CHAOS.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

This project is optimized for deployment on static hosting platforms like **Cloudflare Pages** or Vercel. 
- Build Command: `npm run build`
- Output Directory: `dist`

## Credits & Attribution

The 3D models used in this project are proudly sourced from open-source libraries under CC0 / open licenses.
- [Open Source 3D Assets](https://www.opensource3dassets.com) (GitHub: [ToxSam](https://github.com/ToxSam/open-source-3d-assets))
- [KhronosGroup glTF Sample Models](https://github.com/KhronosGroup/glTF-Sample-Models)
- [PMNDRS Market](https://market.pmnd.rs/)

We deeply appreciate the original creators for compiling and allowing the use of these comprehensive 3D model databases.
