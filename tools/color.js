function rgb_to_hsl(rgb, add=0, scale=1) {
	if (typeof rgb === "string") {
		if (rgb[0] === "#")
			rgb = rgb.substring(1)
		rgb = parseInt(rgb, 16)
	}

	let r = ((rgb >> 16) & 255) / 255
	let g = ((rgb >> 8) & 255) / 255
	let b = ((rgb) & 255) / 255
	let cmin = Math.min(r, g, b)
	let cmax = Math.max(r, g, b)
	let delta = cmax - cmin
	let h = 0, s = 0, l = 0

	if (delta == 0)
		h = 0
	else if (cmax == r)
		h = ((g - b) / delta) % 6
	else if (cmax == g)
		h = (b - r) / delta + 2
	else
		h = (r - g) / delta + 4

	h = Math.round(h * 60)

	if (h < 0)
		h += 360

	l = (cmax + cmin) / 2

	s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))

	l = Math.max(0, Math.min(1, l * scale + add))

	s = Math.round(s * 100)
	l = Math.round(l * 100)

	return "hsl(" + h + "," + s + "%," + l + "%)"
}

function foo(sel, rgb) {
	let bg = rgb_to_hsl(rgb, 0.00, 1.00)
	let hi = rgb_to_hsl(rgb, 0.10, 1.00)
	let sh = rgb_to_hsl(rgb, -0.10, 1.00)
	let bd = rgb_to_hsl(rgb, 0.00, 0.33)
	console.log(sel + ` { background-color: ${bg}; border-color: ${hi} ${sh} ${sh} ${hi}; box-shadow: 0 0 0 1px ${bd}, 0px 1px 4px #0008; }`)
}

foo(".mat .background", "#af9770")

foo(".marker.battle", "#91806A")
foo(".marker.campaign", "#406D80")
foo(".marker.levy", "#967348")

foo(".asset.cart.x1", "#DABA8B")
foo(".asset.cart.x2", "#D1A973")
foo(".asset.cart.x3", "#C4975B")
foo(".asset.cart.x4", "#A87A56")
foo(".asset.coin.x1", "#D2D5D4")
foo(".asset.coin.x2", "#BBBCBB")
foo(".asset.coin.x3", "#A5A4A5")
foo(".asset.coin.x4", "#909090")
foo(".asset.prov.x1", "#FFE293")
foo(".asset.prov.x2", "#FFD87D")
foo(".asset.prov.x3", "#FFCD66")
foo(".asset.prov.x4", "#EEB753")
foo(".asset.ship.x1", "#94BEE5")
foo(".asset.ship.x2", "#64A1CE")

foo(".unit.retinue", "#ABABAB")

foo(".marker.cities.york", "#F5F5F5")
foo(".marker.fortresses.york", "#F5F5F5")
foo(".marker.ip.york", "#F5F5F5")
foo(".marker.towns.york", "#F5F5F5")

foo(".marker.cities.lancaster", "#ED2023")
foo(".marker.fortresses.lancaster", "#ED2023")
foo(".marker.ip.lancaster", "#ED2023")
foo(".marker.towns.lancaster", "#ED2023")

foo(".marker.depleted", "#D6D9DB")
foo(".marker.end", "#967348")
foo(".marker.exhausted", "#504B52")
foo(".marker.exile", "#698C3B")
foo(".marker.exile.lancaster", "#FBD3D4")
foo(".marker.exile.york", "#D1DDF1")
foo(".marker.feed.x2", "#0072BC")
foo(".marker.feed.x3", "#006192")
foo(".marker.fled", "#0E0507")
foo(".marker.hits.lancaster", "#FBD3D4")
foo(".marker.hits.york", "#D1DDF1")
foo(".marker.rose.lancaster", "#FBD3D4")
foo(".marker.rose.york", "#D1DDF1")
foo(".marker.source", "#CBBD9E")
foo(".marker.valour", "#995FA7")
foo(".marker.victory_check", "#FCD914")

foo(".marker.moved_fought", "#0072BC")
foo(".marker.number.lancaster", "#FBD3D4")
foo(".marker.number.york", "#FEFEFE")

foo(".marker.seat.lancaster", "#E02027")
foo(".marker.seat.york", "#f5f5f5")

foo(".marker.vassal", "#D1CFA1")
foo(".marker.vassal.back", "#DDDA9F")

foo(".marker.vassal.vassal_hastings", "#D1DDF1")
foo(".marker.vassal.vassal_clifford", "#FBD3D4")
foo(".marker.vassal.vassal_edward", "#FBD3D4")
foo(".marker.vassal.vassal_thomas_stanley", "#FBD3D4")
foo(".marker.vassal.vassal_trollope", "#FBD3D4")

