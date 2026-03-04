import { type CSSProperties, type PropsWithChildren, type Ref, useRef } from "react";
import type { MagneticOptions } from "./types.js";
import { useMagnetic } from "./use-magnetic.js";

export interface MagneticProps extends PropsWithChildren, MagneticOptions {
	/** HTML tag to render. Default: 'div' */
	as?: keyof HTMLElementTagNameMap;
	/** Additional CSS class */
	className?: string;
	/** Additional inline styles */
	style?: CSSProperties;
	/** Ref to the underlying element */
	ref?: Ref<HTMLElement>;
}

export function Magnetic({
	as: Tag = "div",
	className,
	style,
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
}: MagneticProps) {
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

	const setRef = (el: HTMLElement | null) => {
		(innerRef as React.MutableRefObject<HTMLElement | null>).current = el;
		if (typeof ref === "function") ref(el);
		else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = el;
	};

	return (
		// @ts-expect-error — dynamic tag with ref
		<Tag ref={setRef} className={className} style={style}>
			{children}
		</Tag>
	);
}
