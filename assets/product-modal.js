if (!customElements.get('product-modal')) {
  customElements.define(
    'product-modal',
    class ProductModal extends ModalDialog {
      constructor() {
        super();

        this.content = this.querySelector('.product-media-modal__content');
        this.prevButton = this.querySelector('.product-media-modal__nav-button--prev');
        this.nextButton = this.querySelector('.product-media-modal__nav-button--next');
        this.currentCounter = this.querySelector('.product-media-modal__counter-current');
        this.totalCounter = this.querySelector('.product-media-modal__counter-total');
        this.currentIndex = 0;

        // Prevent pointerup on controls or media from bubbling to ModalDialog's auto-close handler
        this.addEventListener(
          'pointerup',
          (event) => {
            if (
              event.target.closest(
                '.product-media-modal__nav-button, .product-media-modal__counter, img, deferred-media, product-model'
              )
            ) {
              event.stopPropagation();
            }
          },
          true
        );

        if (this.prevButton) {
          this.prevButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.slidePrev();
          });
        }

        if (this.nextButton) {
          this.nextButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.slideNext();
          });
        }

        // Track scroll / swipe position
        if (this.content) {
          let scrollTimeout;
          this.content.addEventListener(
            'scroll',
            () => {
              window.clearTimeout(scrollTimeout);
              scrollTimeout = setTimeout(() => {
                this.updateActiveSlideOnScroll();
              }, 60);
            },
            { passive: true }
          );
        }

        // Keyboard navigation (Left / Right arrows)
        this.addEventListener('keydown', (event) => {
          if (event.code === 'ArrowLeft') {
            event.preventDefault();
            this.slidePrev();
          } else if (event.code === 'ArrowRight') {
            event.preventDefault();
            this.slideNext();
          }
        });
      }

      get slides() {
        if (!this.content) return [];
        return Array.from(this.content.children).filter((el) =>
          el.matches('img, deferred-media, .product-media-modal__model, [data-media-id]')
        );
      }

      show(opener) {
        super.show(opener);
        this.initSlider();
      }

      initSlider() {
        const slides = this.slides;
        if (!slides.length) return;

        if (this.totalCounter) {
          this.totalCounter.textContent = slides.length;
        }

        // Hide navigation if only 1 slide
        if (slides.length <= 1) {
          if (this.prevButton) this.prevButton.style.display = 'none';
          if (this.nextButton) this.nextButton.style.display = 'none';
          const counter = this.querySelector('.product-media-modal__counter');
          if (counter) counter.style.display = 'none';
        } else {
          if (this.prevButton) this.prevButton.style.display = '';
          if (this.nextButton) this.nextButton.style.display = '';
          const counter = this.querySelector('.product-media-modal__counter');
          if (counter) counter.style.display = '';
        }

        // Determine starting slide based on opener
        const mediaId = this.openedBy ? this.openedBy.getAttribute('data-media-id') : null;
        let targetIndex = 0;
        if (mediaId) {
          const matchedIndex = slides.findIndex(
            (slide) => slide.dataset.mediaId === mediaId || slide.querySelector(`[data-media-id="${mediaId}"]`)
          );
          if (matchedIndex !== -1) targetIndex = matchedIndex;
        }

        // Jump immediately to clicked slide
        this.goToSlide(targetIndex, false);
      }

      goToSlide(index, smooth = true) {
        const slides = this.slides;
        if (!slides.length) return;

        if (index < 0) {
          index = slides.length - 1;
        } else if (index >= slides.length) {
          index = 0;
        }

        this.currentIndex = index;
        const targetSlide = slides[index];

        slides.forEach((slide, idx) => {
          if (idx === index) {
            slide.classList.add('active');
          } else {
            slide.classList.remove('active');
          }
        });

        if (this.currentCounter) {
          this.currentCounter.textContent = index + 1;
        }

        if (targetSlide && this.content) {
          this.content.scrollTo({
            left: targetSlide.offsetLeft,
            behavior: smooth ? 'smooth' : 'instant',
          });

          const template = targetSlide.querySelector('template');
          if (
            targetSlide.nodeName === 'DEFERRED-MEDIA' &&
            template &&
            template.content.querySelector('.js-youtube')
          ) {
            targetSlide.loadContent();
          }
        }
      }

      slideNext() {
        this.goToSlide(this.currentIndex + 1, true);
      }

      slidePrev() {
        this.goToSlide(this.currentIndex - 1, true);
      }

      updateActiveSlideOnScroll() {
        const slides = this.slides;
        if (!slides.length || !this.content) return;

        const scrollLeft = this.content.scrollLeft;
        let closestIndex = 0;
        let minDiff = Infinity;

        slides.forEach((slide, idx) => {
          const diff = Math.abs(slide.offsetLeft - scrollLeft);
          if (diff < minDiff) {
            minDiff = diff;
            closestIndex = idx;
          }
        });

        if (closestIndex !== this.currentIndex) {
          this.currentIndex = closestIndex;
          slides.forEach((slide, idx) => {
            if (idx === closestIndex) {
              slide.classList.add('active');
            } else {
              slide.classList.remove('active');
            }
          });
          if (this.currentCounter) {
            this.currentCounter.textContent = closestIndex + 1;
          }
        }
      }
    }
  );
}
