import React from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, Mail, Phone, MapPin } from 'lucide-react';
export function Footer() {
  return <footer className="bg-white border-t border-[var(--color-border)] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-[var(--color-primary)] rounded-xl">
                <PawPrint className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-[var(--color-text)]">
                PetMate
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-light)]">
              Connecting loving homes with pets in need across Nepal.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-[var(--color-text)] mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors">
                  Browse Pets
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[var(--color-text)] mb-4">
              Support
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors">
                  Adoption Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[var(--color-text)] mb-4">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-[var(--color-text-light)]">
                <Mail className="w-4 h-4" />
                <span>info@petadopt.np</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-[var(--color-text-light)]">
                <Phone className="w-4 h-4" />
                <span>+977 1-234567</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-[var(--color-text-light)]">
                <MapPin className="w-4 h-4" />
                <span>Kathmandu, Nepal</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--color-border)] mt-8 pt-8 text-center">
          <p className="text-sm text-[var(--color-text-light)]">
            © 2024 PetMate Nepal. All rights reserved. Made with love for pets
            in need.
          </p>
        </div>
      </div>
    </footer>;
}