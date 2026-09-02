// Ключ уходит в браузер вместе со скриптом — для JS API это норма. Защищает
// не секретность, а список доменов у ключа в кабинете Яндекса
const KEY = "b847d5d5-a7ff-44f3-9166-d73393056a8f";
const SRC = `https://api-maps.yandex.ru/2.1/?apikey=${KEY}&lang=ru_RU`;

// Снят с макета: там видны Перерва и Иловайская, то есть охват шире дома
const ZOOM = 15;

let api;

function loadApi() {
  if (!api) {
    api = new Promise((resolve, reject) => {
      const script = document.createElement("script");

      script.src = SRC;
      script.onload = () => ymaps.ready(resolve);
      script.onerror = () => reject(new Error("api-maps.yandex.ru недоступен"));
      document.head.append(script);
    });
  }

  return api;
}

export function ymap(selector = "[data-map]") {
  const box = document.querySelector(selector);

  if (!box) return;

  const center = [Number(box.dataset.mapLat), Number(box.dataset.mapLng)];

  if (center.some(Number.isNaN)) return;

  // Скрипт тянем, только когда карта доехала до экрана: тариф — 500 запросов
  // в сутки, и тратить их на тех, кто до контактов не долистал, незачем
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;

      observer.disconnect();
      build(box, center);
    },
    { rootMargin: "200px" }
  );

  observer.observe(box);
}

async function build(box, center) {
  try {
    await loadApi();
  } catch {
    // Ключ не тот, сеть легла, блокировщик — причин много, поведение одно:
    // остаёмся на статичной карте из макета
    return;
  }

  const canvas = document.createElement("div");

  canvas.className = "ymap__canvas";
  box.append(canvas);

  const map = new ymaps.Map(
    canvas,
    { center, zoom: ZOOM, controls: ["zoomControl"] },
    { suppressMapOpenBlock: true }
  );

  // Колесо мыши листает страницу, а не зумит карту под курсором
  map.behaviors.disable("scrollZoom");

  const { mapCaption = "", mapAddress = "" } = box.dataset;

  map.geoObjects.add(
    new ymaps.Placemark(
      center,
      {
        hintContent: mapCaption,
        balloonContent: [mapCaption, mapAddress].filter(Boolean).join("<br>"),
      },
      { preset: "islands#redIcon" }
    )
  );

  box.classList.add("ymap--ready");
}
