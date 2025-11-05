export default function Empty({ message }: { message?: string }) {
  return (
    <div className="empty">
      {message || "No content found"}
    </div>
  );
}

