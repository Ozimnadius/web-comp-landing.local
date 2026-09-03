export function mobileMenu() {
  const menu = document.querySelector("[data-mobile-menu]");
  const burger = document.querySelector("[data-mobile-menu-open]");

  if (!menu || !burger) return;

  const close = menu.querySelector("[data-mobile-menu-close]");
  // Пока меню открыто, страница под ним недоступна ни мыши, ни клавиатуре
  const page = document.querySelector(".wrapper");
  const desktop = window.matchMedia("(min-width: 1200px)");

  function open() {
    menu.hidden = false;
    burger.setAttribute("aria-expanded", "true");
    if (page) page.inert = true;
    close.focus();
  }

  function shut(returnFocus = true) {
    if (menu.hidden) return;

    menu.hidden = true;
    burger.setAttribute("aria-expanded", "false");
    if (page) page.inert = false;
    if (returnFocus) burger.focus();
  }

  burger.addEventListener("click", open);
  close.addEventListener("click", () => shut());

  // Переход по якорю и открытие брифа закрывают меню сами: иначе оно
  // останется висеть над проскролленной страницей или под окном брифа
  menu.addEventListener("click", (event) => {
    if (event.target.closest('a[href^="#"], [data-brief-open]')) shut(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") shut();
  });

  // На планшете панель занимает 375px, остальная страница видна — клик по ней закрывает меню
  document.addEventListener("click", (event) => {
    if (menu.hidden || menu.contains(event.target) || burger.contains(event.target)) return;
    shut(false);
  });

  desktop.addEventListener("change", (event) => {
    if (event.matches) shut(false);
  });
}
