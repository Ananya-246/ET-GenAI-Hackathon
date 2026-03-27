import { useState } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import MyETPage from "./pages/MyETPage";
import NavigatorPage from "./pages/NavigatorPage";
import VideoStudioPage from "./pages/VideoStudioPage";
import VernacularPage from "./pages/VernacularPage";
import "./App.css";

export default function App() {
  const [activePage, setActivePage] = useState("home");

  const renderPage = () => {
    switch (activePage) {
      case "my-et": return <MyETPage />;
      case "navigator": return <NavigatorPage />;
      case "video": return <VideoStudioPage />;
      case "vernacular": return <VernacularPage />;
      default: return <HomePage setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="app">
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      <main>{renderPage()}</main>
    </div>
  );
}