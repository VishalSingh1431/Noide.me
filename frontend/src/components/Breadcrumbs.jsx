import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Breadcrumb Component for SEO and Navigation
 * Automatically generates breadcrumbs based on current route
 */
const Breadcrumbs = ({ customBreadcrumbs }) => {
  const location = useLocation();
  
  // Generate breadcrumbs from pathname if not provided
  const generateBreadcrumbs = () => {
    if (customBreadcrumbs) return customBreadcrumbs;
    
    const pathnames = location.pathname.split('/').filter(x => x);
    const breadcrumbs = [{ name: 'Home', path: '/', url: '/' }];
    
    let currentPath = '';
    pathnames.forEach((name, index) => {
      currentPath += `/${name}`;
      
      // Format name for display
      const displayName = name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbs.push({
        name: displayName,
        path: currentPath,
        url: currentPath
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on home page
  if (location.pathname === '/') return null;

  return (
    <nav 
      aria-label="Breadcrumb" 
      className="bg-gray-50 border-b border-gray-200 py-3"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            return (
              <li key={crumb.path} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                )}
                {isLast ? (
                  <span 
                    className="text-gray-900 font-medium"
                    aria-current="page"
                  >
                    {index === 0 ? (
                      <Home className="w-4 h-4 inline mr-1" />
                    ) : null}
                    {crumb.name}
                  </span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="text-gray-600 hover:text-blue-600 transition-colors flex items-center"
                  >
                    {index === 0 && <Home className="w-4 h-4 mr-1" />}
                    {crumb.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumbs;

