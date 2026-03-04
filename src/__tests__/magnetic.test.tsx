import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Magnetic } from "../magnetic.js";

// ---------------------------------------------------------------------------
// Mock matchMedia (required by useMagnetic internally)
// ---------------------------------------------------------------------------

let originalMatchMedia: typeof window.matchMedia;

function mockMatchMedia(query: string): MediaQueryList {
	return {
		matches: false,
		media: query,
		onchange: null,
		addEventListener() {},
		removeEventListener() {},
		addListener() {},
		removeListener() {},
		dispatchEvent() {
			return false;
		},
	} as unknown as MediaQueryList;
}

beforeEach(() => {
	originalMatchMedia = window.matchMedia;
	window.matchMedia = mockMatchMedia as unknown as typeof window.matchMedia;
});

afterEach(() => {
	cleanup();
	window.matchMedia = originalMatchMedia;
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Magnetic", () => {
	it("renders with default as=div", () => {
		render(<Magnetic data-testid="mag">Hello</Magnetic>);

		const el = screen.getByTestId("mag");
		expect(el.tagName).toBe("DIV");
		expect(el.textContent).toBe("Hello");
	});

	it("renders with custom as=button", () => {
		render(
			<Magnetic as="button" data-testid="mag-btn">
				Click
			</Magnetic>,
		);

		const el = screen.getByTestId("mag-btn");
		expect(el.tagName).toBe("BUTTON");
	});

	it("renders with custom as=a", () => {
		render(
			<Magnetic as="a" href="https://example.com" data-testid="mag-link">
				Link
			</Magnetic>,
		);

		const el = screen.getByTestId("mag-link");
		expect(el.tagName).toBe("A");
		expect(el.getAttribute("href")).toBe("https://example.com");
	});

	it("forwards className", () => {
		render(
			<Magnetic className="my-class" data-testid="mag">
				Styled
			</Magnetic>,
		);

		const el = screen.getByTestId("mag");
		expect(el.className).toBe("my-class");
	});

	it("forwards onClick handler", () => {
		let clicked = false;
		render(
			<Magnetic
				as="button"
				data-testid="mag-btn"
				onClick={() => {
					clicked = true;
				}}
			>
				Click
			</Magnetic>,
		);

		screen.getByTestId("mag-btn").click();
		expect(clicked).toBe(true);
	});

	it("forwards aria attributes", () => {
		render(
			<Magnetic aria-label="magnetic element" data-testid="mag">
				Accessible
			</Magnetic>,
		);

		const el = screen.getByTestId("mag");
		expect(el.getAttribute("aria-label")).toBe("magnetic element");
	});

	it("forwards data attributes", () => {
		render(
			<Magnetic data-testid="mag" data-custom="value">
				Data
			</Magnetic>,
		);

		const el = screen.getByTestId("mag");
		expect(el.getAttribute("data-custom")).toBe("value");
	});

	it("forwards ref correctly", () => {
		const ref = createRef<HTMLElement>();

		render(
			<Magnetic ref={ref} data-testid="mag">
				Ref
			</Magnetic>,
		);

		const el = screen.getByTestId("mag");
		expect(ref.current).toBe(el);
	});

	it("renders children correctly", () => {
		render(
			<Magnetic data-testid="mag">
				<span data-testid="child">Child element</span>
			</Magnetic>,
		);

		expect(screen.getByTestId("child")).toBeDefined();
		expect(screen.getByTestId("child").textContent).toBe("Child element");
	});
});
