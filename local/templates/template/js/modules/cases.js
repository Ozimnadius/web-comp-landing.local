import { Fancybox } from "@fancyapps/ui";

// Карточка кейса открывает полный скриншот сайта. Скриншот лежит в разметке
// скрытым блоком .case-lightbox, Fancybox берёт его по id из data-case.
export function cases(selector = "[data-case]") {
  document.querySelectorAll(selector).forEach((card) => {
    card.addEventListener("click", (event) => {
      // Ссылки внутри карточки — тип проекта и теги — ведут на свои страницы
      if (event.target.closest("a")) return;

      Fancybox.show([{ src: card.dataset.case, type: "inline" }], {
        mainClass: "case-modal",
        triggerEl: card.querySelector("button") || card,
        closeButton: false,
        dragToClose: false,
        Carousel: { Toolbar: false },
      });
    });
  });
}
