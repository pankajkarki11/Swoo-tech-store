import React from 'react';
import Loader from './Loader';
import Button from './ui/Button';
import {ArrowLeft} from 'lucide-react'
import{useNavigate} from "react-router-dom"

const NotFound404 = () => {

  const navigate = useNavigate();
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
 <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back
          </Button>

          
          <Button variant="primary"
          className=" w-full mt-4"
          onClick={() => navigate("/")}
          >
            Go to Homepage
           
          </Button>
         
        </div>
      </div>
    </div>
  );
};

export default NotFound404;