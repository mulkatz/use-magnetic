import { Magnetic } from "use-magnetic";

export function Hero() {
	return (
		<section className="py-24 text-center">
			<h1 className="text-5xl font-bold tracking-tight text-zinc-50 mb-4">use-magnetic</h1>
			<p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-16">
				Elements that attract toward your cursor. Like on Apple.com and Awwwards sites.
			</p>

			<div className="flex justify-center gap-8 flex-wrap">
				<Magnetic as="button" strength={0.4} range={180} className="magnetic-btn">
					Hover me
				</Magnetic>
				<Magnetic as="button" strength={0.6} range={200} className="magnetic-btn">
					Stronger
				</Magnetic>
				<Magnetic as="button" strength={0.2} range={250} ease={0.05} className="magnetic-btn">
					Smooth
				</Magnetic>
			</div>

			<p className="mt-12 text-sm text-zinc-500">Move your cursor over the buttons above</p>
		</section>
	);
}
