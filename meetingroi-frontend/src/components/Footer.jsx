import React from 'react';
import { Icon } from './Icons';
import { motion } from 'framer-motion';
import { FaTwitter, FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = {
    product: [
      { name: 'Features', href: '/features' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Integrations', href: '/integrations' },
      { name: 'Changelog', href: '/changelog' }
    ],
    resources: [
      { name: 'Documentation', href: '/help' },
      { name: 'API Reference', href: '/api' },
      { name: 'Status', href: '/status' },
      { name: 'Blog', href: '/blog' }
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' },
      { name: 'Privacy', href: '/privacy' }
    ]
  };

  const socialLinks = [
    { icon: FaTwitter, label: 'Twitter', href: '#', color: 'hover:text-sky-400' },
    { icon: FaGithub, label: 'GitHub', href: '#', color: 'hover:text-gray-400' },
    { icon: FaLinkedin, label: 'LinkedIn', href: '#', color: 'hover:text-blue-400' },
    { icon: FaEnvelope, label: 'Email', href: '#', color: 'hover:text-amber-400' }
  ];

  return (
    <footer className="bg-gradient-to-br from-slate-900 to-slate-800 text-white w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                <Icon name="brain" size={20} className="text-white" />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                  MeetingROI
                </span>
                <p className="text-xs text-amber-300/70">making meetings matter</p>
              </div>
            </div>
            
            <p className="text-slate-300 text-sm mb-4 max-w-md">
              Transform your meeting culture with AI-powered insights. 
              Save time, reduce costs, and boost productivity across your organization.
            </p>
            
            <div className="flex items-center gap-3">
              {socialLinks.map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.href}
                  whileHover={{ y: -3, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 group"
                  aria-label={social.label}
                >
                  <social.icon className={`w-4 h-4 text-slate-300 transition ${social.color}`} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="text-slate-300 hover:text-amber-400 text-sm transition-colors duration-200">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="text-slate-300 hover:text-amber-400 text-sm transition-colors duration-200">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="text-slate-300 hover:text-amber-400 text-sm transition-colors duration-200">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-slate-700/50 pt-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-sm font-semibold text-amber-400">Stay updated</h3>
              <p className="text-slate-300 text-sm">Get the latest insights and product updates</p>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-2 bg-white/10 border border-slate-600 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500 text-sm"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl text-white text-sm font-medium hover:shadow-lg transition"
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Made by Diksha */}
        <div className="border-t border-slate-700/50 mt-6 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-center sm:text-left">
              <p className="text-slate-400 text-xs">
                © {currentYear} MeetingROI. All rights reserved.
              </p>
            </div>
            
            {/* Made by Diksha - Featured Section */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 hover:border-amber-500/30 transition-all duration-300">
                <span className="text-amber-400 text-sm">✨</span>
                <span className="text-slate-300 text-xs font-medium">Made with</span>
                <span className="text-rose-400 text-sm">❤️</span>
                <span className="text-slate-300 text-xs font-medium">by</span>
                <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent font-semibold text-sm">
                  Diksha
                </span>
                <span className="text-amber-400 text-sm">✨</span>
              </div>
            </motion.div>

            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-amber-400 text-xs transition">Terms</a>
              <a href="#" className="text-slate-400 hover:text-amber-400 text-xs transition">Privacy</a>
              <a href="#" className="text-slate-400 hover:text-amber-400 text-xs transition">Cookies</a>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Wave */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500"></div>
    </footer>
  );
};

export default Footer;