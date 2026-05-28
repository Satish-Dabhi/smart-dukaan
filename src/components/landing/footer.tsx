"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { ShoppingBag, Mail, MapPin, Heart } from "lucide-react";

export function Footer() {
  const locale = useLocale();

  return (
    <footer className="bg-gray-950 text-gray-400 pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center shadow-md">
                <ShoppingBag className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">SmartDukaan</span>
            </div>
            <p className="text-sm leading-relaxed mb-5 text-gray-400">
              The all-in-one platform for Indian local businesses — POS billing, online storefront,
              GST invoicing, and analytics in one place.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0 text-gray-600" />
                <span>Ahmedabad, Gujarat, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 text-gray-600" />
                <a
                  href="mailto:support@smartdukaan.com"
                  className="hover:text-white transition-colors"
                >
                  support@smartdukaan.com
                </a>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-5 flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> in India
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide">Product</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#features"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <Link
                  href={`/${locale}/demo`}
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-emerald-500 hover:text-emerald-400"
                >
                  Live Demo Store
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/auth/register`}
                  className="hover:text-white transition-colors"
                >
                  Get Started Free
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide">Company</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href={`/${locale}/about`} className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@smartdukaan.com"
                  className="hover:text-white transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <Link href={`/${locale}/auth/login`} className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href={`/${locale}/privacy`} className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/terms`} className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>

            <div className="mt-8">
              <h4 className="text-white font-semibold mb-3 text-sm tracking-wide">
                Supported Languages
              </h4>
              <div className="flex gap-2">
                <span className="bg-gray-800 border border-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">
                  English
                </span>
                <span className="bg-gray-800 border border-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">
                  ગુજરાતી
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© 2026 SmartDukaan. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href={`/${locale}/privacy`} className="hover:text-gray-300 transition-colors">
              Privacy
            </Link>
            <Link href={`/${locale}/terms`} className="hover:text-gray-300 transition-colors">
              Terms
            </Link>
            <span className="text-emerald-500 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
