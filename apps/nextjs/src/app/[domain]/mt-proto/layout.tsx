export default function Layout({ children }) {
  return (
    <div className="mx-auto flex flex-col gap-4 lg:h-[80vh] lg:min-w-max lg:max-w-sm lg:rounded-lg lg:border lg:shadow-sm">
      <div id="appHeader"></div>
      {children}
    </div>
  );
}
