import React, { useCallback, useEffect } from "react";
import { type ComponentPropsWithoutRef, forwardRef, useState } from "react";
import { tv } from "tailwind-variants";
import {
	motion,
	useMotionValueEvent,
	useScroll,
	type SVGMotionProps,
} from "motion/react";

import Link from "next/link";
import Image from "next/image";

const Path: React.FC<SVGMotionProps<SVGPathElement>> = (props) => (
	<motion.path
		fill="transparent"
		strokeWidth="2"
		stroke="#FFFFFF"
		strokeLinecap="round"
		{...props}
	/>
);

const useIsWide = () => {
	const [isWide, setIsWide] = useState(false);

	useEffect(() => {
		const mediaQuery = window.matchMedia("(min-width: 780px)");
		const handleMediaChange = (event: MediaQueryListEvent) => {
			setIsWide(event.matches);
		};

		setIsWide(mediaQuery.matches);

		mediaQuery.addEventListener("change", handleMediaChange);

		return () => {
			mediaQuery.removeEventListener("change", handleMediaChange);
		};
	}, []);

	return isWide;
};

interface MenuToggleProps {
	toggle: () => void;
}

const MenuToggle: React.FC<MenuToggleProps> = ({ toggle }) => (
	<button className="p-2 lg:hidden" onClick={toggle}>
		<svg width="20" height="20" viewBox="0 0 23 23">
			<Path
				variants={{
					closed: { d: "M 2 2.5 L 20 2.5" },
					open: { d: "M 3 16.5 L 17 2.5" },
				}}
			/>
			<Path
				d="M 2 9.423 L 20 9.423"
				variants={{
					closed: { opacity: 1 },
					open: { opacity: 0 },
				}}
				transition={{ duration: 0.1 }}
			/>
			<Path
				variants={{
					closed: { d: "M 2 16.346 L 20 16.346" },
					open: { d: "M 3 2.5 L 17 16.346" },
				}}
			/>
		</svg>
	</button>
);

const useToggle = (initialValue: boolean = false): [boolean, () => void] => {
	const [state, setState] = useState(initialValue);
	const toggle = useCallback(() => setState((prev) => !prev), []);
	return [state, toggle];
};

const useLockBodyScroll = (enabled: boolean = true) => {
	useEffect(() => {
		if (!enabled) return;

		const originalStyle = window.getComputedStyle(document.body).overflow;
		document.body.style.overflow = "hidden";

		return () => {
			document.body.style.overflow = originalStyle;
		};
	}, [enabled]);
};

const barVariants = {
	rest: { opacity: 0, y: 5 },
	hover: {
		opacity: 1,
		y: 0,
		transition: {
			delay: 0.1,
			type: "spring",
		},
	},
};

const mobileMenuContainerVariants = {
	open: {
		display: "block",
	},
	closed: {
		display: "none",
		transition: { delay: 0.8 },
	},
};

const mobileMenuItemContainerVariants = {
	open: {
		opacity: 1,
		transition: {
			ease: "easeOut",
			staggerChildren: 0.07,
			delayChildren: 0.2,
		},
	},
	closed: {
		opacity: 0,
		transition: { delay: 0.6, staggerChildren: 0.05, staggerDirection: -1 },
	},
};

const mobileMenuItemVariants = {
	open: {
		y: 0,
		opacity: 1,
		transition: {
			ease: "easeOut",
			y: { stiffness: 1000, velocity: -100 },
		},
	},
	closed: {
		y: 50,
		opacity: 0,
		transition: {
			ease: "easeIn",
			y: { stiffness: 1000 },
		},
	},
};

const mobileMenuButtonsVariants = {
	open: {
		opacity: 1,
		transition: { delay: 0.4, duration: 0.4 },
	},
	closed: {
		opacity: 0,
		transition: { delay: 0 },
	},
};

const headerAnimationVariants = {
	show: {
		top: 0,
		transition: { ease: "easeOut", stiffness: 100 },
	},
	hide: {
		top: -88,
	},
};

interface MobileMenuItemProps {
	name: string;
	href: string;
	index: number;
	isCurrent: boolean;
	color?: string;
}

const MobileMenuItem: React.FC<MobileMenuItemProps> = ({
	name,
	href,
	color,
	isCurrent,
}) => {
	return (
		<motion.li className="font-semibold" variants={mobileMenuItemVariants}>
			<a
				className="inline-flex w-full items-center py-4 leading-6 text-on-background"
				href={href}
			>
				<span className="pr-2">{name}</span>
				{isCurrent && (
					<svg width="8" height="8">
						<title>Current page</title>
						<circle cx="4" cy="4" r="4" fill={color} />
					</svg>
				)}
			</a>
		</motion.li>
	);
};

export interface HeaderButtonProps {
	href: string;
	target?: "_blank" | "_self" | "_parent" | "_top";
	title: string;
}

export interface HeaderProps extends ComponentPropsWithoutRef<"div"> {
	/**
	 * Header branding
	 */
	brand?: {
		/**
		 * Name
		 */
		name: string;
		/**
		 * URL to the brand's homepage
		 */
		href: string;
		/**
		 * Logo URL
		 */
		logo: string;
		/**
		 * Whether to show the brand name in the header
		 *
		 * @default false
		 */
		showTitle?: boolean;
		/**
		 * Whether to round the logo corners
		 *
		 * @default false
		 */
		rounded?: boolean;
	};
	/**
	 * List of navigation items to display in the header.
	 */
	navigation: { name: string; href: string }[];
	/**
	 * The buttons to display on the right side of the header.
	 */
	buttons?: HeaderButtonProps[];
	/**
	 * The colour that is shown when a Header link is active.
	 */
	color?: string;
	/**
	 * Which link is currently active.
	 */
	current?: string | number;
}

export const Header = forwardRef<HTMLDivElement, HeaderProps>(
	(
		{
			navigation,
			brand = {
				logo: "",
				href: "/",
				name: "ACME",
			},
			current,
			color,
			buttons,
		}: HeaderProps,
		ref,
	) => {
		const [isScrolled, setIsScrolled] = useState(false);
		const [lastYPosition, setLastYPosition] = useState(0);
		const [isHeaderShown, setIsHeaderShown] = useState(true);
		const isWide = useIsWide();

		const { scrollY } = useScroll();
		const [isMobileMenuOpen, toggleMobileMenuOpen] = useToggle(false);

		const headerHeight = 88;

		useLockBodyScroll(isMobileMenuOpen);

		useMotionValueEvent(scrollY, "change", (latest) => {
			setIsScrolled(latest > 10);
			if (!isMobileMenuOpen) {
				setIsHeaderShown(
					latest < headerHeight || latest < lastYPosition,
				);
				setLastYPosition(latest);
			}
		});

		const headerVariants = tv({
			base: "fixed inset-x-0 top-0 z-50 py-2 transition-[padding-top,padding-bottom,box-shadow] ease-in-out lg:py-0",
			variants: {
				isScrolled: {
					true: "border-b border-outline backdrop-blur backdrop-opacity-50",
					false: "bg-transparent lg:py-4",
				},
			},
		});

		return (
			<motion.header
				variants={headerAnimationVariants}
				initial={"show"}
				animate={
					isWide || isMobileMenuOpen || isHeaderShown
						? "show"
						: "hide"
				}
				className={headerVariants({ isScrolled })}
				style={{
					backgroundColor: isScrolled ? `${color}80` : "transparent",
					borderColor: isScrolled ? color : "transparent",
				}}
				ref={ref}
			>
				<motion.nav
					className="mx-auto flex h-12 max-w-6xl items-center justify-between px-6 lg:h-16 lg:px-8"
					initial={false}
					animate={isMobileMenuOpen ? "open" : "closed"}
				>
					{/* Mobile hamburger menu */}
					<MenuToggle toggle={() => toggleMobileMenuOpen()} />

					{/* Site Title */}
					<Link
						href={brand.href}
						className="-m-1.5 flex items-center gap-2 p-1.5"
					>
						<Image
							className="h-10 w-auto transition-transform duration-300 transform hover:scale-110 hover:-rotate-6 active:scale-90"
							src={brand.logo}
							alt={brand.name}
							width={100}
							height={100}
						/>
						{brand.showTitle && (
							<span className="text-2xl font-semibold text-on-background ml-2">
								{brand.name}
							</span>
						)}
					</Link>

					{/* Mobile Menu */}
					<motion.div
						className="absolute inset-x-0 bottom-0 top-16 h-[calc(100svh-4rem)]  lg:hidden"
						variants={mobileMenuContainerVariants}
					>
						<motion.ul
							className="flex h-full w-full flex-col border-t border-outline px-6 py-4"
							style={{ backgroundColor: color }}
							variants={mobileMenuItemContainerVariants}
						>
							{navigation.map((item, index) => {
								const isCurrent =
									(typeof current === "string" &&
										item.href === current) ||
									(typeof current === "number" &&
										index === current);
								return (
									<MobileMenuItem
										key={item.name}
										name={item.name}
										href={item.href}
										index={index}
										color={color}
										isCurrent={isCurrent}
									/>
								);
							})}
							{buttons?.length && (
								<motion.div
									className="mt-auto flex flex-col gap-2"
									variants={mobileMenuButtonsVariants}
								>
									{buttons?.map((buttonProps) => {
										return (
											<button
												key={buttonProps.title}
												{...buttonProps}
												className={"btn btn-neutral"}
											>
												{buttonProps.href ? (
													<Link
														href={buttonProps.href}
														target={
															buttonProps.target ??
															"_self"
														}
													>
														{buttonProps.title}
													</Link>
												) : (
													buttonProps.title
												)}
											</button>
										);
									})}
								</motion.div>
							)}
						</motion.ul>
					</motion.div>

					{/* Desktop navigation */}
					<div className="hidden h-full items-center py-4 lg:flex lg:gap-x-12">
						{navigation.map((item, index) => {
							const isCurrent =
								(typeof current === "string" &&
									item.href === current) ||
								(typeof current === "number" &&
									index === current);
							return (
								<motion.a
									key={item.name}
									href={item.href}
									className="group relative text-sm font-semibold leading-6 text-on-background"
									initial="rest"
									whileHover="hover"
									animate="rest"
								>
									{item.name}
									{isCurrent ? (
										<span className="absolute inset-x-0 -bottom-1.5 flex h-1 w-full items-center justify-center">
											<span
												style={{
													backgroundColor: color,
												}}
												className="h-[3px] w-3 rounded-full"
											/>
										</span>
									) : (
										<motion.span
											className="absolute inset-x-0 -bottom-1.5 hidden h-1 w-full items-center justify-center group-hover:flex"
											variants={barVariants}
										>
											<span
												style={{
													backgroundColor: color,
												}}
												className="h-[3px] w-1.5 rounded-full"
											/>
										</motion.span>
									)}
								</motion.a>
							);
						})}
					</div>

					{/* Desktop buttons */}
					<div className="hidden gap-2 lg:flex lg:justify-end">
						{buttons?.map((buttonProps) => {
							return (
								<button
									key={buttonProps.title}
									{...buttonProps}
									className={"btn btn-secondary"}
								>
									{buttonProps.href ? (
										<Link
											href={buttonProps.href}
											target={
												buttonProps.target ?? "_self"
											}
										>
											{buttonProps.title}
										</Link>
									) : (
										buttonProps.title
									)}
								</button>
							);
						})}
					</div>

					{/* Mobile width adjustments */}
					<div className="h-9 w-9 opacity-0 lg:hidden" />
				</motion.nav>
			</motion.header>
		);
	},
);
Header.displayName = "Header";
