/**
 * Custom Process Slider Component
 * Supports responsive layout, touch swiping, and Shopify Theme Editor events
 */
(function () {
  function setupProcessSliders($) {
    $('.process-slider').each(function () {
      const $slider = $(this);
      if ($slider.data('slider-initialized')) return;
      $slider.data('slider-initialized', true);

      // Wrap Slider if not already wrapped
      if (!$slider.parent().hasClass('custom-slider-wrap')) {
        $slider.wrap('<div class="custom-slider-wrap"></div>');
      }
      const $wrap = $slider.parent('.custom-slider-wrap');

      // Add Navigation buttons if not already present
      if (!$wrap.find('.custom-slider-nav').length) {
        $wrap.append(`
          <div class="custom-slider-nav tns-controls">
            <button class="slider-prev" disabled aria-label="Previous"></button>
            <button class="slider-next" aria-label="Next"></button>
          </div>
        `);
      }

      const $items = $slider.find('.process-item');
      const $prevBtn = $wrap.find('.slider-prev');
      const $nextBtn = $wrap.find('.slider-next');

      if ($items.length === 0) return;

      let currentIndex = 0;
      let itemsToShow = getItemsToShow();

      // Base Slider Styles
      $slider.css({
        display: 'flex',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform',
        width: 'max-content'
      });

      function getItemsToShow() {
        const w = window.innerWidth;
        if (w >= 1200) return 2.2;
        if (w >= 991) return 2;
        if (w >= 768) return 1.5;
        return 1;
      }

      function getGap() {
        const w = window.innerWidth;
        if (w >= 1200) return 64;
        if (w >= 991) return 48;
        if (w >= 768) return 36;
        return 24;
      }

      function updateActiveSlide() {
        $items.removeClass('active');
        $items.eq(currentIndex).addClass('active');
      }

      function updateNavButtons(translateX, maxTranslate) {
        $prevBtn.prop('disabled', translateX <= 0);
        $nextBtn.prop('disabled', translateX >= maxTranslate - 1 || $items.length <= itemsToShow);
      }

      function updateSlider() {
        itemsToShow = getItemsToShow();
        const gap = getGap();
        const container = $slider.parent()[0];
        if (!container) return;
        const containerWidth = container.clientWidth;

        $slider.css({ gap: gap + 'px' });

        const itemWidth =
          (containerWidth - (itemsToShow - 1) * gap) / itemsToShow;

        $items.css({
          flex: `0 0 ${itemWidth}px`,
          minWidth: `${itemWidth}px`,
          maxWidth: `${itemWidth}px`,
          boxSizing: 'border-box',
          flexShrink: 0
        });

        const slideWidth = itemWidth + gap;
        const sliderWidth = $items.length * slideWidth - gap;

        let translateX = 0;
        if (currentIndex === 0) {
          translateX = 0;
        } else {
          translateX =
            currentIndex * slideWidth -
            (containerWidth - itemWidth) / 2;
        }

        const maxTranslate = Math.max(0, sliderWidth - containerWidth);
        translateX = Math.max(0, Math.min(translateX, maxTranslate));

        $slider.css({
          transform: `translateX(-${translateX}px)`
        });

        updateActiveSlide();
        updateNavButtons(translateX, maxTranslate);
      }

      // Button Click Events (scoped)
      $nextBtn.off('click').on('click', function () {
        if (currentIndex < $items.length - 1) {
          currentIndex++;
          updateSlider();
        }
      });

      $prevBtn.off('click').on('click', function () {
        if (currentIndex > 0) {
          currentIndex--;
          updateSlider();
        }
      });

      // Touch Swipe (scoped)
      let startX = 0;
      $slider.off('touchstart touchend');
      $slider.on('touchstart', function (e) {
        if (e.originalEvent && e.originalEvent.touches) {
          startX = e.originalEvent.touches[0].clientX;
        }
      });

      $slider.on('touchend', function (e) {
        if (e.originalEvent && e.originalEvent.changedTouches) {
          const endX = e.originalEvent.changedTouches[0].clientX;
          if (startX > endX + 50) {
            $nextBtn.trigger('click');
          } else if (startX < endX - 50) {
            $prevBtn.trigger('click');
          }
        }
      });

      // Resize handler
      $(window).off('resize.processSlider' + $slider.index()).on('resize.processSlider' + $slider.index(), function () {
        updateSlider();
      });

      // Initial layout run
      updateSlider();
    });
  }

  function init() {
    if (typeof window.jQuery === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://code.jquery.com/jquery-3.7.1.min.js';
      script.onload = function () {
        setupProcessSliders(window.jQuery);
      };
      document.head.appendChild(script);
    } else {
      setupProcessSliders(window.jQuery);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Shopify Theme Editor support
  document.addEventListener('shopify:section:load', function (e) {
    if ($(e.target).find('.process-slider').length) {
      $(e.target).find('.process-slider').removeData('slider-initialized');
      init();
    }
  });
})();
