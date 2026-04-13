import { Link } from "react-router-dom";
import { useState } from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");

function LogInButton({ onLogin }) {
  const handleLogin = async () => {
    if (onLogin) {
      onLogin();
    }
    window.dispatchEvent(new Event("authChange"));
  };

  return (
    <>
      <div
        onClick={handleLogin}
        className="md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse"
      >
        <Link to="/login">
          <button
            type="button"
            className="text-customGreen bg-customWhite font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-customWhite flex items-center space-x-1 border border-customGreen"
          >
            <div className="relative inline-flex rounded-full h-5 w-5 bg-customGreen">
              <img
                className="px-0.6 py-0.6"
                src="/assets/Icons/login.png"
                alt="Login"
              />
            </div>
            <span>Přihlášení</span>
          </button>
        </Link>
      </div>
    </>
  );
}

export default LogInButton;
