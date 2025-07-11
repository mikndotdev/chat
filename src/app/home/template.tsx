'use client';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { FaDiscord, FaGithub, FaTwitter } from 'react-icons/fa';
import MikanCat from '@/assets/img/mikan-cat.png';
import KawaiiLogo from '@/assets/img/mikan-vtube.svg';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';

export default function PagesLayout({ children }: { children: ReactNode }) {
  const nav = [
    {
      name: 'Documentation',
      href: 'https://docs.mikn.dev/solutions/md-chat',
    },
    {
      name: 'Our Stuff',
      href: 'https://mikn.dev',
    },
    {
      name: 'Legal',
      href: 'https://docs.mikn.dev/legal/',
    },
    {
      name: 'GitHub',
      href: 'https://github.com/mikndotdev/md-chat',
    },
  ];

  const social = [
    {
      name: 'GitHub',
      href: 'https://github.com/mikndotdev',
      color: 'hover:text-github hover:bg-github',
      icon: FaGithub,
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com/kunkunmaamo',
      color: 'hover:text-twitter hover:bg-twitter',
      icon: FaTwitter,
    },
    {
      name: 'Discord',
      href: 'https://discord.gg/FZCN6fjPuG',
      color: 'hover:text-discord hover:bg-discord',
      icon: FaDiscord,
    },
  ];

  const links = [
    {
      name: 'Support',
      children: [
        {
          name: 'Discord',
          href: 'https://discord.gg/FZCN6fjPuG',
        },
        {
          name: 'Contact',
          href: 'https://mikn.dev/contact',
        },
      ],
    },
    {
      name: 'Legal',
      children: [
        {
          name: 'Terms of Service',
          href: 'https://docs.mikn.dev/legal/terms',
        },
        {
          name: 'Privacy Policy',
          href: 'https://docs.mikn.dev/legal/privacy',
        },
        {
          name: '特定商取引法に基づく表記',
          href: 'https://docs.mikn.dev/legal/jp-payments',
        },
      ],
    },
  ];

  const buttons = [
    {
      href: '/chat',
      title: 'Get Started',
    },
  ];

  return (
    <>
      <Header
        brand={{
          showTitle: true,
          name: 'Chat',
          href: '/',
          logo: KawaiiLogo.src,
        }}
        buttons={buttons}
        className="bg-neutral text-base-content"
        color="#6F45E3"
        navigation={nav}
      />
      <div className="mx-auto min-h-screen max-w-7xl px-4 py-24">
        {children}
      </div>
      <Footer
        className="bg-neutral font-thin text-white"
        copyRight={`2020-${new Date().getFullYear()} MikanDev`}
        links={links}
        social={social}
      >
        <div className="flex items-center self-end">
          <div className="tooltip tooltip-warning" data-tip=":3">
            <Image
              alt=":3"
              className="mb-0 ml-2"
              height={100}
              src={MikanCat.src}
              width={200}
            />
          </div>
        </div>
      </Footer>
    </>
  );
}
