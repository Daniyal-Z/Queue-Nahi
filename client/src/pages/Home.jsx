import { Link } from "react-router-dom";
import { FiCoffee, FiBook, FiPrinter, FiCalendar } from "react-icons/fi";

const Home = () => {
  const services = [
    {
      icon: <FiCoffee className="text-3xl text-indigo-600" />,
      title: "Food Services",
      description: "Order from campus restaurants and cafes",
      link: "/login/student",
    },
    {
      icon: <FiPrinter className="text-3xl text-indigo-600" />,
      title: "Print Services",
      description: "Print, copy, and bind your documents",
      link: "/login/student",
    },
    {
      icon: <FiBook className="text-3xl text-indigo-600" />,
      title: "Book Shop",
      description: "Purchase books and stationery",
      link: "/login/student",
    },
    {
      icon: <FiCalendar className="text-3xl text-indigo-600" />,
      title: "Ground Booking",
      description: "Book sports grounds and facilities",
      link: "/login/student",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to <span className="text-indigo-600">Queue Nahi</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Your one-stop platform for all campus services - no more waiting in queues!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {services.map((service, index) => (
          <Link
            key={index}
            to={service.link}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4">{service.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {service.title}
              </h3>
              <p className="text-gray-600">{service.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-gray-600 mb-6">
            Join thousands of students and managers using Queue Nahi to simplify campus life.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/signup/student"
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Sign Up as Student
            </Link>
            <Link
              to="/signup/manager"
              className="px-6 py-3 border border-indigo-600 text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Sign Up as Manager
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;