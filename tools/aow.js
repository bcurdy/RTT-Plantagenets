const fs = require("fs")

let buf = []

let cards = []

let SHIELD_EVT_1 = [ "L17", "L32", "L35", "Y20", "Y24", "Y26", "Y28", "Y29", "Y32", "Y33" ]
let SHIELD_EVT_2 = [ "Y20", "Y26" ]
let SHIELD_CAP_R = [ "L19", "L21", "L23", "L26", "L35", "Y24" ]
let SHIELD_CAP_2 = [ "L20", "L33", "L34", "L35", "Y14", "Y18", "Y19", "Y20", "Y23", "Y30" ]
let SHIELD_CAP_3 = [ "L18", "L19", "L27", "L37", "Y21", "Y31", "L36" ]

function flush_card() {
	function blank() {
		while(buf.length > 0 && buf[0].length === 0)
			buf.shift()
	}

	if (buf.length === 0)
		return

	let number = buf.shift()
	blank()

	let evt_title = buf.shift()
	let evt_subtitle = null
	if (buf[0].length > 0)
		evt_subtitle = buf.shift()
	blank()
	let evt_text = buf.shift()
	blank()

	let cap_title = buf.shift()
	let cap_subtitle = null
	if (buf[0].length > 0)
		cap_subtitle = buf.shift()
	blank()
	let cap_text = buf.shift()
	blank()

	let card = {
		number,
		evt_title, evt_subtitle, evt_text,
		cap_title, cap_subtitle, cap_text
	}

	cards.push(card)
}

function process_line(line) {
	line = line.trim()
	if (/[YL]\d+/.test(line)) {
		flush_card()
		buf = []
	}
	buf.push(line)
}

fs.readFileSync("tools/cards/york.txt", "utf-8").split("\n").forEach(process_line)
fs.readFileSync("tools/cards/lancaster.txt", "utf-8").split("\n").forEach(process_line)
flush_card()



console.log(
`<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<head>
<title>Plantagenet - Arts of War</title>
<link rel="stylesheet" href="/fonts/fonts.css">
<link rel="stylesheet" href="/plantagenet/cards.css">
<style>
body{background-color:dimgray;margin:20px;display:flex;flex-wrap:wrap;gap:20px;}
</style>
</head>
<body>
`)

let out = []
let i = 0
for (let c of cards) {

	if (c.evt_text.startsWith("This Levy "))
		c.evt_text = c.evt_text.replace("This Levy ", "<b>This Levy</b><br>")
	if (c.evt_text.startsWith("This Campaign "))
		c.evt_text = c.evt_text.replace("This Campaign ", "<b>This Campaign</b><br>")
	if (c.evt_text.startsWith("Hold: "))
		c.evt_text = c.evt_text.replace("Hold: ", "<b>Hold:</b> ")
	//c.evt_text = c.evt_text.replaceAll("Richard III", "Richard\xa0III")
	c.evt_text = c.evt_text.replaceAll("'", "\u2019")

	c.cap_text = c.cap_text.replaceAll("'", "\u2019")

	let img = ""
	if (c.number[0] == "Y")
		img = `aow_york_${c.number.substring(1)}.jpg`
	if (c.number[0] == "L")
		img = `aow_lancaster_${c.number.substring(1)}.jpg`

	let xx = c.number[0] === "Y" ? " york" : " lancaster"

	out.push(`<div data-card="${c.number}" class="card aow${xx} c${i++}">`)

	let ec = ""
	if (SHIELD_EVT_1.includes(c.number))
		ec = " sh1"
	if (SHIELD_EVT_2.includes(c.number))
		ec = " sh2"
	out.push(`<div class="event${ec}">`)
	out.push(`<div class="title">${c.evt_title}</div>`)
	if (c.evt_subtitle)
		out.push(`<div class="subtitle">${c.evt_subtitle}</div>`)
	out.push(`<div class="text">${c.evt_text}</div>`)
	out.push(`</div>`)

	let cc = " sh1"
	if (SHIELD_CAP_2.includes(c.number))
		cc = " sh2"
	if (SHIELD_CAP_3.includes(c.number))
		cc = " sh3"
	if (SHIELD_CAP_R.includes(c.number))
		cc += " shr"
	out.push(`<div class="capability${cc}">`)
	out.push(`<div class="title">${c.cap_title}</div>`)
	if (c.cap_subtitle)
		out.push(`<div class="subtitle">${c.cap_subtitle}</div>`)
	out.push(`<div class="text">${c.cap_text}</div>`)
	out.push(`</div>`)

	out.push(`<div class="number">${c.number}</div>`)

	out.push("</div>\n")
}

console.log(out.join(""))
