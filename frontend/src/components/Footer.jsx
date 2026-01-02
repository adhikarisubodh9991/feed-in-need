import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="Starvation to Salvation" className="w-10 h-10 object-contain" />
              <span className="text-xl font-bold text-white">Starvation to Salvation</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Connecting food donors with those in need. Together, we can reduce food waste and help our community thrive.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/donations" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">Available Donations</Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">Become a Donor</Link>
              </li>
              <li>
                <Link to="/register/receiver" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">Register as Receiver</Link>
              </li>
            </ul>
          </div>

          {/* For Users */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">For Users</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/login" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">Login</Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">My Profile</Link>
              </li>
              <li>
                <Link to="/my-activity" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">My Activity</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <FiMail className="w-4 h-4 text-primary-500" />
                <span>interactclubofgorkha@gmail.com</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <FiPhone className="w-4 h-4 text-primary-500" />
                <span>+977 9767012721</span>
              </li>
              <li className="flex items-start gap-3 text-gray-400 text-sm">
                <FiMapPin className="w-4 h-4 text-primary-500 mt-0.5" />
                <span>Tulsipur-Dang, Nepal</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm text-center sm:text-left">
              © {new Date().getFullYear()} Starvation to Salvation. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs">Supported by</span>
              <img src="/logo1.png" alt="Interact Club" className="w-8 h-8 object-contain rounded-full" />
              <span className="text-gray-400 text-sm font-medium">Interact Club</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
