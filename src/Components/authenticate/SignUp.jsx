import React, { useState } from "react";
import { Link } from "@reach/router";
import { signInWithGoogle } from "../../firebase";
import { auth } from "../../firebase";

const SignUp = () => {
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState(null);
  
  const onChangeHandler = event => {
    const { name, value } = event.currentTarget;
    setDisplayName(value);
  };

  return (
    <div>
      <h1>Sign Up</h1>
      <div>
        {error !== null && (
          <div>
            {error}
          </div>
        )}
        <form className="">
          <label htmlFor="displayName" className="block">
            Display Name:
          </label>
          <input
            type="text"
            name="displayName"
            value={displayName}
            placeholder="My Name"
            id="displayName"
            onChange={event => onChangeHandler(event)}
          />
        </form>
        <button onClick={() => {signInWithGoogle();}}>
          Sign In with Google
        </button>
        <p>
          Already have an account?{" "}
          <Link to="/auth/signIn"> Sign in here </Link>
        </p>
      </div>
    </div>
  );
};
export default SignUp;