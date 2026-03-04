export interface MagneticOptions {
	/** Attraction strength (0-1). Higher = stronger pull. Default: 0.3 */
	strength?: number;
	/** Trigger radius in px. How far the cursor can be to activate. Default: 200 */
	range?: number;
	/** Lerp ease factor (0-1). Lower = smoother/slower. Default: 0.1 */
	ease?: number;
	/** Max displacement in px. Caps how far element moves. Default: range * strength */
	maxDisplacement?: number;
	/** Whether to respect prefers-reduced-motion. Default: true */
	respectMotionPreference?: boolean;
	/** Trigger area. 'self' = element bounds, 'parent' = parent bounds. Default: 'self' */
	triggerArea?: "self" | "parent";
	/** Callback when cursor enters magnetic range */
	onEnter?: () => void;
	/** Callback when cursor leaves magnetic range */
	onLeave?: () => void;
}

export interface MagneticState {
	/** Whether the cursor is within range */
	isActive: boolean;
	/** Current x displacement in px */
	x: number;
	/** Current y displacement in px */
	y: number;
}
