function Container({ children }) {
  return (
    <div className="max-w-screen-xl mx-auto p-5 overflow-hidden px-5 flex flex-col gap-5">
      {children}
    </div>
  );
}

export default Container;