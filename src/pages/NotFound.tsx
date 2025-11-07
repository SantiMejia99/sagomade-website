import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main style={{
      minHeight: "80vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "2rem"
    }}>
      <h1 style={{ fontSize: "4rem", margin: 0 }}>404</h1>
      <p style={{ fontSize: "1.25rem", marginTop: "0.5rem" }}>
        Oops — we couldn't find that page.
      </p>
      <img
        src={"image404"}
        alt="What do you think of this line?"
        style={{ maxWidth: "400px", width: "100%", marginTop: "1.5rem" }}
      />
      <p>
        <Link to="/" style={{ textDecoration: "underline" }}>Go back home</Link>
      </p>
    </main>
  );
}