import { Link } from "react-router-dom";

export default function Home() {
  const gridItems = [
    {
      id: 1,
      title: "Consultation Notice",
      subtitle: "Layout & Notice",
      gifUrl: "/gifs/consultation-notice.gif",
    },
    {
      id: 2,
      title: "Espacio Ideal",
      subtitle: "Typography",
      gifUrl: "/gifs/espacio-ideal.gif",
    },
    {
      id: 3,
      title: "Wine Bottles",
      subtitle: "Package Design",
      gifUrl: "/gifs/wine-bottles.gif",
    },
    {
      id: 4,
      title: "Burlington Co.",
      subtitle: "Package Design",
      gifUrl: "/gifs/beer-bottles.gif",
    },
    {
      id: 5,
      title: "Autonomous Standing Desk",
      subtitle: "Illustration & Product",
      gifUrl: "/gifs/standing-desk.gif",
    },
    {
      id: 6,
      title: "POSS Magazine",
      subtitle: "Layout & Print",
      gifUrl: "/gifs/poss-magazine.gif",
    },
    {
      id: 7,
      title: "Run, Ride or Walk",
      subtitle: "Logo & Apparel",
      gifUrl: "/gifs/running-shirt.gif",
    },
    {
      id: 8,
      title: "Green Standards Toolkit",
      subtitle: "Book Design",
      gifUrl: "/gifs/green-standards-toolkit.gif",
    },
    {
      id: 9,
      title: "Tote Bag",
      subtitle: "Illustration & Product",
      gifUrl: "/gifs/tote-bag.gif",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-10 px-4">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {gridItems.map((item) => (
            <Link
              key={item.id}
              to={`/projects/${item.id}`}
              className="group relative aspect-square overflow-hidden rounded-xl cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-2xl"
            >
              {/* Animated GIF Background */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{
                  backgroundImage: `url(${item.gifUrl})`,
                }}
              />

              {/* Overlay */}
              <div className="absolute inset-0 group-hover:bg-black/40 transition-all duration-500" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-6 transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
                <h3 className="text-2xl font-black mb-2 text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700 delay-100">
                  {item.title}
                </h3>
                <p className="text-md text-center opacity-90 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700 delay-200">
                  {item.subtitle}
                </p>
              </div>

              {/* Subtle border animation */}
              <div className="absolute inset-0 border-transparent group-hover:border-white/30 rounded-xl transition-all duration-500" />
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
