import Link from 'next/link';
import type React from 'react';
import type { IconType } from 'react-icons';
import { tv } from 'tailwind-variants';

export const footerVariants = tv({
  base: 'w-full bg-footer-background',
});

export interface FooterProps {
  social: {
    name: string;
    href: string;
    icon: IconType;
  }[];
  links: {
    name: string;
    children: {
      name: string;
      href: string;
    }[];
  }[];
  copyRight?: string;
  className?: string;
  children?: React.ReactNode;
}

export const Footer: React.FC<FooterProps> = ({
  social,
  links,
  children,
  className,
  copyRight = ' 2021- Neody. All rights reserved.',
}) => {
  const maxWidth = links.length < 4 ? 'max-w-4xl' : 'max-w-5xl';

  return (
    <footer className={footerVariants({ className })}>
      <div
        className={`mx-auto flex w-full ${maxWidth} flex-col justify-between`}
      >
        <div
          className="flex flex-col gap-4 px-4 pt-7 pb-4 lg:grid lg:gap-0 lg:px-0 lg:pt-9 lg:pb-7"
          style={{
            gridTemplateColumns: `repeat(${links.length + 1}, minmax(0, 1fr))`,
          }}
        >
          {links.map((item) => (
            <div key={item.name}>
              <h3 className="font-semibold text-footer-text text-sm tracking-wider">
                {item.name}
              </h3>
              <ul className="mt-2 space-y-1">
                {item.children.map((child) => (
                  <li key={child.name}>
                    <Link
                      className="text-sm text-steel tracking-wide transition-colors hover:text-footer-text"
                      href={child.href}
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {children}
        </div>
        <div>
          <div className="mx-4 border-footer-border border-t py-2 lg:mx-0">
            <div className="mt-1 mb-4 flex w-full flex-col-reverse items-start justify-between gap-1 lg:m-0 lg:flex-row lg:items-center lg:gap-0">
              <p className="text-gray-400 text-xs tracking-wider">
                &copy; {copyRight}
              </p>
              <div className="flex flex-row justify-start gap-1 lg:items-center">
                {social.map((item) => (
                  <Link
                    className="rounded-full p-2 text-steel transition-colors hover:text-footer-text"
                    href={item.href}
                    key={item.name}
                  >
                    <item.icon className="h-5 w-5" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
Footer.displayName = 'Footer';
