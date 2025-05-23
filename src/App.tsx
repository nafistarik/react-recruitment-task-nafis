import { useState, useEffect } from "react";
import ComplaintForm from "./components/ComplaintForm/ComplaintForm";
import Toast from "./components/shared/Toast/Toast";
import ComplaintList from "./components/ComplaintList/ComplaintList";
import ThemeToggle from "./components/shared/ThemeToggle/ThemeToggle";
import ErrorBoundary from "./components/shared/ErrorBoundary/ErrorBoundary";
import "./App.css";
import heroBanner from "./assets/hero-illlustration.svg";
import CustomCursor from "./components/shared/CursorEffect/CustomCursor";

const baseUrl = "https://sugarytestapi.azurewebsites.net/";
const listPath = "TestApi/GetComplains";
const savePath = "TestApi/SaveComplain";

function App() {
  const [complains, setComplains] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchComplains = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${baseUrl}${listPath}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setComplains(data);
      // console.log(data);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Failed to load complaints");
      }
      Toast.show("Failed to load complaints", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (title: string, body: string) => {
    try {
      const response = await fetch(`${baseUrl}${savePath}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Title: title,
          Body: body,
        }),
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      if (!data.Success) {
        throw new Error(data.Message || "Failed to submit complaint");
      }
      Toast.show("Complaint submitted successfully!", "success");
      fetchComplains(); // refreshing after submission
    } catch (error) {
      if (error instanceof Error) {
        // Toast.show(error.message, "error");
        Toast.show("Failed to submit complaint", "error");
      } else {
        Toast.show("Failed to submit complaint", "error");
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchComplains();
    return () => {
      controller.abort(); // Cleanup function to abort
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("cursor-hidden");
    return () => {
      document.documentElement.classList.remove("cursor-hidden");
    };
  }, []);

  return (
    <ErrorBoundary>
      <div className="app">
        <header className="app-header">
          <h1>
            <a href="https://sugary-feedback-control.vercel.app/">
              Feedback Control
            </a>
          </h1>
          <ThemeToggle />
        </header>

        <main className="app-content">
          <section className="form-section">
            <ComplaintForm onSubmit={handleSubmit} />
          </section>
          <section className="image-section">
            <img src={heroBanner} alt="hero banner" />
          </section>
        </main>

        <section className="list-section">
          <ComplaintList
            complaints={complains}
            isLoading={isLoading}
            error={errorMessage}
            onRefresh={fetchComplains}
          />
        </section>

        <div id="toast-container"></div>
        <CustomCursor />
      </div>
    </ErrorBoundary>
  );
}

export default App;
