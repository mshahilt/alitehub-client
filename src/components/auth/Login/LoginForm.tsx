const LoginForm = () => {
  return (
    <div className="bg-primary text-gray-100 flex justify-center min-h-screen">
      <div className="max-w-screen-lg m-0 sm:m-10 bg-secondary shadow sm:rounded-lg flex justify-center flex-1">
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
          <div>
            <img 
              src="/images/logo.png" 
              className="w-32 mx-auto" 
              alt="Logo" 
            />
          </div>
          <div className="mt-12  flex flex-col items-center">
            <h1 className="text-2xl xl:text-3xl font-bold">Login</h1>
            <div className="w-full flex-1 mt-8">
                <div className="flex flex-col items-center">
                <button className="w-full max-w-xs font-bold shadow-sm rounded-lg py-1.5 bg-black text-gray-300 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline">
                  <div className="bg-black p-2 rounded-full">
                  <img className="w-6 h-6" src="/images/google-icon.svg" alt="google" />
                  </div>
                  <span className="ml-4">Login with Google</span>
                </button>
              </div>
                <div className="my-12 border-b border-gray-600 text-center">
                  <div className="leading-none px-2 inline-block text-sm text-gray-400 tracking-wide font-medium bg-secondary transform translate-y-1/2">
                  Or Login with e-mail
                  </div>
                </div>
                <div className="mx-auto max-w-xs">
                <input className="w-full px-8 py-4 rounded-lg font-medium bg-gray-800 border border-gray-700 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-500 focus:bg-gray-900 text-gray-100" type="email" placeholder="Email" />
                <input className="w-full px-8 py-4 rounded-lg font-medium bg-gray-800 border border-gray-700 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-500 focus:bg-gray-900 text-gray-100 mt-5" type="password" placeholder="Password" />
                <button className="mt-5 tracking-wide font-semibold bg-indigo-900 text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-900 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none">
                  <span className="ml-3">Sign Up</span>
                </button>
                <p className="mt-6 text-xs text-gray-400 text-center">
                  Don't have an account? <a href="/register" className="border-b border-gray-500 border-dotted">Register Now</a>

                </p>
                <p className="mt-6 text-xs text-gray-400 text-center">
                  I agree with the project's Policy
                  <a href="#" className="border-b border-gray-500 border-dotted"> Terms of Service </a>
                  and its
                  <a href="#" className="border-b border-gray-500 border-dotted"> Privacy Policy </a>
                </p>
                </div>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-secondary text-center hidden lg:flex">
          <div className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat" style={{backgroundImage: "url('/images/login_illustration.png')"}}>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
