import Link from "next/link";
import Image from "next/image";
import { 
    Facebook, 
    Instagram, 
    Youtube, 
    Linkedin, 
    Send,
    MapPin,
    ArrowUpRight
} from "lucide-react";

interface FooterLink {
    label: string;
    href: string;
    external?: boolean;
}

interface FooterSection {
    title: string;
    links: FooterLink[];
}

const footerSections: FooterSection[] = [
    {
        title: "Product",
        links: [
            { label: "App Features", href: "/features" },
            { label: "Pricing Plans", href: "/pricing" },
            { label: "Help Center", href: "/help" },
        ],
    },
    {
        title: "Company",
        links: [
            { label: "About Aynzo", href: "https://aynzo.com", external: true },
            { label: "Contact Us", href: "/contact" },
            { label: "Privacy Policy", href: "/privacy-policy" },
        ],
    },
];

const socialLinks = [
    {
        name: "Facebook",
        href: "https://www.facebook.com/profile.php?id=61579388700386",
        icon: <Facebook className="h-5 w-5" />,
    },
    {
        name: "Instagram",
        href: "https://www.instagram.com/aynzo.world?igsh=dXhycGs5anVtMnR5",
        icon: <Instagram className="h-5 w-5" />,
    },
    {
        name: "X",
        href: "https://x.com/aynzoworld?t=uRJUZAb4glT07Z9FIGfBZA&s=08",
        icon: (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H1.476l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zM16.69 20.497h2.042L7.326 3.652H5.2l11.49 16.845z" />
            </svg>
        ),
    },
    {
        name: "YouTube",
        href: "https://www.youtube.com/channel/UC7lY7bl4eALJv4oUwXpfGMg",
        icon: <Youtube className="h-5 w-5" />,
    },
    {
        name: "LinkedIn",
        href: "https://www.linkedin.com/company/aynzo/",
        icon: <Linkedin className="h-5 w-5" />,
    },
];

export function Footer() {
    return (
        <footer className="relative bg-[#072433] text-white overflow-hidden">
            {/* Design Accents - Ambient Glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -left-20 -top-20 w-[400px] h-[400px] bg-brand/5 blur-[120px] rounded-full opacity-40"></div>
                <div className="absolute -right-20 -bottom-20 w-[350px] h-[350px] bg-accent/5 blur-[110px] rounded-full opacity-30"></div>
                {/* Horizontal Divider with glow */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            </div>

            <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-20 sm:px-12 lg:px-16">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                    
                    {/* Brand & Mission Column */}
                    <div className="lg:col-span-5 space-y-8">
                        <Link href="/" className="inline-block group transition-transform hover:scale-105 duration-300">
                            <Image
                                src="/aynzo-logo.png"
                                alt="Aynzo Logo"
                                width={140}
                                height={56}
                                className="h-10 w-auto brightness-0 invert"
                            />
                        </Link>
                        <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                            Revolutionizing visitor management and appointment scheduling with a seamless, 
                            secure, and modern digital platform for modern businesses.
                        </p>
                        
                        {/* Social Links with glass effect */}
                        <div className="flex flex-wrap gap-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 transition-all duration-300 hover:bg-brand hover:text-white hover:border-brand hover:-translate-y-1"
                                    aria-label={social.name}
                                >
                                    <span className="sr-only">{social.name}</span>
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Section */}
                    <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
                        {/* Dynamic Sections */}
                        {footerSections.map((section) => (
                            <div key={section.title} className="space-y-6">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-white/50">{section.title}</h3>
                                <ul className="space-y-4">
                                    {section.links.map((link) => (
                                        <li key={link.label}>
                                            <Link
                                                href={link.href}
                                                target={link.external ? "_blank" : undefined}
                                                rel={link.external ? "noopener noreferrer" : undefined}
                                                className="group flex items-center text-gray-300 transition-all duration-200 hover:text-white"
                                            >
                                                <span className="relative">
                                                    {link.label}
                                                    <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-accent transition-all duration-300 group-hover:w-full"></span>
                                                </span>
                                                {link.external && <ArrowUpRight className="ml-1 h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        {/* Address Column */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-white/50">Location</h3>
                            <div className="space-y-4 text-gray-300">
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                                    <address className="not-italic leading-relaxed">
                                        Zirakpur, Mohali,<br />
                                        Punjab - 140603,<br />
                                        India
                                    </address>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-20 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <p className="text-sm text-gray-500 font-medium">
                        © {new Date().getFullYear()} <span className="text-white">Aynzo Inc.</span> All rights reserved.
                    </p>
                    
                    <div className="flex items-center gap-8">
                        <Link href="/privacy-policy" className="text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors">
                            Privacy Policy
                        </Link>
                        <div className="h-4 w-[1px] bg-white/10 hidden sm:block"></div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                            Crafted with <span className="text-accent">♥</span> in India
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
