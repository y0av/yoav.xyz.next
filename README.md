# Yoav.xyz - Interactive Portfolio Landing Page

A modern, interactive portfolio landing page built with Next.js and Tailwind CSS, featuring a custom canvas game background and 3D portrait interactions.

## Features

- **Interactive Canvas Game**: Background with stars, shooting stars, spaceship that follows mouse, and targets to shoot
- **3D Portrait Interaction**: Drag/flick the portrait to spin it in 3D space with physics-based momentum
- **Smooth Animations**: Entrance animations using Framer Motion
- **Responsive Design**: Optimized for both desktop and mobile
- **Modern Tech Stack**: Next.js 15, React 19, Tailwind CSS v4, TypeScript

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Typography**: Roboto Mono (Google Fonts)
- **Language**: TypeScript
- **Package Manager**: PNPM

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
