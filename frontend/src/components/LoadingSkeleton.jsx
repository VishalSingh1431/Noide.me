import { motion } from 'framer-motion';

export const BusinessCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      <div className="h-56 bg-gray-200 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>
      <div className="p-6">
        <div className="h-6 bg-gray-200 rounded-lg mb-3 w-3/4">
          <motion.div
            className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-full">
          <motion.div
            className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
              delay: 0.2,
            }}
          />
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-5/6">
          <motion.div
            className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
              delay: 0.4,
            }}
          />
        </div>
        <div className="flex gap-2">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex-1">
            <motion.div
              className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
                delay: 0.6,
              }}
            />
          </div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-24">
            <motion.div
              className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
                delay: 0.8,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const BusinessesGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <BusinessCardSkeleton key={index} />
      ))}
    </div>
  );
};

export const PageSkeleton = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8 w-1/3">
          <motion.div
            className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg">
              <motion.div
                className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: index * 0.1,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const StatsSkeleton = () => {
  return (
    <section className="relative mt-12 z-20 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.15)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 md:p-12 border-2 border-gray-200 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-200 rounded-2xl mb-4">
                  <motion.div
                    className="w-10 h-10 bg-gray-300 rounded-lg"
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                </div>
                <div className="h-16 w-24 bg-gray-200 rounded-lg mx-auto mb-3">
                  <motion.div
                    className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                </div>
                <div className="h-6 w-32 bg-gray-200 rounded-lg mx-auto">
                  <motion.div
                    className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'linear',
                      delay: index * 0.2,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const SearchSkeleton = () => {
  return (
    <div className="max-w-2xl mx-auto mb-6">
      <div className="relative">
        <div className="h-14 bg-gray-200 rounded-2xl">
          <motion.div
            className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>
      </div>
    </div>
  );
};

