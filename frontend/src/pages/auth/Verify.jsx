import React, { useState, useRef, useEffect } from "react";
import "./auth.css";
import { Link, useNavigate } from "react-router-dom";
import { UserData } from "../../context/UserContext";

const OTP_LENGTH = 6;

const Verify = () => {
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(""));
  const { btnLoading, verifyOtp } = UserData();
  const navigate = useNavigate();
  const inputRefs = useRef([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes = 300 seconds

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleChange = (e, index) => {
    const value = e.target.value;

    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Move to previous input on backspace if current is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    // Arrow keys navigation
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, OTP_LENGTH).split("");
    const newOtp = [...otp];
    digits.forEach((digit, i) => {
      newOtp[i] = digit;
    });
    setOtp(newOtp);

    // Focus the next empty input or the last one
    const nextEmpty = newOtp.findIndex((d) => !d);
    const focusIndex = nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty;
    inputRefs.current[focusIndex]?.focus();
  };

  const otpValue = otp.join("");
  const isComplete = otpValue.length === OTP_LENGTH;

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!isComplete) return;
    await verifyOtp(Number(otpValue), navigate);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="otp-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6d34d1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1>Verify Your Email</h1>
          <p>We've sent a 6-digit verification code to your email address. Enter it below to complete your registration.</p>
        </div>

        {timeLeft > 0 ? (
          <div className="otp-timer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Code expires in <strong>{formatTime(timeLeft)}</strong>
          </div>
        ) : (
          <div className="otp-timer otp-timer-expired">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            Code has expired. Please register again.
          </div>
        )}

        <form onSubmit={submitHandler} className="auth-form">
          <div className="otp-inputs" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`otp-input ${digit ? "otp-input-filled" : ""}`}
                disabled={timeLeft <= 0}
              />
            ))}
          </div>

          <button
            disabled={btnLoading || !isComplete || timeLeft <= 0}
            type="submit"
            className="auth-button"
          >
            {btnLoading ? (
              <span className="btn-loading">
                <span className="spinner"></span>
                Verifying...
              </span>
            ) : (
              "Verify & Continue"
            )}
          </button>

          <p className="auth-footer">
            Didn't receive the code? <Link to="/register">Try again</Link>
          </p>
          <p className="auth-footer">
            Already verified? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Verify;
