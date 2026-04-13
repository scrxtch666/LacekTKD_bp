const navigateToGoogleMaps = () => {
  const lat = 49.4278672;
  const lon = 15.2179083;

  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`;

  window.open(url, "_blank");
};

function Navigovat() {
  return (
    <>
      <div className="md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
        <button
          onClick={navigateToGoogleMaps}
          type="button"
          className="text-customGreen bg-customGreen font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-customGreen flex items-center space-x-1 border border-customGreen w-full justify-center"
        >
          <div className="relative inline-flex rounded-full h-5 w-5 bg-customGreen items-center">
            <img
              className="px-0.6 py-0.6 h-4"
              src="/assets/Icons/navigate.png"
              alt="Login"
            />
          </div>
          <span className="text-customWhite">Navigovat</span>
        </button>
      </div>
    </>
  );
}

export default Navigovat;
