import "../styles/women.css";

const superiorProducts = [
  {
    id: 1,
    name: "BLUSA MUJER EFFIGIE VINOTINTO",
    imageUrl: "/imagenesMujer/1.webp",
  },
  {
    id: 2,
    name: "TOP WOMEN VIBRANTE GREY/CREAM",
    imageUrl: "/imagenesMujer/2.webp",
  },
  {
    id: 3,
    name: "BODYSUITS CRUDELE NEGRO",
    imageUrl: "/imagenesMujer/3.webp",
  },
  {
    id: 4,
    name: "CROP TOP MUJER ARMONIOSO TAUPE",
    imageUrl: "/imagenesMujer/4.webp",
  },
  {
    id: 5,
    name: "TANK TOP WOMEN ABBAGLIANTE CREAM/TAUPE",
    imageUrl: "/imagenesMujer/5.webp",
  },
  {
    id: 6,
    name: "BLUSA DIVINEZZA NUDE",
    imageUrl: "/imagenesMujer/6.webp",
  },
];

function WomenSuperior() {
  return (
    <main className="women-page">
      <h1 className="women-page__title">SUPERIOR</h1>

      <section className="women-grid">
        {superiorProducts.map((product) => (
          <article key={product.id} className="women-card">
            <div className="women-card__image-wrapper">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="women-card__image"
              />
            </div>
            <p className="women-card__name">{product.name}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

export default WomenSuperior;

