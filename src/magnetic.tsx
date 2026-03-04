import {
	type ComponentPropsWithoutRef,
	type ElementType,
	type MutableRefObject,
	type PropsWithChildren,
	type Ref,
	useCallback,
	useRef,
} from "react";
import type { MagneticOptions } from "./types.js";
import { useMagnetic } from "./use-magnetic.js";

export type MagneticProps<T extends ElementType = "div"> = PropsWithChildren<
	MagneticOptions & {
		/** HTML tag to render. Default: 'div' */
		as?: T;
		/** Ref to the underlying element */
		ref?: Ref<HTMLElement>;
	} & Omit<ComponentPropsWithoutRef<T>, keyof MagneticOptions | "as" | "ref">
>;

export function Magnetic<T extends ElementType = "div">({
	as,
	children,
	ref,
	strength,
	range,
	ease,
	maxDisplacement,
	respectMotionPreference,
	triggerArea,
	onEnter,
	onLeave,
	...htmlProps
}: MagneticProps<T>) {
	const Tag = as ?? "div";
	const innerRef = useRef<HTMLElement>(null);

	useMagnetic(innerRef, {
		strength,
		range,
		ease,
		maxDisplacement,
		respectMotionPreference,
		triggerArea,
		onEnter,
		onLeave,
	});

	const setRef = useCallback(
		(el: HTMLElement | null) => {
			(innerRef as MutableRefObject<HTMLElement | null>).current = el;
			if (typeof ref === "function") ref(el);
			else if (ref) (ref as MutableRefObject<HTMLElement | null>).current = el;
		},
		[ref],
	);

	return (
		<Tag ref={setRef} {...htmlProps}>
			{children}
		</Tag>
	);
}
