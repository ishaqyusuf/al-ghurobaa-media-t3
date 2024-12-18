import Header from "./header";

export default async function Layout({ children }) {
  return (
    <div className="">
      <Header />
      {children}
    </div>
  );
}
