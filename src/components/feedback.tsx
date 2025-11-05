export default function Feedback({ socialLinks }: { socialLinks?: any[] }) {
  if (!socialLinks || socialLinks.length === 0) return null;
  
  return (
    <div className="feedback">
      {/* Feedback content */}
    </div>
  );
}

