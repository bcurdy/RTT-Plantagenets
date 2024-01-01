"use strict"

function toggle_pieces() {
	document.getElementById("pieces").classList.toggle("hide")
}

// === COMMON LIBRARY ===

function map_get(map, key, missing) {
	let a = 0
	let b = (map.length >> 1) - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = map[m << 1]
		if (key < x)
			b = m - 1
		else if (key > x)
			a = m + 1
		else
			return map[(m << 1) + 1]
	}
	return missing
}

function map_get_pack4(map, lord, k) {
	return pack4_get(map_get(map, lord, 0), k)
}

function map2_get(map, x, y, v) {
	return map_get(map, (x << 1) + y, v)
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

const first_york_lord = 0
const last_york_lord = 13
const first_lancaster_lord = 14
const last_lancaster_lord = 27

const first_york_card = 0
const last_york_card = 36
const first_lancaster_card = 37
const last_lancaster_card = 73
const last_aow_card = last_lancaster_card

const first_locale = 0
const last_locale = data.locales.length - 1

const first_vassal = 0
const last_vassal = data.vassals.length - 1

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

const A1 = 0, A2 = 1, A3 = 2, D1 = 3, D2 = 4, D3 = 5

const RETINUE = 0
const VASSAL = 1
const MEN_AT_ARMS = 2
const LONGBOWMEN = 3
const MILITIA = 4
const BURGUNDIANS = 5
const MERCENARIES = 6
const force_type_count = 7

const force_action_name = [ "retinue", "vassal", "men_at_arms", "longbowmen", "militia", "burgundians", "mercenaries" ]
const routed_force_action_name = [ "routed_retinue", "routed_vassal", "routed_men_at_arms", "routed_longbowmen", "routed_militia", "routed_burgundians", "routed_mercenaries" ]

const COIN = 1
const asset_type_count = 4
const asset_action_name = [ "prov", "coin", "cart", "ship" ]
const asset_type_x34 = [ 1, 1, 1, 0 ]

const NOWHERE = -1
const CALENDAR = 100

const VASSAL_READY = 29
const VASSAL_CALENDAR = 30
const VASSAL_OUT_OF_PLAY = 31

const TOWN = "town"
const CITY = "city"
const FORTRESS = "fortress"

const SUMMER = 0
const SPRING = 1
const WINTER = 2
const AUTUMN = 3

const SEASONS = [
	null,
	WINTER,
	SPRING,
	SUMMER,
	AUTUMN,
	WINTER,
	WINTER,
	SPRING,
	SUMMER,
	AUTUMN,
	WINTER,
	WINTER,
	SPRING,
	SUMMER,
	AUTUMN,
	WINTER,
	null
]
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
	if (set_has(data.seaports, id))
		tip += " - Port"
	let list = []
	for (let lord = 0; lord < data.lords.length; ++lord) {
		if (data.lords[lord].seat === id)
			list.push(data.lords[lord].name)
	}
	if (list.length > 0)
		tip += " - " + list.join(", ")
	return tip
}

function on_focus_cylinder(evt) {
	let lord = evt.target.my_id
	let info = data.lords[lord]
	let loc = get_lord_locale(lord)
	let tip = info.name
	on_focus(tip)
}

// === GAME STATE ===

function current_season() {
	return SEASONS[view.turn >> 1]
}

function max_plan_length() {
	switch (current_season()) {
	case SUMMER: return 7
	case WINTER: return 4
	case SPRING: return 6
	case AUTUMN: return 6
	}
}

function is_york_lord(lord) {
	return lord >= first_york_lord && lord <= last_york_lord
}

function is_lancaster_lord(lord) {
	return lord >= first_lancaster_lord && lord <= last_lancaster_lord
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
			if ((view.battle.ambush & 1) && is_york_lord(lord))
				return is_lord_on_left_or_right(lord)
			if ((view.battle.ambush & 2) && is_lancaster_lord(lord))
				return is_lord_on_left_or_right(lord)
		} else {
			if ((view.battle.ambush & 1) && is_lancaster_lord(lord))
				return is_lord_on_left_or_right(lord)
			if ((view.battle.ambush & 2) && is_york_lord(lord))
				return is_lord_on_left_or_right(lord)
		}
	}
	return false
}

function get_lord_locale(lord) {
	return map_get(view.pieces.locale, lord, -1)
}

function get_lord_moved(lord) {
	return map_get(view.pieces.moved, lord, 0)
}

function get_lord_assets(lord, n) {
	return map_get_pack4(view.pieces.assets, lord, n, 0)
}

function get_lord_forces(lord, n) {
	return map_get_pack4(view.pieces.forces, lord, n, 0)
}

function get_lord_routed(lord, n) {
	return map_get_pack4(view.pieces.routed, lord, n, 0)
}

function get_lord_capability(lord, n) {
	return map2_get(view.pieces.capabilities, lord, n, -1)
}

function is_lord_in_exile(ix) {
	return pack1_get(view.pieces.in_exile, ix)
}

function count_lord_all_forces(lord) {
	return (
		get_lord_forces(lord, MERCENARIES) +
		get_lord_forces(lord, BURGUNDIANS) +
		get_lord_forces(lord, MEN_AT_ARMS) +
		get_lord_forces(lord, MILITIA) +
		get_lord_forces(lord, LONGBOWMEN)
	)
}

function count_favour(type) {
	let n = 0
	for (let x = first_locale; x <= last_locale; x++) {
		if (data.locales[x].type !== type)
			continue
		if (set_has(view.pieces.favourl, x))
			n += 1
		if (set_has(view.pieces.favoury, x))
			n -= 1
	}
	return n
}

function get_vassal_lord(vassal) {
	return view.pieces.vassals[vassal] & 31
}

function get_vassal_service(vassal) {
	return view.pieces.vassals[vassal] >> 5
}

function for_each_vassal_with_lord(lord, f) {
	for (let x = first_vassal; x <= last_vassal; x++)
		if (get_vassal_lord(x) === lord)
			f(x)
}

function is_york_locale(loc) {
	return loc >= first_york_locale && loc <= last_york_locale
}

function is_lancaster_locale(loc) {
	return loc >= first_lancaster_locale && loc <= last_lancaster_locale
}

function is_lord_on_map(lord) {
	let loc = get_lord_locale(lord)
	return loc !== NOWHERE && loc < CALENDAR
}

function is_lord_in_game(lord) {
	return get_lord_locale(lord) !== NOWHERE
}

function is_lord_on_calendar(lord) {
	let loc = get_lord_locale(lord)
	return loc >= CALENDAR
}

function is_levy_phase() {
	return (view.turn & 1) === 0
}

function is_lord_in_battle(lord) {
	if (view.battle && view.battle.array) {
		for (let i = 0; i < 6; ++i)
			if (view.battle.array[i] === lord)
				return true
		if (set_has(view.battle.reserves, lord))
			return true
	}
	return false
}

function is_lord_command(ix) {
	return view.command === ix
}

function is_lord_selected(ix) {
	if (view.group)
		return set_has(view.group, ix)
	if (view.who >= 0)
		return ix === view.who
	return false
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

// === BUILD UI ===

const calendar_boxes = {
	"box1": [204,38,100,162],
	"box2": [306,38,100,162],
	"box3": [408,38,100,162],
	"box4": [510,38,100,162],
	"box5": [612,38,100,162],
	"box6": [734,38,100,162],
	"box7": [836,38,100,162],
	"box8": [938,38,100,162],
	"box9": [1040,38,100,162],
	"box10": [1142,38,100,162],
	"box11": [734,260,100,162],
	"box12": [836,260,100,162],
	"box13": [938,260,100,162],
	"box14": [1040,260,100,162],
	"box15": [1142,260,100,162],
	"box16": [938,423,310,52],
}

const track_boxes = {
	"track0": [22,1575,48,48],
	"track1": [71,1575,47,48],
	"track2": [118,1575,46,48],
	"track3": [165,1575,46,48],
	"track4": [211,1575,48,48],
	"track5": [259,1575,47,48],
	"track6": [306,1575,48,48],
	"track7": [354,1575,47,48],
	"track8": [401,1575,46,48],
	"track9": [447,1575,47,48],
	"track10": [494,1575,49,49],
	"track11": [543,1575,47,49],
	"track12": [590,1575,47,49],
	"track13": [637,1575,48,49],
	"track14": [685,1575,46,48],
	"track15": [731,1575,48,48],
	"track16": [779,1575,47,48],
	"track17": [826,1575,48,48],
	"track18": [873,1575,46,48],
	"track19": [920,1575,48,48],
	"track20": [968,1575,46,49],
	"track21": [1014,1575,48,49],
	"track22": [1062,1575,47,49],
	"track23": [1109,1575,48,49],
	"track24": [1157,1575,46,49],
	"track25": [1203,1577,49,47],
	"track26": [1203,1530,49,47],
	"track27": [1203,1488,49,46],
	"track28": [1203,1434,49,47],
	"track29": [1203,1388,49,46],
	"track30": [1203,1340,49,48],
	"track31": [1203,1292,49,48],
	"track32": [1203,1244,49,48],
	"track33": [1203,1198,49,46],
	"track34": [1203,1151,49,47],
	"track35": [1203,1104,49,47],
	"track36": [1203,1057,49,46],
	"track37": [1203,1010,49,47],
	"track38": [1203,960,49,50],
	"track39": [1203,914,47,46],
	"track40": [1203,865,47,48],
	"track41": [1203,819,47,46],
	"track42": [1203,774,51,45],
	"track43": [1203,724,51,50],
	"track44": [1203,676,51,48],
	"track45": [1203,630,47,46],
}

const track_xy = []
const calendar_xy = []
const locale_xy = []

let expand_calendar = -1
let expand_track = -1

const ui = {
	favicon: document.getElementById("favicon"),
	locale: [],
	locale_name: [],
	locale_markers: [],
	locale_markers_rose: [],
	lord_cylinder: [],
	lord_mat: [],
	lord_exile: [],
	lord_buttons: [],
	vassal_cal: [], // token on calendar
	vassal_map: [], // token on map
	forces: [],
	routed: [],
	assets: [],
	lord_capabilities: [],
	lord_events: [],
	lord_moved1: [],
	lord_moved2: [],
	lord_fled: [],
	lord_valour: [],
	lord_feed: [],
	cards: [],
	cards2: [],
	calendar: [],
	track: [],
	seat: [],

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

	held_york: document.querySelector("#role_York .role_stat"),
	held_lancaster: document.querySelector("#role_Lancaster .role_stat"),

	command: document.getElementById("turn_info"),
	turn: document.getElementById("turn"),
	end: document.getElementById("end"),
	victory_check: document.getElementById("victory_check"),
	fortress: document.getElementById("fortresses"),
	town: document.getElementById("towns"),
	cities: document.getElementById("cities"),
	influence: document.getElementById("ip"),

	court1_header: document.getElementById("court1_header"),
	court2_header: document.getElementById("court2_header"),
	court1: document.getElementById("court1"),
	court2: document.getElementById("court2"),
	battle_panel: document.getElementById("battle_panel"),
	battle_header: document.getElementById("battle_header"),
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
let calendar_layout_vassal = []
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
	ui.lord_buttons[ix] = build_div(bg, "card lord " + side + " " + name)
	ui.lord_capabilities[ix] = build_div(mat, "capabilities")
	ui.lord_events[ix] = build_div(mat, "events")
	ui.lord_moved1[ix] = build_div(mat, "marker square moved_fought one hide")
	ui.lord_moved2[ix] = build_div(mat, "marker square moved_fought two hide")
	ui.lord_fled[ix] = build_div(mat, "marker square fled hide")
	ui.lord_valour[ix] = build_div(mat, "valour_area")
	ui.lord_feed[ix] = build_div(mat, "marker small feed x2")
	ui.lord_mat[ix] = mat
	register_action(ui.lord_buttons[ix], "lord", ix)
}

function build_card(side, c, id) {
	let card = ui.cards[c] = document.querySelector(`div[data-card="${id}"]`)
	ui.cards2[c] = card.cloneNode(true)
	register_action(card, "card", c)
}

function build_plan() {
	let elt

	for (let i = 0; i < 7; ++i) {
		elt = document.createElement("div")
		elt.className = "hide"
		ui.plan_cards.push(elt)
		ui.plan.appendChild(elt)
	}

	for (let lord = 0; lord < 28; ++lord) {
		let side = lord < 14 ? "york" : "lancaster"
		elt = document.createElement("div")
		elt.className = `card cc ${side} ${data.lords[lord].id}`
		register_action(elt, "plan", lord)
		ui.plan_action_cards.push(elt)
		ui.plan_actions.appendChild(elt)
	}

	ui.plan_action_pass_york = elt = document.createElement("div")
	elt.className = `card cc york pass`
	register_action(elt, "plan", -1)
	ui.plan_actions.appendChild(elt)

	ui.plan_action_pass_lancaster = elt = document.createElement("div")
	elt.className = `card cc lancaster pass`
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
		let xc = Math.round(x + w / 2)
		let yc = Math.round(y + h / 2)
		let e
		let small = 40
		let offsetdeplete = 10

		locale_xy[ix] = [ xc, yc ]

		// Main Area
		e = ui.locale[ix] = document.createElement("div")
		e.className = "locale " + locale.type + " " + region
		e.style.left = x + "px"
		e.style.top = y + "px"
		e.style.width = w + "px"
		e.style.height = h + "px"
		e.style.zIndex = "-10"
		register_action(e, "locale", ix, "laden_march")
		register_tooltip(e, get_locale_tip(ix))
		document.getElementById("locales").appendChild(e)

		// Locale Markers
		e = ui.locale_markers_rose[ix] = document.createElement("div")
		e.className = "locale marker rose favour " + locale.name // York/Lancaster to add favour
		e.style.top = y + h - small + "px"
		e.style.left = x + (w - small) / 2 + "px"
		e.style.width = small + "px"
		e.style.height = small + "px"
		e.style.zIndex = "-20"
		// e.style.border = "2px solid aqua" // to be changed depending on the favour marker
		e.style.backgroundSize = small + "px"
		document.getElementById("pieces").appendChild(e)

		// Depleted markers
		e = ui.locale_markers[ix] = document.createElement("div")
		e.className = "locale marker " + locale.name // depleted or exhausted to add markers
		e.style.top = y + h - small - offsetdeplete + "px"
		e.style.left = offsetdeplete + x + (w - small) / 2 + "px"
		e.style.width = small + "px"
		e.style.height = small + "px"
		e.style.zIndex = "-15"
		// e.style.border = "2px solid aqua"
		e.style.backgroundSize = small + "px"
		document.getElementById("pieces").appendChild(e)
	})

	// Lord seats
	data.seat.forEach((seat, ix) => {
		let e = ui.seat[ix] = document.createElement("div")
		let { x, y, w, h } = seat.box
		let xc = Math.round(x + w / 2)
		let yc = Math.round(y + h / 2)
		let small = 46
		e.className = "hide marker " + seat.name
		e.style.position = "absolute"
		e.style.top = y + "px"
		e.style.left = x + "px"
		e.style.width = 46 + "px"
		e.style.height = 46 + "px"
		e.style.backgroundSize = small + "px"
		e.style.transform = "rotate(315deg)"
		e.style.zIndex = "-50"
		register_tooltip(e, data.seat[ix].name)
		document.getElementById("pieces").appendChild(e)
	})

	data.lords.forEach((lord, ix) => {
		let e = ui.lord_cylinder[ix] = document.createElement("div")
		let side = lord.side.toLowerCase()
		e.className = "cylinder " + side + " " + lord.id + " hide"
		register_action(e, "lord", ix)
		register_tooltip(e, on_focus_cylinder)
		document.getElementById("pieces").appendChild(e)

		// TODO: remove this when not in exile
		let exile = ui.lord_exile[ix] = document.createElement("div")
		exile.className = "marker small exile hide"
		e.appendChild(exile)

		build_lord_mat(lord, ix, side, lord.id)
	})

	data.vassalbox.forEach((vassal, ix) => {
		let e = ui.vassal_map[ix] = document.createElement("div")
		let { x, y, w, h } = vassal.box
		let xc = Math.round(x + w / 2)
		let yc = Math.round(y + h / 2)
		let small = 46
		e.className = "hide unit " + vassal.name
		e.style.position = "absolute"
		e.style.top = y + "px"
		e.style.left = x + "px"
		e.style.width = 46 + "px"
		e.style.height = 46 + "px"
		e.style.backgroundSize = small + "px"
		register_action(e, "vassal", ix)
		register_tooltip(e, data.vassals[ix].name)
		document.getElementById("pieces").appendChild(e)
	})

	data.vassals.forEach((vassal, ix) => {
		let e = ui.vassal_cal[ix] = document.createElement("div")
		e.className = "hide marker square back vassal vassal_" + clean_name(vassal.name)
		e.style.position = "absolute"
		e.style.width = 46 + "px"
		e.style.height = 46 + "px"
		e.style.backgroundSize = 46 + "px"

		register_action(e, "vassal", ix)
		register_tooltip(e, data.vassals[ix].name)

		document.getElementById("pieces").appendChild(e)
	})

	for (let i = 1; i <= 16; ++i) {
		let name = "box" + i
		let x = calendar_boxes[name][0]
		let y = calendar_boxes[name][1]
		let w = calendar_boxes[name][2]
		let h = calendar_boxes[name][3]
		calendar_xy[i] = [ x, y ]
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

	for (let i = 0; i <= 45; ++i) {
		let name = "track" + i
		let x = track_boxes[name][0]
		let y = track_boxes[name][1]
		let w = track_boxes[name][2]
		let h = track_boxes[name][3]
		track_xy[i] = [ x, y ]
		let e = ui.track[i] = document.createElement("div")
		e.className = "track box " + name
		e.style.left = x + "px"
		e.style.top = y + "px"
		e.style.width = w + "px"
		e.style.height = h + "px"
		document.getElementById("boxes").appendChild(e)
	}

	for (let i = 0; i <= 45; ++i)
		register_action(ui.track[i], "track", i)

	build_plan()

	for (let i = 0; i < 6; ++i)
		register_action(ui.battle_grid_array[i], "array", i)

	for (let c = first_york_card; c <= last_york_card; ++c)
		build_card("york", c, "Y" + (1 + c - first_york_card))
	for (let c = first_lancaster_card; c <= last_lancaster_card; ++c)
		build_card("lancaster", c, "L" + (1 + c - first_lancaster_card))

	ui.card_aow_lancaster_back = build_div(null, "card aow lancaster back")
	ui.card_aow_york_back = build_div(null, "card aow york back")
	ui.card_cc_lancaster_back = build_div(null, "card cc lancaster back")
	ui.card_cc_york_back = build_div(null, "card cc york back")

	ui.card_cc = []
	for (let i = 0; i < 14; ++i)
		ui.card_cc[i] = build_div(null, "card cc york " + data.lords[i].id)
	for (let i = 14; i < 28; ++i)
		ui.card_cc[i] = build_div(null, "card cc lancaster " + data.lords[i].id)
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
	// TODO: clone card elements instead of using classes
	if (typeof view.what === "number" && view.what >= 0) {
		ui.command.replaceChildren(ui.cards2[view.what])
	} else if ((view.turn & 1) === 0) {
		if (player === "Lancaster")
			ui.command.replaceChildren(ui.card_aow_lancaster_back)
		else
			ui.command.replaceChildren(ui.card_aow_york_back)
	} else if (view.command < 0) {
		if (player === "Lancaster")
			ui.command.replaceChildren(ui.card_cc_lancaster_back)
		else
			ui.command.replaceChildren(ui.card_cc_york_back)
	} else {
		ui.command.replaceChildren(ui.card_cc[view.command])
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

	let wrap = 2
	switch (data.locales[loc].type) {
		case "london":
			wrap = 3
			break
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
		let list = calendar_layout_vassal[loc]
		for (let i = 0; i < list.length; ++i) {
			let e = list[i]
			let x = cx, y = cy, z = 60 - i
			let d = 46 - 24
			if (loc === expand_calendar) {
				d = 46
				z += 100
			}
			x += 10
			y += i * d
			e.style.top = y + "px"
			e.style.left = x + "px"
			e.style.zIndex = z
		}

		list = calendar_layout_cylinder[loc]
		for (let i = 0; i < list.length; ++i) {
			let e = list[i]
			let x = cx, y = cy, z = 61 + i
			x += 10
			y += i * 32 - 3
			e.style.top = y + "px"
			e.style.left = x + "px"
			e.style.zIndex = z
		}
	}
}

function layout_track() {
	for (let loc = 0; loc <= 45; ++loc) {
		let [cx, cy] = track_xy[loc]
		let list = track_layout[loc]
		for (let i = 0; i < list.length; ++i) {
			let e = list[i]
			let x = cx, y = cy, z = 60 - i
			let d = 46 - 24
			if (loc === expand_track) {
				d = 46
				z += 100
			}
			x += 10
			y += i * d
			e.style.top = y + "px"
			e.style.left = x + "px"
			e.style.zIndex = z
		}
	}
}

function add_vassal(parent, vassal, lord, routed) {
	let elt
	if (routed) {
		if (is_action(routed_force_action_name[VASSAL], vassal))
			elt = get_cached_element(
				"action unit " + force_action_name[VASSAL] + " vassal_" + clean_name(data.vassals[vassal].name),
				routed_force_action_name[VASSAL],
				vassal
			)
		else
			elt = get_cached_element(
				"unit " + force_action_name[VASSAL] + " vassal_" + clean_name(data.vassals[vassal].name),
				routed_force_action_name[VASSAL],
				vassal
			)
	} else {
		if (is_action(force_action_name[VASSAL], vassal))
			elt = get_cached_element(
				"action unit " + force_action_name[VASSAL] + " vassal_" + clean_name(data.vassals[vassal].name),
				force_action_name[VASSAL],
				vassal
			)
		else
			elt = get_cached_element(
				"unit " + force_action_name[VASSAL] + " vassal_" + clean_name(data.vassals[vassal].name),
				force_action_name[VASSAL],
				vassal
			)
	}
	parent.appendChild(elt)
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
		elt = get_cached_element("action asset " + asset_action_name[type] + " x" + n, asset_action_name[type], lord)
	else
		elt = get_cached_element("asset " + asset_action_name[type] + " x" + n)
	parent.appendChild(elt)
}

function update_forces(parent, forces, lord_ix, routed) {
	parent.replaceChildren()
	for (let i = 0; i < force_type_count; ++i) {
		if (i === VASSAL) {
			for_each_vassal_with_lord(lord_ix, v => {
				if (view.battle) {
					if (set_has(view.battle.routed_vassals, v) === routed)
						add_vassal(parent, v, lord_ix, routed)
				} else {
					if (routed === false)
						add_vassal(parent, v, lord_ix, routed)
				}
			})
		} else {
			let n = map_get_pack4(forces, lord_ix, i, 0)
			for (let k = 0; k < n; ++k) {
				add_force(parent, i, lord_ix, routed)
			}
		}
	}
}

function update_assets(parent, assets, lord_ix) {
	parent.replaceChildren()
	for (let i = 0; i < asset_type_count; ++i) {
		let n = map_get_pack4(assets, lord_ix, i, 0)
		if (asset_type_x34[i]) {
			while (n >= 4) {
				add_asset(parent, i, 4, lord_ix)
				n -= 4
			}
			while (n >= 3) {
				add_asset(parent, i, 3, lord_ix)
				n -= 3
			}
		}
		while (n >= 2) {
			add_asset(parent, i, 2, lord_ix)
			n -= 2
		}
		while (n >= 1) {
			add_asset(parent, i, 1, lord_ix)
			n -= 1
		}
	}
}

function add_valour(parent, lord) {
	let elt
	if (is_action("valour", lord))
		elt = get_cached_element("action marker small valour", "valour", lord)
	else
		elt = get_cached_element("marker valour small")
	parent.appendChild(elt)
}

function update_valour(lord, parent, battle) {
	if (!battle) return
	parent.replaceChildren()
	for (let i = 0; i < battle.valour[lord]; i++) {
		add_valour(parent, lord)
	}

}

function update_lord_mat(ix) {
	if (view.reveal & (1 << ix)) {
		ui.lord_mat[ix].classList.remove("hidden")
		update_assets(ui.assets[ix], view.pieces.assets, ix)
		update_forces(ui.forces[ix], view.pieces.forces, ix, false)
		update_forces(ui.routed[ix], view.pieces.routed, ix, true)
		ui.lord_feed[ix].classList.toggle("hide", count_lord_all_forces(ix) <= 6)
	} else {
		ui.lord_mat[ix].classList.add("hidden")
		ui.assets[ix].replaceChildren()
		ui.forces[ix].replaceChildren()
		ui.routed[ix].replaceChildren()
		ui.lord_moved1[ix].classList.add("hide")
		ui.lord_moved2[ix].classList.add("hide")
		ui.lord_feed[ix].classList.add("hide")
	}
	let m = get_lord_moved(ix)
	ui.lord_moved1[ix].classList.toggle("hide", is_levy_phase() || (m !== 1 && m !== 2))
	ui.lord_moved2[ix].classList.toggle("hide", is_levy_phase() || (m !== 2))
	ui.lord_fled[ix].classList.toggle("hide", view.battle === 0 || !set_has(view.battle.fled, ix))
	update_valour(ix, ui.lord_valour[ix], view.battle)
}

function update_lord(ix) {
	let locale = get_lord_locale(ix)
	if (locale < 0) {
		ui.lord_cylinder[ix].classList.add("hide")
		ui.lord_mat[ix].classList.remove("action")
		return
	}
	if (locale < 100) {
		layout_locale_item(locale, ui.lord_cylinder[ix])
		ui.lord_cylinder[ix].classList.remove("hide")
		update_lord_mat(ix)
		ui.lord_exile[ix].classList.add("hide")
	} else {
		let t = locale - 100
		if (t > 16) t = 16
		calendar_layout_cylinder[t].push(ui.lord_cylinder[ix])
		ui.lord_cylinder[ix].classList.remove("hide")
		ui.lord_exile[ix].classList.toggle("hide", !is_lord_in_exile(ix))
	}
	ui.lord_buttons[ix].classList.toggle("action", is_action("lord", ix))
	ui.lord_cylinder[ix].classList.toggle("action", is_action("lord", ix))

	ui.lord_cylinder[ix].classList.toggle("selected", is_lord_selected(ix))
	ui.lord_mat[ix].classList.toggle("selected", is_lord_selected(ix))

	ui.lord_cylinder[ix].classList.toggle("command", is_lord_command(ix))
	ui.lord_mat[ix].classList.toggle("command", is_lord_command(ix))

	ui.lord_mat[ix].classList.toggle("ambushed", is_lord_ambushed(ix))

	ui.seat[ix].classList.toggle("hide", !is_lord_in_game(ix))
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

	//DEPLETED/EXHAUSTED
	if (!set_has(view.pieces.depleted, loc) && !set_has(view.pieces.exhausted, loc)) {
		let cn
		cn = "depleted"
		ui.locale_markers[loc].classList.remove(cn)
		cn = "exhausted"
		ui.locale_markers[loc].classList.remove(cn)
	}

	if (set_has(view.pieces.depleted, loc)) {
		let cn
		cn = "depleted"
		ui.locale_markers[loc].classList.add(cn)
		cn = "exhausted"
		ui.locale_markers[loc].classList.remove(cn)
	}
	if (set_has(view.pieces.exhausted, loc)) {
		let cn
		cn = "exhausted"
		ui.locale_markers[loc].classList.add(cn)
		cn = "depleted"
		ui.locale_markers[loc].classList.remove(cn)
	}

	// FAVOUR MARKERS
	if (!set_has(view.pieces.favourl, loc) && !set_has(view.pieces.favoury, loc)) {
		let cn
		cn = "lancaster"
		ui.locale_markers_rose[loc].classList.remove(cn)
		cn = "york"
		ui.locale_markers_rose[loc].classList.remove(cn)
	}

	if (set_has(view.pieces.favourl, loc)) {
		let cn
		cn = "lancaster"
		ui.locale_markers_rose[loc].classList.add(cn)
		cn = "york"
		ui.locale_markers_rose[loc].classList.remove(cn)
	}

	if (set_has(view.pieces.favoury, loc)) {
		let cn
		cn = "york"
		ui.locale_markers_rose[loc].classList.add(cn)
		cn = "lancaster"
		ui.locale_markers_rose[loc].classList.remove(cn)
	}
}

function update_plan() {
	if (view.plan) {
		let is_planning = view.actions && view.actions.plan

		ui.plan_panel.classList.remove("hide")
		for (let i = 0; i < 7; ++i) {
			if (i < view.plan.length) {
				let lord = view.plan[i]
				if (lord < 0) {
					if (player === "York")
						ui.plan_cards[i].className = "card cc york pass"
					else
						ui.plan_cards[i].className = "card cc lancaster pass"
				} else {
					if (lord < 14)
						ui.plan_cards[i].className = "card cc york " + data.lords[lord].id
					else
						ui.plan_cards[i].className = "card cc lancaster " + data.lords[lord].id
				}
			} else if (is_planning && i < max_plan_length()) {
				if (player === "York")
					ui.plan_cards[i].className = "card cc york back"
				else
					ui.plan_cards[i].className = "card cc lancaster back"
			} else {
				ui.plan_cards[i].className = "hide"
			}
		}

		if (is_planning) {
			ui.plan_actions.classList.remove("hide")
			for (let lord = 0; lord < 28; ++lord) {
				if (is_action("plan", lord)) {
					ui.plan_action_cards[lord].classList.add("action")
					ui.plan_action_cards[lord].classList.remove("disabled")
				} else {
					ui.plan_action_cards[lord].classList.remove("action")
					ui.plan_action_cards[lord].classList.add("disabled")
				}
			}
			if (is_action("plan", -1)) {
				ui.plan_action_pass_york.classList.add("action")
				ui.plan_action_pass_york.classList.remove("disabled")
				ui.plan_action_pass_lancaster.classList.add("action")
				ui.plan_action_pass_lancaster.classList.remove("disabled")
			} else {
				ui.plan_action_pass_york.classList.remove("action")
				ui.plan_action_pass_york.classList.add("disabled")
				ui.plan_action_pass_lancaster.classList.remove("action")
				ui.plan_action_pass_lancaster.classList.add("disabled")
			}
		} else {
			ui.plan_actions.classList.add("hide")
		}
	} else {
		ui.plan_panel.classList.add("hide")
	}
}

function update_cards() {
	for (let c = 0; c <= last_aow_card; ++c) {
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
			let c = get_lord_capability(ix, 0)
			if (c >= 0)
				ui.lord_capabilities[ix].appendChild(ui.cards[c])
			c = get_lord_capability(ix, 1)
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
	let ycourt_hdr = (player === "Lancaster") ? ui.court2_header : ui.court1_header
	let lcourt_hdr = (player === "Lancaster") ? ui.court1_header : ui.court2_header
	let ycourt = (player === "Lancaster") ? ui.court2 : ui.court1
	let lcourt = (player === "Lancaster") ? ui.court1 : ui.court2
	ycourt_hdr.textContent = "York Lords"
	lcourt_hdr.textContent = "Lancaster Lords"
	ycourt.replaceChildren()
	lcourt.replaceChildren()
	for (let lord = first_york_lord; lord <= last_york_lord; ++lord)
		if (!is_lord_in_battle(lord) && is_lord_on_map(lord))
			ycourt.appendChild(ui.lord_mat[lord])
	for (let lord = first_lancaster_lord; lord <= last_lancaster_lord; ++lord)
		if (!is_lord_in_battle(lord) && is_lord_on_map(lord))
			lcourt.appendChild(ui.lord_mat[lord])
}

function update_vassals() {
	for (let v = first_vassal; v <= last_vassal; v++) {
		let loc = get_vassal_lord(v)
		let srv = get_vassal_service(v)
		if (loc === VASSAL_OUT_OF_PLAY) {
			// not present
			ui.vassal_cal[v].classList.add("hide")
			if (ui.vassal_map[v]) {
				ui.vassal_map[v].classList.add("hide")
			}
		} else if (loc === VASSAL_READY) {
			// on map
			ui.vassal_cal[v].classList.add("hide")
			if (ui.vassal_map[v]) {
				ui.vassal_map[v].classList.remove("hide")
				ui.vassal_map[v].classList.toggle("action", is_action("vassal", v))
			}
		} else {
			// on calendar (+ maybe on lord mat)
			if (data.vassals[v].service > 0) {
				ui.vassal_cal[v].classList.remove("hide")
				ui.vassal_cal[v].classList.toggle("action", is_action("vassal", v))
				calendar_layout_vassal[srv].push(ui.vassal_cal[v])
			} else {
				// special vassal not on calendar
				ui.vassal_cal[v].classList.add("hide")
			}
			if (ui.vassal_map[v]) {
				ui.vassal_map[v].classList.add("hide")
			}
		}
	}
}

function on_update() {
	restart_cache()

	switch (player) {
		case "York":
			ui.favicon.href = "favicons/favicon_york.png"
			break
		case "Lancaster":
			ui.favicon.href = "favicons/favicon_henry_vi.png"
			break
		default:
			ui.favicon.href = "favicons/favicon_warwick.png"
			break
	}

	for (let i = 0; i <= 16; ++i) {
		calendar_layout_cylinder[i] = []
		calendar_layout_vassal[i] = []
	}

	for (let i = 0; i < data.locales.length; ++i)
		locale_layout[i].length = 0

	for (let ix = 0; ix < data.lords.length; ++ix) {
		if (get_lord_locale(ix) < 0) {
			ui.lord_cylinder[ix].classList.add("hide")
		} else {
			ui.lord_cylinder[ix].classList.remove("hide")
			update_lord(ix)
		}
	}

	update_vassals()
	layout_calendar()
	//layout_track()

	for (let loc = 0; loc < data.locales.length; ++loc)
		update_locale(loc)

	update_current_card_display()

	if (view.turn & 1) {
		ui.turn.className = `marker circle turn campaign`
	} else {
		ui.turn.className = `marker circle turn levy`
	}
	ui.turn.style.left = (calendar_xy[view.turn >> 1][0] + 91 - 52) + "px"
	ui.turn.style.top = (calendar_xy[view.turn >> 1][1] + 94) + "px"
	ui.end.style.left = (calendar_xy[view.end][0] + 91 - 52) + "px"
	ui.end.style.top = (calendar_xy[view.end][1] + 94) + "px"

	ui.held_york.textContent = `${view.held_y} Held`
	ui.held_lancaster.textContent = `${view.held_l} Held`

	ui.victory_check.style.top = (track_xy[view.victory_check][1]) + "px"
	ui.victory_check.style.left = (track_xy[view.victory_check][0]) + "px"

	let town = count_favour(TOWN)
	ui.town.style.top = (track_xy[Math.abs(town)][1]) + "px"
	ui.town.style.left = (track_xy[Math.abs(town)][0]) + "px"
	ui.town.classList.toggle("york", town < 0)
	ui.town.classList.toggle("lancaster", town >= 0)

	let cities = count_favour(CITY)
	ui.cities.style.top = (track_xy[Math.abs(cities)][1]) + "px"
	ui.cities.style.left = (track_xy[Math.abs(cities)][0]) + "px"
	ui.cities.classList.toggle("york", cities < 0)
	ui.cities.classList.toggle("lancaster", cities >= 0)

	let fortress = count_favour(FORTRESS)
	ui.fortress.style.top = (track_xy[Math.abs(fortress)][1]) + "px"
	ui.fortress.style.left = (track_xy[Math.abs(fortress)][0]) + "px"
	ui.fortress.classList.toggle("york", fortress < 0)
	ui.fortress.classList.toggle("lancaster", fortress >= 0)

	ui.influence.style.top = (track_xy[Math.abs(view.influence)][1]) + "px"
	ui.influence.style.left = (track_xy[Math.abs(view.influence)][0]) + "px"
	ui.influence.classList.toggle("york", view.influence < 0)
	ui.influence.classList.toggle("lancaster", view.influence >= 0)

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

	// Use all commands
	action_button("heralds", "Heralds")
	
	// Use one command
	action_button("sail", "Sail")
	action_button("parley", "Parley")
	action_button("forage", "Forage")
	action_button("supply", "Supply")
	action_button("tax", "Tax")
	action_button("merchants", "Merchants")
	action_button("agitators", "Agitators")
	action_button("exile_pact", "Exile Pact")

	// Muster & Spoils
	action_button("take_prov", "Provender")
	action_button("take_coin", "Coin")
	action_button("take_ship", "Ship")
	action_button("take_cart", "Cart")
	action_button("levy_troops", "Levy Troops")
	action_button("levy_beloved_warwick", "Beloved Warwick")
	action_button("levy_irishmen", "Irishmen")
	action_button("soldiers_of_fortune", "Soldiers of Fortune")

	action_button("capability", "Capability")

	// Parley
	action_button("check", "Influence Check")
	action_button("spend1", "Spend 1 Influence")
	action_button("spend3", "Spend 3 Influence")

	// Supply
	action_button("stronghold", "Stronghold")
	action_button("port", "Port")

	// Pay or Disband
	action_button("pay_all", "Pay All")
	action_button("pay", "Pay")
	action_button("disband", "Disband")
	action_button("pillage", "Pillage")

	// Events
	action_button("decline", "Decline")
	action_button("deploy", "Deploy")
	action_button("discard", "Discard")
	action_button("hold", "Hold")
	action_button("play", "Play")

	action_button("approach", "Approach")
	action_button("intercept", "Intercept")
	action_button("concede", "Concede")
	action_button("battle", "Battle")

	action_button("end_array", "End Array")
	action_button("end_avoid_battle", "End Avoid Battle")
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
	action_button("end_remove", "End Remove")
	action_button("end_sack", "End Sack")
	action_button("end_setup", "End Setup")
	action_button("end_spoils", "End Spoils")
	action_button("end_supply", "End Supply")
	action_button("end_wastage", "End Wastage")
	action_button("end_withdraw", "End Withdraw")

	// ADDING TROOPS THROUGH EVENTS
	action_button("add_militia", "Add Militia")
	action_button("add_militia2", "Add 2 Militias")

	action_button("add_men_at_arms", "Add Men at Arms")
	
	// REMOVE INFLUENCE
	action_button("remove_favour", "Remove favour")

	action_button("pass", "Pass")
	action_button("done", "Done")
	action_button("undo", "Undo")
}

// === LOG ===

function on_focus_card_tip(c) {
	ui.command.replaceChildren(ui.cards2[c])
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
	ui.locale[loc].scrollIntoView({ block: "center", inline: "center", behavior: "smooth" })
}

function on_click_lord_tip(lord) {
	ui.lord_mat[lord].scrollIntoView({ block: "center", inline: "center", behavior: "smooth" })
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

function sub_vassal_name(match, x) {
	let n = data.vassals[x].name
	return `<span class="vassal_tip" >${n}</span>`
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
	text = text.replace(/V(\d+)/g, sub_vassal_name)

	if (text.match(/^\.h1/)) {
		text = text.substring(4)
		p.className = "h1"
	} else if (text.match(/^\.h2y/)) {
		text = text.substring(5)
		p.className = "h2 york"
	} else if (text.match(/^\.h2l/)) {
		text = text.substring(5)
		p.className = "h2 lancaster"
	} else if (text.match(/^\.h2/)) {
		text = text.substring(4)
		p.className = "h2"
	} else if (text.match(/^\.h3y/)) {
		text = text.substring(5)
		p.className = "h3 york"
	} else if (text.match(/^\.h3l/)) {
		text = text.substring(5)
		p.className = "h3 lancaster"
	} else if (text.match(/^\.h3/)) {
		text = text.substring(4)
		p.className = "h3"
	} else if (text.match(/^\.h4/)) {
		text = text.substring(4)
		p.className = "h4"
	} else if (text.match(/^\.h5/)) {
		text = text.substring(4)
		p.className = "h5"
	}

	p.innerHTML = text
	return p
}

build_map()
scroll_with_middle_mouse("main")
