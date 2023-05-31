"use strict"

const BOTH = "Both"
const LANCASTER = "Lancaster"
const YORK = "York"

const P1 = LANCASTER
const P2 = YORK

const HIT = [ "0", '\u2776', '\u2777', '\u2778', '\u2779', '\u277A', '\u277B' ]
const MISS = [ "0", '\u2460', '\u2461', '\u2462', '\u2463', '\u2464', '\u2465' ]

function frac(x) {
	if (x === 1)
		return "\xbd"
	if (x & 1)
		return (x >> 1) + "\xbd"
	return x >> 1
}

function range(x) {
	switch (x) {
	case 1: return "1"
	case 2: return "1-2"
	case 3: return "1-3"
	case 4: return "1-4"
	case 5: return "1-5"
	case 6: return "1-6"
	}
}

let game = null
let view = null
let states = {}

exports.roles = [ LANCASTER, YORK ]

exports.scenarios = [
	"Ia. Henry VI",
	"Ib. Towton",
	"Ic. Somerset's Return",
	"II. Warwicks' Rebellion",
	"III. My Kingdom for a Horse",
	"I-III. Wars of the Roses",
]

const scenario_first_turn = {
	"Ia. Henry VI": 1,
	"Ib. Towton": 1,
	"Ic. Somerset's Return": 5,
	"II. Warwicks' Rebellion": 1,
	"III. My Kingdom for a Horse": 9,
	"I-III. Wars of the Roses": 1,
}


const scenario_last_turn = {
	"Ia. Henry VI": 15,
	"Ib. Towton": 2,
	"Ic. Somerset's Return": 8,
	"II. Warwicks' Rebellion": 15,
	"III. My Kingdom for a Horse": 15,
	"I-III. Wars of the Roses": 15,
}

function should_remove_Y28_event_card() {
	return game.scenario !== "I-III. Wars of the Roses"
}


// unit types
const RETINUE = 0
const VASSAL = 1
const MERCENARIES = 2
const BURGUNDIANS = 3
const MEN_AT_ARMS = 4
const MILITIA = 5
const LONGBOWMEN = 6

const FORCE_TYPE_NAME = [ "Retinue", "Vassal", "Mercenary", "Burgundians", "Men-at-Arms", "Militia", "Longbowmen" ]
const FORCE_PROTECTION = [ 4, 4, 3, 3, 3, 1, 1 ]
const FORCE_EVADE = [ 0, 0, 0, 0, 0, 0, 0 ]

// asset types
const PROV = 0
const COIN = 1
//const LOOT = 2
const CART = 2
//const SLED = 4
//const BOAT = 5
const SHIP = 4

const ASSET_TYPE_NAME = [ "Provender", "Coin", "Cart", "Ship" ]


// battle array
const A1 = 0 // attackers
const A2 = 1
const A3 = 2
const D1 = 3 // defenders
const D2 = 4
const D3 = 5


const ARRAY_FLANKS = [
	[ A2, A3 ], [ A1, A3 ], [ A1, A2 ],
	[ D2, D3 ], [ D1, D3 ], [ D1, D2 ],
]


function find_card(name) {
	return data.cards.findIndex((x) => x.name === name)
}
function find_lord(name) {
	return data.lords.findIndex((x) => x.name === name)
}
function find_locale(name) {
	return data.locales.findIndex((x) => x.name === name)
}

const lord_name = data.lords.map((lord) => lord.name)

const lord_count = data.lords.length
const vassal_count = data.vassals.length

const first_lord = 0
const last_lord = lord_count - 1

const first_p1_locale = 0
const last_p1_locale = 23
const first_p2_locale = 24
const last_p2_locale = 52
const first_locale = 0
const last_locale = 52


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



//const GARRISON = 100

const LORD_YORK = find_lord("York")
const LORD_MARCH = find_lord("March")
const LORD_EDWARD_IV = find_lord("Edward IV")
const LORD_SALISBURY = find_lord("Salisbury")
const LORD_RUTLAND = find_lord("Rutland")
const LORD_PEMBROKE = find_lord("Pembroke")
const LORD_DEVON = find_lord("Devon")
const LORD_NORTHUMBERLAND = find_lord("Northumberland")
const LORD_GLOUCESTER = find_lord("Gloucester")
const LORD_RICHARD_III = find_lord("Richard III")
const LORD_NORFOLK = find_lord("Norfolk")
const LORD_WARWICKY = find_lord("WarwickY")

const LORD_HENRYVI = find_lord("Henry VI")
const LORD_MARGARET = find_lord("Margaret")
const LORD_SOMERSET = find_lord("Somerset")
const LORD_EXETER = find_lord("Exeter")
const LORD_BUCKINGHAM = find_lord("Buckingham")
const LORD_CLARENCE = find_lord("Clarence")

const LORD_JASPER_TUDOR = find_lord("Jasper Tudor")
const LORD_HENRY_TUDOR = find_lord("Henry Tudor")
const LORD_OXFORD = find_lord("Oxford")
const LORD_WARWICKL = find_lord("WarwickL")



const LOC_BAMBURGH = find_locale("Bamburgh")
const LOC_NEWCASTLE = find_locale("Newcastle")
const LOC_APPLEBY = find_locale("Appleby")
const LOC_HEXHAM = find_locale("Hexham")
const LOC_CARLISLE = find_locale("Carlisle")
const LOC_HARLECH = find_locale("Harlech")
const LOC_PEMBROKE = find_locale("Pembroke")
const LOC_CARDIFF = find_locale("Cardiff")
const LOC_HEREFORD = find_locale("Hereford")
const LOC_LUDLOW = find_locale("Ludlow")
const LOC_SHREWSBURY = find_locale("Shrewsbury")
const LOC_SALISBURY = find_locale("Salisbury")
const LOC_WINCHESTER = find_locale("Winchester")
const LOC_GUILDFORD = find_locale("Guildford")
const LOC_Arundel = find_locale("Arundel")
const LOC_SOUTHAMPTON = find_locale("Southampton")
const LOC_ROCHESTER = find_locale("Rochester")
const LOC_DOVER = find_locale("Dover")
const LOC_CANTERBURY = find_locale("Canterbury")
const LOC_HASTINGS = find_locale("Hastings")
const LOC_DORCHESTER = find_locale("Dorchester")
const LOC_EXETER = find_locale("Exeter")
const LOC_PLYMOUTH = find_locale("Plymouth")
const LOC_LAUNCESTON = find_locale("Launceston")
const LOC_TRURO = find_locale("Truro")
const LOC_WELLS = find_locale("Wells")
const LOC_BRISTOL = find_locale("Bristol")
const LOC_GLOUCESTER = find_locale("Gloucester")
const LOC_OXFORD = find_locale("Oxford")
const LOC_NEwBURY = find_locale("Newbury")
const LOC_LONDON = find_locale("London")
const LOC_ST_ALBANS = find_locale("St Albans")
const LOC_BEDFORD = find_locale("Bedford")
const LOC_CAMBRIDGE = find_locale("Cambridge")
const LOC_BURY_ST_EDMUNDS = find_locale("Bury St Edmunds")
const LOC_IPSWICH = find_locale("Ipswich")
const LOC_NORWICH = find_locale("Norwich")
const LOC_LYNN = find_locale("Lynn")
const LOC_ELY = find_locale("Ely")
const LOC_PETERBOROUGH = find_locale("Peterborough")
const LOC_NORTHAMPTON = find_locale("Northampton")
const LOC_COVENTRY = find_locale("Coventry")
const LOC_LEICESTER = find_locale("Leicester")
const LOC_LICHFIELD = find_locale("Lichfield")
const LOC_DERBY = find_locale("Derby")
const LOC_NOTTINGHAM = find_locale("Notthingham")
const LOC_WORCESTER = find_locale("Worcester")
const LOC_CHESTER = find_locale("Chester")
const LOC_LANCASTER = find_locale("Lancaster")
const LOC_LINCOLN = find_locale("Lincoln")
const LOC_YORK = find_locale("York")
const LOC_CALAIS = find_locale("Calais")
const LOC_FRANCE = find_locale("France")
const LOC_SCOTLAND = find_locale("Scotland")
const LOC_IRELAND = find_locale("Ireland")
const LOC_BURGUNDY = find_locale("Burgundy")
const LOC_ENGLISH_CHANNEL = find_locale("English Channel")
const LOC_IRISH_SEA = find_locale("Irish Sea")
const LOC_NORTH_SEA = find_locale("North Sea")
const LOC_SCARBOROUGH = find_locale("Scarborough")
const LOC_RAVENSPUR = find_locale("Ravenspur")