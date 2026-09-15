import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-message">
          Oops! The page you are looking for does not exist.
        </p>
        <Link to="/home" className="not-found-link">
          Go Back to Home
        </Link>
      </div>
    </div>
  );
}
