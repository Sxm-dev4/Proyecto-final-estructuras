import "../styles/women.css";

function WomenInferior() {
  const products = [
    {
      id: 1,
      name: "SHORT MUJER AMBROSIA",
      img: "/imagenesMujer/7.webp",
    },
    {
      id: 2,
      name: "SHORT MUJER AMBROSIA",
      img: "/imagenesMujer/8.webp",
    },
    {
      id: 3,
      name: "FALDA KARMICO NEGRO",
      img: "/imagenesMujer/9.webp",
    },
    {
      id: 4,
      name: "SKIRTS INQUIETUDINE GRIS",
      img: "/imagenesMujer/10.webp",
    },
    {
      id: 5,
      name: "PANTALÓN MUJER RADIOSO NEGRO",
      img: "/imagenesMujer/11.webp",
    },
    {
      id: 6,
      name: "PANTALON PARALELO NUDE",
      img: "/imagenesMujer/12.webp",
    },
  ];

  return (
    <div className="women-container">
      <h2 className="women-title">INFERIOR</h2>

      <div className="women-grid">
        {products.map((p) => (
          <div key={p.id} className="women-item">
            <img src={p.img} alt={p.name} className="women-img" />
            <p className="women-name">{p.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WomenInferior;
