"use client";

import { logFirebaseEvent } from '@/lib/firebase';

const StackOverflowIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.725 0l-1.72 1.277 6.39 8.588 1.716-1.277L15.725 0zm-3.94 3.418l-1.369 1.644 8.225 6.85 1.369-1.644-8.225-6.85zm-3.15 4.465l-.905 1.94 9.702 4.517.904-1.94-9.701-4.517zm-1.85 4.86l-.44 2.093 10.473 2.201.44-2.092-10.473-2.202zM1.89 15.47V24h19.19v-8.53h-2.133v6.397H4.021v-6.396H1.89zm4.265 2.133v2.13h10.66v-2.13H6.155z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const EmailIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 6.817h-18.779l5.513-6.812zm9.208-1.264l4.616-3.741v9.348l-4.616-5.607z"/>
  </svg>
);

export default function SocialIcons() {
  const socialLinks = [
    {
      href: 'https://stackoverflow.com/users/874662/joe', // Update with your StackOverflow profile
      icon: StackOverflowIcon,
      label: 'StackOverflow',
    },
    {
      href: 'https://github.com/y0av',
      icon: GitHubIcon,
      label: 'GitHub',
    },
    {
      href: 'mailto:gy4b6ss7w@mozmail.com', // Update with your email
      icon: EmailIcon,
      label: 'Email',
    },
  ];

  return (
    <div className="flex gap-6 justify-center pointer-events-auto">
      {socialLinks.map((link, index) => (
        <a
          key={link.label}
          href={link.href}
          target={link.href.startsWith('mailto:') ? '_self' : '_blank'}
          rel={link.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
          className={`text-gray-300 hover:text-blue-400 transition-all duration-300 hover:scale-110 animate-bounce-in animate-delay-${800 + index * 100}`}
          aria-label={link.label}
          onClick={() => logFirebaseEvent('social_click', { network: link.label, href: link.href })}
        >
          <link.icon />
        </a>
      ))}
    </div>
  );
}
