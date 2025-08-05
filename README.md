# Yoav.xyz - Interactive Landing Page

A modern, interactive Next.js landing page featuring animated components, 3D portrait interaction, and a custom canvas-based space game background.

## ✨ Features

- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Interactive 3D Portrait**: Drag/flick the circular portrait to spin it in 3D space with realistic physics
- **Custom Canvas Game**: 
  - Spaceship that follows your mouse/pointer
  - Shoot projectiles by holding down mouse/touch
  - Animated targets that slide in from screen edges
  - Particle explosions when targets are hit
  - Animated star field with parallax effects
  - Shooting stars at random intervals
- **Smooth Animations**: CSS-based entrance animations for all elements
- **Modern Tech Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS v4

## 🛠️ Tech Stack

- **Framework**: Next.js 15.4.5 with App Router
- **Frontend**: React 19.1.0, TypeScript
- **Styling**: Tailwind CSS v4 with custom animations
- **Font**: Roboto Mono (Google Fonts)
- **Package Manager**: pnpm
- **Deployment**: Optimized for Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- PNPM (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/y0av/yoav.xyz.next.git
cd yoav.xyz
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
pnpm build
pnpm start
```

## Deployment

This project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically with zero configuration

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/y0av/yoav.xyz.next)

## Customization

### Personal Information

Update the following files with your information:

- `src/components/Bio.tsx` - Update bio text
- `src/components/SocialIcons.tsx` - Update social media links
- `public/yoav.jpg` - Replace with your photo
- `public/logo.svg` - Replace with your logo

### Styling

- Colors and styling can be customized in `tailwind.config.ts`
- Global styles in `src/app/globals.css`

### Game Settings

Customize the canvas game in `src/components/CanvasGame.tsx`:
- Star count and movement speed
- Shooting star frequency  
- Target spawn rate
- Spaceship appearance and movement

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with font configuration
│   ├── page.tsx            # Main landing page
│   └── globals.css         # Global styles
└── components/
    ├── CanvasGame.tsx      # Interactive background game
    ├── Logo.tsx            # Top-left logo component
    ├── Greeting.tsx        # Animated greeting text
    ├── Portrait.tsx        # 3D interactive portrait
    ├── Bio.tsx             # Bio text with animation
    └── SocialIcons.tsx     # Social media links
```

## License

MIT License - feel free to use this as a template for your own portfolio!

## Contact

- GitHub: [y0av](https://github.com/y0av)
- Website: [yoav.xyz](https://yoav.xyz)
