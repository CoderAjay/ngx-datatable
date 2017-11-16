import {Directive, ElementRef, OnInit, HostListener, OnDestroy} from '@angular/core';
import {Observable} from 'rxjs/Observable';

import { Renderer2 } from '@angular/core';

export const CSS_CLASSES = {
	thumb: 'scrollbar-thumb',
	track: 'scrollbar-track',
};

/**
 * Simple utility that lets you throttle calls to a component to every x, discarding
 * any other calls.
 */
export class Throttle {
	private lastCall: number = 0;
	private skipped = 0;

	constructor(private fn, private val: number) {}

	public invoke() {
		this.skipped++;

		if (+new Date() - this.lastCall >= this.val) {
			this.fn();
			this.lastCall = +new Date();
			this.skipped = 0;
		}
	}
}

/**
 * Explanation:
 * This works by hiding the scrollbar by offsetting the content by minus the scrollbar width, meaning we can still
 * get the benefits of using native scrolling (we don't need to implement custom scroll, page up/down.. etc. events)
 *
 * We then implement our own scrollbar on top to replace the native one.
 *
 * If scrollbar width is 0, we can assume that the browser is overlaying scroll bars (doing the same as what we're doing) so
 * we use the native scrollbar instead.
 */
@Directive({
	selector: '[scrollBar]',
})
export class ScrollDirective implements OnInit, OnDestroy {
	public static readonly scrollbarWidth = ScrollDirective.calculateScrollbarWidth();
	private mutations: MutationObserver;
	private canvas: Element;
	private wrapper: Element;
	private down: boolean = false;
	private cursorDistance = 0;
	private listeners = [];

	private recalculate = new Throttle(this.redraw.bind(this), 50);
	private isHovering = false;
	private isFullWidth = false;
	private scrollbarLocation = {
		top: 0,
		bottom: 0,
	};

	constructor(private renderer: Renderer2, private element: ElementRef) {
	}

	/**
	 * Calculate the width of the current browsers scroll bar.
	 */
	public static calculateScrollbarWidth() {
		let el: any = document.createElement('div');

		el.innerHTML = `<div style="width:50px;height:50px;position:absolute;left:-50px;top:-50px;overflow:auto;">
							<div style="width:1px;height:100px;">
							</div>
						</div>
					`;

		el = el.firstChild;
		document.body.appendChild(el);
		const val = el.offsetWidth - el.clientWidth;
		document.body.removeChild(el);

		return val;
	}

	public ngOnInit() {
		this.renderer.setStyle(this.element.nativeElement, 'overflow-x', 'hidden');
		this.renderer.setStyle(this.element.nativeElement, 'overflow-y', 'scroll');

		// If the scrollbar has no width, we should disable.
		if (ScrollDirective.scrollbarWidth === 0) {
			return;
		}

		this.renderer.setStyle(this.element.nativeElement, 'margin-right', `-${ScrollDirective.scrollbarWidth}px`);

		// Build all the elements we need.
		this.buildWrapper();

		this.buildCanvas();

		this.renderer.listen(this.wrapper, 'mouseenter', () => {
			this.isHovering = true;
			this.redraw();
		});

		this.renderer.listen(this.wrapper, 'mouseleave', () => {
			this.isHovering = false;
			this.redraw();
		});

		this.renderer.listen(this.canvas, 'mouseenter', () => {
			this.isFullWidth = true;
			this.redraw();
		});

		this.renderer.listen(this.canvas, 'mouseleave', () => {
			this.isFullWidth = false;
			this.redraw();
		});

		this.renderer.listen(this.canvas, 'click', e => {
			console.log(e, this.scrollbarLocation);
			if (e.offsetY <= this.scrollbarLocation.top) {
				this.scrollByPage(true);
			} else if (e.offsetY >= this.scrollbarLocation.bottom) {
				this.scrollByPage(false);
			}
		});

		if (MutationObserver) {
			// React to DOM changes
			this.mutations = new MutationObserver(() => {
				this.recalculate.invoke();
			});

			this.mutations.observe(this.element.nativeElement, { attributes: true, childList: true, characterData: true });
		}

		Observable.merge(
			Observable.fromEvent(this.element.nativeElement, 'scroll'),
			Observable.fromEvent(this.element.nativeElement, 'wheel')
		).subscribe(() => this.recalculate.invoke());
	}

	public ngOnDestroy() {
		this.listeners.forEach(listener => listener());

		if (this.mutations) {
			this.mutations.disconnect();
		}
	}

	/**
	 * Scroll the content by 1 view size
	 *
	 * @param reverse Reverse the direction of scroll
	 */
	public scrollByPage(reverse: boolean) {
		this.scrollBy(this.element.nativeElement.clientHeight * 0.8, reverse);
	}

	/**
	 * Scroll the viewport by an amount
	 *
	 * @param amt The amount in pixels to scroll by
	 * @param direction Whether to reverse scroll direction.
	 */
	public scrollBy(amt: number, direction: boolean) {
		let val = Math.min(this.element.nativeElement.scrollTop + amt, this.element.nativeElement.scrollHeight);

		if (direction) {
			val = Math.max(this.element.nativeElement.scrollTop - amt, 0);
		}

		this.scrollTo(val);
	}

	/**
	 * Scroll to an exact position.
	 *
	 * @param amount The value in pixels to scroll to.
	 */
	public scrollTo(amount: number) {
		window.requestAnimationFrame(() => {
			this.element.nativeElement.scrollTop = amount;

			this.recalculate.invoke();
		});
	}

	/**
	 * Calculate what percentage of content is visible.
	 */
	private calculateVisiblePerc() {
		const amountToScroll = this.element.nativeElement.scrollHeight;
		const amountToSee = this.element.nativeElement.clientHeight;

		return amountToSee / amountToScroll * 100;
	}

	/**
	 * Buid the DOM element for the main wrapper.
	 */
	private buildWrapper() {
		this.wrapper = this.renderer.createElement('div');
		this.renderer.setStyle(this.wrapper, 'position', 'relative');
		this.renderer.setStyle(this.wrapper, 'display', 'block');
		this.renderer.setStyle(this.wrapper, 'overflow', 'hidden');
		// this.renderer.setStyle(this.wrapper, 'width', '100%');

		this.renderer.insertBefore(this.element.nativeElement.parentElement, this.wrapper, this.element.nativeElement);
		this.renderer.appendChild(this.wrapper, this.element.nativeElement);
	}

	/**
	 * Build the scrollbar canvas.
	 */
	private buildCanvas() {
		this.canvas = this.renderer.createElement('canvas');
		this.renderer.addClass(this.canvas, CSS_CLASSES.track);

		this.redraw();

		this.renderer.appendChild(this.wrapper, this.canvas);
	}

	/**
	 * Redraw the scrollbar.
	 */
	@HostListener('window:resize')
	private redraw() {
		this.renderer.setAttribute(this.canvas, 'height', `${this.wrapper.clientHeight}`);
		this.renderer.setAttribute(this.canvas, 'width', `35`);

		const context: CanvasRenderingContext2D = (<any>this.canvas).getContext('2d');
		context.clearRect(0, 0, (<any>this.canvas).width, (<any>this.canvas).height);

		if (this.calculateVisiblePerc() >= 100 || !this.isHovering) {
			return;
		}

		let width = 20;
		let offset = 15;

		if (this.isFullWidth) {
			width = 35;
			offset = 0;

			context.fillStyle = `rgba(255, 255, 255, 0.1)`;
			context.fillRect(0, 0, (<any>this.canvas).width, (<any>this.canvas).height);
		}

        console.log(this.calculateVisiblePerc());
		const top = (this.element.nativeElement.scrollTop / this.element.nativeElement.scrollHeight) * this.wrapper.clientHeight;
		context.fillStyle = `rgba(255, 255, 255, ${this.isFullWidth ? 0.3 : 0.2})`;
		context.fillRect(offset, top, width, this.wrapper.clientHeight * (this.calculateVisiblePerc() / 100));

		this.scrollbarLocation = {
			top,
			bottom: top + this.wrapper.clientHeight * (this.calculateVisiblePerc() / 100),
		};
	}
}
