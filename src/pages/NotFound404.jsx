import Button from "../components/ui/Button"; 
 
 const NotFound404 = ()=>{
    return(


 
 
 <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 dark:bg-gray-800">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center dark:bg-gray-800 dark:shadow-white dark:shadow-sm">
                  <div className="text-gray-800 text-6xl mb-4 dark:text-white">404</div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-3 dark:text-white">
                    Page Not Found
                  </h1>
                  <p className="text-gray-600 mb-6 dark:text-white">
                    The page you're looking for doesn't exist or has been moved.
                  </p>
                  <div className="space-y-3">
                    <a
                      href="/"
                      className="block w-full bg-gradient-to-r from-[#01A49E] to-[#01857F] text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Go to Homepage
                    </a>
                    <Button variant="outline" onClick={() => window.history.back()}
                      className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 transition-all dark:text-white">
                   
                      Go Back
                   
                    </Button>
                  </div>
                </div>
              </div>

                  );
 };
 export default NotFound404