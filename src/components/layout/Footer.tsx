import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0f0f1a] mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="text-xl font-black text-[#e91e8c]">
              jasyre
            </Link>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Stories worth getting lost in. Discover romance, drama, fantasy and more.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Company</h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <Link to="/about" className="hover:text-[#e91e8c]">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#e91e8c]">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <Link to="/terms" className="hover:text-[#e91e8c]">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-[#e91e8c]">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <a href="mailto:hello@inkwavestudios.com" className="hover:text-[#e91e8c]">
                  hello@inkwavestudios.com
                </a>
              </li>
              <li>
                <a href="mailto:support@jasyre.com" className="hover:text-[#e91e8c]">
                  support@jasyre.com
                </a>
              </li>
            </ul>
            {/* Add real social URLs when Miss J sends them */}
            <div className="flex gap-3 mt-4 text-sm text-gray-400">
              {/* <a href="https://..." target="_blank" rel="noreferrer">X</a> */}
              {/* <a href="https://..." target="_blank" rel="noreferrer">Instagram</a> */}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-400 dark:text-gray-500">
          © {new Date().getFullYear()} Jasyre. Operated by Inkwave Studios Ltd. All rights reserved.
        </div>
      </div>
    </footer>
  );
      }
