import { useRoutes } from "react-router-dom";
import WomenAll from "../pages/womenAll";
import WomenSuperior from "../pages/womenSuperior";
import WomenInferior from "../pages/womenInferior";

export default function WomenRoutes() {
  return useRoutes([
    { path: "/", element: <WomenAll /> },
    { path: "/women", element: <WomenAll /> },
    { path: "/women/superior", element: <WomenSuperior /> },
    { path: "/women/inferior", element: <WomenInferior /> },
  ]);
}
