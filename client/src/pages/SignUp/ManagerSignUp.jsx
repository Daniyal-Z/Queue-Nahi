import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ManagerSignUp = () => {
  const [name, setname] = useState("");
  const [email, setemail] = useState("");
  const [pass, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
  
    // Basic validation
    if (pass.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:3001/managers/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, pass }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        setError(data.message || "Sign Up failed");
        return;
      }
  
      // Store manager data and token
      localStorage.setItem("manager", JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role
      }));
      localStorage.setItem("access_token", data.token);
      
      // Redirect to R_Manager dashboard
      navigate("/rmanager/dashboard");
  
    } catch (err) {
      setError("Network error - please try again later");
      console.error("Signup error:", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSignUp}
        className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Manager Sign Up</h2>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setname(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
          required
        />

        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setemail(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={pass}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />

        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
        )}

        <button
          type="submit"
          className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default ManagerSignUp;
