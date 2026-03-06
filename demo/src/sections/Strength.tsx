import { useState } from "react";
import { Magnetic } from "use-magnetic";

const presets = [
	{ label: "Subtle", strength: 0.15, range: 150 },
	{ label: "Default", strength: 0.3, range: 200 },
	{ label: "Strong", strength: 0.5, range: 200 },
	{ label: "Intense", strength: 0.8, range: 250 },
] as const;

export function Strength() {
	const [activePreset, setActivePreset] = useState(1);
	const preset = presets[activePreset];

	return (
		<section className="py-20">
			<h2 className="text-2xl font-semibold text-zinc-50 mb-3">Strength & Range</h2>
			<p className="text-zinc-400 mb-10 max-w-xl">
				Control how strongly elements attract and from how far away. Combine{" "}
				<code className="text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded text-sm">strength</code>{" "}
				and <code className="text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded text-sm">range</code>{" "}
				for different feels.
			</p>

			<div className="flex gap-3 mb-10">
				{presets.map((p, i) => (
					<button
						key={p.label}
						type="button"
						onClick={() => setActivePreset(i)}
						className={`px-4 py-2 rounded-lg text-sm transition-colors ${
							i === activePreset
								? "bg-zinc-100 text-zinc-900"
								: "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
						}`}
					>
						{p.label}
					</button>
				))}
			</div>

			<div className="flex justify-center">
				<Magnetic
					as="div"
					strength={preset.strength}
					range={preset.range}
					className="w-32 h-32 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center transition-colors"
				>
					<div className="text-center">
						<p className="text-2xl font-mono text-zinc-100">{preset.strength}</p>
						<p className="text-xs text-zinc-500 mt-1">{preset.range}px range</p>
					</div>
				</Magnetic>
			</div>

			<div className="mt-8 text-center">
				<code className="text-sm text-zinc-500">
					&lt;Magnetic strength={"{"}
					{preset.strength}
					{"}"} range={"{"}
					{preset.range}
					{"}"}&gt;
				</code>
			</div>
		</section>
	);
}
