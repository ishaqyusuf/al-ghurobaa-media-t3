export default function Layout({ children }) {
  return (
    <div className="mx-auto flex flex-col overflow-auto lg:h-[60vh] lg:max-w-md lg:rounded-lg lg:border lg:shadow-sm">
      {children}
    </div>
  );
}
