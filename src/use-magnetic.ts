import { type RefObject, useCallback, useEffect, useRef, useState } from "react";
import type { MagneticOptions, MagneticState } from "./types.js";

const DEFAULT_STRENGTH = 0.3;
const DEFAULT_RANGE = 200;
const DEFAULT_EASE = 0.1;
const SNAP_THRESHOLD = 0.1;

function lerp(start: number, end: number, factor: number): number {
	return start + (end - start) * factor;
}

function getReducedMotionQuery(): MediaQueryList | null {
	if (typeof window === "undefined") return null;
	return window.matchMedia("(prefers-reduced-motion: reduce)");
}

function usePrefersReducedMotion(): boolean {
	const [prefersReduced, setPrefersReduced] = useState(() => {
		return getReducedMotionQuery()?.matches ?? false;
	});

	useEffect(() => {
		const mql = getReducedMotionQuery();
		if (!mql) return;

		const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
		mql.addEventListener("change", handler);
		// Sync in case it changed between render and effect
		setPrefersReduced(mql.matches);
		return () => mql.removeEventListener("change", handler);
	}, []);

	return prefersReduced;
}

export function useMagnetic(
	ref: RefObject<HTMLElement | null>,
	options: MagneticOptions = {},
): MagneticState {
	const {
		strength = DEFAULT_STRENGTH,
		range = DEFAULT_RANGE,
		ease = DEFAULT_EASE,
		maxDisplacement,
		respectMotionPreference = true,
		triggerArea = "self",
		onEnter,
		onLeave,
	} = options;

	const prefersReducedMotion = usePrefersReducedMotion();
	const motionDisabled = respectMotionPreference && prefersReducedMotion;

	const [isActiveState, setIsActiveState] = useState(false);

	const targetX = useRef(0);
	const targetY = useRef(0);
	const currentX = useRef(0);
	const currentY = useRef(0);
	const rafId = useRef<number>(0);
	const isActive = useRef(false);
	const baseTransform = useRef("");

	const onEnterRef = useRef(onEnter);
	const onLeaveRef = useRef(onLeave);
	onEnterRef.current = onEnter;
	onLeaveRef.current = onLeave;

	// Store latest options in a ref so the animation loop always reads fresh values
	const optionsRef = useRef({ strength, range, ease, maxDisplacement });
	optionsRef.current = { strength, range, ease, maxDisplacement };

	const animate = useCallback(() => {
		const { ease: currentEase } = optionsRef.current;
		currentX.current = lerp(currentX.current, targetX.current, currentEase);
		currentY.current = lerp(currentY.current, targetY.current, currentEase);

		// Snap to zero when close enough
		if (
			Math.abs(currentX.current - targetX.current) < SNAP_THRESHOLD &&
			Math.abs(currentY.current - targetY.current) < SNAP_THRESHOLD
		) {
			currentX.current = targetX.current;
			currentY.current = targetY.current;
		}

		const el = ref.current;
		if (el) {
			const magnetic = `translate3d(${currentX.current}px, ${currentY.current}px, 0)`;
			el.style.transform = baseTransform.current
				? `${magnetic} ${baseTransform.current}`
				: magnetic;
		}

		// Continue animating if not at rest
		if (currentX.current !== targetX.current || currentY.current !== targetY.current) {
			rafId.current = requestAnimationFrame(animate);
		} else {
			rafId.current = 0;
		}
	}, [ref]);

	const startAnimation = useCallback(() => {
		if (rafId.current === 0) {
			rafId.current = requestAnimationFrame(animate);
		}
	}, [animate]);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		if (motionDisabled) {
			el.style.transform = baseTransform.current;
			return;
		}

		// Capture existing transform so we can compose rather than overwrite
		const computed = getComputedStyle(el).transform;
		baseTransform.current = computed === "none" ? "" : computed;

		const triggerEl = triggerArea === "parent" ? (el.parentElement ?? el) : el;

		const handlePointerMove = (e: PointerEvent) => {
			const rect = el.getBoundingClientRect();

			// Guard: skip if element has zero dimensions (collapsed, hidden, etc.)
			if (rect.width === 0 || rect.height === 0) return;

			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;

			const distX = e.clientX - centerX;
			const distY = e.clientY - centerY;
			const distance = Math.sqrt(distX * distX + distY * distY);

			const { strength: s, range: r, maxDisplacement: md } = optionsRef.current;

			if (distance < r) {
				if (!isActive.current) {
					isActive.current = true;
					setIsActiveState(true);
					onEnterRef.current?.();
				}

				const maxDist = md ?? r * s;
				const pullX = Math.min(Math.max(distX * s, -maxDist), maxDist);
				const pullY = Math.min(Math.max(distY * s, -maxDist), maxDist);

				targetX.current = pullX;
				targetY.current = pullY;
			} else {
				if (isActive.current) {
					isActive.current = false;
					setIsActiveState(false);
					onLeaveRef.current?.();
				}
				targetX.current = 0;
				targetY.current = 0;
			}

			startAnimation();
		};

		const handlePointerLeave = () => {
			if (isActive.current) {
				isActive.current = false;
				setIsActiveState(false);
				onLeaveRef.current?.();
			}
			targetX.current = 0;
			targetY.current = 0;
			startAnimation();
		};

		triggerEl.addEventListener("pointermove", handlePointerMove);
		triggerEl.addEventListener("pointerleave", handlePointerLeave);

		return () => {
			triggerEl.removeEventListener("pointermove", handlePointerMove);
			triggerEl.removeEventListener("pointerleave", handlePointerLeave);
			if (rafId.current) {
				cancelAnimationFrame(rafId.current);
				rafId.current = 0;
			}
			// Reset all internal state so Strict Mode re-mount starts clean
			targetX.current = 0;
			targetY.current = 0;
			currentX.current = 0;
			currentY.current = 0;
			if (isActive.current) {
				isActive.current = false;
				setIsActiveState(false);
			}
			// Restore original transform on cleanup
			if (el) {
				el.style.transform = baseTransform.current;
			}
			baseTransform.current = "";
		};
	}, [ref, motionDisabled, triggerArea, startAnimation]);

	return {
		isActive: isActiveState,
		x: currentX.current,
		y: currentY.current,
	};
}
