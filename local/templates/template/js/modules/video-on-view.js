// Запускает видео при появлении в кадре и ставит на паузу при уходе.
// Повтора нет: ролик доигрывает и замирает на последнем кадре.

export function videoOnView(selector = "[data-video-on-view]") {
  const videos = document.querySelectorAll(selector);

  if (!videos.length) return;

  // Автозапуск отключён — отдаём управление пользователю
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    videos.forEach((video) => (video.controls = true));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) {
          target.pause();
          return;
        }

        // Браузер вправе отказать в автозапуске — тогда показываем контролы
        target.play().catch(() => (target.controls = true));
      });
    },
    { threshold: 0.4 }
  );

  videos.forEach((video) => observer.observe(video));
}
