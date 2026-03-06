import { Magnetic } from "use-magnetic";

const items = Array.from({ length: 12 }, (_, i) => i);

export function Grid() {
	return (
		<section className="py-20">
			<h2 className="text-2xl font-semibold text-zinc-50 mb-3">Grid of Elements</h2>
			<p className="text-zinc-400 mb-10 max-w-xl">
				Apply to any number of elements. Each tracks the cursor independently. Move your cursor
				across the grid.
			</p>

			<div className="grid grid-cols-4 sm:grid-cols-6 gap-4 max-w-lg mx-auto">
				{items.map((i) => (
					<Magnetic
						key={i}
						strength={0.35}
						range={100}
						className="w-14 h-14 rounded-lg bg-zinc-800 border border-zinc-700 mx-auto"
					/>
				))}
			</div>
		</section>
	);
}
