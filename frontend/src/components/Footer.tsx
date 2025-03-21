import {
  GlobeAltIcon,
  ChatBubbleLeftIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Верхняя часть с колонками */}
        <div className="border-t border-gray-200 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Колонка 1: Категории */}
            <div>
              <h3 className="text-sm font-medium text-gray-900">Categories</h3>
              <ul role="list" className="mt-6 space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Women
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Men
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Browse All
                  </a>
                </li>
              </ul>
            </div>

            {/* Колонка 2: О компании */}
            <div>
              <h3 className="text-sm font-medium text-gray-900">Company</h3>
              <ul role="list" className="mt-6 space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            {/* Колонка 3: Поддержка */}
            <div>
              <h3 className="text-sm font-medium text-gray-900">Support</h3>
              <ul role="list" className="mt-6 space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Returns
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Contact Support
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Нижняя часть с копирайтом и иконками */}
        <div className="border-t border-gray-200 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Копирайт */}
            <p className="text-sm text-gray-700">
              © 2025 My Shop. All rights reserved.
            </p>

            {/* Иконки соцсетей */}
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Twitter</span>
                <GlobeAltIcon aria-hidden="true" className="size-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Instagram</span>
                <ChatBubbleLeftIcon aria-hidden="true" className="size-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Email</span>
                <EnvelopeIcon aria-hidden="true" className="size-6" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
