import "../styles/women.css";

function WomenSuperior() {
  const products = [
    {
      id: 1,
      name: "BLUSA MUJER EFFIGIE VINOTINTO",
      img: "/imagenesMujer/1.webp",
    },
    {
      id: 2,
      name: "TOP WOMEN VIBRANTE GREY/CREAM",
      img: "/imagenesMujer/2.webp",
    },
    {
      id: 3,
      name: "BODYSUITS CRUDELE NEGRO",
      img: "/imagenesMujer/3.webp",
    },
    {
      id: 4,
      name: "CROP TOP MUJER ARMONIOSO TAUPE",
      img: "/imagenesMujer/4.webp",
    },
    {
      id: 5,
      name: "TANK TOP WOMEN ABBAGLIANTE CREAM/TAUPE",
      img: "/imagenesMujer/5.webp",
    },
    {
      id: 6,
      name: "BLUSA DIVINEZZA NUDE",
      img: "/imagenesMujer/6.webp",
    },
  ];

  return (
    <div className="women-container">
      <h2 className="women-title">SUPERIOR</h2>

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

export default WomenSuperior;
