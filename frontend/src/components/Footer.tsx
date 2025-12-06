import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-xl tracking-[0.2em] text-slate-800 mb-6">
              easel
            </h3>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs tracking-[0.2em] text-slate-400 mb-6 uppercase">
              Navigation
            </h4>
            <nav className="space-y-4">
              <Link to="/about" className="block text-sm text-slate-500 hover:text-slate-800 transition-colors duration-300">
                About
              </Link>
              <Link to="/vol2" className="block text-sm text-slate-500 hover:text-slate-800 transition-colors duration-300">
                Vol.2
              </Link>
              <Link to="/easel-live" className="block text-sm text-slate-500 hover:text-slate-800 transition-colors duration-300">
                easel Live
              </Link>
              <Link to="/news" className="block text-sm text-slate-500 hover:text-slate-800 transition-colors duration-300">
                News
              </Link>
            </nav>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs tracking-[0.2em] text-slate-400 mb-6 uppercase">
              Links
            </h4>
            <nav className="space-y-4">
              <Link to="/goods" className="block text-sm text-slate-500 hover:text-slate-800 transition-colors duration-300">
                Goods
              </Link>
              <Link to="/community" className="block text-sm text-slate-500 hover:text-slate-800 transition-colors duration-300">
                Community
              </Link>
              <Link to="/contact" className="block text-sm text-slate-500 hover:text-slate-800 transition-colors duration-300">
                Contact
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-20 pt-8 border-t border-slate-200">
          <p className="text-center text-xs text-slate-400 tracking-wider">
            © {new Date().getFullYear()} easel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
