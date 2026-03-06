import { useRef } from "react";
import { useMagnetic } from "use-magnetic";

export function HookDemo() {
	const ref1 = useRef<HTMLDivElement>(null);
	const ref2 = useRef<HTMLDivElement>(null);
	const ref3 = useRef<HTMLDivElement>(null);

	const { isActive: active1 } = useMagnetic(ref1, { strength: 0.3, range: 180 });
	const { isActive: active2 } = useMagnetic(ref2, { strength: 0.4, range: 200 });
	const { isActive: active3 } = useMagnetic(ref3, {
		strength: 0.3,
		range: 200,
		triggerArea: "parent",
	});

	return (
		<section className="py-20">
			<h2 className="text-2xl font-semibold text-zinc-50 mb-3">useMagnetic Hook</h2>
			<p className="text-zinc-400 mb-10 max-w-xl">
				Full control with the hook API. Access{" "}
				<code className="text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded text-sm">isActive</code> to
				react to hover state — scale, glow, or animate however you want.
			</p>

			<div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
				<div className="text-center">
					<div
						ref={ref1}
						className={`w-20 h-20 mx-auto rounded-xl border transition-all duration-200 flex items-center justify-center ${
							active1
								? "bg-zinc-100 border-zinc-100 text-zinc-900 scale-110"
								: "bg-zinc-800 border-zinc-700 text-zinc-400"
						}`}
					>
						<span className="text-sm font-medium">{active1 ? "Active" : "Idle"}</span>
					</div>
					<p className="mt-4 text-xs text-zinc-500">Scale on hover</p>
				</div>

				<div className="text-center">
					<div
						ref={ref2}
						className={`w-20 h-20 mx-auto rounded-full border transition-all duration-200 flex items-center justify-center ${
							active2 ? "bg-zinc-800 border-zinc-500" : "bg-zinc-900 border-zinc-800"
						}`}
					>
						<div
							className={`w-3 h-3 rounded-full transition-all duration-200 ${
								active2 ? "bg-zinc-100 scale-150" : "bg-zinc-600"
							}`}
						/>
					</div>
					<p className="mt-4 text-xs text-zinc-500">Dot indicator</p>
				</div>

				<div className="flex flex-col items-center">
					<div className="w-full max-w-[160px] h-20 rounded-xl border border-zinc-800 bg-zinc-900 flex items-center justify-center">
						<div
							ref={ref3}
							className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
								active3 ? "bg-zinc-100 text-zinc-900" : "bg-zinc-800 text-zinc-400"
							}`}
						>
							Parent trigger
						</div>
					</div>
					<p className="mt-4 text-xs text-zinc-500">triggerArea: &quot;parent&quot;</p>
				</div>
			</div>
		</section>
	);
}
