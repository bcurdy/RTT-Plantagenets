"use strict"

// TODO: show strikers and targets highlighting on battle mat?

function toggle_pieces() {
	document.getElementById("pieces").classList.toggle("hide")
}

// === COMMON LIBRARY ===

function map_has(map, key) {
	let a = 0
	let b = (map.length >> 1) - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = map[m<<1]
		if (key < x)
			b = m - 1
		else if (key > x)
			a = m + 1
		else
			return true
	}
	return false
}

function map_get(map, key, missing) {
	let a = 0
	let b = (map.length >> 1) - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = map[m<<1]
		if (key < x)
			b = m - 1
		else if (key > x)
			a = m + 1
		else
			return map[(m<<1)+1]
	}
	return missing
}

function set_has(set, item) {
	let a = 0
	let b = set.length - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = set[m]
		if (item < x)
			b = m - 1
		else if (item > x)
			a = m + 1
		else
			return true
	}
	return false
}

// === CONSTANTS (matching those in rules.js) ===

function find_lord(name) { return data.lords.findIndex((x) => x.name === name) }
function find_card(name) { return data.cards.findIndex((x) => x.name === name) }

const LORD_YORK = find_lord("York")
const LORD_MARCH = find_lord("March")
const LORD_EDWARD_IV = find_lord("Edward IV")
const LORD_SALISBURY = find_lord("Salisbury")
const LORD_RUTLAND = find_lord("Rutland")
const LORD_PEMBROKE = find_lord("Pembroke")
const LORD_DEVON = find_lord("Devon")
const LORD_NORTHUMBERLAND_Y1 = find_lord("Northumberland Y1")
const LORD_NORTHUMBERLAND_Y2 = find_lord("Northumberland Y2")

const LORD_GLOUCESTER_1 = find_lord("Gloucester 1")
const LORD_GLOUCESTER_2 = find_lord("Gloucester 2")
const LORD_RICHARD_III = find_lord("Richard III")
const LORD_NORFOLK = find_lord("Norfolk")
const LORD_WARWICK_Y = find_lord("Warwick Y")

const LORD_HENRY_VI = find_lord("Henry VI")
const LORD_MARGARET = find_lord("Margaret")
const LORD_SOMERSET_1 = find_lord("Somerset 1")
const LORD_SOMERSET_2 = find_lord("Somerset 2")

const LORD_EXETER_1 = find_lord("Exeter 1")
const LORD_EXETER_2 = find_lord("Exeter 2")

const LORD_BUCKINGHAM = find_lord("Buckingham")
const LORD_CLARENCE = find_lord("Clarence")
const LORD_NORTHUMBERLAND_L = find_lord("Northumberland L")

const LORD_JASPER_TUDOR_1 = find_lord("Jasper Tudor 1")
const LORD_JASPER_TUDOR_2 = find_lord("Jasper Tudor 2")

const LORD_HENRY_TUDOR = find_lord("Henry Tudor")
const LORD_OXFORD = find_lord("Oxford")
const LORD_WARWICK_L = find_lord("Warwick L")

const first_p1_lord = 0
const last_p1_lord = 13
const first_p2_lord = 14
const last_p2_lord = 27

const first_p1_card = 0
const last_p1_card = 36
const first_p2_card = 37
const last_p2_card = 73

const Y1 = find_card("Y1")
const Y2 = find_card("Y2")
const Y3 = find_card("Y3")
const Y4 = find_card("Y4")
const Y5 = find_card("Y5")
const Y6 = find_card("Y6")
const Y7 = find_card("Y7")
const Y8 = find_card("Y8")
const Y9 = find_card("Y9")
const Y10 = find_card("Y10")
const Y11 = find_card("Y11")
const Y12 = find_card("Y12")
const Y13 = find_card("Y13")
const Y14 = find_card("Y14")
const Y15 = find_card("Y15")
const Y16 = find_card("Y16")
const Y17 = find_card("Y17")
const Y18 = find_card("Y18")
const Y19 = find_card("Y19")
const Y20 = find_card("Y20")
const Y21 = find_card("Y21")
const Y22 = find_card("Y22")
const Y23 = find_card("Y23")
const Y24 = find_card("Y24")
const Y25 = find_card("Y25")
const Y26 = find_card("Y26")
const Y27 = find_card("Y27")
const Y28 = find_card("Y28")
const Y29 = find_card("Y29")
const Y30 = find_card("Y30")
const Y31 = find_card("Y31")
const Y32 = find_card("Y32")
const Y33 = find_card("Y33")
const Y34 = find_card("Y34")
const Y35 = find_card("Y35")
const Y36 = find_card("Y36")
const Y37 = find_card("Y37")

const L1 = find_card("L1")
const L2 = find_card("L2")
const L3 = find_card("L3")
const L4 = find_card("L4")
const L5 = find_card("L5")
const L6 = find_card("L6")
const L7 = find_card("L7")
const L8 = find_card("L8")
const L9 = find_card("L9")
const L10 = find_card("L10")
const L11 = find_card("L11")
const L12 = find_card("L12")
const L13 = find_card("L13")
const L14 = find_card("L14")
const L15 = find_card("L15")
const L16 = find_card("L16")
const L17 = find_card("L17")
const L18 = find_card("L18")
const L19 = find_card("L19")
const L20 = find_card("L20")
const L21 = find_card("L21")
const L22 = find_card("L22")
const L23 = find_card("L23")
const L24 = find_card("L24")
const L25 = find_card("L25")
const L26 = find_card("L26")
const L27 = find_card("L27")
const L28 = find_card("L28")
const L29 = find_card("L29")
const L30 = find_card("L30")
const L31 = find_card("L31")
const L32 = find_card("L32")
const L33 = find_card("L33")
const L34 = find_card("L34")
const L35 = find_card("L35")
const L36 = find_card("L36")
const L37 = find_card("L37")


const EVENT_RUSSIAN_BRIDGE = R1
const EVENT_TEUTONIC_BRIDGE = T4
const EVENT_TEUTONIC_FIELD_ORGAN = T10
const AOW_TEUTONIC_TREBUCHETS = T14
const EVENT_RUSSIAN_VALDEMAR = R11
const EVENT_RUSSIAN_DIETRICH_VON_GRUNINGEN = R17

const A1 = 0, A2 = 1, A3 = 2, D1 = 3, D2 = 4, D3 = 5


const RETINUE = 0
const VASSAL = 1
const MERCENARIES = 2
const BURGUNDIANS = 3
const MEN_AT_ARMS = 4
const MILITIA = 5
const LONGBOWMEN = 6
const force_type_count = 7


const force_action_name = [ "Retinue", "Vassal", "Mercenary", "Burgundians", "Men-at-Arms", "Militia", "Longbowmen" ]
const routed_force_action_name = [ "routed_retinue", "routed_vassal", "routed_mercenary", "routed_burgundians", "routed_men_at_arms", "routed_militia", "routed_longbowmen" ]

const COIN = 1
const asset_type_count = 4
const asset_action_name = [ "prov", "coin", "cart", "ship" ]
const asset_type_x3 = [ 1, 1, 1, 0]


const VASSAL_READY = 1
const VASSAL_MUSTERED = 2
const NOWHERE = -1
const CALENDAR = 100


// === ACTIONS ===

function is_action(action, arg) {
	if (arg === undefined)
		return !!(view.actions && view.actions[action] === 1)
	return !!(view.actions && view.actions[action] && set_has(view.actions[action], arg))
}

function on_action(evt) {
	if (evt.button === 0) {
		if (evt.target.my_id === undefined) {
			send_action(evt.target.my_action)
			if (evt.target.my_action_2)
				send_action(evt.target.my_action_2)
		} else {
			send_action(evt.target.my_action, evt.target.my_id)
			if (evt.target.my_action_2)
				send_action(evt.target.my_action_2, evt.target.my_id)
		}
	}
}

function register_action(elt, action, id, action_2) {
	elt.my_id = id
	elt.my_action = action
	elt.my_action_2 = action_2
	elt.onmousedown = on_action
}

// === TOOLTIPS ===

function register_tooltip(elt, focus, blur) {
	if (typeof focus === "function")
		elt.onmouseenter = focus
	else
		elt.onmouseenter = () => on_focus(focus)
	if (blur)
		elt.onmouseleave = blur
	else
		elt.onmouseleave = on_blur
}

function on_focus(text) {
	document.getElementById("status").textContent = text
}

function on_blur() {
	document.getElementById("status").textContent = ""
}

function get_locale_tip(id) {
	let loc = data.locales[id]
	let tip = loc.name
	if (data.seaports.includes(id))
		tip += " - Seaport"
	let list = []
	for (let lord = 0; lord < data.lords.length; ++lord) {
		if (data.lords[lord].seats.includes(id))
			list.push(data.lords[lord].name)
	}
	if (list.length > 0)
		tip += " - " + list.join(", ")
	return tip
}

function is_event_in_play(c) {
	return set_has(view.events, c)
}

function on_focus_cylinder(evt) {
	let lord = evt.target.my_id
	let info = data.lords[lord]
	let loc = view.pieces.locale[lord]
	let tip = info.name

	if (loc >= CALENDAR) {
		tip += ` - ${info.fealty} Fealty`
	}

	on_focus(tip)
}

// === GAME STATE ===

function current_season() {
	return SEASONS[view.turn >> 1]
}

function max_plan_length() {
	switch (current_season()) {
	case SUMMER: return 6
	case EARLY_WINTER: return 4
	case LATE_WINTER: return 4
	case RASPUTITSA: return 5
	}
}

function is_p1_lord(lord) {
	return lord >= first_p1_lord && lord <= last_p1_lord
}

function is_p2_lord(lord) {
	return lord >= first_p2_lord && lord <= last_p2_lord
}

function is_lord_besieged(lord) {
	let besieged = pack1_get(view.pieces.besieged, lord)
	// show sallying lords as not besieged
	if (view.battle && view.battle.array && view.battle.reserves.includes(lord))
		return false
	return besieged
}

function is_lord_on_left_or_right(lord) {
	if (view.battle.array[A1] === lord) return true
	if (view.battle.array[A3] === lord) return true
	if (view.battle.array[D1] === lord) return true
	if (view.battle.array[D3] === lord) return true
	return false
}

function is_lord_ambushed(lord) {
	if (view.battle) {
		// ambush & 2 = attacker played ambush
		// ambush & 1 = defender played ambush
		if (view.battle.attacker === "York") {
			if ((view.battle.ambush & 1) && is_p1_lord(lord))
				return is_lord_on_left_or_right(lord)
			if ((view.battle.ambush & 2) && is_p2_lord(lord))
				return is_lord_on_left_or_right(lord)
		} else {
			if ((view.battle.ambush & 1) && is_p2_lord(lord))
				return is_lord_on_left_or_right(lord)
			if ((view.battle.ambush & 2) && is_p1_lord(lord))
				return is_lord_on_left_or_right(lord)
		}
	}
	return false
}

function get_lord_moved(lord) {
	return pack2_get(view.pieces.moved, lord)
}

function get_lord_forces(lord, n) {
	return pack4_get(view.pieces.forces[lord], n)
}

function count_lord_all_forces(lord) {
	return (
		get_lord_forces(lord, KNIGHTS) +
		get_lord_forces(lord, SERGEANTS) +
		get_lord_forces(lord, LIGHT_HORSE) +
		get_lord_forces(lord, ASIATIC_HORSE) +
		get_lord_forces(lord, MEN_AT_ARMS) +
		get_lord_forces(lord, MILITIA) +
		get_lord_forces(lord, SERFS)
	)
}

function is_p1_locale(loc) {
	return loc >= first_p1_locale && loc <= last_p1_locale
}

function is_p2_locale(loc) {
	return loc >= first_p2_locale && loc <= last_p2_locale
}

function count_vp1() {
	let vp = 0
	return vp
}

function count_vp2() {
	let vp = 0
	return vp
}

function get_lord_locale(lord) {
	return view.pieces.locale[lord]
}

function is_lord_on_map(lord) {
	let loc = get_lord_locale(lord)
	return loc !== NOWHERE && loc < CALENDAR
}

function is_vassal_ready(vassal) {
	return view.pieces.vassals[vassal] === VASSAL_READY
}

function is_vassal_mustered(vassal) {
	return view.pieces.vassals[vassal] === VASSAL_MUSTERED
}

function is_legate_selected() {
	return player === "York" && !!view.pieces.legate_selected
}

function is_levy_phase() {
	return (view.turn & 1) === 0
}

function is_lord_in_battle(lord) {
	if (view.battle && view.battle.array) {
		for (let i = 0; i < 12; ++i)
			if (view.battle.array[i] === lord)
				return true
		if (view.battle.reserves.includes(lord))
			return true
	}
	return false
}

function is_lord_command(ix) {
	return view.command === ix
}

function is_lord_selected(ix) {
	if (view.who >= 0)
		return ix === view.who
	if (view.group)
		return view.group.includes(ix)
	return false
}

function is_town_locale(loc) {
	return data.locales[loc].type === "town"
}

function is_bishopric(loc) {
	return data.locales[loc].type === "bishopric"
}

function has_walls(loc) {
	return set_has(view.pieces.walls, loc)
}

function lord_has_unrouted_units(lord) {
	return view.pieces.forces[lord] !== 0
}

function get_lord_capability(lord, n) {
	return view.pieces.capabilities[(lord << 1) + n]
}

function lord_has_capability_card(lord, c) {
	let name = data.cards[c].capability
	let c1 = get_lord_capability(lord, 0)
	if (c1 >= 0 && data.cards[c1].capability === name)
		return true
	let c2 = get_lord_capability(lord, 1)
	if (c2 >= 0 && data.cards[c2].capability === name)
		return true
	return false
}

function lord_has_capability(lord, card_or_list) {
	if (Array.isArray(card_or_list)) {
		for (let card of card_or_list)
			if (lord_has_capability_card(lord, card))
				return true
		return false
	}
	return lord_has_capability_card(lord, card_or_list)
}

function attacker_has_trebuchets() {
	if (view.battle.attacker === "York") {
		for (let lord = first_p1_lord; lord <= last_p1_lord; ++lord) {
			if (get_lord_locale(lord) === view.battle.where && lord_has_unrouted_units(lord)) {
				if (lord_has_capability(lord, AOW_TEUTONIC_TREBUCHETS))
					return true
			}
		}
	}
	return false
}

function count_siege_markers(loc) {
	return map_get(view.pieces.sieges, loc, 0)
}

// === BUILD UI ===

const original_boxes = {
	"box1": [238,72,103,163],
	"box2": [341,72,103,163],
	"box3": [444,72,99,163],
	"box4": [544,72,103,163],
	"box5": [646,72,104,163],
	"box6": [773,72,102,163],
	"box7": [875,72,102,163],
	"box8": [977,72,102,163],
	"box9": [1079,72,99,163],
	"box10": [1178,72,102,163],
	"box11": [773,296,107,155],
	"box12": [880,296,97,155],
	"box13": [977,296,102,155],
	"box14": [1079,296,114,155],
	"box15": [1192,296,93,155],
	"box16": [1285,296,65,155],
}

const track_boxes = [
	[60,1613,48,48],
	[109,1613,47,48],
	[156,1613,46,48],
	[203,1613,46,48],
	[249,1613,48,48],
	[297,1613,47,48],
	[344,1613,48,48],
	[392,1613,47,48],
	[439,1613,46,48],
	[485,1613,47,48],
	[532,1613,49,49],
	[581,1613,47,49],
	[628,1613,47,49],
	[675,1613,48,49],
	[723,1613,46,48],
	[769,1613,48,48],
	[817,1613,47,48],
	[864,1613,48,48],
	[911,1613,46,48],
	[958,1613,48,48],
	[1006,1613,46,49],
	[1052,1613,48,49],
	[1100,1613,47,49],
	[1147,1613,48,49],
	[1195,1613,46,49],
	[1241,1615,49,47],
	[1241,1568,49,47],
	[1241,1472,49,47],
	[1241,1426,49,46],
	[1241,1378,49,48],
	[1241,1330,49,48],
	[1241,1282,49,48],
	[1241,1236,49,46],
	[1241,1189,49,47],
	[1241,1142,49,47],
	[1241,1095,49,46],
	[1241,1048,49,47],
	[1241,998,49,50],
	[1241,952,47,46],
	[1241,903,47,48],
	[1241,857,47,46],
	[1241,812,51,45],
	[1241,762,51,50],
	[1241,714,51,48],
	[1241,668,47,46],
]

const track_xy = track_boxes.map(([x,y,w,h])=>[x+w/2,y+h/2])

const calendar_xy = []
const locale_xy = []

let expand_calendar = -1

const ui = {
	locale: [],
	locale_name: [],
	locale_markers: [],
	lord_cylinder: [],
	lord_mat: [],
	lord_buttons: [],
	vassal_service: [],
	forces: [],
	routed: [],
	assets: [],
	ready_vassals: [],
	mustered_vassals: [],
	lord_capabilities: [],
	lord_events: [],
	lord_moved1: [],
	lord_moved2: [],
	lord_feed_x2: [],
	cards: [],
	calendar: [],

	plan_panel: document.getElementById("plan_panel"),
	plan: document.getElementById("plan"),
	plan_actions: document.getElementById("plan_actions"),
	plan_cards: [],
	plan_action_cards: [],

	arts_of_war_panel: document.getElementById("arts_of_war_panel"),
	arts_of_war: document.getElementById("arts_of_war"),

	reserves_panel: document.getElementById("reserves_panel"),
	reserves: document.getElementById("reserves"),

	events_panel: document.getElementById("events_panel"),
	events: document.getElementById("events"),

	hand_panel: document.getElementById("hand_panel"),
	hand: document.getElementById("hand"),

	held1: document.querySelector("#role_York .role_held"),
	held2: document.querySelector("#role_Lancaster .role_held"),

	command: document.getElementById("command"),
	turn: document.getElementById("turn"),
	vp1: document.getElementById("vp1"),
	vp2: document.getElementById("vp2"),
	court1_header: document.getElementById("court1_header"),
	court2_header: document.getElementById("court2_header"),
	court1: document.getElementById("court1"),
	court2: document.getElementById("court2"),
	battle_panel: document.getElementById("battle_panel"),
	battle_header: document.getElementById("battle_header"),
	pursuit: document.getElementById("pursuit"),
	battle_grid: document.getElementById("battle_grid"),
	battle_grid_array: [
		document.getElementById("grid_a1"),
		document.getElementById("grid_a2"),
		document.getElementById("grid_a3"),
		document.getElementById("grid_d1"),
		document.getElementById("grid_d2"),
		document.getElementById("grid_d3"),
	],
}

let locale_layout = []
let calendar_layout_service = []
let calendar_layout_cylinder = []

function clean_name(name) {
	return name.toLowerCase().replaceAll("&", "and").replaceAll(" ", "_")
}

function build_div(parent, className) {
	let e = document.createElement("div")
	e.className = className
	if (parent)
		parent.appendChild(e)
	return e
}

function build_lord_mat(lord, ix, side, name) {
	let mat = build_div(null, `mat ${side} ${name}`)
	let bg = build_div(mat, "background")
	ui.forces[ix] = build_div(bg, "forces")
	ui.routed[ix] = build_div(bg, "routed")
	ui.assets[ix] = build_div(bg, "assets")
	ui.ready_vassals[ix] = build_div(bg, "ready_vassals")
	ui.mustered_vassals[ix] = build_div(bg, "mustered_vassals")
	ui.lord_buttons[ix] = build_div(bg, "shield")
	ui.lord_capabilities[ix] = build_div(mat, "capabilities")
	ui.lord_events[ix] = build_div(mat, "events")
	ui.lord_moved1[ix] = build_div(mat, "marker square moved_fought one hide")
	ui.lord_moved2[ix] = build_div(mat, "marker square moved_fought two hide")
	ui.lord_feed_x2[ix] = build_div(mat, "marker small feed_x2")
	ui.lord_mat[ix] = mat
	register_action(ui.lord_buttons[ix], "lord", ix)
}

function build_card(side, c) {
	let card = ui.cards[c] = document.createElement("div")
	card.className = `card ${side} aow_${c}`
	register_action(card, "card", c)
}

function build_plan() {
	let elt
	for (let i = 0; i < 6; ++i) {
		elt = document.createElement("div")
		elt.className = "hide"
		ui.plan_cards.push(elt)
		ui.plan.appendChild(elt)
	}
	for (let lord = 0; lord < 24; ++lord) {
		let side = lord < 12 ? "york" : "lancaster"
		elt = document.createElement("div")
		elt.className = `card ${side} cc_lord_${lord}`
		register_action(elt, "plan", lord)
		ui.plan_action_cards.push(elt)
		ui.plan_actions.appendChild(elt)
	}

	ui.plan_action_pass_p1 = elt = document.createElement("div")
	elt.className = `card york cc_pass`
	register_action(elt, "plan", -1)
	ui.plan_actions.appendChild(elt)

	ui.plan_action_pass_p2 = elt = document.createElement("div")
	elt.className = `card lancaster cc_pass`
	register_action(elt, "plan", -1)
	ui.plan_actions.appendChild(elt)
}

const locale_size = {
	town: [ 100, 100 ],
	city: [ 100, 100 ],
	fortress: [ 100, 100 ],
	harlech: [ 100, 100 ],
	calais: [ 100, 100 ],
	london: [ 150, 150 ],
	exile: [ 150, 200 ],
	sea: [ 100, 100 ],
}

function build_map() {
	for (let i = 0; i < data.locales.length; ++i)
		locale_layout[i] = []

	data.locales.forEach((locale, ix) => {
		let region = clean_name(locale.region)
		let { x, y, w, h } = locale.box
		console.log("LOC", locale, ix, x, y, w, h)
		let xc = Math.round(x + w / 2)
		let yc = Math.round(y + h / 2)
		let e

		locale_xy[ix] = [ xc, yc ]

		// Main Area
		e = ui.locale[ix] = document.createElement("div")
		e.className = "locale " + locale.type + " " + region
		e.style.left = x + "px"
		e.style.top = y + "px"
		e.style.width = w + "px"
		e.style.height = h + "px"
		register_action(e, "locale", ix, "laden_march")
		register_tooltip(e, get_locale_tip(ix))
		document.getElementById("locales").appendChild(e)

		// Locale Markers
		e = ui.locale_markers[ix] = document.createElement("div")
		e.className = "locale_markers " + locale.type + " " + region
		x = locale_xy[ix][0] - 196/2
		y = locale_xy[ix][1] + 36
		e.style.top = y + "px"
		e.style.left = x + "px"
		e.style.width = 196 + "px"
		document.getElementById("pieces").appendChild(e)
	})

	data.lords.forEach((lord, ix) => {
		let e = ui.lord_cylinder[ix] = document.createElement("div")
		e.className = "cylinder lord " + clean_name(lord.side) + " " + clean_name(lord.name) + " hide"
		register_action(e, "lord", ix)
		register_tooltip(e, on_focus_cylinder)
		document.getElementById("pieces").appendChild(e)

		build_lord_mat(lord, ix, clean_name(lord.side), clean_name(lord.name))
	})

	data.vassals.forEach((vassal, ix) => {
		let e = ui.vassal_service[ix] = document.createElement("div")
		e.className = "vassal v" + ix
		register_action(e, "vassal", ix)
		register_tooltip(e, data.vassals[ix].name)
		document.getElementById("pieces").appendChild(e)
	})

	for (let i = 1; i <= 16; ++i) {
		let name = "box" + i
		let x = original_boxes[name][0]
		let y = original_boxes[name][1]
		let w = original_boxes[name][2] - 8
		let h = original_boxes[name][3] - 8
		calendar_xy[i] = [ x + w / 2, y + h / 2 ]
		let e = ui.calendar[i] = document.createElement("div")
		e.className = "calendar box " + name
		e.style.left = x + "px"
		e.style.top = y + "px"
		e.style.width = w + "px"
		e.style.height = h + "px"
		document.getElementById("boxes").appendChild(e)
	}

	for (let i = 1; i <= 16; ++i)
		register_action(ui.calendar[i], "calendar", i)

	build_plan()

	for (let i = 0; i < 6; ++i)
		register_action(ui.battle_grid_array[i], "array", i)

	for (let c = first_p1_card; c <= last_p1_card; ++c)
		build_card("york", c)
	for (let c = first_p2_card; c <= last_p2_card; ++c)
		build_card("lancaster", c)
}

// === UPDATE UI ===

let used_cache = {}
let unused_cache = {}

function get_cached_element(className, action, id) {
	let key = className
	if (action !== undefined)
		key += "/" + action + "/" + id
	if (!(key in unused_cache)) {
		unused_cache[key] = []
		used_cache[key] = []
	}
	if (unused_cache[key].length > 0) {
		let elt = unused_cache[key].pop()
		used_cache[key].push(elt)
		return elt
	}
	let elt = document.createElement("div")
	elt.className = className
	used_cache[key].push(elt)
	if (action !== undefined)
		register_action(elt, action, id)
	return elt
}

function restart_cache() {
	for (let k in used_cache) {
		let u = used_cache[k]
		let uu = unused_cache[k]
		while (u.length > 0)
			uu.push(u.pop())
	}
}

function update_current_card_display() {
	if (typeof view.what === "number" && view.what >= 0) {
		if (view.what <= first_p1_card)
			ui.command.className = `card york aow_${view.what}`
		else
			ui.command.className = `card lancaster aow_${view.what}`
	} else if ((view.turn & 1) === 0) {
		if (player === "Lancaster")
			ui.command.className = `card lancaster aow_back`
		else
			ui.command.className = `card york aow_back`
	} else if (view.command < 0) {
		if (player === "Lancaster")
			ui.command.className = `card lancaster cc_back`
		else
			ui.command.className = `card york cc_back`
	} else {
		if (view.command < 6)
			ui.command.className = `card lancaster cc_lord_${view.command}`
		else
			ui.command.className = `card york cc_lord_${view.command}`
	}
}

function layout_locale_item(loc, e, is_upper) {
	locale_layout[loc].push([e, is_upper])
}

function layout_locale_cylinders(loc) {
	let [xc, yc] = locale_xy[loc]

	let n = 0
	for (let [e,is_upper] of locale_layout[loc])
		if (!is_upper)
			++n

	let wrap = 3
	switch (data.locales[loc].type) {
	case "region": wrap = 2; break
	case "town": wrap = 2; break
	case "novgorod": wrap = 4; break
	}

	let m = Math.floor((n-1) / wrap)
	let i = 0
	let k = 0
	for (let [e,is_upper] of locale_layout[loc]) {
		let nn = n
		if (nn > wrap)
			nn = wrap
		let x = xc + (i - (nn-1)/2) * 44 + k * 22
		let y = yc + (k * 32) - m * 32
		let z = 1
		if (is_upper) {
			y -= 18
			z = 2
		}
		if (e === ui.legate) {
			y -= 16
			z = 3
		}
		e.style.top = (y - 23) + "px"
		e.style.left = (x - 23) + "px"
		e.style.zIndex = z
		if (!is_upper)
			++i
		if (i >= wrap) {
			i = 0
			++k
		}
	}
}

function layout_calendar() {
	for (let loc = 1; loc <= 16; ++loc) {
		let [cx, cy] = calendar_xy[loc]
		let list = calendar_layout_service[loc]
		for (let i = 0; i < list.length; ++i) {
			let e = list[i]
			let x = cx, y = cy, z = 60 - i
			let d = 46 - 24
			if (loc === expand_calendar) {
				d = 46
				z += 100
			}
			if (loc === 0) {
				x += -6 + 46 * i
				z = 1
			} else if (loc === 17) {
				x += 60 - 46 * i
				z = 60 - i
			} else {
				x += (146 - 94 - 2)
				y += (227 - 46 - 2) - i * d
			}
			e.style.top = y + "px"
			e.style.left = x + "px"
			e.style.zIndex = z
		}

		list = calendar_layout_cylinder[loc]
		for (let i = 0; i < list.length; ++i) {
			let e = list[i]
			let x = cx, y = cy, z = 61
			if (loc === 0) {
				let k = calendar_layout_service[0].length
				if (k > 0)
					x += k * 46 + 46 + i * 46
				else
					x += 0 + i * 46
			} else if (loc === 17) {
				let k = calendar_layout_service[17].length
				if (k > 0)
					x += 60 - k * 46 - i * 46
				else
					x += 60 + i * 46
			} else if (loc === 1) {
				x += 46 + (i%2) * 46 + (i/2|0) * 12
				y += 66 + (i/2|0) * 36
			} else {
				x += 6 + (i%3) * 46 + (i/3|0) * 24
				y += 66 + (i/3|0) * 36
			}
			e.style.top = y + "px"
			e.style.left = x + "px"
			e.style.zIndex = z
		}
	}
}

function add_force(parent, type, lord, routed) {
	let elt
	if (routed) {
		if (is_action(routed_force_action_name[type], lord))
			elt = get_cached_element("action unit " + force_action_name[type], routed_force_action_name[type], lord)
		else
			elt = get_cached_element("unit " + force_action_name[type], routed_force_action_name[type], lord)
	} else {
		if (is_action(force_action_name[type], lord))
			elt = get_cached_element("action unit " + force_action_name[type], force_action_name[type], lord)
		else
			elt = get_cached_element("unit " + force_action_name[type], force_action_name[type], lord)
	}
	parent.appendChild(elt)
}

function add_asset(parent, type, n, lord) {
	let elt
	if (is_action(asset_action_name[type], lord))
		elt = get_cached_element("action asset " + asset_action_name[type] + " x"+n, asset_action_name[type], lord)
	else
		elt = get_cached_element("asset " + asset_action_name[type] + " x"+n)
	parent.appendChild(elt)
}

function update_forces(parent, forces, lord_ix, routed) {
	parent.replaceChildren()
	for (let i = 0; i < force_type_count; ++i) {
		let n = pack4_get(forces, i)
		for (let k = 0; k < n; ++k) {
			add_force(parent, i, lord_ix, routed)
		}
	}
}

function update_assets(id, parent, assets) {
	parent.replaceChildren()
	for (let i = 0; i < asset_type_count; ++i) {
		let n = pack4_get(assets, i)
		while (n >= 4) {
			add_asset(parent, i, 4, id)
			n -= 4
		}
		if (asset_type_x3[i]) {
			while (n >= 3) {
				add_asset(parent, i, 3, id)
				n -= 3
			}
		}
		while (n >= 2) {
			add_asset(parent, i, 2, id)
			n -= 2
		}
		while (n >= 1) {
			add_asset(parent, i, 1, id)
			n -= 1
		}
	}
}

function update_vassals(ready_parent, mustered_parent, lord_ix) {
	/* TODO: vassals currently with lord
	for (let v of data.lords[lord_ix].vassals) {
		let e = ui.vassal_service[v]
		if (is_vassal_ready(v)) {
			e.classList.remove("hide")
			ready_parent.appendChild(e)
		}
		else if (is_vassal_mustered(v)) {
			e.classList.remove("hide")
			mustered_parent.appendChild(e)
		}
		else {
			e.classList.add("hide")
		}
		e.classList.toggle("action", is_action("vassal", v))
	}
	*/
}

function update_lord_mat(ix) {
	if (view.reveal & (1 << ix)) {
		ui.lord_mat[ix].classList.remove("hidden")
		update_assets(ix, ui.assets[ix], view.pieces.assets[ix])
		update_vassals(ui.ready_vassals[ix], ui.mustered_vassals[ix], ix)
		update_forces(ui.forces[ix], view.pieces.forces[ix], ix, false)
		update_forces(ui.routed[ix], view.pieces.routed[ix], ix, true)
		ui.lord_feed_x2[ix].classList.toggle("hide", count_lord_all_forces(ix) <= 6)
	} else {
		ui.lord_mat[ix].classList.add("hidden")
		ui.assets[ix].replaceChildren()
		ui.ready_vassals[ix].replaceChildren()
		ui.mustered_vassals[ix].replaceChildren()
		ui.forces[ix].replaceChildren()
		ui.routed[ix].replaceChildren()
		ui.lord_moved1[ix].classList.add("hide")
		ui.lord_moved2[ix].classList.add("hide")
		ui.lord_feed_x2[ix].classList.add("hide")
	}
	let m = get_lord_moved(ix)
	ui.lord_moved1[ix].classList.toggle("hide", is_levy_phase() || (m !== 1 && m !== 2))
	ui.lord_moved2[ix].classList.toggle("hide", is_levy_phase() || (m !== 2))
}

function update_lord(ix) {
	let locale = view.pieces.locale[ix]
	if (locale < 0) {
		ui.lord_cylinder[ix].classList.add("hide")
		ui.lord_mat[ix].classList.remove("action")
		return
	}
	if (locale < 100) {
		layout_locale_item(locale, ui.lord_cylinder[ix])
		ui.lord_cylinder[ix].classList.remove("hide")
		update_lord_mat(ix)
	} else {
		let t = locale - 100
		if (t > 17) t = 17
		calendar_layout_cylinder[t].push(ui.lord_cylinder[ix])
		ui.lord_cylinder[ix].classList.remove("hide")
	}
	ui.lord_cylinder[ix].classList.toggle("besieged", is_lord_besieged(ix))
	ui.lord_buttons[ix].classList.toggle("action", is_action("lord", ix))
	ui.lord_cylinder[ix].classList.toggle("action", is_action("lord", ix))

	ui.lord_cylinder[ix].classList.toggle("selected", is_lord_selected(ix))
	ui.lord_mat[ix].classList.toggle("selected", is_lord_selected(ix))

	ui.lord_cylinder[ix].classList.toggle("command", is_lord_command(ix))
	ui.lord_mat[ix].classList.toggle("command", is_lord_command(ix))

	ui.lord_mat[ix].classList.toggle("besieged", is_lord_besieged(ix))
	ui.lord_mat[ix].classList.toggle("ambushed", is_lord_ambushed(ix))
}

function update_locale(loc) {
	layout_locale_cylinders(loc)

	ui.locale[loc].classList.toggle("action", is_action("locale", loc) || is_action("laden_march", loc))
	ui.locale[loc].classList.toggle("laden", is_action("laden_march", loc))
	ui.locale[loc].classList.toggle("supply_path", !!(view.supply && view.supply[0] === loc))
	ui.locale[loc].classList.toggle("supply_source", !!(view.supply && view.supply[1] === loc))
	if (ui.locale_name[loc]) {
		ui.locale_name[loc].classList.toggle("action", is_action("locale", loc) || is_action("laden_march", loc))
	}

	ui.locale_markers[loc].replaceChildren()

	if (view.battle && view.battle.where === loc)
		if (view.battle.storm)
			ui.locale_markers[loc].appendChild(get_cached_element("marker circle storm"))
		else
			ui.locale_markers[loc].appendChild(get_cached_element("marker circle battle"))

	if (set_has(view.pieces.exhausted, loc)) {
		let cn
		if (is_p1_locale(loc))
			cn = "marker small exhausted lancaster"
		else
			cn = "marker small exhausted york"
		ui.locale_markers[loc].appendChild(get_cached_element(cn))
	}
}

function update_plan() {
	if (view.plan) {
		let is_planning = view.actions && view.actions.plan

		ui.plan_panel.classList.remove("hide")
		for (let i = 0; i < 6; ++i) {
			if (i < view.plan.length) {
				let lord = view.plan[i]
				if (lord < 0) {
					if (player === "York")
						ui.plan_cards[i].className = "card york cc_pass"
					else
						ui.plan_cards[i].className = "card lancaster cc_pass"
				} else {
					if (lord < 6)
						ui.plan_cards[i].className = "card york cc_lord_" + lord
					else
						ui.plan_cards[i].className = "card lancaster cc_lord_" + lord
				}
			} else if (is_planning && i < max_plan_length()) {
				if (player === "York")
					ui.plan_cards[i].className = "card york cc_back"
				else
					ui.plan_cards[i].className = "card lancaster cc_back"
			} else {
				ui.plan_cards[i].className = "hide"
			}
		}

		if (is_planning) {
			ui.plan_actions.classList.remove("hide")
			for (let lord = 0; lord < 12; ++lord) {
				if (is_action("plan", lord)) {
					ui.plan_action_cards[lord].classList.add("action")
					ui.plan_action_cards[lord].classList.remove("disabled")
				} else {
					ui.plan_action_cards[lord].classList.remove("action")
					ui.plan_action_cards[lord].classList.add("disabled")
				}
			}
			if (is_action("plan", -1)) {
				ui.plan_action_pass_p1.classList.add("action")
				ui.plan_action_pass_p1.classList.remove("disabled")
				ui.plan_action_pass_p2.classList.add("action")
				ui.plan_action_pass_p2.classList.remove("disabled")
			} else {
				ui.plan_action_pass_p1.classList.remove("action")
				ui.plan_action_pass_p1.classList.add("disabled")
				ui.plan_action_pass_p2.classList.remove("action")
				ui.plan_action_pass_p2.classList.add("disabled")
			}
		} else {
			ui.plan_actions.classList.add("hide")
		}
	} else {
		ui.plan_panel.classList.add("hide")
	}
}

function update_cards() {
	for (let c = 0; c < 42; ++c) {
		let elt = ui.cards[c]
		elt.classList.toggle("selected", c === view.what)
		elt.classList.toggle("action", is_action("card", c))
	}

	if (view.arts_of_war) {
		ui.arts_of_war_panel.classList.remove("hide")
		ui.arts_of_war.replaceChildren()
		for (let c of view.arts_of_war)
			ui.arts_of_war.appendChild(ui.cards[c])
	} else {
		ui.arts_of_war_panel.classList.add("hide")
	}

	if (view.events.length > 0) {
		ui.events_panel.classList.remove("hide")
		ui.events.replaceChildren()
		for (let c of view.events)
			ui.events.appendChild(ui.cards[c])
	} else {
		ui.events_panel.classList.add("hide")
	}

	if (view.hand && view.hand.length > 0) {
		ui.hand_panel.classList.remove("hide")
		ui.hand.replaceChildren()
		if (view.hand) {
			for (let c of view.hand)
				ui.hand.appendChild(ui.cards[c])
		}
	} else {
		ui.hand_panel.classList.add("hide")
	}

	for (let ix = 0; ix < data.lords.length; ++ix) {
		ui.lord_capabilities[ix].replaceChildren()
		ui.lord_events[ix].replaceChildren()
		if (view.reveal & (1 << ix)) {
			let c = view.pieces.capabilities[(ix << 1) + 0]
			if (c >= 0)
				ui.lord_capabilities[ix].appendChild(ui.cards[c])
			c = view.pieces.capabilities[(ix << 1) + 1]
			if (c >= 0)
				ui.lord_capabilities[ix].appendChild(ui.cards[c])
			if (view.battle && view.battle.field_organ === ix)
				ui.lord_events[ix].appendChild(ui.cards[EVENT_TEUTONIC_FIELD_ORGAN])
			if (view.battle && view.battle.bridge && view.battle.bridge.lord1 === ix)
				ui.lord_events[ix].appendChild(ui.cards[EVENT_RUSSIAN_BRIDGE])
			if (view.battle && view.battle.bridge && view.battle.bridge.lord2 === ix)
				ui.lord_events[ix].appendChild(ui.cards[EVENT_TEUTONIC_BRIDGE])
		}
	}
}

function update_battle() {
	let array = view.battle.array

	// Pursuit marker points "up" towards the conceding side
	if (view.battle.conceded === "Lancaster") {
		if (view.battle.attacker === "Lancaster")
			ui.pursuit.className = "marker rectangle pursuit york"
		else
			ui.pursuit.className = "marker rectangle pursuit york rotate"
	} else if (view.battle.conceded === "York") {
		if (view.battle.attacker === "York")
			ui.pursuit.className = "marker rectangle pursuit lancaster"
		else
			ui.pursuit.className = "marker rectangle pursuit lancaster rotate"
	} else {
		ui.pursuit.className = "hide"
	}

	for (let i = 0; i < array.length; ++i) {
		let lord = array[i]
		ui.battle_grid_array[i].replaceChildren()
		if (lord >= 0)
			ui.battle_grid_array[i].appendChild(ui.lord_mat[lord])
		ui.battle_grid_array[i].classList.toggle("action", is_action("array", i))
	}

	ui.reserves.replaceChildren()
	for (let lord of view.battle.reserves)
		ui.reserves.appendChild(ui.lord_mat[lord])
}

function update_court() {
	let tcourt_hdr = (player === "Lancaster") ? ui.court2_header : ui.court1_header
	let rcourt_hdr = (player === "Lancaster") ? ui.court1_header : ui.court2_header
	tcourt_hdr.textContent = "York Lords"
	rcourt_hdr.textContent = "Lancaster Lords"
	let tcourt = (player === "Lancaster") ? ui.court2 : ui.court1
	let rcourt = (player === "Lancaster") ? ui.court1 : ui.court2
	tcourt.replaceChildren()
	rcourt.replaceChildren()
	for (let lord = 0; lord < 6; ++lord)
		if (!is_lord_in_battle(lord) && is_lord_on_map(lord))
			tcourt.appendChild(ui.lord_mat[lord])
	for (let lord = 6; lord < 12; ++lord)
		if (!is_lord_in_battle(lord) && is_lord_on_map(lord))
			rcourt.appendChild(ui.lord_mat[lord])
}

function on_update() {
	restart_cache()

	for (let i = 0; i < 18; ++i) {
		calendar_layout_cylinder[i] = []
		calendar_layout_service[i] = []
	}

	for (let i = 0; i < data.locales.length; ++i)
		locale_layout[i].length = 0

	for (let ix = 0; ix < data.lords.length; ++ix) {
		if (view.pieces.locale[ix] < 0) {
			ui.lord_cylinder[ix].classList.add("hide")
		} else {
			ui.lord_cylinder[ix].classList.remove("hide")
			update_lord(ix)
		}
	}

	layout_calendar()

	for (let loc = 0; loc < data.locales.length; ++loc)
		update_locale(loc)

	update_current_card_display()

	if (view.turn & 1)
		ui.turn.className = `marker circle turn campaign t${view.turn>>1}`
	else
		ui.turn.className = `marker circle turn levy t${view.turn>>1}`

	let vp1 = count_vp1()
	let vp2 = count_vp2()
	if ((vp1 >> 1) === (vp2 >> 1)) {
		if (vp1 & 1)
			ui.vp1.className = `marker circle victory york stack v${vp1>>1} half`
		else
			ui.vp1.className = `marker circle victory york stack v${vp1>>1}`
		if (vp2 & 1)
			ui.vp2.className = `marker circle victory lancaster stack v${vp2>>1} half`
		else
			ui.vp2.className = `marker circle victory lancaster stack v${vp2>>1}`
	} else {
		if (vp1 & 1)
			ui.vp1.className = `marker circle victory york v${vp1>>1} half`
		else
			ui.vp1.className = `marker circle victory york v${vp1>>1}`
		if (vp2 & 1)
			ui.vp2.className = `marker circle victory lancaster v${vp2>>1} half`
		else
			ui.vp2.className = `marker circle victory lancaster v${vp2>>1}`
	}

	ui.held1.textContent = `${view.held1} Held`
	ui.held2.textContent = `${view.held2} Held`

	update_plan()
	update_cards()

	if (view.battle && view.battle.array) {
		ui.reserves_panel.classList.remove("hide")
		ui.battle_panel.classList.remove("hide")
		if (view.battle.storm)
			ui.battle_header.textContent = "Storm at " + data.locales[view.battle.where].name
		else if (view.battle.sally)
			ui.battle_header.textContent = "Sally at " + data.locales[view.battle.where].name
		else
			ui.battle_header.textContent = "Battle at " + data.locales[view.battle.where].name
		if (view.battle.attacker === player) {
			ui.battle_grid.className = "attacker"
		} else {
			ui.battle_grid.className = "defender"
		}
		update_battle()
	} else {
		ui.battle_panel.classList.add("hide")
	}

	if (view.battle && view.battle.array && view.battle.reserves.length > 0)
		ui.reserves_panel.classList.remove("hide")
	else
		ui.reserves_panel.classList.add("hide")

	update_court()

	// Misc
	action_button("lordship", "Lordship")
	action_button("march", "March")
	action_button("avoid", "Avoid Battle")
	action_button("withdraw", "Withdraw")
	action_button("retreat", "Retreat")
	action_button("remove", "Remove")
	action_button("surrender", "Surrender")
	action_button("siegeworks", "Siegeworks")
	action_button("boats_x2", "Boats x2")

	// Use all commands
	action_button("use_legate", "Legate")
	action_button("stonemasons", "Stonemasons")
	action_button("stone_kremlin", "Stone Kremlin")
	action_button("tax", "Tax")
	action_button("siege", "Siege")

	// Use one command
	action_button("smerdi", "Smerdi")
	action_button("storm", "Storm")
	action_button("sally", "Sally")
	action_button("sail", "Sail")
	action_button("ravage", "Ravage")
	action_button("forage", "Forage")
	action_button("supply", "Supply")

	// Muster & Spoils
	action_button("take_prov", "Provender")
	action_button("take_loot", "Loot")
	action_button("take_coin", "Coin")
	action_button("take_ship", "Ship")
	action_button("take_boat", "Boat")
	action_button("take_cart", "Cart")
	action_button("take_sled", "Sled")
	action_button("capability", "Capability")

	// Events
	action_button("decline", "Decline")
	action_button("deploy", "Deploy")
	action_button("discard", "Discard")
	action_button("hold", "Hold")
	action_button("play", "Play")

	action_button("approach", "Approach")
	action_button("concede", "Concede")
	action_button("battle", "Battle")

	action_button("end_array", "End Array")
	action_button("end_avoid_battle", "End Avoid Battle")
	action_button("end_call_to_arms", "End Call to Arms")
	action_button("end_command", "End Command")
	action_button("end_disband", "End Disband")
	action_button("end_discard", "End Discard")
	action_button("end_feed", "End Feed")
	action_button("end_growth", "End Growth")
	action_button("end_levy", "End Levy")
	action_button("end_muster", "End Muster")
	action_button("end_pay", "End Pay")
	action_button("end_plan", "End Plan")
	action_button("end_plow_and_reap", "End Plow and Reap")
	action_button("end_ransom", "End Ransom")
	action_button("end_remove", "End Remove")
	action_button("end_reposition", "End Reposition")
	action_button("end_sack", "End Sack")
	action_button("end_sally", "End Sally")
	action_button("end_setup", "End Setup")
	action_button("end_spoils", "End Spoils")
	action_button("end_supply", "End Supply")
	action_button("end_wastage", "End Wastage")
	action_button("end_withdraw", "End Withdraw")

	action_button("pass", "Pass")
	action_button("done", "Done")
	action_button("undo", "Undo")
}

// === LOG ===

function on_focus_card_tip(c) {
	if (c <= first_p1_card)
		ui.command.className = `card york aow_${c}`
	else
		ui.command.className = `card lancaster aow_${c}`
}

function on_blur_card_tip() {
	update_current_card_display()
}

function sub_card_capability(match, p1) {
	let x = p1 | 0
	return `<span class="card_tip" onmouseenter="on_focus_card_tip(${x})" onmouseleave="on_blur_card_tip(${x})">${data.cards[x].capability}</span>`
}

function sub_card_event(match, p1) {
	let x = p1 | 0
	return `<span class="card_tip" onmouseenter="on_focus_card_tip(${x})" onmouseleave="on_blur_card_tip(${x})">${data.cards[x].event}</span>`
}

function on_focus_locale_tip(loc) {
	ui.locale[loc].classList.add("tip")
	if (ui.locale_name[loc])
		ui.locale_name[loc].classList.add("tip")
}

function on_blur_locale_tip(loc) {
	ui.locale[loc].classList.remove("tip")
	if (ui.locale_name[loc])
		ui.locale_name[loc].classList.remove("tip")
}

function on_click_locale_tip(loc) {
	ui.locale[loc].scrollIntoView({ block:"center", inline:"center", behavior:"smooth" })
}

function on_click_lord_tip(lord) {
	ui.lord_mat[lord].scrollIntoView({ block:"center", inline:"center", behavior:"smooth" })
}

function sub_locale_name(match, p1) {
	let x = p1 | 0
	let n = data.locales[x].name
	return `<span class="locale_tip" onmouseenter="on_focus_locale_tip(${x})" onmouseleave="on_blur_locale_tip(${x})" onclick="on_click_locale_tip(${x})">${n}</span>`
}

function sub_lord_name(match, p1) {
	let x = p1 | 0
	let n = data.lords[x].name
	return `<span class="lord_tip" onclick="on_click_lord_tip(${x})">${n}</span>`
}

function on_log(text) {
	let p = document.createElement("div")

	if (text.match(/^>>/)) {
                text = text.substring(2)
                p.className = "ii"
        }

	if (text.match(/^>/)) {
                text = text.substring(1)
                p.className = "i"
        }

	text = text.replace(/&/g, "&amp;")
	text = text.replace(/</g, "&lt;")
	text = text.replace(/>/g, "&gt;")

	text = text.replace(/C(\d+)/g, sub_card_capability)
	text = text.replace(/E(\d+)/g, sub_card_event)
	text = text.replace(/L(\d+)/g, sub_lord_name)
	text = text.replace(/%(\d+)/g, sub_locale_name)

	if (text.match(/^\.h1/)) {
		text = text.substring(4)
		p.className = "h1"
	}
	else if (text.match(/^\.h2y/)) {
		text = text.substring(5)
		p.className = "h2 york"
	}
	else if (text.match(/^\.h2l/)) {
		text = text.substring(5)
		p.className = "h2 lancaster"
	}
	else if (text.match(/^\.h2/)) {
		text = text.substring(4)
		p.className = "h2"
	}
	else if (text.match(/^\.h3y/)) {
		text = text.substring(5)
		p.className = "h3 york"
	}
	else if (text.match(/^\.h3l/)) {
		text = text.substring(5)
		p.className = "h3 lancaster"
	}
	else if (text.match(/^\.h3/)) {
		text = text.substring(4)
		p.className = "h3"
	}
	else if (text.match(/^\.h4/)) {
		text = text.substring(4)
		p.className = "h4"
	}
	else if (text.match(/^\.h5/)) {
		text = text.substring(4)
		p.className = "h5"
	}

	p.innerHTML = text
	return p
}

function pack1_get(word, n) {
	return (word >>> n) & 1
}

function pack2_get(word, n) {
	n = n << 1
	return (word >>> n) & 3
}

function pack4_get(word, n) {
	n = n << 2
	return (word >>> n) & 15
}

build_map()
scroll_with_middle_mouse("main")
