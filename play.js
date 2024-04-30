"use strict"


function toggle_pieces() {
	document.getElementById("pieces").classList.toggle("hide")
}

// === CONSTANTS (matching those in rules.js) ===

function find_lord(name) { return data.lords.findIndex((x) => x.name === name) }
function find_card(name) { return data.cards.findIndex((x) => x.name === name) }
function find_locale(name) { return data.locales.findIndex(x => x.name === name) }

const LORD_HENRY_VI = find_lord("Henry VI")
const LOC_LONDON = find_locale("London")

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

const RETINUE = 0
const VASSAL = 1
const MEN_AT_ARMS = 2
const LONGBOWMEN = 3
const MILITIA = 4
const BURGUNDIANS = 5
const MERCENARIES = 6
const force_type_count = 7

const force_action_name = [ "retinue", "vassal", "men_at_arms", "longbowmen", "militia", "burgundians", "mercenaries" ]
const force_class_name = [ "retinue", "vassal", "shape men_at_arms", "shape longbowmen", "shape militia", "shape burgundians", "shape mercenaries" ]
const routed_force_action_name = [ "routed_retinue", "routed_vassal", "routed_men_at_arms", "routed_longbowmen", "routed_militia", "routed_burgundians", "routed_mercenaries" ]

const COIN = 1
const asset_type_count = 4
const asset_action_name = [ "prov", "coin", "cart", "ship" ]
const asset_type_x34 = [ 1, 1, 1, 0 ]

const NOWHERE = -1
const CALENDAR = 100
const CALENDAR_EXILE = 200
const LONDON_FOR_YORK = 300
const CAPTURE_OF_THE_KING = 400 // Ia. special rule (400 + lord ID that has him captured)

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
	update_current_card_display()
}

function get_locale_tip(id) {
	return data.locales[id].name
}

function on_focus_cylinder(evt) {
	let lord = evt.target.my_id
	let info = data.lords[lord]
	let loc = get_lord_locale(lord)
	let tip = info.short_name
	on_focus(tip)
	ui.command.replaceChildren(ui.lords2[lord])
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

function is_lord_in_exile(lord) {
	return get_lord_locale(lord) >= CALENDAR_EXILE
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
		if (set_has(view.battle.routed, lord))
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

const track_xy = []
const calendar_xy = []
const locale_xy = []

const ui = {
	favicon: document.getElementById("favicon"),
	locale: [],
	locale_name: [],
	locale_markers: [],
	locale_markers_rose: [],
	lord_cylinder: [],
	mat: [],
	mat_card: [],
	mat_caps: [],
	retinue: [],
	routed_retinue: [],
	troops: [],
	routed_troops: [],
	assets: [],

	lord_exile: [],
	vassal_cal: [], // token on calendar
	vassal_map: [], // token on map
	vassal_mat: [], // token on mat
	valour_area: [],
	marker_area: [],

	lord_moved1: [],
	lord_moved2: [],
	lord_fled: [],
	lord_feed: [],

	cards: [],
	cards2: [],
	lords2: [],
	calendar: [],
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

	routed_panel: document.getElementById("routed_panel"),
	routed: document.getElementById("routed"),

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
	fortresses: document.getElementById("fortresses"),
	towns: document.getElementById("towns"),
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

let locale_layout_york = []
let locale_layout_lanc = []
let calendar_layout_vassal = []
let calendar_layout_york = []
let calendar_layout_lanc = []

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
	let board = build_div(mat, "board")
	ui.mat_card[ix] = build_div(board, "card lord " + side + " " + name)
	ui.lords2[ix] = build_div(null, "card lord " + side + " " + name)
	build_div(board, "mask " + side)
	ui.retinue[ix] = build_div(board, "retinue_vassals")
	ui.routed_retinue[ix] = build_div(board, "routed_retinue_vassals")
	ui.troops[ix] = build_div(board, "troops")
	ui.routed_troops[ix] = build_div(board, "routed_troops")
	ui.assets[ix] = build_div(board, "assets")
	ui.mat_caps[ix] = build_div(mat, "capabilities")
	ui.valour_area[ix] = build_div(board, "valour_area")
	ui.marker_area[ix] = build_div(board, "marker_area")

	ui.lord_moved1[ix] = build_div(ui.marker_area[ix], "marker square moved_fought one hide")
	ui.lord_moved2[ix] = build_div(ui.marker_area[ix], "marker square moved_fought two hide")
	ui.lord_fled[ix] = build_div(ui.marker_area[ix], "marker square fled hide")
	ui.lord_feed[ix] = build_div(ui.marker_area[ix], "marker small feed x2")

	ui.mat[ix] = mat
	register_action(ui.mat_card[ix], "lord", ix)
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

function build_map() {
	for (let i = 0; i <= 16; ++i) {
		calendar_layout_york[i] = []
		calendar_layout_lanc[i] = []
		calendar_layout_vassal[i] = []
	}

	for (let i = 0; i < data.locales.length; ++i) {
		locale_layout_york[i] = []
		locale_layout_lanc[i] = []
	}

	data.locales.forEach((locale, ix) => {
		let region = locale.region ? clean_name(locale.region) : ""
		let { x, y, w, h } = locale.box
		let ax, ay, aw, ah
		let xc = Math.round(x + w / 2)
		let yc = Math.round(y + h / 2)
		let e

		locale_xy[ix] = [ xc, yc ]

		if (locale.type === "exile_box") {
			locale_xy[ix] = [ xc, y + 45 ]
			ax = x + 6
			ay = y + 6
			aw = w - 13
			ah = h - 21
		} else {
			ax = x - 6
			ay = y - 6
			aw = w + 12
			ah = h + 8
		}

		// Main Area
		e = ui.locale[ix] = document.createElement("div")
		if (locale.type === "exile_box")
			e.className = "locale " + locale.type + " " + locale.name.toLowerCase()
		else
			e.className = "locale " + locale.type + " " + region.toLowerCase()
		e.style.left = ax + "px"
		e.style.top = ay + "px"
		e.style.width = aw + "px"
		e.style.height = ah + "px"
		register_action(e, "locale", ix, "laden_march")
		register_tooltip(e, get_locale_tip(ix))
		document.getElementById("locales").appendChild(e)

		// Favour
		if (locale.type === "exile_box") {
			e = ui.locale_markers_rose[ix] = document.createElement("div")
			e.className = "marker circle exile_rose "
			//e.style.top = (y - 8) + "px"
			//e.style.left = (x + w - 54 + 8) + "px"
			e.style.top = (y + h - 50) + "px"
			e.style.left = (xc - 27) + "px"
			e.style.pointerEvents = "none"
			document.getElementById("pieces").appendChild(e)
		} else {
			e = ui.locale_markers_rose[ix] = document.createElement("div")
			e.className = "marker small rose"
			//e.style.top = y + h - 41 + "px"
			e.style.top = yc - 20 + "px"
			e.style.left = xc - 20 + "px"
			e.style.pointerEvents = "none"
			document.getElementById("pieces").appendChild(e)
		}

		// Depleted/Exhausted
		e = ui.locale_markers[ix] = document.createElement("div")
		e.className = "marker small depexh " + locale.name
		e.style.top = yc - 20 - 13 + "px"
		e.style.left = xc - 20 + 13 + "px"
		e.style.pointerEvents = "none"
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
		//e.style.transform = "rotate(315deg)"
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

		let exile = ui.lord_exile[ix] = document.createElement("div")
		exile.className = "marker small exile hide"
		exile.style.zIndex=1
		document.getElementById("pieces").appendChild(exile)

		build_lord_mat(lord, ix, side, lord.id)
	})

	ui.captured_king = document.createElement("div")
	ui.captured_king.className = "cylinder lancaster " + data.lords[LORD_HENRY_VI].id
	ui.captured_king.style.position = "static"

	data.vassals.forEach((vassal, ix) => {
		let e

		if (vassal.box) {
			let { x, y, w, h } = vassal.box
			e = ui.vassal_map[ix] = document.createElement("div")
			let xc = Math.round(x + w / 2)
			let yc = Math.round(y + h / 2)
			e.className = "hide unit vassal vassal_" + vassal.name.toLowerCase()
			e.style.position = "absolute"
			e.style.top = yc - 27 + "px"
			e.style.left = xc - 27 + "px"
			register_action(e, "vassal", ix)
			register_tooltip(e, data.vassals[ix].name)
			document.getElementById("pieces").appendChild(e)
		}

		e = ui.vassal_cal[ix] = document.createElement("div")
		e.className = "hide unit vassal + vassal_" + vassal.name.toLowerCase()
		e.style.position = "absolute"
		register_action(e, "vassal", ix)
		register_tooltip(e, data.vassals[ix].name)
		document.getElementById("pieces").appendChild(e)

		e = ui.vassal_mat[ix] = document.createElement("div")
		e.className = "unit vassal + vassal_" + vassal.name.toLowerCase()
		register_action(e, "vassal", ix)
		register_tooltip(e, data.vassals[ix].name)
	})

	for (let i = 1; i <= 16; ++i) {
		let name = "box" + i
		let x = calendar_boxes[name][0]
		let y = calendar_boxes[name][1]
		let w = calendar_boxes[name][2]
		let h = calendar_boxes[name][3]
		calendar_xy[i] = [ x, y, w, h ]

		let e = ui.calendar[i] = document.createElement("div")
		e.className = "calendar box " + name
		e.style.left = x + "px"
		e.style.top = y + "px"
		e.style.width = w + "px"
		e.style.height = h + "px"
		document.getElementById("boxes").appendChild(e)
	}

	for (let i = 0; i <= 45; ++i) {
		let name = "track" + i
		let x = 0, y = 0
		if (i <= 25) {
			x = 24 + i * 47.25 + 22
			y = 1577 + 22
		} else {
			x = 1205 + 22
			y = 1577 - (i-25) * 47.25 + 22
		}
		track_xy[i] = [ x, y ]
	}

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

function layout_locale_cylinders(loc, list, dx) {
	let [xc, yc] = locale_xy[loc]
	let dy = (list.length - 1) * -15
	let x = xc + dx
	let y = yc + dy
	let z = 5
	for (let ix of list) {
		let e = ui.lord_cylinder[ix]
		e.style.top = (y - 23) + "px"
		e.style.left = (x - 23) + "px"
		e.style.zIndex = z++
		y += 30
	}
}

function layout_exile_box_cylinders(loc, list, dy) {
	let [xc, yc] = locale_xy[loc]
	let dx = (list.length - 1) * -23
	let x = xc + dx
	let y = yc + dy
	let z = 5
	for (let ix of list) {
		let e = ui.lord_cylinder[ix]
		e.style.top = (y - 23) + "px"
		e.style.left = (x - 23) + "px"
		e.style.zIndex = z++
		x += 46
	}
}

function layout_calendar() {
	for (let loc = 1; loc <= 16; ++loc) {
		let [cx, cy] = calendar_xy[loc]
		let list

		list = calendar_layout_lanc[loc]
		for (let i = 0; i < list.length; ++i) {
			let e = ui.lord_cylinder[list[i]]
			let x = cx, y = cy, z = 30
			x += 5
			y += i * 30 - 2
			e.style.top = y + "px"
			e.style.left = x + "px"
			e.style.zIndex = z

			// cylinder is 44x48, exile marker is 39
			if (is_lord_in_exile(list[i])) {
				e = ui.lord_exile[list[i]]
				e.style.top = y + 5 + "px"
				e.style.left = x + 3 - 20 + "px"
				e.style.zIndex = z - 1
			}
		}

		list = calendar_layout_york[loc]
		for (let i = 0; i < list.length; ++i) {
			// ui.lord_exile[ix].classList.toggle("hide", !is_lord_in_exile(ix))
			let e = ui.lord_cylinder[list[i]]
			let x = cx, y = cy, z = 30
			x += 50
			y += i * 30 - 2
			e.style.top = y + "px"
			e.style.left = x + "px"
			e.style.zIndex = z

			// cylinder is 44, exile marker is 39
			if (is_lord_in_exile(list[i])) {
				e = ui.lord_exile[list[i]]
				e.style.top = y + "px"
				e.style.left = x + 3 + 20 + "px"
				e.style.zIndex = z - 1
			}
		}

		list = calendar_layout_vassal[loc]
		for (let i = 0; i < list.length; ++i) {
			let e = list[i]
			let x = cx, y = cy, z = 20 - i
			let len_lanc = calendar_layout_lanc[loc].length
			let len_york = calendar_layout_york[loc].length
			if (len_lanc <= len_york) {
				y += len_lanc * 30 + 48-30 + 3 + i * 20
				x += 7
			} else {
				y += len_york * 30 + 48-30 + 3 + i * 20
				x += 42
			}
			e.style.top = y + "px"
			e.style.left = x + "px"
			e.style.zIndex = z
		}

	}
}

function add_vassal(parent, vassal, lord, routed) {
	let elt = ui.vassal_mat[vassal]
	elt.classList.toggle("selected", view.vassal === vassal || set_has(view.vassal, vassal))
	parent.appendChild(elt)
}

function add_force(parent, type, lord, routed, first, z) {
	let elt
	if (routed) {
		if (first && is_action(routed_force_action_name[type], lord))
			elt = get_cached_element("action unit " + force_class_name[type], routed_force_action_name[type], lord)
		else
			elt = get_cached_element("unit " + force_class_name[type], routed_force_action_name[type], lord)
	} else {
		if (first && is_action(force_action_name[type], lord))
			elt = get_cached_element("action unit " + force_class_name[type], force_action_name[type], lord)
		else
			elt = get_cached_element("unit " + force_class_name[type], force_action_name[type], lord)
	}
	elt.style.zIndex = z
	parent.appendChild(elt)
}

function add_asset(parent, type, n, lord, first, z) {
	let elt
	if (first && is_action(asset_action_name[type], lord))
		elt = get_cached_element("action asset " + asset_action_name[type] + " x" + n, asset_action_name[type], lord)
	else
		elt = get_cached_element("asset " + asset_action_name[type] + " x" + n)
	elt.style.zIndex = z
	parent.appendChild(elt)
}

function update_forces(parent, a, b, forces, lord_ix, routed) {
	parent.replaceChildren()
	let z = 5
	for (let i = a; i <= b; ++i) {
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
				add_force(parent, i, lord_ix, routed, k === n-1, z++)
			}
			if (i > 1) {
				z = 5
				parent.appendChild(get_cached_element("break"))
			}
		}
	}
}

function update_assets(parent, assets, lord_ix) {
	parent.replaceChildren()
	let z = 5
	for (let i = 0; i < asset_type_count; ++i) {
		let n = map_get_pack4(assets, lord_ix, i, 0)
		if (asset_type_x34[i]) {
			while (n >= 4) {
				n -= 4
				add_asset(parent, i, 4, lord_ix, n === 0, z++)
			}
			while (n >= 3) {
				n -= 3
				add_asset(parent, i, 3, lord_ix, n === 0, z++)
			}
		}
		while (n >= 2) {
			n -= 2
			add_asset(parent, i, 2, lord_ix, n === 0, z++)
		}
		while (n >= 1) {
			n -= 1
			add_asset(parent, i, 1, lord_ix, n === 0, z++)
		}
		if (i < 2) {
			z = 5
			parent.appendChild(get_cached_element("break"))
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
	parent.replaceChildren()
	if (!battle) return
	for (let i = 0; i < battle.valour[lord]; i++) {
		add_valour(parent, lord)
	}

}

function update_lord_mat(ix) {
	if (view.reveal & (1 << ix)) {
		ui.mat[ix].classList.remove("hidden")
		update_assets(ui.assets[ix], view.pieces.assets, ix)
		update_forces(ui.retinue[ix], 0, 1, view.pieces.forces, ix, false)
		update_forces(ui.routed_retinue[ix], 0, 1, view.pieces.routed, ix, true)
		update_forces(ui.troops[ix], 2, 6, view.pieces.forces, ix, false)
		update_forces(ui.routed_troops[ix], 2, 6, view.pieces.routed, ix, true)
		ui.lord_feed[ix].classList.toggle("hide", count_lord_all_forces(ix) <= 6)

		if (get_lord_locale(LORD_HENRY_VI) === CAPTURE_OF_THE_KING + ix)
			ui.marker_area[ix].appendChild(ui.captured_king)
	} else {
		ui.mat[ix].classList.add("hidden")
		ui.assets[ix].replaceChildren()
		ui.retinue[ix].replaceChildren()
		ui.routed_retinue[ix].replaceChildren()
		ui.troops[ix].replaceChildren()
		ui.routed_troops[ix].replaceChildren()
		ui.lord_moved1[ix].classList.add("hide")
		ui.lord_moved2[ix].classList.add("hide")
		ui.lord_feed[ix].classList.add("hide")

		if (get_lord_locale(LORD_HENRY_VI) === CAPTURE_OF_THE_KING + ix)
			ui.marker_area[ix].appendChild(ui.captured_king)
	}
	let m = get_lord_moved(ix)
	ui.lord_moved1[ix].classList.toggle("hide", is_levy_phase() || (m !== 1 && m !== 2))
	ui.lord_moved2[ix].classList.toggle("hide", is_levy_phase() || (m !== 2))
	ui.lord_fled[ix].classList.toggle("hide", view.battle === undefined || !set_has(view.battle.fled, ix))
	update_valour(ix, ui.valour_area[ix], view.battle)
}

function update_lord(ix) {
	let locale = get_lord_locale(ix)
	if (locale < 0 || locale > CALENDAR_EXILE + 16) {
		ui.lord_cylinder[ix].classList.add("hide")
		ui.mat[ix].classList.remove("action")
		return
	}
	if (locale < CALENDAR) {
		if (is_york_lord(ix))
			locale_layout_york[locale].push(ix)
		else
			locale_layout_lanc[locale].push(ix)
		ui.lord_cylinder[ix].classList.remove("hide")
		update_lord_mat(ix)
		ui.lord_exile[ix].classList.add("hide")
	} else if (locale <= CALENDAR_EXILE + 16) {
		let t = locale > CALENDAR_EXILE ? locale - CALENDAR_EXILE : locale - CALENDAR
		if (is_york_lord(ix))
			calendar_layout_york[t].push(ix)
		else
			calendar_layout_lanc[t].push(ix)
		ui.lord_cylinder[ix].classList.remove("hide")
		ui.lord_exile[ix].classList.toggle("hide", !is_lord_in_exile(ix))
	}
	ui.mat_card[ix].classList.toggle("action", is_action("lord", ix))
	ui.lord_cylinder[ix].classList.toggle("action", is_action("lord", ix))

	ui.lord_cylinder[ix].classList.toggle("selected", is_lord_selected(ix))
	ui.mat[ix].classList.toggle("selected", is_lord_selected(ix))

	ui.lord_cylinder[ix].classList.toggle("command", is_lord_command(ix))
	ui.mat[ix].classList.toggle("command", is_lord_command(ix))

	ui.seat[ix].classList.toggle("hide", !is_lord_in_game(ix))
}

function update_locale(loc) {
	if (data.locales[loc].type === "exile_box") {
		layout_exile_box_cylinders(loc, locale_layout_lanc[loc], 0)
		layout_exile_box_cylinders(loc, locale_layout_york[loc], 30)
	} else {
		layout_locale_cylinders(loc, locale_layout_lanc[loc], -30)
		layout_locale_cylinders(loc, locale_layout_york[loc], 30)
	}

	ui.locale[loc].classList.toggle("action", is_action("locale", loc) || is_action("laden_march", loc))
	ui.locale[loc].classList.toggle("selected", view.where === loc || set_has(view.where, loc))
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

	if (loc === LOC_LONDON) {
		if (set_has(view.pieces.favoury, LONDON_FOR_YORK)) {
			// TODO: extra rose marker
		}
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
				if (is_lord_in_game(lord)) {
					ui.plan_action_cards[lord].classList.remove("hide")
					if (is_action("plan", lord)) {
						ui.plan_action_cards[lord].classList.add("action")
						ui.plan_action_cards[lord].classList.remove("disabled")
					} else {
						ui.plan_action_cards[lord].classList.remove("action")
						ui.plan_action_cards[lord].classList.add("disabled")
					}
				} else {
					ui.plan_action_cards[lord].classList.add("hide")
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
		ui.mat_caps[ix].replaceChildren()
		if (view.reveal & (1 << ix)) {
			let c = get_lord_capability(ix, 0)
			if (c >= 0)
				ui.mat_caps[ix].appendChild(ui.cards[c])
			c = get_lord_capability(ix, 1)
			if (c >= 0)
				ui.mat_caps[ix].appendChild(ui.cards[c])
		}
	}
}

function update_battle() {
	let array = view.battle.array

	for (let i = 0; i < array.length; ++i) {
		let lord = array[i]
		ui.battle_grid_array[i].replaceChildren()
		if (lord >= 0)
			ui.battle_grid_array[i].appendChild(ui.mat[lord])
		ui.battle_grid_array[i].classList.toggle("action", is_action("array", i))
	}

	ui.reserves.replaceChildren()
	for (let lord of view.battle.reserves)
		ui.reserves.appendChild(ui.mat[lord])

	ui.routed.replaceChildren()
	for (let lord of view.battle.routed)
		ui.routed.appendChild(ui.mat[lord])
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
			ycourt.appendChild(ui.mat[lord])
	for (let lord = first_lancaster_lord; lord <= last_lancaster_lord; ++lord)
		if (!is_lord_in_battle(lord) && is_lord_on_map(lord))
			lcourt.appendChild(ui.mat[lord])
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
				ui.vassal_map[v].classList.toggle("selected", v === view.vassal || set_has(view.vassal, v))
			}
		} else {
			// on calendar (+ maybe on lord mat)
			if (data.vassals[v].service > 0) {
				ui.vassal_cal[v].classList.remove("hide")
				ui.vassal_cal[v].classList.toggle("action", is_action("vassal", v))
				ui.vassal_cal[v].classList.toggle("selected", v === view.vassal || set_has(view.vassal, v))
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

var track_offset = new Array(45).fill(0)

function show_track_marker(elt, pos) {
	let n = track_offset[pos]++
	let x = track_xy[pos][0] - 25
	let y = track_xy[pos][1] - 25

	if (pos <= 10) {
		y -= 51 * n
	} else if (pos < 24) {
		y -= 24 * n
	} else if (pos > 26) {
		x -= 51 * n
	} else {
		x -= 24 * n
		y -= 24 * n
	}

	elt.style.left = x + "px"
	elt.style.top = y + "px"
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
		calendar_layout_york[i].length = 0
		calendar_layout_lanc[i].length = 0
		calendar_layout_vassal[i].length = 0
	}

	for (let i = 0; i < data.locales.length; ++i) {
		locale_layout_york[i].length = 0
		locale_layout_lanc[i].length = 0
	}

	track_offset.fill(0)

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

	if (view.end < 16) {
		ui.end.style.display = null
		ui.end.style.left = (calendar_xy[view.end][0] + 91 - 52) + "px"
		ui.end.style.top = (calendar_xy[view.end][1] + 94) + "px"
	} else {
		ui.end.style.display = "none"
	}

	ui.held_york.textContent = `${view.held_y} Held`
	ui.held_lancaster.textContent = `${view.held_l} Held`

	if (view.victory_check <= 45) {
		ui.victory_check.style.display = null
		show_track_marker(ui.victory_check, view.victory_check)
	} else {
		ui.victory_check.style.display = "none"
	}

	let towns = count_favour(TOWN)
	ui.towns.classList.toggle("york", towns < 0)
	ui.towns.classList.toggle("lancaster", towns >= 0)
	show_track_marker(ui.towns, Math.abs(towns))

	let cities = count_favour(CITY)
	ui.cities.classList.toggle("york", cities < 0)
	ui.cities.classList.toggle("lancaster", cities >= 0)
	show_track_marker(ui.cities, Math.abs(cities))

	let fortresses = count_favour(FORTRESS)
	ui.fortresses.classList.toggle("york", fortresses < 0)
	ui.fortresses.classList.toggle("lancaster", fortresses >= 0)
	show_track_marker(ui.fortresses, Math.abs(fortresses))

	ui.influence.classList.toggle("york", view.influence < 0)
	ui.influence.classList.toggle("lancaster", view.influence >= 0)
	show_track_marker(ui.influence, Math.abs(view.influence))

	update_plan()
	update_cards()

	if (view.battle) {
		ui.reserves_panel.classList.toggle("hide", view.battle.reserves.length === 0)
		ui.routed_panel.classList.toggle("hide", view.battle.routed.length === 0)
		ui.battle_panel.classList.remove("hide")
		ui.battle_header.textContent = "Battle at " + data.locales[view.battle.where].name
		if (view.battle.attacker === player) {
			ui.battle_grid.className = "attacker"
		} else {
			ui.battle_grid.className = "defender"
		}

		update_battle()
	} else {
		ui.battle_panel.classList.add("hide")
		ui.reserves_panel.classList.add("hide")
		ui.routed_panel.classList.add("hide")
	}


	update_court()

	// Misc
	action_button("richard_iii", "Richard III")
	action_button("exile", "Exile")
	action_button("vanguard", "Vanguard")
	action_button("final_charge", "Final Charge")
	action_button("lordship", "Lordship")
	action_button("march", "March")
	action_button("avoid", "Avoid Battle")
	action_button("withdraw", "Withdraw")
	action_button("retreat", "Retreat")
	action_button("regroup", "Regroup")
	action_button("remove", "Remove")
	action_button("surrender", "Surrender")
	action_button("roll", "Roll")

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
	action_button("take_ship", "Ship")
	action_button("take_cart", "Cart")
	action_button("take_all", "Take all")
	action_button("levy_troops", "Levy Troops")
	action_button("levy_beloved_warwick", "Beloved Warwick")
	action_button("levy_irishmen", "Irishmen")
	action_button("soldiers_of_fortune", "Soldiers of Fortune")
	action_button("commission_of_array", "Commission of Array")

	action_button("capability", "Capability")

	// Influence Check
	action_button_with_argument("check", 2, "Check +2")
	action_button_with_argument("check", 1, "Check +1")
	action_button_with_argument("check", 0, "Check")

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
	action_button("play", "Play")
	action_button("hold", "Hold")

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
	action_button("escape_ship", "End Escape Ship")
	action_button("loyalty_and_trust", "+3 Lordship")

	action_button("end_wastage", "End Wastage")
	action_button("end_withdraw", "End Withdraw")
	action_button("end_battle_round", "End Round")

	// ADDING TROOPS THROUGH EVENTS
	action_button("add_militia", "Add Militia")
	action_button("add_militia2", "Add 2 Militia")

	action_button("add_men_at_arms", "Add Men at Arms")
	
	// REMOVE INFLUENCE
	action_button("influence", "Influence")
	action_button("favour", "Favour")
	action_button("valour", "Valour")

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
	ui.mat[lord].scrollIntoView({ block: "center", inline: "center", behavior: "smooth" })
}

function sub_locale_name(match, p1) {
	let x = p1 | 0
	let n = data.locales[x].name
	return `<span class="locale_tip" onmouseenter="on_focus_locale_tip(${x})" onmouseleave="on_blur_locale_tip(${x})" onclick="on_click_locale_tip(${x})">${n}</span>`
}

function sub_lord_name(match, p1) {
	let x = p1 | 0
	let n = data.lords[x].short_name
	return `<span class="lord_tip" onclick="on_click_lord_tip(${x})">${n}</span>`
}

function sub_vassal_name(match, x) {
	let n = data.vassals[x].name
	return `<span class="vassal_tip" >${n}</span>`
}

const ICONS_SVG = {
	B0: '<span class="black d0"></span>',
	B1: '<span class="black d1"></span>',
	B2: '<span class="black d2"></span>',
	B3: '<span class="black d3"></span>',
	B4: '<span class="black d4"></span>',
	B5: '<span class="black d5"></span>',
	B6: '<span class="black d6"></span>',
	W0: '<span class="white d0"></span>',
	W1: '<span class="white d1"></span>',
	W2: '<span class="white d2"></span>',
	W3: '<span class="white d3"></span>',
	W4: '<span class="white d4"></span>',
	W5: '<span class="white d5"></span>',
	W6: '<span class="white d6"></span>',
}

const ICONS_HTM = {
	B0: '<span class="black d0">0</span>',
	B1: '<span class="black d1">1</span>',
	B2: '<span class="black d2">2</span>',
	B3: '<span class="black d3">3</span>',
	B4: '<span class="black d4">4</span>',
	B5: '<span class="black d5">5</span>',
	B6: '<span class="black d6">6</span>',
	W0: '<span class="white d0">0</span>',
	W1: '<span class="white d1">1</span>',
	W2: '<span class="white d2">2</span>',
	W3: '<span class="white d3">3</span>',
	W4: '<span class="white d4">4</span>',
	W5: '<span class="white d5">5</span>',
	W6: '<span class="white d6">6</span>',
}

const ICONS_TXT = {
	B0: "\u25cf",
	B1: "\u2776",
	B2: "\u2777",
	B3: "\u2778",
	B4: "\u2779",
	B5: "\u277A",
	B6: "\u277B",
	W0: "\u25cb",
	W1: "\u2460",
	W2: "\u2461",
	W3: "\u2462",
	W4: "\u2463",
	W5: "\u2464",
	W6: "\u2465",
}

function sub_icon(match) {
	return ICONS_TXT[match]
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

	text = text.replace(/\b[BW]\d\b/g, sub_icon)

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
	if (!set)
		return false
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

