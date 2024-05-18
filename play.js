"use strict"

/* global data, view, player, action_button, action_button_with_argument, send_action */

/* export toggle_pieces, toggle_seats, on_update, on_log */

function toggle_pieces() {
	document.getElementById("pieces").classList.toggle("hide")
}

function toggle_seats() {
	document.getElementById("seats").classList.toggle("hide")
}

// === GAME STATE ===

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
	if (!Array.isArray(set))
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

function pack4_get(word, n) {
	n = n << 2
	return (word >>> n) & 15
}

const LORD_HENRY_VI = data.lords.findIndex(x => x.name === "Henry VI")
const LOC_LONDON = data.locales.findIndex(x => x.name === "London")

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

const MEN_AT_ARMS = 2
const LONGBOWMEN = 3
const MILITIA = 4
const BURGUNDIANS = 5
const MERCENARIES = 6

const force_action_name = [ "retinue", "vassal", "men_at_arms", "longbowmen", "militia", "burgundians", "mercenaries" ]
const force_class_name = [ "retinue", "vassal", "shape men_at_arms", "shape longbowmen", "shape militia", "shape burgundians", "shape mercenaries" ]
const routed_force_action_name = [ "routed_retinue", "routed_vassal", "routed_men_at_arms", "routed_longbowmen", "routed_militia", "routed_burgundians", "routed_mercenaries" ]

const asset_type_count = 4
const asset_action_name = [ "prov", "coin", "cart", "ship" ]
const asset_type_x34 = [ 1, 1, 1, 0 ]

const NOWHERE = -1
const CALENDAR = 100
const CALENDAR_EXILE = 200
const LONDON_FOR_YORK = 300
const CAPTURE_OF_THE_KING = 400 // Ia. special rule (400 + lord ID that has him captured)

const VASSAL_READY = 29
const VASSAL_DISBANDED = 30
const VASSAL_OUT_OF_PLAY = 31

function is_special_vassal(v) {
	return data.vassals[v].box === null
}

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

function current_season() {
	return SEASONS[view.turn >> 1]
}

function max_plan_length() {
	switch (current_season()) {
		case SUMMER:
			return 7
		case WINTER:
			return 4
		case SPRING:
			return 6
		case AUTUMN:
			return 6
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

function get_lord_forces(lord, n) {
	return map_get_pack4(view.pieces.forces, lord, n, 0)
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

function is_lord_on_map(lord) {
	let loc = get_lord_locale(lord)
	return loc !== NOWHERE && loc < CALENDAR
}

function is_lord_in_game(lord) {
	return get_lord_locale(lord) !== NOWHERE
}

function is_levy_phase() {
	return (view.turn & 1) === 0
}

function is_lord_in_battle(lord) {
	if (view.battle && view.battle.array) {
		for (let i = 0; i < 6; ++i)
			if (view.battle.array[i] === lord)
				return true
	}
	return false
}

function is_lord_command(ix) {
	if (view.battle)
		return false
	return view.command === ix
}

function is_lord_selected(ix) {
	if (view.group)
		return set_has(view.group, ix)
	if (view.who >= 0)
		return ix === view.who
	return false
}

const SCENARIO_IA = 0
const SCENARIO_IB = 1
const SCENARIO_IC = 2
const SCENARIO_II = 3
const SCENARIO_III = 4

const scenario_end_marker = [
	16,
	2,
	8,
	16,
	10,
]

function scenario_victory_threshold() {
	let turn = view.turn >> 1
	switch (view.scenario) {
		case SCENARIO_IA:
			if (turn <= 5)
				return 40
			if (turn <= 10)
				return 35
			return 30
		case SCENARIO_IB:
			return 100 // no threshold
		case SCENARIO_IC:
			return 25
		case SCENARIO_II:
			if (turn <= 5)
				return 40
			if (turn <= 10)
				return 35
			return 30
		case SCENARIO_III:
			return 45
	}
	return 45
}

// === BUILD UI ===

function is_action(action, arg) {
	if (arg === undefined)
		return !!(view.actions && view.actions[action] === 1)
	return !!(view.actions && view.actions[action] && set_has(view.actions[action], arg))
}

function register_action(target, action, id) {
	target.my_id = id
	target.my_action = action
	target.onmousedown = (evt) => on_action(evt, target)
}

function on_action(evt, target) {
	if (evt.button === 0)
		if (send_action(target.my_action, target.my_id))
			evt.stopPropagation()
}

var locale_lord_york = []
var locale_lord_lanc = []
var calendar_lord_york = []
var calendar_lord_lanc = []
var calendar_vassal_disband = []
var calendar_vassal_york = []
var calendar_vassal_lanc = []

const ui = {
	favicon: document.getElementById("favicon"),
	locale: [],
	depleted: [],
	locale_markers_rose: [],
	lord_cylinder: [],
	lord_retinue: [],
	lord_routed_retinue: [],
	mat: [],
	mat_card: [],
	mat_caps: [],

	retinue_area: [],
	vassal_area: [],
	routed_retinue_vassal_area: [],
	troops: [],
	routed_troops: [],
	assets: [],

	lord_exile: [],
	vassal_map: [], // token on map/calendar
	vassal_mat: [], // token on mat
	valour_area: [],
	marker_area: [],

	lord_moved1: [],
	lord_moved2: [],
	lord_feed: [],

	cards: [],
	cards2: [],
	lords2: [],
	seat: [],

	plan_panel: document.getElementById("plan_panel"),
	plan: document.getElementById("plan"),
	plan_actions: document.getElementById("plan_actions"),
	plan_cards: [],
	plan_action_cards: [],

	arts_of_war_panel: document.getElementById("arts_of_war_panel"),
	arts_of_war: document.getElementById("arts_of_war"),

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
	battle: document.getElementById("battle"),

	court1_panel: document.getElementById("court1_panel"),
	court2_panel: document.getElementById("court2_panel"),
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

const TRACK_XY = []

for (let i = 0; i <= 45; ++i) {
	let x = 0, y = 0
	if (i <= 25) {
		x = 24 + i * 47.25 + 22
		y = 1577 + 22
	} else {
		x = 1205 + 22
		y = 1577 - (i-25) * 47.25 + 22
	}
	TRACK_XY[i] = [ Math.round(x), Math.round(y) ]
}

const CALENDAR_XY = [
	[102,38],
	[204,38],
	[306,38],
	[408,38],
	[510,38],
	[612,38],
	[734,38],
	[836,38],
	[938,38],
	[1040,38],
	[1142,38],
	[734,260],
	[836,260],
	[938,260],
	[1040,260],
	[1142,260],
	[1030,480],
]

const LOCALE_XY = []

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

function build_lord_mat(ix, side, name) {
	let mat = build_div(null, `mat ${side} ${name}`)
	let board = build_div(mat, "board")
	ui.mat_card[ix] = build_div(board, "card lord " + side + " " + name)
	ui.lords2[ix] = build_div(null, "card lord " + side + " " + name)
	build_div(board, "mask " + side)
	ui.retinue_area[ix] = build_div(board, "retinue_area")
	ui.vassal_area[ix] = build_div(board, "vassal_area")
	ui.routed_retinue_vassal_area[ix] = build_div(board, "routed_retinue_vassal_area")
	ui.troops[ix] = build_div(board, "troops")
	ui.routed_troops[ix] = build_div(board, "routed_troops")
	ui.assets[ix] = build_div(board, "assets")
	ui.mat_caps[ix] = build_div(mat, "capabilities")
	ui.valour_area[ix] = build_div(board, "valour_area")
	ui.marker_area[ix] = build_div(board, "marker_area")

	ui.lord_moved1[ix] = build_div(ui.marker_area[ix], "marker square moved_fought one hide")
	ui.lord_moved2[ix] = build_div(ui.marker_area[ix], "marker square moved_fought two hide")
	ui.lord_feed[ix] = build_div(ui.marker_area[ix], "marker small feed x2")

	ui.mat[ix] = mat
	register_action(ui.mat_card[ix], "lord", ix)
}

function build_card(c, name) {
	let card = ui.cards[c] = document.querySelector(`div[data-card="${name}"]`)
	ui.cards2[c] = card.cloneNode(true)
	register_action(card, "card", c)
}

(function build_map() {
	let elt

	for (let i = 0; i <= 16; ++i) {
		calendar_lord_york[i] = []
		calendar_lord_lanc[i] = []
		calendar_vassal_disband[i] = []
		calendar_vassal_york[i] = []
		calendar_vassal_lanc[i] = []
	}

	data.locales.forEach((locale, ix) => {
		let region = locale.region ? clean_name(locale.region) : ""
		let { x, y, w, h } = locale.box
		let ax, ay, aw, ah
		let xc = Math.round(x + w / 2)
		let yc = Math.round(y + h / 2)
		let e

		LOCALE_XY[ix] = [ xc, yc ]

		locale_lord_york[ix] = []
		locale_lord_lanc[ix] = []

		if (locale.type === "exile_box") {
			LOCALE_XY[ix] = [ xc, y + 45 ]
			ax = x + 6
			ay = y + 6
			aw = w - 13
			ah = h - 21
		} else if (locale.type === "fortress") {
			ax = x - 12
			aw = w + 24
			ay = y - 28
			ah = h + 28
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
		register_action(e, "locale", ix)
		register_tooltip(e, on_focus_locale)
		document.getElementById("locales").appendChild(e)

		// London for York
		if (ix === LOC_LONDON) {
			e = ui.london_for_york = document.createElement("div")
			e.className = "hide"
			e.style.top = yc - 20 - 13 + "px"
			//e.style.top = y + h - 43 - 13 + "px"
			e.style.left = xc - 20 - 13 + "px"
			e.style.pointerEvents = "none"
			document.getElementById("pieces").appendChild(e)
		}

		// Favour
		if (locale.type === "exile_box") {
			e = ui.locale_markers_rose[ix] = document.createElement("div")
			e.className = "hide"
			e.style.top = (y + h - 50) + "px"
			e.style.left = (xc - 27) + "px"
			e.style.pointerEvents = "none"
			document.getElementById("pieces").appendChild(e)
		} else {
			e = ui.locale_markers_rose[ix] = document.createElement("div")
			e.className = "hide"
			e.style.top = yc - 20 + "px"
			//e.style.top = y + h - 43 + "px"
			e.style.left = xc - 20 + "px"
			e.style.pointerEvents = "none"
			document.getElementById("pieces").appendChild(e)
		}

		// Depleted/Exhausted
		e = ui.depleted[ix] = document.createElement("div")
		e.className = "hide marker small depexh " + locale.name
		e.style.top = yc - 20 - 13 + "px"
		//e.style.top = y + h - 43 - 13 + "px"
		e.style.left = xc - 20 + 13 + "px"
		e.style.pointerEvents = "none"
		document.getElementById("pieces").appendChild(e)

	})

	let layout_seat_york = []
	let layout_seat_lanc = []
	for (let loc = first_locale; loc <= last_locale; ++loc) {
		layout_seat_york[loc] = []
		layout_seat_lanc[loc] = []
	}

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

		ui.lord_retinue[ix] = document.createElement("div")
		ui.lord_retinue[ix].className = "unit retinue"
		register_action(ui.lord_retinue[ix], "retinue", ix)

		ui.lord_routed_retinue[ix] = document.createElement("div")
		ui.lord_routed_retinue[ix].className = "unit retinue"
		register_action(ui.lord_routed_retinue[ix], "routed_retinue", ix)

		build_lord_mat(ix, side, lord.id)

		let loc = data.lords[ix].seat
		e = ui.seat[ix] = document.createElement("div")
		document.getElementById("seats").appendChild(e)
		if (is_york_lord(ix)) {
			e.className = "hide seat york " + lord.id
			layout_seat_york[loc].push(e)
		} else {
			e.className = "hide seat lancaster " + lord.id
			layout_seat_lanc[loc].push(e)
		}
	})

	function layout_seat_markers(loc, dx, dy, list) {
		let [ x, y ] = LOCALE_XY[loc]
		y -= (list.length - 1) * 8
		x += dx
		y += dy
		for (let e of list) {
			e.style.top = y - 37 + "px"
			e.style.left = x - 37 + "px"
			y += 16
		}
	}

	for (let loc = first_locale; loc <= last_locale; ++loc) {
		if (layout_seat_lanc[loc].length + layout_seat_york[loc].length === 1) {
			layout_seat_markers(loc, 0, -22, layout_seat_lanc[loc])
			layout_seat_markers(loc, 0, -22, layout_seat_york[loc])
		} else if (data.locales[loc].name === "Calais" || data.locales[loc].name === "Carlisle") {
			layout_seat_markers(loc, -44, 0, layout_seat_york[loc].concat(layout_seat_lanc[loc]))
		} else {
			layout_seat_markers(loc, -44, 0, layout_seat_lanc[loc])
			layout_seat_markers(loc, 44, 0, layout_seat_york[loc])
		}
	}

	ui.captured_king = document.createElement("div")
	ui.captured_king.className = "cylinder lancaster " + data.lords[LORD_HENRY_VI].id
	ui.captured_king.style.position = "static"

	data.vassals.forEach((vassal, ix) => {
		let e

		if (!is_special_vassal(ix)) {
			let { x, y, w, h } = vassal.box
			e = ui.vassal_map[ix] = document.createElement("div")
			let xc = Math.round(x + w / 2)
			let yc = Math.round(y + h / 2)
			e.className = "hide unit vassal vassal_" + vassal.name.toLowerCase().replaceAll(" ", "_")
			e.style.position = "absolute"
			e.my_map_x = xc - 27 + "px"
			e.my_map_y = yc - 27 + "px"
			register_action(e, "vassal", ix)
			register_tooltip(e, data.vassals[ix].name)
			document.getElementById("pieces").appendChild(e)
		}

		e = ui.vassal_mat[ix] = document.createElement("div")
		e.className = "unit vassal vassal_" + vassal.name.toLowerCase().replaceAll(" ", "_")
		register_action(e, "vassal", ix)
		register_tooltip(e, data.vassals[ix].name)
	})

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

	for (let i = 0; i < 6; ++i)
		register_action(ui.battle_grid_array[i], "array", i)

	for (let c = first_york_card; c <= last_york_card; ++c)
		build_card(c, "Y" + (1 + c - first_york_card))
	for (let c = first_lancaster_card; c <= last_lancaster_card; ++c)
		build_card(c, "L" + (1 + c - first_lancaster_card))

	ui.card_aow_lancaster_back = build_div(null, "card aow lancaster back")
	ui.card_aow_york_back = build_div(null, "card aow york back")
	ui.card_cc_lancaster_back = build_div(null, "card cc lancaster back")
	ui.card_cc_york_back = build_div(null, "card cc york back")

	ui.card_cc = []
	for (let i = 0; i < 14; ++i)
		ui.card_cc[i] = build_div(null, "card cc york " + data.lords[i].id)
	for (let i = 14; i < 28; ++i)
		ui.card_cc[i] = build_div(null, "card cc lancaster " + data.lords[i].id)
})()

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
	let [xc, yc] = LOCALE_XY[loc]
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
	let [xc, yc] = LOCALE_XY[loc]
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
		let [cx, cy] = CALENDAR_XY[loc]
		let list

		list = calendar_lord_lanc[loc]
		for (let i = 0; i < list.length; ++i) {
			let e = ui.lord_cylinder[list[i]]
			let x = cx, y = cy, z = 30 + i
			x += 5
			y += i * 30 - 2
			e.style.top = y + "px"
			e.style.left = x + "px"
			e.style.zIndex = z

			// cylinder is 44x48, exile marker is 39
			if (is_lord_in_exile(list[i])) {
				e = ui.lord_exile[list[i]]
				e.style.top = y + 7 + "px"
				e.style.left = x + 3 - 20 + "px"
				e.style.zIndex = z + 1
			}
		}

		list = calendar_lord_york[loc]
		for (let i = 0; i < list.length; ++i) {
			// ui.lord_exile[ix].classList.toggle("hide", !is_lord_in_exile(ix))
			let e = ui.lord_cylinder[list[i]]
			let x = cx, y = cy, z = 30 + i
			x += 50
			y += i * 30 - 2
			e.style.top = y + "px"
			e.style.left = x + "px"
			e.style.zIndex = z

			// cylinder is 44, exile marker is 39
			if (is_lord_in_exile(list[i])) {
				e = ui.lord_exile[list[i]]
				e.style.top = y + 7 + "px"
				e.style.left = x + 3 + 20 + "px"
				e.style.zIndex = z - 1
			}
		}

		list = calendar_vassal_lanc[loc]
		for (let i = 0; i < list.length; ++i) {
			let e = list[i]
			let x = cx, y = cy, z = 25 - i
			let len_lanc = calendar_lord_lanc[loc].length
			y += len_lanc * 30 + 10 + i * 32
			x += 0
			e.style.top = y + "px"
			e.style.left = x + "px"
			e.style.zIndex = z
		}

		list = calendar_vassal_york[loc]
		for (let i = 0; i < list.length; ++i) {
			let e = list[i]
			let x = cx, y = cy, z = 30 - i
			let len_york = calendar_lord_york[loc].length
			y += len_york * 30 + 10 + i * 32
			x += 51
			e.style.top = y + "px"
			e.style.left = x + "px"
			e.style.zIndex = z
		}

		list = calendar_vassal_disband[loc]
		for (let i = 0; i < list.length; ++i) {
			let e = list[i]
			let x = cx, y = cy, z = 20 - i
			let len_lanc = calendar_lord_lanc[loc].length * 30 + 10
			let len_york = calendar_lord_york[loc].length * 30 + 10
			let len_lanc2 = calendar_vassal_lanc[loc].length * 32
			let len_york2 = calendar_vassal_york[loc].length * 32
			y += Math.max(len_lanc + len_lanc2, len_york + len_york2) + i * 32
			x += 25
			e.style.top = y + "px"
			e.style.left = x + "px"
			e.style.zIndex = z
		}

	}
}

function add_retinue(parent, lord) {
	let elt = ui.lord_retinue[lord]
	elt.classList.toggle("action", is_action("retinue", lord))
	parent.appendChild(elt)
	if (view.battle && set_has(view.battle.fled, lord))
		elt.classList.add("fled")
	else
		elt.classList.remove("fled")
}

function add_routed_retinue(parent, lord) {
	let elt = ui.lord_routed_retinue[lord]
	elt.classList.toggle("action", is_action("routed_retinue", lord))
	parent.appendChild(elt)
	if (view.battle && set_has(view.battle.fled, lord))
		elt.classList.add("fled")
	else
		elt.classList.remove("fled")
}

function add_vassal(parent, vassal) {
	let elt = ui.vassal_mat[vassal]
	elt.classList.toggle("selected", view.vassal === vassal || set_has(view.vassal, vassal))
	elt.classList.toggle("action", is_action("vassal", vassal))
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

function update_lord_troops(parent, forces, lord_ix, routed) {
	parent.replaceChildren()
	let z = 5
	for (let i = 2; i <= 6; ++i) {
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

function update_lord_retinue(parent, forces, lord_ix) {
	parent.replaceChildren()
	let n = map_get_pack4(forces, lord_ix, 0, 0)
	if (n > 0)
		add_retinue(parent, lord_ix)
}

function update_lord_vassals(parent, lord_ix) {
	parent.replaceChildren()
	for_each_vassal_with_lord(lord_ix, v => {
		if (view.battle) {
			if (!set_has(view.battle.routed_vassals, v))
				add_vassal(parent, v)
		} else {
			add_vassal(parent, v)
		}
	})
}

function update_lord_routed_retinue_vassal(parent, forces, lord_ix) {
	parent.replaceChildren()
	let n = map_get_pack4(forces, lord_ix, 0, 0)
	if (n > 0)
		add_routed_retinue(parent, lord_ix)
	for_each_vassal_with_lord(lord_ix, v => {
		if (view.battle) {
			if (set_has(view.battle.routed_vassals, v))
				add_vassal(parent, v)
		}
	})
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

function add_valour(parent) {
	parent.appendChild(get_cached_element("marker valour small"))
}

function update_valour(lord, parent, battle) {
	parent.replaceChildren()
	if (!battle) return
	let n = map_get(battle.valour, lord, 0)
	for (let i = 0; i < n; i++)
		add_valour(parent, lord)
}

function update_lord_mat(ix) {
	ui.mat[ix].classList.remove("ravine")
	ui.mat[ix].classList.remove("engaged")

	if (view.battle) {
		if (view.battle.ravine === ix)
			ui.mat[ix].classList.add("ravine")
		if (view.engaged) {
			for (let p of view.engaged) {
				if (ix === view.battle.array[p])
					ui.mat[ix].classList.add("engaged")
			}
		}
	}

	if (view.reveal & (1 << ix)) {
		ui.mat[ix].classList.remove("hidden")
		update_assets(ui.assets[ix], view.pieces.assets, ix)

		update_lord_retinue(ui.retinue_area[ix], view.pieces.forces, ix)
		update_lord_vassals(ui.vassal_area[ix], ix)
		update_lord_routed_retinue_vassal(ui.routed_retinue_vassal_area[ix], view.pieces.routed, ix)

		update_lord_troops(ui.troops[ix], view.pieces.forces, ix, false)
		update_lord_troops(ui.routed_troops[ix], view.pieces.routed, ix, true)

		let n = count_lord_all_forces(ix)
		if (n <= 6)
			ui.lord_feed[ix].className = "hide"
		else if (n <= 12)
			ui.lord_feed[ix].className = "marker small feed x2"
		else
			ui.lord_feed[ix].className = "marker small feed x3"

		if (get_lord_locale(LORD_HENRY_VI) === CAPTURE_OF_THE_KING + ix)
			ui.marker_area[ix].appendChild(ui.captured_king)
	} else {
		ui.mat[ix].classList.add("hidden")
		ui.assets[ix].replaceChildren()
		ui.retinue_area[ix].replaceChildren()
		ui.vassal_area[ix].replaceChildren()
		ui.routed_retinue_vassal_area[ix].replaceChildren()
		ui.troops[ix].replaceChildren()
		ui.routed_troops[ix].replaceChildren()
		ui.lord_moved1[ix].classList.add("hide")
		ui.lord_moved2[ix].classList.add("hide")
		ui.lord_feed[ix].className = "hide"

		if (get_lord_locale(LORD_HENRY_VI) === CAPTURE_OF_THE_KING + ix)
			ui.marker_area[ix].appendChild(ui.captured_king)
	}
	let m = get_lord_moved(ix)
	ui.lord_moved1[ix].classList.toggle("hide", is_levy_phase() || !!view.battle || (m !== 1 && m !== 2))
	ui.lord_moved2[ix].classList.toggle("hide", is_levy_phase() || !!view.battle || (m !== 2))
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
			locale_lord_york[locale].push(ix)
		else
			locale_lord_lanc[locale].push(ix)
		ui.lord_cylinder[ix].classList.remove("hide")
		update_lord_mat(ix)
		ui.lord_exile[ix].classList.add("hide")
	} else if (locale <= CALENDAR_EXILE + 16) {
		let t = locale > CALENDAR_EXILE ? locale - CALENDAR_EXILE : locale - CALENDAR
		if (is_york_lord(ix))
			calendar_lord_york[t].push(ix)
		else
			calendar_lord_lanc[t].push(ix)
		ui.lord_cylinder[ix].classList.remove("hide")
		ui.lord_exile[ix].classList.toggle("hide", !is_lord_in_exile(ix))
	}
	ui.mat_card[ix].classList.toggle("action", is_action("lord", ix))
	ui.lord_cylinder[ix].classList.toggle("action", is_action("lord", ix))

	ui.lord_cylinder[ix].classList.toggle("selected", is_lord_selected(ix))
	ui.mat[ix].classList.toggle("selected", is_lord_selected(ix))

	ui.lord_cylinder[ix].classList.toggle("command", is_lord_command(ix))
	ui.mat[ix].classList.toggle("command", is_lord_command(ix))
}

function update_locale(loc) {
	if (data.locales[loc].type === "exile_box") {
		layout_exile_box_cylinders(loc, locale_lord_lanc[loc], 0)
		layout_exile_box_cylinders(loc, locale_lord_york[loc], 30)
	} else {
		layout_locale_cylinders(loc, locale_lord_lanc[loc], -30)
		layout_locale_cylinders(loc, locale_lord_york[loc], 30)
	}

	ui.locale[loc].classList.toggle("action", is_action("locale", loc))
	ui.locale[loc].classList.toggle("selected", view.where === loc || set_has(view.where, loc))
	ui.locale[loc].classList.toggle("supply_path", !!(view.supply && view.supply[0] === loc))
	ui.locale[loc].classList.toggle("supply_source", !!(view.supply && view.supply[1] === loc))

	if (set_has(view.pieces.exhausted, loc))
		ui.depleted[loc].className = "marker small exhausted"
	else if (set_has(view.pieces.depleted, loc))
		ui.depleted[loc].className = "marker small depleted"
	else
		ui.depleted[loc].className = "hide"

	if (data.locales[loc].type === "exile_box") {
		if (set_has(view.pieces.favourl, loc))
			ui.locale_markers_rose[loc].className = "marker circle exile_rose lancaster"
		else if (set_has(view.pieces.favoury, loc))
			ui.locale_markers_rose[loc].className = "marker circle exile_rose york"
		else
			ui.locale_markers_rose[loc].className = "hide"
	} else {
		if (set_has(view.pieces.favourl, loc))
			ui.locale_markers_rose[loc].className = "marker small rose lancaster"
		else if (set_has(view.pieces.favoury, loc))
			ui.locale_markers_rose[loc].className = "marker small rose york"
		else
			ui.locale_markers_rose[loc].className = "hide"
	}

	if (loc === LOC_LONDON) {
		if (set_has(view.pieces.favoury, LONDON_FOR_YORK))
			ui.london_for_york.className = "marker small rose york"
		else
			ui.london_for_york.className = "hide"
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
}

function update_court() {
	let ycourt_panel = (player === "Lancaster") ? ui.court2_panel : ui.court1_panel
	let lcourt_panel = (player === "Lancaster") ? ui.court1_panel : ui.court2_panel
	let ycourt_hdr = (player === "Lancaster") ? ui.court2_header : ui.court1_header
	let lcourt_hdr = (player === "Lancaster") ? ui.court1_header : ui.court2_header
	let ycourt = (player === "Lancaster") ? ui.court2 : ui.court1
	let lcourt = (player === "Lancaster") ? ui.court1 : ui.court2
	ycourt_panel.className = "panel court_panel york"
	lcourt_panel.className = "panel court_panel lancaster"
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
		if (is_special_vassal(v))
			return

		let loc = get_vassal_lord(v)
		let srv = get_vassal_service(v)

		if (loc === VASSAL_OUT_OF_PLAY) {
			// not present
			ui.vassal_map[v].classList.add("hide")
		} else {
			ui.vassal_map[v].classList.remove("hide")
			ui.vassal_map[v].classList.toggle("back", loc === VASSAL_DISBANDED)
			ui.vassal_map[v].classList.toggle("action", is_action("vassal", v))
			ui.vassal_map[v].classList.toggle("selected", v === view.vassal || set_has(view.vassal, v))
			if (loc === VASSAL_READY) {
				// ready on map
				ui.vassal_map[v].style.top = ui.vassal_map[v].my_map_y
				ui.vassal_map[v].style.left = ui.vassal_map[v].my_map_x
			} else {
				// mustered or disbanded
				if (is_lancaster_lord(loc))
					calendar_vassal_lanc[srv].push(ui.vassal_map[v])
				else if (is_york_lord(loc))
					calendar_vassal_york[srv].push(ui.vassal_map[v])
				else
					calendar_vassal_disband[srv].push(ui.vassal_map[v])
			}
		}
	}
}

var track_offset = new Array(46).fill(0)

function show_track_marker(elt, pos) {
	let n = track_offset[pos]++
	let x = TRACK_XY[pos][0] - 25
	let y = TRACK_XY[pos][1] - 25

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

function update_lancaster_favicon() {
	switch (view.scenario) {
		default:
		case SCENARIO_IA: return "favicons/favicon_lancaster_henry_vi.png"
		case SCENARIO_IB: return "favicons/favicon_lancaster_somerset.png"
		case SCENARIO_IC: return "favicons/favicon_lancaster_henry_vi.png"
		case SCENARIO_II: return "favicons/favicon_lancaster_margaret.png"
		case SCENARIO_III: return "favicons/favicon_lancaster_henry_tudor.png"
	}
}

function update_york_favicon() {
	switch (view.scenario) {
		default:
		case SCENARIO_IA: return "favicons/favicon_york_york.png"
		case SCENARIO_IB: return "favicons/favicon_york_warwick.png"
		case SCENARIO_IC: return "favicons/favicon_york_march.png"
		case SCENARIO_II: return "favicons/favicon_york_edward_iv.png"
		case SCENARIO_III: return "favicons/favicon_york_gloucester.png"
	}
}

function update_observer_favicon() {
	return "favicons/favicon_france.png"
}

function on_update() {
	restart_cache()

	switch (player) {
		case "York":
			ui.favicon.href = update_york_favicon()
			break
		case "Lancaster":
			ui.favicon.href = update_lancaster_favicon()
			break
		default:
			ui.favicon.href = update_observer_favicon()
			break
	}

	for (let i = 0; i <= 16; ++i) {
		calendar_lord_york[i].length = 0
		calendar_lord_lanc[i].length = 0
		calendar_vassal_disband[i].length = 0
		calendar_vassal_york[i].length = 0
		calendar_vassal_lanc[i].length = 0
	}

	for (let i = 0; i < data.locales.length; ++i) {
		locale_lord_york[i].length = 0
		locale_lord_lanc[i].length = 0
	}

	track_offset.fill(0)

	for (let ix = 0; ix < data.lords.length; ++ix) {
		ui.seat[ix].classList.toggle("hide", !is_lord_in_game(ix))
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

	if (view.battle) {
		let { x, y, w, h } = data.locales[view.battle.where].box
		ui.battle.className = "marker square battle"
		ui.battle.style.left = ((x+w/2)|0) - 27 + "px"
		ui.battle.style.top = y + h - 27 + "px"
	} else {
		ui.battle.className = "hide"
	}

	update_current_card_display()

	if (view.turn & 1) {
		ui.turn.className = `marker circle turn campaign`
	} else {
		ui.turn.className = `marker circle turn levy`
	}
	ui.turn.style.left = (CALENDAR_XY[view.turn >> 1][0] + 91 - 52) + "px"
	ui.turn.style.top = (CALENDAR_XY[view.turn >> 1][1] + 94) + "px"

	let end = scenario_end_marker[view.scenario]
	if (end < 16) {
		ui.end.style.display = null
		ui.end.style.left = (CALENDAR_XY[end][0] + 91 - 52) + "px"
		ui.end.style.top = (CALENDAR_XY[end][1] + 94) + "px"
	} else {
		ui.end.style.display = "none"
	}

	ui.held_york.textContent = `${view.held_y} Held`
	ui.held_lancaster.textContent = `${view.held_l} Held`

	let vc = scenario_victory_threshold()
	if (vc <= 45) {
		ui.victory_check.style.display = null
		show_track_marker(ui.victory_check, vc)
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
	}

	update_court()

	// QUESTIONS
	action_button("remove", "Remove")
	action_button("stronghold", "Stronghold")
	action_button("port", "Port")
	action_button("by_way", "By way")

	// CAPABILITIES / EVENTS
	action_button("add_men_at_arms", "Add Men at Arms")
	action_button("add_militia", "Add Militia")
	action_button("add_militia2", "Add 2 Militia")
	action_button("agitators", "Agitators")
	action_button("commission_of_array", "Commission of Array")
	action_button("exile", "Exile")
	action_button("exile_pact", "Exile Pact")
	action_button("final_charge", "Final Charge")
	action_button("heralds", "Heralds")
	action_button("levy_beloved_warwick", "Beloved Warwick")
	action_button("levy_irishmen", "Irishmen")
	action_button("loyalty_and_trust", "Loyalty and Trust")
	action_button("merchants", "Merchants")
	action_button("regroup", "Regroup")
	action_button("richard_iii", "Richard III")
	action_button("soldiers_of_fortune", "Soldiers of Fortune")
	action_button("vanguard", "Vanguard")

	// MARCH
	action_button("march", "March")
	action_button("approach", "Approach")
	action_button("intercept", "Intercept")
	action_button("battle", "Battle")

	// ARTS OF WAR
	action_button("play", "Play")
	action_button("hold", "Hold")
	action_button("discard", "Discard")

	// LEVY
	action_button("levy_troops", "Troops")
	action_button("take_ship", "Ship")
	action_button("take_prov", "Provender")
	action_button("take_cart", "Cart")
	action_button("take_all", "Take All")
	action_button("capability", "Capability")

	// CAMPAIGN
	action_button("sail", "Sail")
	action_button("supply", "Supply")
	action_button("forage", "Forage")
	action_button("tax", "Tax")

	// LEVY & CAMPAIGN
	action_button("parley", "Parley")

	// PAY/FEED/PILLAGE
	action_button("pay_all", "Pay All")
	action_button("pay", "Pay")
	action_button("pillage", "Pillage")
	action_button("disband", "Disband")

	// INFLUENCE CHECK
	action_button_with_argument("check", 2, "Check +2")
	action_button_with_argument("check", 1, "Check +1")
	action_button_with_argument("check", 0, "Check")

	action_button("end_array", "End Array")
	action_button("end_battle_round", "End Round")
	action_button("end_command", "End Command")
	action_button("end_feed", "End Feed")
	action_button("end_muster", "End Muster")
	action_button("end_pay", "End Pay")
	action_button("end_plan", "End Plan")
	action_button("end_spoils", "End Spoils")

	action_button("roll", "Roll")
	action_button("pass", "Pass")
	action_button("done", "Done")
	action_button("undo", "Undo")
}

// === LOG & TIP ===

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

function on_focus_locale(evt) {
	let id = evt.target.my_id
	let info = data.locales[id]
	let tip = info.name

	if (info.type === "fortress")
		tip += " - Fortress"
	else if (info.type === "city")
		tip += " - City"
	else if (info.type === "town")
		tip += " - Town"

	if (set_has(data.all_ports, id))
		tip += " - Port"

	if (set_has(view.pieces.depleted, id))
		tip += " - Depleted"
	if (set_has(view.pieces.exhausted, id))
		tip += " - Exhausted"

	if (set_has(view.pieces.favourl, id))
		tip += " - Lancastrian"
	if (set_has(view.pieces.favoury, id))
		tip += " - Yorkist"

	on_focus(tip)
}

function on_focus_cylinder(evt) {
	let lord = evt.target.my_id
	let info = data.lords[lord]
	let tip = info.short_name
	on_focus(tip)
	ui.command.replaceChildren(ui.lords2[lord])
}


function on_focus_card_tip(c) {
	ui.command.replaceChildren(ui.cards2[c])
}

function on_blur_card_tip() {
	update_current_card_display()
}

function on_focus_locale_tip(loc) {
	ui.locale[loc].classList.add("tip")
}

function on_blur_locale_tip(loc) {
	ui.locale[loc].classList.remove("tip")
}

function on_click_locale_tip(loc) {
	ui.locale[loc].scrollIntoView({ block: "center", inline: "center", behavior: "smooth" })
}

function on_focus_lord_tip(lord) {
	ui.lord_cylinder[lord].classList.add("tip")
	ui.command.replaceChildren(ui.lords2[lord])
}

function on_blur_lord_tip(lord) {
	ui.lord_cylinder[lord].classList.remove("tip")
	update_current_card_display()
}

function on_click_lord_tip(lord) {
	ui.mat[lord].scrollIntoView({ block: "center", inline: "center", behavior: "smooth" })
}

function sub_card_capability(_match, p1) {
	let x = p1 | 0
	return `<span class="card_tip" onmouseenter="on_focus_card_tip(${x})" onmouseleave="on_blur_card_tip(${x})">${data.cards[x].capability}</span>`
}

function sub_card_event(_match, p1) {
	let x = p1 | 0
	return `<span class="card_tip" onmouseenter="on_focus_card_tip(${x})" onmouseleave="on_blur_card_tip(${x})">${data.cards[x].event}</span>`
}

function sub_locale_name(_match, p1) {
	let x = p1 | 0
	let n = data.locales[x].name
	return `<span class="locale_tip" onmouseenter="on_focus_locale_tip(${x})" onmouseleave="on_blur_locale_tip(${x})" onclick="on_click_locale_tip(${x})">${n}</span>`
}

function sub_lord_name(_match, p1) {
	let x = p1 | 0
	let n = data.lords[x].short_name
	return `<span class="lord_tip" onmouseenter="on_focus_lord_tip(${x})" onmouseleave="on_blur_lord_tip(${x})" onclick="on_click_lord_tip(${x})">${n}</span>`
}

function sub_vassal_name(_match, x) {
	let n = data.vassals[x].name
	return `<span class="vassal_tip">${n}</span>`
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
	return ICONS_SVG[match]
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
	text = text.replace(/S(\d+)/g, sub_locale_name)
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
	} else if (text.match(/^\.h3/)) {
		text = text.substring(4)
		p.className = "h3"
	} else if (text.match(/^\.h4/)) {
		text = text.substring(4)
		p.className = "h4"
	} else if (text.match(/^\.ip/)) {
		text = text.substring(4)
		p.className = "ip"
	}

	p.innerHTML = text
	return p
}
