// physical cylinders are diameter 15mm x 10mm
// at 75dpi => 44px x 29px
// stickers: 42x28
// image: 44x? - outline at 1 to 2 - start at 1.5

const fs = require('fs')

function print_lord(output, side, label) {
	let image = fs.readFileSync(label).toString('base64')
	let svg = []
	let bd = '#222'
	let f = 'url(#g)'
	svg.push('<svg xmlns="http://www.w3.org/2000/svg" width="44" height="48">')
	svg.push('<clipPath id="c"><ellipse cx="22" cy="15" rx="20.5" ry="13.5"/></clipPath>')

	svg.push('<linearGradient id="g">')
	if (side === 'york') {
		svg.push('<stop offset="0%" stop-color="#ddd"/>')
		svg.push('<stop offset="40%" stop-color="#fff"/>')
		svg.push('<stop offset="100%" stop-color="#ccc"/>')
		bd = '#555'
	} else {
		svg.push('<stop offset="0%" stop-color="#d33"/>')
		svg.push('<stop offset="40%" stop-color="#f44"/>')
		svg.push('<stop offset="100%" stop-color="#c22"/>')
		bd = '#533'
	}
	svg.push('</linearGradient>')

	svg.push(`<path fill="${f}" stroke="${bd}" d="M1.5 15v18A20.5 13.5 0 0 0 22 46.5 20.5 13.5 0 0 0 42.5 33V15h-41z"/>`)
	svg.push(`<image href="data:image/png;base64,${image}" clip-path="url(#c)" x="1" y="1" width="42" height="28"/>`)
	svg.push(`<ellipse fill="none" stroke="${bd}" cx="22" cy="15" rx="20.5" ry="13.5"/>`)

	svg.push('</svg>')
	fs.writeFileSync(output, svg.join("\n") + "\n")
}

print_lord("images/lord_york_york.svg", "york", "HIRES/sticker/label_0.png")
print_lord("images/lord_york_march.svg", "york", "HIRES/sticker/label_1.png")
print_lord("images/lord_york_salisbury.svg", "york", "HIRES/sticker/label_2.png")
print_lord("images/lord_york_warwick.svg", "york", "HIRES/sticker/label_3.png")
print_lord("images/lord_york_rutland.svg", "york", "HIRES/sticker/label_4.png")
print_lord("images/lord_york_edward_iv.svg", "york", "HIRES/sticker/label_10.png")
print_lord("images/lord_york_pembroke.svg", "york", "HIRES/sticker/label_11.png")
print_lord("images/lord_york_devon.svg", "york", "HIRES/sticker/label_12.png")
print_lord("images/lord_york_northumberland.svg", "york", "HIRES/sticker/label_13.png")
print_lord("images/lord_york_gloucester_1.svg", "york", "HIRES/sticker/label_14.png")
print_lord("images/lord_york_gloucester_2.svg", "york", "HIRES/sticker/label_20.png")
print_lord("images/lord_york_norfolk.svg", "york", "HIRES/sticker/label_21.png")

print_lord("images/lord_lancaster_henry_vi.svg", "lancaster", "HIRES/sticker/label_5.png")
print_lord("images/lord_lancaster_somerset_1.svg", "lancaster", "HIRES/sticker/label_6.png")
print_lord("images/lord_lancaster_exeter.svg", "lancaster", "HIRES/sticker/label_7.png")
print_lord("images/lord_lancaster_buckingham.svg", "lancaster", "HIRES/sticker/label_8.png")
print_lord("images/lord_lancaster_northumberland.svg", "lancaster", "HIRES/sticker/label_9.png")
print_lord("images/lord_lancaster_warwick.svg", "lancaster", "HIRES/sticker/label_15.png")
print_lord("images/lord_lancaster_jasper_tudor.svg", "lancaster", "HIRES/sticker/label_16.png")
print_lord("images/lord_lancaster_clarence.svg", "lancaster", "HIRES/sticker/label_17.png")
print_lord("images/lord_lancaster_margaret.svg", "lancaster", "HIRES/sticker/label_18.png")
print_lord("images/lord_lancaster_oxford.svg", "lancaster", "HIRES/sticker/label_19.png")
print_lord("images/lord_lancaster_henry_tudor.svg", "lancaster", "HIRES/sticker/label_22.png")
print_lord("images/lord_lancaster_somerset_2.svg", "lancaster", "HIRES/sticker/label_26.png")
