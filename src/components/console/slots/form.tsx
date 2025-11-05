export default function ConsoleForm({ fields, onSubmit }: { fields?: any[]; onSubmit?: (data: any) => void }) {
  if (!fields) return null;
  
  return (
    <form className="console-form">
      {/* Console form content */}
    </form>
  );
}

