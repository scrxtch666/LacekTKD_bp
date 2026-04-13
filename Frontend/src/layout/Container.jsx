function Container({ children }) {
  return (
    <div className="max-w-screen-xl mx-auto overflow-hidden px-5 flex flex-col gap-5 min-h-dvh">
      {children}
    </div>
  );
}

export default Container;