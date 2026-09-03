import { Fancybox } from "@fancyapps/ui";
import JustValidate from "just-validate";
import IMask from "imask";
import { PHONE_MASK, PHONE_RE } from "./phone";

const REQUIRED = "Обязательно к заполнению";

export function brief(selector = "[data-brief]") {
  const root = document.querySelector(selector);

  if (!root) return;

  const form = root.querySelector("[data-brief-form]");
  const body = root.querySelector("[data-brief-body]");
  const panels = [...root.querySelectorAll("[data-brief-panel]")];
  const steps = [...root.querySelectorAll("[data-brief-step]")];
  const prev = root.querySelector("[data-brief-prev]");
  const next = root.querySelector("[data-brief-next]");
  const submit = root.querySelector("[data-brief-submit]");
  const footer = root.querySelector("[data-brief-footer]");
  const done = root.querySelector("[data-brief-done]");
  const doneName = root.querySelector("[data-brief-name]");
  const phone = form.querySelector('input[type="tel"]');

  let current = 0;

  // Fancybox ищет inline-узел по id в документе, переносит его в слайд
  // и возвращает на место при закрытии. Ответы при этом не сбрасываются:
  // открыл снова — продолжил с того же шага.
  document.querySelectorAll("[data-brief-open]").forEach((button) => {
    button.addEventListener("click", () => {
      Fancybox.show([{ src: "#brief", type: "inline" }], {
        mainClass: "brief-modal",
        triggerEl: button,
        closeButton: false,
        dragToClose: false,
        Carousel: { Toolbar: false },
      });
    });
  });

  function go(index) {
    current = Math.min(Math.max(index, 0), panels.length - 1);
    const last = current === panels.length - 1;

    panels.forEach((panel, i) => {
      panel.hidden = i !== current;
    });

    steps.forEach((step, i) => {
      step.classList.toggle("brief__step--done", i < current);
      step.classList.toggle("brief__step--current", i === current);

      if (i === current) step.setAttribute("aria-current", "step");
      else step.removeAttribute("aria-current");
    });

    prev.disabled = current === 0;
    next.hidden = last;
    submit.hidden = !last;
    // Enter в поле отправляет форму через первую submit-кнопку, даже скрытую.
    // Выключенная кнопка отправку глушит — до пятого шага так и должно быть.
    submit.disabled = !last;

    body.scrollTop = 0;
  }

  function focusHeading() {
    panels[current].querySelector("legend")?.focus({ preventScroll: true });
  }

  prev.addEventListener("click", () => {
    go(current - 1);
    focusHeading();
  });

  next.addEventListener("click", () => {
    go(current + 1);
    focusHeading();
  });

  if (phone) IMask(phone, { mask: PHONE_MASK });

  // Проверяется только пятый шаг: у остальных в макете нет состояния ошибки,
  // а подвал обещает «можно вернуться и изменить ответы».
  const validator = new JustValidate(form, {
    errorFieldCssClass: "brief__input--invalid",
    errorLabelCssClass: "brief__error-text",
    focusInvalidField: true,
  });

  validator
    .addField("#brief-name", [{ rule: "required", errorMessage: REQUIRED }], {
      errorsContainer: '[data-error-for="brief-name"]',
    })
    .addField(
      "#brief-phone",
      [
        { rule: "required", errorMessage: REQUIRED },
        { rule: "customRegexp", value: PHONE_RE, errorMessage: "Введите номер целиком" },
      ],
      { errorsContainer: '[data-error-for="brief-phone"]' }
    )
    .addField(
      "#brief-email",
      [
        { rule: "required", errorMessage: REQUIRED },
        { rule: "email", errorMessage: "Проверьте адрес почты" },
      ],
      { errorsContainer: '[data-error-for="brief-email"]' }
    )
    .addField("#brief-consent", [{ rule: "required", errorMessage: "Без согласия отправить бриф нельзя" }], {
      errorsContainer: '[data-error-for="brief-consent"]',
      errorFieldCssClass: "brief__checkbox-input--invalid",
    })
    .onSuccess((event) => {
      event.preventDefault();

      // TODO: здесь встанет отправка, когда появится бэкенд. На Битриксе форму
      // заменит компонент со своей отправкой. Список ошибок сервера показывает
      // showErrors — тем же контейнером, что у формы заявки.
      showErrors(form, []);
      doneName.textContent = form.elements.name.value.trim();

      panels.forEach((panel) => {
        panel.hidden = true;
      });
      footer.hidden = true;
      done.hidden = false;
      // На экране «Спасибо» степпера в макете нет
      root.classList.add("brief--done");
      done.focus();
    });

  // «Заполнить ещё раз» — type="reset": поля чистит браузер, здесь только
  // возврат на первый шаг. Событие приходит до очистки, но ей это не мешает.
  form.addEventListener("reset", () => {
    validator.refresh();
    showErrors(form, []);
    done.hidden = true;
    footer.hidden = false;
    root.classList.remove("brief--done");
    go(0);
    focusHeading();
  });

  go(0);
}

// Список, а не одна строка: сервер может вернуть несколько замечаний разом
function showErrors(form, messages) {
  const box = form.querySelector("[data-form-errors]");

  if (!box) return;

  box.replaceChildren(
    ...messages.map((text) => {
      const item = document.createElement("li");
      item.textContent = text;
      return item;
    })
  );
}
