import React from 'react';
import Loader from './Loader';

const NotFound404 = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 dark:bg-gray-900">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center dark:bg-gray-900">
        <div className='flex flex-row item-center justicy-center pl-12'>
          <div className=" pl-5 text-gray-800 text-9xl mb-4 dark:text-white">4</div>
         <div className="my-6 flex justify-center">
          <Loader size={10} />
        </div>
         <div className="text-gray-800 text-9xl mb-4 dark:text-white">4</div>
        
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3 dark:text-gray-200 pt-2">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-6 dark:text-gray-400 pt-10">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
     
       
        
        <div className="space-y-3">
          <a
            href="/"
            className="block w-full bg-gradient-to-r from-[#01A49E] to-[#01857F] text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Go to Homepage
          </a>
          <a
            href="/admin/login"
            className="block w-full  bg-gray-200 border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 transition-all dark:border-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-800"
          >
            Go to Admin Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound404;