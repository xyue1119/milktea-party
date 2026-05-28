export default function CatalogLoading() {
  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="h-5 w-20 bg-secondary/40 rounded mb-4" />
      <div className="h-9 bg-secondary/30 rounded-lg mb-4" />
      <div className="flex gap-2 mb-4 flex-wrap">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-8 w-8 rounded-full bg-secondary/30" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-secondary/30 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
