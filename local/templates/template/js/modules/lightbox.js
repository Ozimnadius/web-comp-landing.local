import { Fancybox } from "@fancyapps/ui";

// Стандартный лайтбокс: ссылка с data-fancybox открывает свой href как картинку
export function lightbox() {
  Fancybox.bind("[data-fancybox]");
}
