const AccessDenied = () =>{
    return(
<div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 dark:bg-gray-800">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                  <div className="text-red-500 text-6xl mb-4">403</div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-3">
                    Access Denied
                  </h1>
                  <p className="text-gray-600 mb-6">
                    You don't have permission to access this page.
                    {window.location.pathname.includes("/admin") &&
                      " Please login with admin credentials."}
                  </p>
                  <div className="space-y-3">
                    {window.location.pathname.includes("/admin") ? (
                      <a
                        href="/admin/login"
                        className="block w-full bg-gradient-to-r from-[#01A49E] to-[#01857F] text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all"
                      >
                        Go to Admin Login
                      </a>
                    ) : (
                      <button
                        onClick={() => window.history.back()}
                        className="w-full bg-gradient-to-r from-[#01A49E] to-[#01857F] text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all"
                      >
                        Go Back
                      </button>
                    )}
                    <a
                      href="/"
                      className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                    >
                      Go to Homepage
                    </a>
                  </div>
                </div>
              </div>

    );
};
export default AccessDenied;