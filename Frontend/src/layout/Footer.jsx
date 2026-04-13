import Carousel from "./Carousel";
import { Facebook, Instagram } from "lucide-react";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer class="bg-white dark:bg-customBlack text-black w-full z-20 bottom-0 start-0 border-b border-gray-200 dark:border-gray-600 mt-5">
        <div class="mx-auto w-full max-w-screen-xl p-6 py-6 lg:py-8">
          <h3 class="text-customWhite font-bold opacity-45 flex justify-center ">
            SPONZOŘI
          </h3>
          <div class="md:flex md:justify-between">
            <div class="mb-6 md:mb-0"></div>
            <script src="https://cdn.jsdelivr.net/npm/flowbite@2.3.0/dist/flowbite.min.js"></script>
            <Carousel />
          </div>
          <hr class="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
          <div class="sm:flex sm:items-center sm:justify-between">
            <span class="text-sm text-gray-500 sm:text-center dark:text-gray-400">
              © {currentYear}
              <a
                href="https://github.com/scrxtch666"
                class="hover:underline font-bold px-1"
              >
                scrxtch
              </a>
              all rights reserved.
            </span>
            <div class="flex mt-4 gap-3 sm:justify-center sm:mt-0">
              <a
                href="https://www.facebook.com/profile.php?id=100063625778484"
                target="_blank"
                class="text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                <Facebook size={28} />
              </a>
              <a
                href="https://www.instagram.com/lacek_tkd/"
                target="_blank"
                class="text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                <Instagram size={28} />
              </a>
            </div>
          </div>
        </div>
      </footer>
      <script src="https://cdn.jsdelivr.net/npm/flowbite@2.3.0/dist/flowbite.min.js"></script>
      <script>
        document.getElementById("year").textContent = new Date().getFullYear();
      </script>
    </>
  );
}

export default Footer;
