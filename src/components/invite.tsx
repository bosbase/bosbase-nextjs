export default function Invite({ summary, code }: { summary?: any; code?: string }) {
  if (!summary && !code) return null;
  
  return (
    <div className="invite">
      {/* Invite content */}
    </div>
  );
}

