export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-lg px-4 py-6 animate-pulse">
      <div className="h-40 bg-muted rounded-xl mb-4" />
      <div className="h-4 w-20 bg-muted rounded mb-2" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  );
}
