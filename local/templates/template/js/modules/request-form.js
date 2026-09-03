import JustValidate from "just-validate";
import IMask from "imask";

import { PHONE_MASK, PHONE_RE } from "./phone";

const REQUIRED = "Обязательно к заполнению";

export function requestForm(selector = "[data-request-form]") {
  const form = document.querySelector(selector);

  if (!form) return;

  const card = form.closest(".request-form");
  const success = card.querySelector("[data-form-success]");
  const phone = form.querySelector('input[type="tel"]');

  if (phone) IMask(phone, { mask: PHONE_MASK });

  const validator = new JustValidate(form, {
    errorFieldCssClass: "request-form__input--invalid",
    errorLabelCssClass: "request-form__error-text",
    focusInvalidField: true,
  });

  validator
    .addField("#request-name", [{ rule: "required", errorMessage: REQUIRED }], {
      errorsContainer: '[data-error-for="request-name"]',
    })
    .addField(
      "#request-phone",
      [
        { rule: "required", errorMessage: REQUIRED },
        { rule: "customRegexp", value: PHONE_RE, errorMessage: "Введите номер целиком" },
      ],
      { errorsContainer: '[data-error-for="request-phone"]' }
    )
    .addField("#request-email", [{ rule: "email", errorMessage: "Проверьте адрес почты" }], {
      errorsContainer: '[data-error-for="request-email"]',
    })
    .onSuccess((event) => {
      event.preventDefault();
      showErrors(form, []);

      // TODO: здесь встанет отправка, когда появится бэкенд. На Битриксе форму
      // заменит компонент со своей отправкой. Ветка ошибок написана заранее:
      // сервер вернёт список сообщений, showErrors покажет их над кнопкой.
      card.classList.add("request-form--sent");
      success.focus();
    });
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
