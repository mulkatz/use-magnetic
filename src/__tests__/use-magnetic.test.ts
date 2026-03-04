import { act, renderHook } from "@testing-library/react";
import { type RefObject, createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useMagnetic } from "../use-magnetic.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Create a real DOM element with a bounding rect we control. */
function createMockElement(rect: Partial<DOMRect> = {}): HTMLDivElement {
	const el = document.createElement("div");
	document.body.appendChild(el);

	const fullRect: DOMRect = {
		x: 0,
		y: 0,
		width: 100,
		height: 50,
		top: 0,
		left: 0,
		right: 100,
		bottom: 50,
		toJSON() {
			return this;
		},
		...rect,
	};

	el.getBoundingClientRect = () => fullRect;
	return el;
}

function pointerMove(target: HTMLElement, clientX: number, clientY: number): void {
	const event = new PointerEvent("pointermove", {
		clientX,
		clientY,
		bubbles: true,
	});
	target.dispatchEvent(event);
}

function pointerLeave(target: HTMLElement): void {
	const event = new PointerEvent("pointerleave", { bubbles: true });
	target.dispatchEvent(event);
}

// ---------------------------------------------------------------------------
// Mock matchMedia
// ---------------------------------------------------------------------------

let matchMediaMatches = false;
const matchMediaListeners: Array<(e: { matches: boolean }) => void> = [];

function mockMatchMedia(query: string): MediaQueryList {
	return {
		matches: matchMediaMatches,
		media: query,
		onchange: null,
		addEventListener(_event: string, handler: (e: { matches: boolean }) => void) {
			matchMediaListeners.push(handler);
		},
		removeEventListener(_event: string, handler: (e: { matches: boolean }) => void) {
			const idx = matchMediaListeners.indexOf(handler);
			if (idx >= 0) matchMediaListeners.splice(idx, 1);
		},
		addListener() {},
		removeListener() {},
		dispatchEvent() {
			return false;
		},
	} as unknown as MediaQueryList;
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

let originalMatchMedia: typeof window.matchMedia;
let originalRAF: typeof requestAnimationFrame;
let originalCAF: typeof cancelAnimationFrame;
let rafCallbacks: Array<FrameRequestCallback>;
let rafIdCounter: number;

beforeEach(() => {
	matchMediaMatches = false;
	matchMediaListeners.length = 0;

	originalMatchMedia = window.matchMedia;
	window.matchMedia = mockMatchMedia as unknown as typeof window.matchMedia;

	// Manually control rAF so we can flush animation frames synchronously
	rafCallbacks = [];
	rafIdCounter = 0;
	originalRAF = globalThis.requestAnimationFrame;
	originalCAF = globalThis.cancelAnimationFrame;

	globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => {
		const id = ++rafIdCounter;
		rafCallbacks.push(cb);
		return id;
	};
	globalThis.cancelAnimationFrame = (_id: number) => {
		// simplified: just clear all pending
		rafCallbacks = [];
	};
});

afterEach(() => {
	window.matchMedia = originalMatchMedia;
	globalThis.requestAnimationFrame = originalRAF;
	globalThis.cancelAnimationFrame = originalCAF;
	// Clean up DOM elements added during tests
	while (document.body.firstChild) {
		document.body.removeChild(document.body.firstChild);
	}
});

function flushRAF() {
	const cbs = [...rafCallbacks];
	rafCallbacks = [];
	for (const cb of cbs) cb(performance.now());
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useMagnetic", () => {
	it("returns isActive=false initially", () => {
		const ref = createRef<HTMLElement>() as RefObject<HTMLElement | null>;
		const { result } = renderHook(() => useMagnetic(ref));

		expect(result.current.isActive).toBe(false);
		expect(result.current.x).toBe(0);
		expect(result.current.y).toBe(0);
	});

	it("sets isActive=true when pointer enters range", () => {
		const el = createMockElement({
			width: 100,
			height: 50,
			left: 0,
			top: 0,
			right: 100,
			bottom: 50,
		});
		const ref = { current: el } as RefObject<HTMLElement | null>;

		const { result } = renderHook(() => useMagnetic(ref, { strength: 0.3, range: 200 }));

		// Pointer near center — well within range
		act(() => {
			pointerMove(el, 60, 30);
		});

		expect(result.current.isActive).toBe(true);
	});

	it("sets isActive=false when pointer leaves range", () => {
		const el = createMockElement({
			width: 100,
			height: 50,
			left: 0,
			top: 0,
			right: 100,
			bottom: 50,
		});
		const ref = { current: el } as RefObject<HTMLElement | null>;

		const { result } = renderHook(() => useMagnetic(ref, { strength: 0.3, range: 50 }));

		// Enter range
		act(() => {
			pointerMove(el, 50, 25);
		});
		expect(result.current.isActive).toBe(true);

		// Move far out of range
		act(() => {
			pointerMove(el, 500, 500);
		});
		expect(result.current.isActive).toBe(false);
	});

	it("sets isActive=false on pointerleave", () => {
		const el = createMockElement({
			width: 100,
			height: 50,
			left: 0,
			top: 0,
		});
		const ref = { current: el } as RefObject<HTMLElement | null>;

		const { result } = renderHook(() => useMagnetic(ref, { range: 200 }));

		act(() => {
			pointerMove(el, 50, 25);
		});
		expect(result.current.isActive).toBe(true);

		act(() => {
			pointerLeave(el);
		});
		expect(result.current.isActive).toBe(false);
	});

	it("calls onEnter and onLeave callbacks", () => {
		const el = createMockElement({
			width: 100,
			height: 50,
			left: 0,
			top: 0,
		});
		const ref = { current: el } as RefObject<HTMLElement | null>;
		const onEnter = vi.fn();
		const onLeave = vi.fn();

		renderHook(() => useMagnetic(ref, { range: 200, onEnter, onLeave }));

		act(() => {
			pointerMove(el, 50, 25);
		});
		expect(onEnter).toHaveBeenCalledTimes(1);
		expect(onLeave).not.toHaveBeenCalled();

		act(() => {
			pointerLeave(el);
		});
		expect(onLeave).toHaveBeenCalledTimes(1);
	});

	it("applies translate3d transform on pointer move", () => {
		const el = createMockElement({
			width: 100,
			height: 50,
			left: 0,
			top: 0,
		});
		const ref = { current: el } as RefObject<HTMLElement | null>;

		renderHook(() => useMagnetic(ref, { range: 200, strength: 0.5, ease: 1 }));

		act(() => {
			pointerMove(el, 70, 25); // 20px right of center, exactly at center Y
		});

		// Flush the rAF to apply the transform
		act(() => {
			flushRAF();
		});

		expect(el.style.transform).toContain("translate3d(");
		expect(el.style.transform).toContain("px");
	});

	it("guards against zero-size elements", () => {
		const el = createMockElement({ width: 0, height: 0 });
		const ref = { current: el } as RefObject<HTMLElement | null>;

		const { result } = renderHook(() => useMagnetic(ref, { range: 200 }));

		act(() => {
			pointerMove(el, 50, 25);
		});

		// Should not become active since element has no dimensions
		expect(result.current.isActive).toBe(false);
	});

	it("cleans up event listeners and cancels animation frame on unmount", () => {
		const el = createMockElement({
			width: 100,
			height: 50,
			left: 0,
			top: 0,
		});
		const ref = { current: el } as RefObject<HTMLElement | null>;
		const removeSpy = vi.spyOn(el, "removeEventListener");

		const { unmount } = renderHook(() => useMagnetic(ref));

		unmount();

		// Should have removed pointermove and pointerleave
		const removedEvents = removeSpy.mock.calls.map((c) => c[0]);
		expect(removedEvents).toContain("pointermove");
		expect(removedEvents).toContain("pointerleave");
	});

	it("restores original transform on cleanup", () => {
		const el = createMockElement({
			width: 100,
			height: 50,
			left: 0,
			top: 0,
		});
		const ref = { current: el } as RefObject<HTMLElement | null>;

		const { unmount } = renderHook(() => useMagnetic(ref, { range: 200, ease: 1 }));

		// Move pointer to apply a transform
		act(() => {
			pointerMove(el, 70, 25);
		});
		act(() => {
			flushRAF();
		});

		// Unmount should restore original transform
		unmount();

		// baseTransform was "" (no pre-existing transform), so it should be reset
		expect(el.style.transform).toBe("");
	});

	it("respects prefers-reduced-motion", () => {
		matchMediaMatches = true;

		const el = createMockElement({
			width: 100,
			height: 50,
			left: 0,
			top: 0,
		});
		const ref = { current: el } as RefObject<HTMLElement | null>;

		const { result } = renderHook(() => useMagnetic(ref, { range: 200 }));

		act(() => {
			pointerMove(el, 50, 25);
		});

		// Should not activate since reduced motion is preferred
		expect(result.current.isActive).toBe(false);
	});

	it("allows disabling motion preference respect", () => {
		matchMediaMatches = true;

		const el = createMockElement({
			width: 100,
			height: 50,
			left: 0,
			top: 0,
		});
		const ref = { current: el } as RefObject<HTMLElement | null>;

		const { result } = renderHook(() =>
			useMagnetic(ref, { range: 200, respectMotionPreference: false }),
		);

		act(() => {
			pointerMove(el, 50, 25);
		});

		expect(result.current.isActive).toBe(true);
	});

	it("resets transform when motionDisabled becomes true", () => {
		const el = createMockElement({
			width: 100,
			height: 50,
			left: 0,
			top: 0,
		});
		const ref = { current: el } as RefObject<HTMLElement | null>;

		// Start with motion enabled
		matchMediaMatches = false;

		renderHook(() => useMagnetic(ref, { range: 200 }));

		act(() => {
			pointerMove(el, 70, 25);
		});
		act(() => {
			flushRAF();
		});

		// Transform was applied
		expect(el.style.transform).toContain("translate3d(");

		// Now simulate prefers-reduced-motion activating
		matchMediaMatches = true;
		act(() => {
			for (const listener of [...matchMediaListeners]) {
				listener({ matches: true });
			}
		});

		// After the effect re-runs with motionDisabled=true, transform should be reset
		expect(el.style.transform).toBe("");
	});

	it("uses parent element as trigger when triggerArea=parent", () => {
		const parent = document.createElement("div");
		const el = createMockElement({
			width: 100,
			height: 50,
			left: 0,
			top: 0,
		});
		parent.appendChild(el);
		document.body.appendChild(parent);

		const ref = { current: el } as RefObject<HTMLElement | null>;
		const addSpy = vi.spyOn(parent, "addEventListener");

		renderHook(() => useMagnetic(ref, { triggerArea: "parent" }));

		const addedEvents = addSpy.mock.calls.map((c) => c[0]);
		expect(addedEvents).toContain("pointermove");
		expect(addedEvents).toContain("pointerleave");
	});

	it("clamps displacement to maxDisplacement", () => {
		const el = createMockElement({
			width: 100,
			height: 50,
			left: 0,
			top: 0,
		});
		const ref = { current: el } as RefObject<HTMLElement | null>;

		renderHook(() =>
			useMagnetic(ref, {
				range: 200,
				strength: 1.0,
				ease: 1.0,
				maxDisplacement: 5,
			}),
		);

		// Move far from center but still in range
		act(() => {
			pointerMove(el, 150, 25); // 100px right of center
		});
		act(() => {
			flushRAF();
		});

		// The transform should be clamped — parse out the x value
		const match = el.style.transform.match(/translate3d\(([-\d.]+)px/);
		expect(match).not.toBeNull();
		const xValue = Number.parseFloat(match?.[1] ?? "0");
		expect(Math.abs(xValue)).toBeLessThanOrEqual(5);
	});
});
