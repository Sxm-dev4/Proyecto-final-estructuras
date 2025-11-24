import "../styles/women.css";

function WomenAll() {
  const products = [
    { id: 1, name: "BLUSA MUJER EFFIGIE VINOTINTO", img: "/imagenesMujer/1.webp" },
    { id: 2, name: "TOP WOMEN VIBRANTE GREY/CREAM", img: "/imagenesMujer/2.webp" },
    { id: 3, name: "BODYSUITS CRUDELE NEGRO", img: "/imagenesMujer/3.webp" },
    { id: 4, name: "CROP TOP MUJER ARMONIOSO TAUPE", img: "/imagenesMujer/4.webp" },
    { id: 5, name: "TANK TOP WOMEN ABBAGLIANTE CREAM/TAUPE", img: "/imagenesMujer/5.webp" },
    { id: 6, name: "BLUSA DIVINEZZA NUDE", img: "/imagenesMujer/6.webp" },
    { id: 7, name: "SHORT MUJER AMBROSIA", img: "/imagenesMujer/7.webp" },
    { id: 8, name: "SHORT MUJER AMBROSIA", img: "/imagenesMujer/8.webp" },
    { id: 9, name: "FALDA KARMICO NEGRO", img: "/imagenesMujer/9.webp" },
    { id: 10, name: "SKIRTS INQUIETUDINE GRIS", img: "/imagenesMujer/10.webp" },
    { id: 11, name: "PANTALÓN MUJER RADIOSO NEGRO", img: "/imagenesMujer/11.webp" },
    { id: 12, name: "PANTALON PARALELO NUDE", img: "/imagenesMujer/12.webp" },
  ];

  return (
    <div className="women-container">
      <h2 className="women-title">ALL</h2>

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

export default WomenAll;
