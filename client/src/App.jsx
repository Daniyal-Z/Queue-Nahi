// import React from 'react'
// import { useEffect, useState } from 'react'
// import './index.css';

// const App = () => {
//   const[data, setData] = useState([]);       //consider them to be similar to variables in C++
//   const [showForm, setShowForm] = useState(false); // State to toggle form
//   const [student, setStudent] = useState({ email: '', name: '' , pass: ''}); // State to store form input

//   useEffect(() => {
//     fetch('http://localhost:3001/Students')
//     .then(res => res.json())
//     .then(res => setData(res.recordset));
//   }, [])
//   //console.log(data);

//   // Handle form input changes
//   const handleChange = (s) => {
//     setStudent({ ...student, [s.target.name]: s.target.value });  // the student is the var name; s.target.name = the field(id or name); value being user entered data
//   };

//   const handleSubmit = async (s) => {
//     s.preventDefault(); // Prevents page refresh
  
//     // Send data to backend
//     const response = await fetch("http://localhost:3001/students", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(student), // Convert object to JSON
//     });
  
//     if (response.ok) {
//       alert("Student Added!");
//       setShowForm(false); // Hide the form
//       setStudent({ email: "", name: "" , pass: ""}); // Reset input fields
//       //fetchEmployees(); // Refresh the employee list
//       window.location.reload();
//     } else {
//       alert("Failed to add student");
//     }
//   };

//   return (
//     <div className="container">
//       <h2>Student List</h2>
//       <table className="student-table">
//         <thead>
//           <tr>
//             <th>Email</th>
//             <th>Name</th>
//           </tr>
//         </thead>
//         <tbody>
//           {data.map((d, i) => (
//             <tr key={i}>
//               <td>{d.email}</td>
//               <td>{d.name}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Add Student Button */}
//       <button className="add-student-btn" onClick={() => setShowForm(true)}>
//         Add Student
//       </button>

//       {/* Student Form (Shown when button is clicked) */}
//       {showForm && (
//         <div className="form-container">
//           <h3>Add New Student</h3>
//           <form onSubmit={handleSubmit}>
//             <input
//               type="text"
//               name="email"
//               placeholder="Enter Email: "
//               value={student.email}
//               onChange={handleChange}
//               required
//             />
//             <input
//               type="text"
//               name="name"
//               placeholder="Enter Name: "
//               value={student.name}
//               onChange={handleChange}
//               required
//             />
//             <input
//               type="text"
//               name="pass"
//               placeholder="Enter Password: "
//               value={student.pass}
//               onChange={handleChange}
//               required
//             />
//             <button type="submit" className="submit-btn">Submit</button>
//             <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
//           </form>
//         </div>
//       )}
//     </div>
//   )
// }

// export default App

import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;

