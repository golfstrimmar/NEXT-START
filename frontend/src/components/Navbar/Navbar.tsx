"use client";
import { useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Fragment, useState } from "react";
import ModalMessage from "@/components/ModalMessage/ModalMessage";
import getCategories from "@/components/Navbar/GetCategories";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/providers/CartContext";
import { useRouter, useParams, usePathname } from "next/navigation";

// const navigation = {
//   categories: [
//     {
//       id: "women",
//       name: "Women",
//       featured: [
//         {
//           name: "New Arrivals",
//           href: "#",
//           imageSrc:
//             "https://tailwindcss.com/plus-assets/img/ecommerce-images/mega-menu-category-01.jpg",
//           imageAlt:
//             "Models sitting back to back, wearing Basic Tee in black and bone.",
//         },
//         {
//           name: "Basic Tees",
//           href: "#",
//           imageSrc:
//             "https://tailwindcss.com/plus-assets/img/ecommerce-images/mega-menu-category-02.jpg",
//           imageAlt:
//             "Close up of Basic Tee fall bundle with off-white, ochre, olive, and black tees.",
//         },
//       ],
//       sections: [
//         {
//           id: "clothing",
//           name: "Clothing",
//           items: [
//             { name: "Tops", href: "#" },
//             { name: "Dresses", href: "#" },
//             { name: "Pants", href: "#" },
//             { name: "Denim", href: "#" },
//             { name: "Sweaters", href: "#" },
//             { name: "T-Shirts", href: "#" },
//             { name: "Jackets", href: "#" },
//             { name: "Activewear", href: "#" },
//             { name: "Browse All", href: "#" },
//           ],
//         },
//         {
//           id: "accessories",
//           name: "Accessories",
//           items: [
//             { name: "Watches", href: "#" },
//             { name: "Wallets", href: "#" },
//             { name: "Bags", href: "#" },
//             { name: "Sunglasses", href: "#" },
//             { name: "Hats", href: "#" },
//             { name: "Belts", href: "#" },
//           ],
//         },
//         {
//           id: "brands",
//           name: "Brands",
//           items: [
//             { name: "Full Nelson", href: "#" },
//             { name: "My Way", href: "#" },
//             { name: "Re-Arranged", href: "#" },
//             { name: "Counterfeit", href: "#" },
//             { name: "Significant Other", href: "#" },
//           ],
//         },
//       ],
//     },
//     {
//       id: "men",
//       name: "Men",
//       featured: [
//         {
//           name: "New Arrivals",
//           href: "#",
//           imageSrc:
//             "https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-04-detail-product-shot-01.jpg",
//           imageAlt:
//             "Drawstring top with elastic loop closure and textured interior padding.",
//         },
//         {
//           name: "Artwork Tees",
//           href: "#",
//           imageSrc:
//             "https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-02-image-card-06.jpg",
//           imageAlt:
//             "Three shirts in gray, white, and blue arranged on table with same line drawing of hands and shapes overlapping on front of shirt.",
//         },
//       ],
//       sections: [
//         {
//           id: "clothing",
//           name: "Clothing",
//           items: [
//             { name: "Tops", href: "#" },
//             { name: "Pants", href: "#" },
//             { name: "Sweaters", href: "#" },
//             { name: "T-Shirts", href: "#" },
//             { name: "Jackets", href: "#" },
//             { name: "Activewear", href: "#" },
//             { name: "Browse All", href: "#" },
//           ],
//         },
//         {
//           id: "accessories",
//           name: "Accessories",
//           items: [
//             { name: "Watches", href: "#" },
//             { name: "Wallets", href: "#" },
//             { name: "Bags", href: "#" },
//             { name: "Sunglasses", href: "#" },
//             { name: "Hats", href: "#" },
//             { name: "Belts", href: "#" },
//           ],
//         },
//         {
//           id: "brands",
//           name: "Brands",
//           items: [
//             { name: "Re-Arranged", href: "#" },
//             { name: "Counterfeit", href: "#" },
//             { name: "Full Nelson", href: "#" },
//             { name: "My Way", href: "#" },
//           ],
//         },
//       ],
//     },
//   ],
//
// };
const pages = [
  { name: "Shop", href: "/products" },
  { name: "Company", href: "#" },
  { name: "Stores", href: "#" },
  { name: "Admin", href: "/admin" },
];
export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const { cart } = useCart();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [activeLink, setactiveLink] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  useEffect(() => {
    if (pathname) {
      setactiveLink(pathname);
    }
  }, [pathname]);

  const handleCartClick = () => {
    if (status === "authenticated") {
      router.push("/cart");
    } else {
      setError("User not authenticated");
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        setError("");
      }, 1500);
    }
  };

  // ---------------------------
  const memoizedCategories = useMemo(() => categories, [categories]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/categories`
        );
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        console.log("Data from API:", data);
        setCategories(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    };
    fetchData();
  }, []);

  // ---------------------------
  // ---------------------------

  // ---------------------------

  return (
    <div>
      {error && <ModalMessage message={error} open={showModal} />}
      {/* Mobile menu */}
      <Dialog open={open} onClose={setOpen} className="relative z-40 lg:hidden">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0"
        />

        <div className="fixed inset-0 z-40 flex">
          <DialogPanel
            transition
            className="relative flex w-full max-w-xs transform flex-col overflow-y-auto bg-white pb-12 shadow-xl transition duration-300 ease-in-out data-closed:-translate-x-full"
          >
            <div className="flex px-4 pt-5 pb-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
              >
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>

            {/* Links */}
            <TabGroup className="mt-2">
              <div className="border-b border-gray-200">
                <TabList className="-mb-px flex space-x-8 px-4">
                  {/* {categories.map((category) => (
                    <Tab
                      key={category.name}
                      className="flex-1 border-b-2 border-transparent px-1 py-4 text-base font-medium whitespace-nowrap text-gray-900 data-selected:border-indigo-600 data-selected:text-indigo-600"
                    >
                      {category.name}
                    </Tab>
                  ))} */}
                </TabList>
              </div>
              <TabPanels as={Fragment}>
                {/* {categories.map((category) => (
                  <TabPanel
                    key={category.name}
                    className="space-y-10 px-4 pt-10 pb-8"
                  >
                    <div className="grid grid-cols-2 gap-x-4">
                      {category.featured.map((item) => (
                        <div key={item.name} className="group relative text-sm">
                          <img
                            alt={item.imageAlt}
                            src={item.imageSrc}
                            className="aspect-square w-full rounded-lg bg-gray-100 object-cover group-hover:opacity-75"
                          />
                          <a
                            href={item.href}
                            className="mt-6 block font-medium text-gray-900"
                          >
                            <span
                              aria-hidden="true"
                              className="absolute inset-0 z-10"
                            />
                            {item.name}
                          </a>
                          <p aria-hidden="true" className="mt-1">
                            Shop now
                          </p>
                        </div>
                      ))} 
                    </div>
                    {category.sections.map((section) => (
                      <div key={section.name}>
                        <p
                          id={`${category.id}-${section.id}-heading-mobile`}
                          className="font-medium text-gray-900"
                        >
                          {section.name}
                        </p>
                        <ul
                          role="list"
                          aria-labelledby={`${category.id}-${section.id}-heading-mobile`}
                          className="mt-6 flex flex-col space-y-6"
                        >
                          {section.items.map((item) => (
                            <li key={item.name} className="flow-root">
                              <a
                                href={item.href}
                                className="-m-2 block p-2 text-gray-500"
                              >
                                {item.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))} 
                  </TabPanel>
                ))} */}
              </TabPanels>
            </TabGroup>

            <div className="space-y-6 border-t border-gray-200 px-4 py-6">
              {pages.map((page) => (
                <div key={page.name} className="flow-root">
                  <a
                    href={page.href}
                    className="-m-2 block p-2 font-medium text-gray-900"
                  >
                    {page.name}
                  </a>
                </div>
              ))}
            </div>
            {/* Мобильное меню */}
            {/* <div className="space-y-6 border-t border-gray-200 px-4 py-6">
              {session ? (
                <div className="flow-root">
                  {session.user?.image && (
                    <img
                      className="rounded-full mr-2 w-10 h-10"
                      src={session.user?.image}
                      alt={session.user?.name || "User avatar"}
                    />
                  )}
                  <span className="-m-2 block p-2 text-gray-900">
                    Hallo, {session.user?.name}
                  </span>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="-m-2 block p-2 font-medium text-gray-900 hover:text-gray-700"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <>
                  <div className="flow-root">
                    <Link
                      href="/auth/signin"
                      className="-m-2 block p-2 font-medium text-gray-900"
                    >
                      Sign in
                    </Link>
                  </div>
                  <div className="flow-root">
                    <Link
                      href="/auth/signup"
                      className="-m-2 block p-2 font-medium text-gray-900"
                    >
                      Create account
                    </Link>
                  </div>
                </>
              )}
            </div> */}

            <div className="border-t border-gray-200 px-4 py-6">
              <a href="#" className="-m-2 flex items-center p-2">
                <img
                  alt=""
                  src="https://tailwindcss.com/plus-assets/img/flags/flag-canada.svg"
                  className="block h-auto w-5 shrink-0"
                />
                <span className="ml-3 block text-base font-medium text-gray-900">
                  CAD
                </span>
                <span className="sr-only">, change currency</span>
              </a>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
      {/* ==============================header===== */}
      {/* ==============================header===== */}
      {/* ==============================header===== */}
      {/* ==============================header===== */}
      {/* ==============================header===== */}
      <header className="relative bg-white z-[100]">
        <p className="flex h-10 items-center justify-center bg-indigo-600 px-4 text-sm font-medium text-white sm:px-6 lg:px-8">
          Get free delivery on orders over $100
        </p>
        <nav aria-label="Top" className="mx-auto max-w-[1600px]  px-4">
          <div className="border-b border-gray-200">
            <div className="flex h-16 items-center">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="relative rounded-md bg-white p-2   lg:hidden cursor-pointer transition-all duration-300 ease-in-out"
              >
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open menu</span>
                <Bars3Icon
                  aria-hidden="true"
                  className="size-6 text-gray-400 hover:text-gray-900"
                />
              </button>

              {/* Logo */}
              <div className="ml-4 flex lg:ml-0">
                <Link href={`/`} onClick={() => setOpen(false)}>
                  <Image
                    src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                    width={40}
                    height={40}
                    alt="tailwindcss"
                  />
                </Link>
              </div>

              {/* Flyout menus */}
              <PopoverGroup className="hidden lg:ml-8 lg:block lg:self-stretch ">
                <div className="flex h-full space-x-8">
                  {memoizedCategories &&
                    memoizedCategories.map((category) => {
                      const categorySlug = category.category;
                      const subCategories = category.subcategories;
                      // .toLowerCase();
                      // .replace(/\s+/g, "-") // Заменяем пробелы на дефисы
                      // .replace(/[^\w-]+/g, ""); // Удаляем спецсимволы
                      // console.log("<====category====>", category);
                      // console.log(
                      //   "<====subCategories memo====>",
                      //   subCategories
                      // );
                      // console.log(
                      //   "<====subCategories memo typeof====>",
                      //   subCategories.map((foo) => typeof foo)
                      // );
                      return (
                        <div key={category.category}>
                          <Link
                            href={`/shop/${categorySlug}`}
                            className={`flex items-center text-sm border-bottom text-gray-700 hover:text-indigo-500 transition duration-300 ease-in-out ${
                              activeLink.startsWith(`/shop/${categorySlug}`)
                                ? "border-b-2 border-indigo-600 text-indigo-600"
                                : "text-gray-700 font-medium"
                            }`}
                          >
                            {category.category}
                          </Link>
                          {subCategories &&
                            subCategories.map((foo) => (
                              <Link
                                key={foo}
                                href={`/shop/${categorySlug}/${foo}`}
                                className={`flex items-center text-sm border-bottom text-gray-700 hover:text-indigo-500 transition duration-300 ease-in-out ${
                                  activeLink.startsWith(`/shop/${categorySlug}`)
                                    ? "border-b-2 border-indigo-600 text-indigo-600"
                                    : "text-gray-700 font-medium"
                                }`}
                              >
                                {foo}
                              </Link>
                            ))}
                        </div>
                      );
                    })}
                  {pages.map((page: { name: string; href: string }) => (
                    <Link
                      key={page.name}
                      href={page.href}
                      className={`flex items-center text-sm  border-bottom border-indigo-600 text-gray-700 hover:text-indigo-500 transition duration-300 ease-in-out ${
                        activeLink.startsWith(page.href)
                          ? " border-b-2 border-indigo-600 text-indigo-600"
                          : "text-gray-700 font-medium"
                      }`}
                    >
                      {page.name}
                    </Link>
                  ))}
                </div>
              </PopoverGroup>

              <div className="ml-auto flex items-center h-[100%]">
                <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6 h-[100%]">
                  {/* Десктопное меню */}
                  {session ? (
                    <>
                      {session.user?.image && (
                        <Link href="/profile">
                          <img
                            className="rounded-full mr-2 w-10 h-10 cursor-pointer "
                            src={session.user?.image}
                            alt={session.user?.name || "User avatar"}
                          />
                        </Link>
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        Hallo, {session.user?.name}
                      </span>
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="text-sm font-medium text-gray-700 hover:text-indigo-500 cursor-pointer"
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/signin"
                        className={`flex items-center text-sm h-[100%]  text-gray-700 hover:text-indigo-500 transition duration-300 ease-in-out 
                            ${
                              "/auth/signin" === activeLink
                                ? " border-b-2 border-indigo-600 text-indigo-600"
                                : "text-gray-700 font-medium"
                            }`}
                      >
                        Sign in
                      </Link>
                      <span
                        aria-hidden="true"
                        className="h-6 w-px bg-gray-200"
                      />
                      <Link
                        href="/auth/signup"
                        className={`flex items-center text-sm h-[100%] text-gray-700 hover:text-indigo-500 transition duration-300 ease-in-out 
                            ${
                              "/auth/signup" === activeLink
                                ? " border-b-2 border-indigo-600 text-indigo-600"
                                : "text-gray-700 font-medium"
                            }`}
                      >
                        Create account
                      </Link>
                    </>
                  )}
                </div>

                <div className="hidden lg:ml-8 lg:flex">
                  <a
                    href="#"
                    className="flex items-center text-gray-700 hover:text-indigo-500"
                  >
                    <img
                      alt=""
                      src="https://tailwindcss.com/plus-assets/img/flags/flag-canada.svg"
                      className="block h-auto w-5 shrink-0"
                    />
                    <span className="ml-3 block text-sm font-medium">CAD</span>
                    <span className="sr-only">, change currency</span>
                  </a>
                </div>

                {/* Search */}
                <div className="flex lg:ml-6">
                  <a href="#" className="p-2 text-gray-400 hover:text-gray-500">
                    <span className="sr-only">Search</span>
                    <MagnifyingGlassIcon
                      aria-hidden="true"
                      className="size-6"
                    />
                  </a>
                </div>

                {/* Cart */}
                <div className="ml-4 flow-root lg:ml-6">
                  <div
                    onClick={handleCartClick}
                    className={`group -m-2 flex items-center p-2 cursor-pointer relative ${
                      "/cart" === activeLink
                        ? "text-indigo-800 font-bold text-lg"
                        : "text-gray-700 font-medium"
                    }`}
                  >
                    <ShoppingBagIcon
                      aria-hidden="true"
                      className={`size-6 shrink-0 text-gray-400 group-hover:text-gray-500 ${
                        "/cart" === activeLink
                          ? "text-indigo-900 "
                          : "text-gray-400"
                      }`}
                    />
                    <p className="ml-2 text-[12px] font-light  text-gray-100 group-hover:text-gray-300 absolute right-0 top-2 bg-[#e11d48] rounded-full  w-4.5 h-4.5 flex justify-center items-center cursor-pointer transition-all duration-300 ease-in-out">
                      <span>{totalItems}</span>
                    </p>
                    <span className="sr-only">items in cart, view bag</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}
