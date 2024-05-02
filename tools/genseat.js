/*
border radius in html/css is given on outer edge (8 * 50/50)
black outline is box-shadow (8 * 52/50)
inner image is 8 * 46/50)
*/

const fs = require('fs')

const PREFIX1 = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="74" height="74">
<clipPath id="a"><path d="M0,0 52,52 0,52z"/></clipPath>
<clipPath id="b"><path d="M0,0 52,52 52,0z"/></clipPath>
<clipPath id="c"><rect transform="translate(11 11) rotate(-45 26 26)" x="3" y="3" width="46" height="46" rx="7.36" ry="7.36"/></clipPath>
<g transform="translate(11 11) rotate(-45 26 26)">
<rect x="0" y="0" width="52" height="52" rx="8.32" ry="8.32" fill="#333"/>`

const L_PREFIX=`
<rect clip-path="url(#a)" x="1" y="1" width="50" height="50" rx="8" ry="8" fill="#b4181e"/>
<rect clip-path="url(#b)" x="1" y="1" width="50" height="50" rx="8" ry="8" fill="#e74b51"/>`

const PREFIX2=`
</g>
<image clip-path="url(#c)" x="4" y="4" width="66" height="66" xlink:href="data:image/png;base64,`

const Y_PREFIX = `
<rect clip-path="url(#a)" x="1" y="1" width="50" height="50" rx="8" ry="8" fill="#dbdbdb"/>
<rect clip-path="url(#b)" x="1" y="1" width="50" height="50" rx="8" ry="8" fill="#ffffff"/>`

const SUFFIX = `"/>
</svg>`

function print_seat(prefix, output, label) {
	let image = fs.readFileSync(label).toString('base64')
	fs.writeFileSync(output, PREFIX1 + prefix + PREFIX2 + image + SUFFIX)
}

print_seat(L_PREFIX, "images/seat_lancaster_buckingham.svg", "images/raw_seat_lancaster_buckingham.png")
print_seat(L_PREFIX, "images/seat_lancaster_clarence.svg", "images/raw_seat_lancaster_clarence.png")
print_seat(L_PREFIX, "images/seat_lancaster_exeter.svg", "images/raw_seat_lancaster_exeter.png")
print_seat(L_PREFIX, "images/seat_lancaster_henry_tudor.svg", "images/raw_seat_lancaster_henry_tudor.png")
print_seat(L_PREFIX, "images/seat_lancaster_henry_vi.svg", "images/raw_seat_lancaster_henry_vi.png")
print_seat(L_PREFIX, "images/seat_lancaster_jasper_tudor.svg", "images/raw_seat_lancaster_jasper_tudor.png")
print_seat(L_PREFIX, "images/seat_lancaster_margaret.svg", "images/raw_seat_lancaster_margaret.png")
print_seat(L_PREFIX, "images/seat_lancaster_northumberland.svg", "images/raw_seat_lancaster_northumberland.png")
print_seat(L_PREFIX, "images/seat_lancaster_oxford.svg", "images/raw_seat_lancaster_oxford.png")
print_seat(L_PREFIX, "images/seat_lancaster_somerset.svg", "images/raw_seat_lancaster_somerset.png")
print_seat(L_PREFIX, "images/seat_lancaster_warwick.svg", "images/raw_seat_lancaster_warwick.png")
print_seat(Y_PREFIX, "images/seat_york_devon.svg", "images/raw_seat_york_devon.png")
print_seat(Y_PREFIX, "images/seat_york_edward_iv.svg", "images/raw_seat_york_edward_iv.png")
print_seat(Y_PREFIX, "images/seat_york_gloucester.svg", "images/raw_seat_york_gloucester.png")
print_seat(Y_PREFIX, "images/seat_york_march.svg", "images/raw_seat_york_march.png")
print_seat(Y_PREFIX, "images/seat_york_norfolk.svg", "images/raw_seat_york_norfolk.png")
print_seat(Y_PREFIX, "images/seat_york_northumberland.svg", "images/raw_seat_york_northumberland.png")
print_seat(Y_PREFIX, "images/seat_york_pembroke.svg", "images/raw_seat_york_pembroke.png")
print_seat(Y_PREFIX, "images/seat_york_rutland.svg", "images/raw_seat_york_rutland.png")
print_seat(Y_PREFIX, "images/seat_york_salisbury.svg", "images/raw_seat_york_salisbury.png")
print_seat(Y_PREFIX, "images/seat_york_warwick.svg", "images/raw_seat_york_warwick.png")
print_seat(Y_PREFIX, "images/seat_york_york.svg", "images/raw_seat_york_york.png")
