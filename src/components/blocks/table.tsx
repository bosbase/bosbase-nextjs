export default function TableBlock({ 
  data, 
  columns, 
  title, 
  description, 
  tip, 
  toolbar, 
  empty_message 
}: { 
  data?: any[]; 
  columns?: any[]; 
  title?: string;
  description?: string;
  tip?: any;
  toolbar?: any;
  empty_message?: string;
}) {
  return (
    <div className="table-block">
      {title && <h2>{title}</h2>}
      {description && <p>{description}</p>}
      {/* Table content */}
      {(!data || data.length === 0) && empty_message && (
        <div>{empty_message}</div>
      )}
    </div>
  );
}

