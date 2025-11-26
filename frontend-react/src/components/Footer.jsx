const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold">Church Record Management System</h3>
            <p className="text-sm text-gray-400">Managing your church records efficiently</p>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-400">
              © {currentYear} Church Records. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Version 1.0.0
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
