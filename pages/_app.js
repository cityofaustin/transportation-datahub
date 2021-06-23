import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Spinner from "react-bootstrap/Spinner";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/global.scss";

function App({ Component, pageProps }) {
  const router = useRouter();
  const [isRouting, setIsRouting] = useState(false);

  useEffect(() => {
    const handleRouteStart = () => {
      setIsRouting(true);
    };

    const handeRouteComplete = () => {
      setIsRouting(false);
    };
    router.events.on("routeChangeStart", handleRouteStart);

    router.events.on("routeChangeComplete", handeRouteComplete);
    // If the component is unmounted, unsubscribe
    // from the event with the `off` method:
    return () => {
      router.events.off("routeChangeStart", handleRouteStart);
      router.events.off("routeChangeStart", handeRouteComplete);
    };
  }, []);

  if (isRouting)
    return (
      <div style={{ position: "fixed", top: "50%", left: "50%" }}>
        <Spinner className="text-secondary" animation="border" role="status" />
        <span className="ms-2 align-top text-primary"> Loading...</span>
      </div>
    );
  return <Component {...pageProps} />;
}

export default App;
