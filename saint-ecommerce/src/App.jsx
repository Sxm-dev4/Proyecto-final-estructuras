import NavBar from "./women/components/navBar.jsx";
import Footer from "./women/components/footer.jsx";
import WomenRoutes from "./women/routes/womenRoutes.jsx";

function App() {
  return (
    <div className="app">
      <NavBar />
      <main className="app-content">
        <WomenRoutes />
      </main>
      <Footer />
    </div>
  );
}

export default App;
