import React from 'react';
import './LoginSignUp.css'

const LoginSignUp = () => {
  return (
    <div className="container">
      <div className="header">
        <div className="text">Sign Up</div>
        <div className="underline"></div>
      </div>
      <div className="inputs">
          <div className="input">
                  <div className="text">Sign Up</div>
                  <div className="email"></div>
          </div>
            <div className="input">
              <input type="password" />
            </div>
      </div>
      <div className="forgot-password">Lost Password? <span>Click Here!</span></div>
      <div className="submit-container"></div>
      <div className="submit">Sign Up</div>
      <div className="submit">Login</div>



      </div>
  );
};

export default LoginSignUp