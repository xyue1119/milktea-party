export default function DiaryLoading() {
  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 w-24 bg-secondary/40 rounded" />
      </div>
      <div className="h-80 bg-secondary/30 rounded-xl mb-4" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-secondary/30 rounded-xl mb-3" />
      ))}
    </div>
  );
}
