import { Switch, Route } from "wouter";
import Home from "@/pages/Home";
import CityPage from "@/pages/CityPage";
import BrowsePage from "@/pages/BrowsePage";
import ResourcesPage from "@/pages/ResourcesPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import LoadingDemo from "@/pages/LoadingDemo";
import NotFound from "@/pages/not-found";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/city/:cityName" component={CityPage} />
          <Route path="/browse" component={BrowsePage} />
          <Route path="/browse/:stateCode" component={BrowsePage} />
          <Route path="/resources" component={ResourcesPage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/loading-demo" component={LoadingDemo} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router />
  );
}

export default App;
