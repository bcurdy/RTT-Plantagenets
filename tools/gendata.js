// Run this script inside the "tools" directory to generate data.js and build_counters3.sh

"use strict"

const fs = require('fs')

function cmpnum(a,b) { return a - b }

function clean_name(name) {
	return name.toLowerCase().replaceAll("&", "and").replaceAll(" ", "_")
}

function array_insert_pair(array, index, key, value) {
	for (let i = array.length; i > index; i -= 2) {
		array[i] = array[i-2]
		array[i+1] = array[i-1]
	}
	array[index] = key
	array[index+1] = value
}

function map_set(map, key, value) {
	let a = 0
	let b = (map.length >> 1) - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = map[m<<1]
		if (key < x)
			b = m - 1
		else if (key > x)
			a = m + 1
		else {
			map[(m<<1)+1] = value
			return
		}
	}
	array_insert_pair(map, a<<1, key, value)
}

// :r !node tools/genboxes.js
const boxes = {
	"Harlech": [282,919,57,52],
	"London": [878,1159,89,73],
	"Calais": [1137,1411,63,58],
	"Scotland": [449,277,113,132],
	"France": [888,1428,113,132],
	"Ireland": [48,950,113,132],
	"Burgundy": [993,684,113,132],
	"Carlisle": [447,420,58,64],
	"Newcastle": [665,427,58,64],
	"York": [705,625,58,64],
	"Lincoln": [780,757,58,64],
	"Chester": [444,800,58,64],
	"Lichfield": [613,899,58,64],
	"Launceston": [202,1351,58,64],
	"Exeter": [344,1376,58,64],
	"Canterbury": [1062,1202,58,64],
	"Rochester": [987,1185,58,64],
	"Guildford": [849,1246,58,64],
	"Winchester": [730,1262,58,64],
	"Salisbury": [620,1267,58,64],
	"Wells": [508,1262,58,64],
	"Bristol": [500,1180,58,64],
	"Oxford": [711,1103,58,64],
	"Gloucester": [568,1091,58,64],
	"Hereford": [486,1040,58,64],
	"Cardiff": [396,1166,58,64],
	"Norwich": [1063,889,58,64],
	"Ely": [927,956,58,64],
	"Peterborough": [832,927,58,64],
	"Coventry": [678,966,58,64],
	"Worcester": [561,989,58,64],
	"Shrewsbury": [506,869,58,64],
	"Bamburgh": [646,311,40,30],
	"Ravenspur": [858,734,40,30],
	"Pembroke": [193,1130,40,30],
	"Lynn": [968,898,40,30],
	"Ludlow": [487,979,40,30],
	"Hexham": [560,403,50,40],
	"Appleby": [546,472,50,40],
	"Scarborough": [809,546,50,40],
	"Lancaster": [485,606,50,40],
	"Derby": [661,850,50,40],
	"Nottingham": [733,843,50,40],
	"Truro": [145,1456,50,40],
	"Dorchester": [531,1377,50,40],
	"Southampton": [682,1379,50,40],
	"Arundel": [796,1337,50,40],
	"Hastings": [989,1328,50,40],
	"Dover": [1041,1287,50,40],
	"Newbury": [676,1195,50,40],
	"St Albans": [906,1091,50,40],
	"Cambridge": [902,1026,50,40],
	"Bedford": [845,1052,50,40],
	"Northampton": [751,1025,50,40],
	"Ipswich": [1108,1031,50,40],
	"Bury St Edmunds": [1000,996,50,40],
	"Leicester": [756,912,50,40],
	"Plymouth": [257,1428,50,40],
	"Irish Sea": [224,664,135,56],
	"English Channel": [550,1450,246,82],
	"North Sea": [1019,824,150,65],
	"vassal vassal_westmoreland": [598,488,27,30],
	"vassal vassal_stanley": [631,862,27,30],
	"vassal vassal_dudley": [727,921,27,30],
	"vassal vassal_shrewsbury": [480,900,27,30],
	"vassal vassal_worcester": [621,1014,27,30],
	"vassal vassal_oxford": [772,1132,27,30],
	"vassal vassal_essex": [959,1103,27,30],
	"vassal vassal_suffolk": [1161,1043,27,30],
	"vassal vassal_fauconberg": [1095,1297,27,30],
	"vassal vassal_norfolk": [848,1353,27,30],
	"vassal vassal_devon": [406,1400,27,30],
	"vassal vassal_bonville": [174,1377,27,30],
	"vassal vassal_beaumont": [753,787,27,30],
}

let data = []
function print(str) {
	data.push(str)
}

var locmap = {}

// 0=offmap, 1-N=map locales, 100-M=calendar boxes
var locales = []
var ways = []
var seat = []
const scale = 1

var is = { stronghold: [] }

function defloc(region, type, name) {
	let [x, y, w, h] = boxes[name]
	x = Math.floor(x)
	y = Math.floor(y)
	w = Math.ceil(w)
	h = Math.ceil(h)
	locmap[name] = locales.length
	let id = locales.length
	locales.push({ name, type, region, adjacent: [], highways: [], roads: [], paths: [], not_paths: [], box:{x,y,w,h} })
	if (!is[type]) is[type] = []
	is[type].push(id)
	if (region) {
		if (!is[region]) is[region] = []
		is[region].push(id)
		is.stronghold.push(id)
	}
	ways.push([])
}

function defway(type, aname, bname) {
	let aix = locmap[aname]
	let bix = locmap[bname]
	if (aix > bix) {
		let tmp = aix
		aix = bix
		bix = tmp
	}

	let a = locales[aix]
	let b = locales[bix]

	map_set(ways[aix], bix, type)
	map_set(ways[bix], aix, type)

	locales[aix].adjacent.push(bix)
	locales[bix].adjacent.push(aix)

	if (type === "highway") {
		locales[aix].highways.push(bix)
		locales[bix].highways.push(aix)
	}
	if (type === "road") {
		locales[aix].roads.push(bix)
		locales[bix].roads.push(aix)
	}
	if (type === "path") {
		locales[aix].paths.push(bix)
		locales[bix].paths.push(aix)
	} else {
		locales[aix].not_paths.push(bix)
		locales[bix].not_paths.push(aix)
	}
}

function highway(a,b) { return defway('highway', a, b) }
function road(a,b) { return defway('road', a, b) }
function path(a,b) { return defway('path', a, b) }


// LOCALES

defloc("England", "fortress", "Lynn")
defloc("England", "fortress", "Ravenspur")
defloc("England", "town", "Ipswich")
defloc("North", "city", "Newcastle")
defloc("North", "town", "Scarborough")

defloc("England", "calais", "Calais")
defloc("England", "city", "Exeter")
defloc("England", "town", "Dorchester")
defloc("England", "town", "Plymouth")
defloc("England", "town", "Truro")
defloc("South", "town", "Arundel")
defloc("South", "town", "Dover")
defloc("South", "town", "Hastings")
defloc("South", "town", "Southampton")

defloc("England", "city", "Bristol")
defloc("Wales", "fortress", "Pembroke")
defloc("Wales", "harlech", "Harlech")

defloc("England", "city", "Chester")
defloc("England", "city", "Coventry")
defloc("England", "city", "Ely")
defloc("England", "city", "Gloucester")
defloc("England", "city", "Launceston")
defloc("England", "city", "Lichfield")
defloc("England", "city", "Lincoln")
defloc("England", "city", "Norwich")
defloc("England", "city", "Oxford")
defloc("England", "city", "Peterborough")
defloc("England", "city", "Wells")
defloc("England", "city", "Worcester")
defloc("England", "city", "York")
defloc("England", "london", "London")
defloc("England", "town", "Bedford")
defloc("England", "town", "Bury St Edmunds")
defloc("England", "town", "Cambridge")
defloc("England", "town", "Derby")
defloc("England", "town", "Lancaster")
defloc("England", "town", "Leicester")
defloc("England", "town", "Newbury")
defloc("England", "town", "Northampton")
defloc("England", "town", "Nottingham")
defloc("England", "town", "St Albans")
defloc("North", "city", "Carlisle")
defloc("North", "fortress", "Bamburgh")
defloc("North", "town", "Appleby")
defloc("North", "town", "Hexham")
defloc("South", "city", "Canterbury")
defloc("South", "city", "Guildford")
defloc("South", "city", "Rochester")
defloc("South", "city", "Salisbury")
defloc("South", "city", "Winchester")
defloc("Wales", "city", "Cardiff")
defloc("Wales", "city", "Hereford")
defloc("Wales", "city", "Shrewsbury")
defloc("Wales", "fortress", "Ludlow")

defloc(null, "exile_box", "Burgundy")
defloc(null, "exile_box", "France")
defloc(null, "exile_box", "Ireland")
defloc(null, "exile_box", "Scotland")

defloc(null, "sea", "English Channel")
defloc(null, "sea", "Irish Sea")
defloc(null, "sea", "North Sea")

//WAYS BETWEEN LOCALES

highway("Bamburgh", "Newcastle")
highway("Newcastle", "York")
highway("York", "Lincoln")
highway("Lincoln", "Peterborough")
highway("Peterborough", "Ely")
highway("Nottingham", "Leicester")
highway("Leicester", "Northampton")
highway("Bedford", "St Albans")
highway("St Albans", "Cambridge")
highway("St Albans", "London")
highway("London", "Oxford")
highway("Oxford", "Gloucester")
highway("Gloucester", "Hereford")
highway("Gloucester", "Worcester")
highway("Hereford", "Ludlow")
highway("Gloucester", "Bristol")
highway("London", "Guildford")
highway("Guildford", "Winchester")
highway("Exeter", "Wells")
highway("Winchester", "Salisbury")
highway("Salisbury", "Wells")
highway("Cambridge", "Ely")
highway("Northampton", "Bedford")


road("Gloucester", "Cardiff")
road("Newbury", "Oxford")
road("Rochester", "Hastings")
road("Hexham", "Carlisle")
road("Hexham", "Newcastle")
road("Appleby", "Carlisle")
road("Appleby", "Newcastle")
road("Lincoln", "Nottingham")
road("Nottingham", "Derby")
road("Chester", "Shrewsbury")
road("Shrewsbury", "Lichfield")
road("Lichfield", "Leicester")
road("Lichfield", "Coventry")
road("Leicester", "Peterborough")
road("Ely", "Lynn")
road("Ely", "Bury St Edmunds")
road("Bury St Edmunds", "Norwich")
road("Norwich", "Lynn")
road("Norwich", "Ipswich")
road("Ipswich", "Bury St Edmunds")
road("Ipswich", "St Albans")
road("Bury St Edmunds", "Cambridge")
road("Cambridge", "Bedford")
road("Peterborough", "Northampton")
road("Northampton", "Coventry")
road("Northampton", "Oxford")
road("Lichfield", "Worcester")
road("Shrewsbury", "Ludlow")
road("Ludlow", "Worcester")
road("London", "Rochester")
road("Rochester", "Canterbury")
road("Canterbury", "Dover")
road("Dover", "Hastings")
road("Hastings", "Arundel")
road("Arundel", "Southampton")
road("Southampton", "Winchester")
road("Southampton", "Salisbury")
road("Salisbury", "Newbury")
road("Salisbury", "Dorchester")
road("Dorchester", "Wells")
road("Dorchester", "Exeter")
road("Wells", "Bristol")
road("Exeter", "Launceston")
road("Plymouth", "Launceston")
road("Exeter", "Plymouth")
road("Plymouth", "Truro")
road("Truro", "Launceston")
road("Derby", "Lichfield")
path("Appleby", "Lancaster")
path("Lancaster", "Chester")
path("Chester", "York")
path("Chester", "Harlech")
path("Harlech", "Pembroke")
path("Pembroke", "Cardiff")

road("Newcastle", "Scarborough")
road("Scarborough", "York")
road("York", "Ravenspur")
road("Ravenspur", "Lincoln")

// one-way road from Scotland to Bamburgh
locales[locmap.Scotland].paths.push(locmap.Bamburgh)
map_set(ways[locmap.Scotland], locmap.Bamburgh, "path")

// one-way road from Scotland to Carlisle
locales[locmap.Scotland].paths.push(locmap.Carlisle)
map_set(ways[locmap.Scotland], locmap.Carlisle, "path")

let sea_1 = locmap["North Sea"]
let sea_2 = locmap["English Channel"]
let sea_3 = locmap["Irish Sea"]

let port_1 = ["Newcastle", "Scarborough", "Ravenspur", "Lynn", "Ipswich"].map(name => locmap[name]).sort(cmpnum)
let port_2 = ["Dover", "Hastings", "Calais", "Southampton", "Dorchester", "Exeter", "Plymouth", "Truro"].map(name => locmap[name]).sort(cmpnum)
let port_3 = ["Bristol","Pembroke","Harlech"].map(name => locmap[name]).sort(cmpnum)
let all_ports = [ ...port_1, ...port_2, ...port_3 ].sort(cmpnum)

let exile_1 = locmap["Burgundy"]
let exile_2 = locmap["France"]
let exile_3 = locmap["Ireland"]
let exile_4 = locmap["Scotland"]

let sail_sea_1 = [ ...port_1, ...port_2, sea_2 ].sort(cmpnum)
let sail_sea_2 = [ ...port_1, ...port_2, ...port_3, sea_1, sea_3 ].sort(cmpnum)
let sail_sea_3 = [ ...port_2, ...port_3, sea_2 ].sort(cmpnum)

let sail_exile_1 = [ sea_1, ...port_1 ]
let sail_exile_2 = [ sea_2, ...port_2 ]
let sail_exile_3 = [ sea_3, ...port_3 ]
let sail_exile_4 = [ sea_1, ...port_1 ]

let sail_port_1 = [ sea_1, ...port_1 ]
let sail_port_2 = [ sea_2, ...port_2 ]
let sail_port_3 = [ sea_3, ...port_3 ]

function dumplist(name, list) {
	print(name + ":[")
	for (let item of list)
		print(JSON.stringify(item) + ",")
	print("],")
}

locales.forEach(loc => {
	loc.adjacent.sort(cmpnum)
	loc.highways.sort(cmpnum)
	loc.roads.sort(cmpnum)
	loc.paths.sort(cmpnum)
	loc.not_paths.sort(cmpnum)
})

let lords = [

	{
		side: "York",
		name: "York",
		short_name: "York",
		full_name: "Richard Plantagenet",
		title: "Duke of York",
		seat: locmap["Ely"],
		marshal:2,
		influence:5,
		lordship:3,
		command:2,
		valour:2,
		forces: {
			retinue:1,
			men_at_arms:2,
			longbowmen:2,
			militia:2
		},
		assets: {
			cart:2,
			prov:2,
			coin:2,
		},
		ships: 0,

	},

	{
		side: "York",
		name: "March",
		short_name: "March",
		full_name:"Edward Plantagenet",
		title:"Earl of March",
		seat: locmap["Ludlow"],
		marshal:0,
		influence:2,
		lordship:2,
		command:2,
		valour:3,
		forces:{
			retinue:1,
			men_at_arms:1,
			longbowmen:2,
			militia:1
		},
		assets:{
			cart:1,
			prov:1,
			coin:1,
		},
		ships: 0,
	},

	{
		side: "York",
		name: "Edward IV",
		short_name: "Edward IV",
		full_name: "Edward Plantagenet",
		title: "King of England",
		seat: locmap["London"],
		marshal:2,
		influence:5,
		lordship:3,
		command:2,
		valour:4,
		forces:{
			retinue:1,
			men_at_arms:2,
			longbowmen:2,
			militia:2
		},
		assets:{
			cart:2,
			prov:2,
			coin:2,
		},
		ships: 0,
	},

	{
		side: "York",
		name: "Salisbury",
		short_name: "Salisbury",
		full_name: "Richard Neville",
		title: "Earl of Salisbury",
		seat: locmap["York"],
		marshal:0,
		influence:3,
		lordship:3,
		command:2,
		valour:1,
		forces:{
			retinue:1,
			men_at_arms:2,
			longbowmen:2
		},
		assets:{
			cart:1,
			prov:1,
			coin:1,
		},
		ships: 0,
	},

	{
		side: "York",
		name: "Rutland",
		short_name: "Rutland",
		full_name: "Edmund Plantagenet",
		title: "Earl of Rutland",
		seat: locmap["Canterbury"],
		marshal:0,
		influence:2,
		lordship:2,
		command:1,
		valour:1,
		forces:{
			retinue:1,
			men_at_arms:1,
			longbowmen:2,
			militia:1
		},
		assets:{
			cart:1,
			prov:1,
			coin:1,
		},
		ships: 0,
	},

	{
		side: "York",
		name: "Pembroke",
		short_name: "Pembroke",
		full_name: "William Herbert",
		title: "Earl of Pembroke",
		seat: locmap["Pembroke"],
		marshal:0,
		influence:2,
		lordship:2,
		command:2,
		valour:2,
		forces:{
			retinue:1,
			men_at_arms:1,
			longbowmen:3,
			militia:2},
		assets:{
			cart:1,
			prov:1,
			coin:2,
		},
		ships: 0,
	},

	{
		side: "York",
		name: "Devon",
		short_name: "Devon",
		full_name: "Humpfrey Stafford",
		title: "Earl of Devon",
		seat: locmap["Exeter"],
		marshal:0,
		influence:4,
		lordship:2,
		command:2,
		valour:1,
		forces:{
			retinue:1,
			men_at_arms:1,
			longbowmen:2,
			militia:1
		},
		assets:{
			cart:1,
			prov:1,
			coin:1,
		},
		ships: 0,
	},

	{
		side: "York",
		name: "Northumberland Y1",
		short_name: "Northumberland",
		full_name: "Henry Percy",
		title: "Northumberland",
		seat: locmap["Carlisle"],
		marshal:0,
		influence:4,
		lordship:2,
		command:2,
		valour:1,
		forces:{
			retinue:1,
			men_at_arms:2,
			longbowmen:2,
			militia:4
		},
		assets:{
			cart:2,
			prov:2,
			coin:2,
		},
		ships: 0,
	},

	{
		side: "York",
		name: "Northumberland Y2",
		short_name: "Northumberland",
		full_name: "Henry Percy",
		title: "Northumberland",
		seat: locmap["Carlisle"],
		marshal:0,
		influence:4,
		lordship:2,
		command:2,
		valour:1,
		forces:{
			retinue:1,
			men_at_arms:2,
			longbowmen:2,
			militia:2
		},
		assets:{
			cart:2,
			prov:2,
			coin:2,
		},
		ships: 0,
	},

	{
		side: "York",
		name: "Gloucester 1",
		short_name: "Gloucester",
		full_name: "Richard Plantagenet",
		title: "Duke of Gloucester",
		seat: locmap["Gloucester"],
		marshal:1,
		influence:2,
		lordship:2,
		command:3,
		valour:2,
		forces:{
			retinue:1,
			men_at_arms:2,
			longbowmen:2,
		},
		assets:{
			cart:1,
			prov:1,
			coin:1,
		},
		ships: 0,
	},

	{
		side: "York",
		name: "Gloucester 2",
		short_name: "Gloucester",
		full_name: "Richard Plantagenet",
		title: "Duke of Gloucester",
		seat: locmap["London"],
		marshal:1,
		influence:5,
		lordship:3,
		command:3,
		valour:2,
		forces:{
			retinue:1,
			men_at_arms:3,
			longbowmen:3,
			militia:4,
		},
		assets:{
			cart:2,
			prov:2,
			coin:4,
		},
		ships: 0,
	},

	{
		side: "York",
		name: "Richard III",
		short_name: "Richard III",
		full_name: "Richard Plantagenet",
		title: "King of England",
		seat: locmap["London"],
		marshal:2,
		influence:5,
		lordship:3,
		command:3,
		valour:2,
		forces:{
			retinue:1,
			men_at_arms:3,
			longbowmen:2,
			militia:4
		},
		assets:{
			cart:2,
			prov:2,
			coin:4,
		},
		ships: 0,
	},

	{
		side: "York",
		name: "Norfolk",
		short_name: "Norfolk",
		full_name: "John Howard",
		title: "Duke of Norfolk",
		seat: locmap["Arundel"],
		marshal:0,
		influence:3,
		lordship:3,
		command:2,
		valour:2,
		forces:{
			retinue:1,
			men_at_arms:2,
			longbowmen:2,
			militia:2,
		},
		assets:{
			cart:2,
			prov:2,
			coin:2,
		},
		ships: 0,
	},

	{
		side: "York",
		name: "Warwick Y",
		short_name: "Warwick",
		full_name: "Richard Neville",
		title: "Earl of Warwick",
		seat: locmap["Calais"],
		marshal:1,
		influence:5,
		lordship:3,
		command:2,
		valour:1,
		forces:{
			retinue:1,
			men_at_arms:3,
			longbowmen:3,
		},
		assets:{
			prov:2,
			coin:2,
		},
		ships:2,
	},

	{
		side: "Lancaster",
		name: "Henry VI",
		short_name: "Henry VI",
		full_name: "Henry VI",
		title: "King of England",
		seat: locmap["London"],
		marshal:2,
		influence:5,
		lordship:2,
		command:2,
		valour:0,
		forces:{
			retinue:1,
			men_at_arms:2,
			longbowmen:2,
			militia:4
		},
		assets:{
			cart:2,
			prov:2,
			coin:4,
		},
		ships: 0,
	},

	{
		side: "Lancaster",
		name: "Margaret",
		short_name: "Margaret",
		full_name: "Margaret d'Anjou",
		title: "Queen of England",
		seat: locmap["London"],
		marshal:2,
		influence:4,
		lordship:2,
		command:2,
		valour:1,
		forces:{
			retinue:1,
			men_at_arms:3,
			longbowmen:3
		},
		assets:{
			cart:2,
			prov:2,
			coin:2,
		},
		ships: 2,
	},

	{
		side: "Lancaster",
		name: "Somerset 1",
		short_name: "Somerset",
		full_name: "Henry Beaufort",
		title: "Duke of Somerset",
		seat: locmap["Wells"],
		marshal:2,
		influence:5,
		lordship:2,
		command:2,
		valour:2,
		forces:{
			retinue:1,
			men_at_arms:2,
			longbowmen:2,
		},
		assets:{
			cart:2,
			prov:2,
			coin:1,
		},
		ships: 0,
	},

	{
		side: "Lancaster",
		name: "Somerset 2",
		short_name: "Somerset",
		full_name: "Edmund Beaufort",
		title: "Duke of Somerset",
		seat: locmap["Wells"],
		marshal:0,
		influence:3,
		lordship:2,
		command:2,
		valour:1,
		forces:{
			retinue:1,
			men_at_arms:2,
			longbowmen:2,
			militia:2},
		assets:{
			cart:2,
			prov:2,
			coin:2,
		},
		ships: 0,
	},

	{
		side: "Lancaster",
		name: "Exeter 1",
		short_name: "Exeter",
		full_name: "Henry Holland",
		title: "Duke of Exeter",
		seat: locmap["Exeter"],
		marshal:0,
		influence:2,
		lordship:1,
		command:2,
		valour:2,
		forces:{
			retinue:1,
			men_at_arms:2,
			longbowmen:2,
		},
		assets:{
			cart:1,
			prov:1,
			coin:1,
		},
		ships: 0,
	},

	{
		side: "Lancaster",
		name: "Exeter 2",
		short_name: "Exeter",
		full_name: "Henry Holland",
		title: "Duke of Exeter",
		seat: locmap["Exeter"],
		marshal:0,
		influence:2,
		lordship:1,
		command:2,
		valour:2,
		forces:{
			retinue:1,
			men_at_arms:2,
			longbowmen:2,
			militia:2,
		},
		assets:{
			cart:2,
			prov:2,
			coin:2,
		},
		ships: 0,
	},
	{
		side: "Lancaster",
		name: "Buckingham",
		short_name: "Buckingham",
		full_name: "Humphrey Stafford",
		title: "Duke of Buckingham",
		seat: locmap["Coventry"],
		marshal:0,
		influence:3,
		lordship:3,
		command:1,
		valour:1,
		forces:{
			retinue:1,
			men_at_arms:1,
			longbowmen:2,
			militia:1
		},
		assets:{
			cart:2,
			prov:2,
			coin:2,
		},
		ships: 0,
	},
	{
		side: "Lancaster",
		name: "Northumberland L",
		short_name: "Northumberland",
		full_name: "Henry Percy",
		title: "Earl of Northumberland",
		seat: locmap["Carlisle"],
		marshal:0,
		influence:4,
		lordship:2,
		command:2,
		valour:1,
		forces:{
			retinue:1,
			men_at_arms:2,
			longbowmen:2,
			militia:2
		},
		assets:{
			cart:2,
			prov:2,
			coin:1,
		},
		ships: 0,
	},

	{
		side: "Lancaster",
		name: "Clarence",
		short_name: "Clarence",
		full_name: "George Plantagenet",
		title: "Duke of Clarence",
		seat: locmap["York"],
		marshal:0,
		influence:1,
		lordship:2,
		command:1,
		valour:1,
		forces:{
			retinue:1,
			men_at_arms:2,
			longbowmen:2,
			militia:2
		},
		assets:{
			cart:1,
			prov:2,
			coin:2,
		},
		ships: 0,
	},

	{
		side: "Lancaster",
		name: "Jasper Tudor 1",
		short_name: "Jasper Tudor",
		full_name: "Jasper Tudor",
		title: "Earl of Pembroke",
		seat: locmap["Harlech"],
		marshal:0,
		influence:2,
		lordship:2,
		command:3,
		valour:2,
		forces:{
			retinue:1,
			men_at_arms:2,
			longbowmen:3,
			militia:1},
		assets:{
			cart:1,
			prov:2,
			coin:2,
		},
		ships: 0,
	},

	{
		side: "Lancaster",
		name: "Jasper Tudor 2",
		short_name: "Jasper Tudor",
		full_name: "Jasper Tudor",
		title: "Earl of Pembroke",
		seat: locmap["Pembroke"],
		marshal:0,
		influence:2,
		lordship:3,
		command:3,
		valour:2,
		forces:{
			retinue:1,
			men_at_arms:3,
			longbowmen:3,
		},
		assets:{
			cart:2,
			prov:2,
			coin:2,
		},
		ships: 0,
	},
	{
		side: "Lancaster",
		name: "Henry Tudor",
		short_name: "Henry Tudor",
		full_name: "Henry Tudor",
		title: "",
		seat: locmap["London"],
		marshal:2,
		influence:5,
		lordship:2,
		command:2,
		valour:1,
		forces:{
			retinue:1,
			men_at_arms:2,
			longbowmen:2,
			militia:2
		},
		assets:{
			cart:2,
			prov:2,
			coin:4,
		},
		ships:2,
	},

	{
		side: "Lancaster",
		name: "Oxford",
		short_name: "Oxford",
		full_name: "John de Vere",
		title: "Earl of Oxford",
		seat: locmap["Oxford"],
		marshal:0,
		influence:2,
		lordship:2,
		command:2,
		valour:2,
		forces:{
			retinue:1,
			men_at_arms:2,
			longbowmen:2,
			militia:2
		},
		assets:{
			cart:2,
			prov:2,
			coin:2,
		},
		ships: 0,
	},

	{
		side: "Lancaster",
		name: "Warwick L",
		short_name: "Warwick",
		full_name: "Richard Neville",
		title: "Earl of Warwick",
		seat: locmap["Calais"],
		marshal:1,
		influence:5,
		lordship:3,
		command:2,
		valour:2,
		forces:{
			retinue:1,
			men_at_arms:3,
			longbowmen:3,
		},
		assets:{
			cart:2,
			prov:2,
			coin:2,
		},
		ships:2,
	},

]

let AOW = {}
let cards = []

function arts_of_war_event(name, event, when) {
	let c = { name, event, roses: 0, when, capability: null, lords: null }
	cards.push(c)
	AOW[name] = c
}

function arts_of_war_capability(name, capability, lord_names) {
	AOW[name].capability = capability
	if (lord_names === "ALL") {
		AOW[name].lords = null
	}
	else if (lord_names === "any") {
		let side = name[0] === 'Y' ? "York" : "Lancaster"
		lord_names = lords.filter(l => l.side === side).map(l => l.name)
		AOW[name].lords = lord_names.map(n => lords.findIndex(l => l.name === n)).sort(cmpnum)
	}
	else if (Array.isArray(lord_names)) {
		AOW[name].lords = lord_names.map(n => lords.findIndex(l => l.name === n)).sort(cmpnum)
	}
}

function arts_of_war_roses(roses, side, a, b) {
	for (let n = a; n <= b; ++n)
		AOW[side + n].roses = roses
}

arts_of_war_event("Y1", "Leeward Battle Line", "hold")
arts_of_war_event("Y2", "Flank Attack", "hold")
arts_of_war_event("Y3", "Escape Ship", "hold")
arts_of_war_event("Y4", "Jack Cade", "this_levy")
arts_of_war_event("Y5", "Suspicion", "hold")
arts_of_war_event("Y6", "Seamanship", "this_campaign")
arts_of_war_event("Y7", "Yorkists Block Parliament", "this_levy")
arts_of_war_event("Y8", "Exile Pact", "this_campaign")
arts_of_war_event("Y9", "Escape Ship", "hold")
arts_of_war_event("Y10", "Tax Collectors", "now")
arts_of_war_event("Y11", "Blocked Ford", "hold")
arts_of_war_event("Y12", "Parliament's Truce", "hold")
arts_of_war_event("Y13", "Aspielles", "hold")
arts_of_war_event("Y14", "Richard of York", "this_levy")
arts_of_war_event("Y15", "London for York", "now")
arts_of_war_event("Y16", "The Commons", "this_levy")
arts_of_war_event("Y17", "She-Wolf of France", "now")
arts_of_war_event("Y18", "Succession", "this_levy")
arts_of_war_event("Y19", "Caltrops", "hold")
arts_of_war_event("Y20", "Yorkist Parade", "hold")
arts_of_war_event("Y21", "Sir Richard Leigh", "now")
arts_of_war_event("Y22", "Loyalty and Trust", "this_levy")
arts_of_war_event("Y23", "Charles the Bold", "now")
arts_of_war_event("Y24", "Sun in Splendour", "hold")
arts_of_war_event("Y25", "Owain Glyndwr", "this_campaign")
arts_of_war_event("Y26", "Dubious Clarence", "now")
arts_of_war_event("Y27", "Yorkist North", "now")
arts_of_war_event("Y28", "Gloucester as heir", "this_levy")
arts_of_war_event("Y29", "Dorset", "this_campaign")
arts_of_war_event("Y30", "Regroup", "hold")
arts_of_war_event("Y31", "Earl Rivers", "now")
arts_of_war_event("Y32", "The King's Name", "this_levy")
arts_of_war_event("Y33", "Edward V", "this_levy")
arts_of_war_event("Y34", "An honest tale speeds best", "this_campaign")
arts_of_war_event("Y35", "Privy Council", "this_levy")
arts_of_war_event("Y36", "Swift Maneuver", "hold")
arts_of_war_event("Y37", "Patrick de la Mote", "hold")

arts_of_war_capability("Y1", "Culverins and Falconets", "any")
arts_of_war_capability("Y2", "Culverins and Falconets", "any")
arts_of_war_capability("Y3", "Muster'd my soldiers", "any")
arts_of_war_capability("Y4", "We done deeds of charity", "any")
arts_of_war_capability("Y5", "Thomas Bourchier", "any")
arts_of_war_capability("Y6", "Great Ships", "any")
arts_of_war_capability("Y7", "Harbingers", "any")
arts_of_war_capability("Y8", "England is my home", "any")
arts_of_war_capability("Y9", "Barricades", "any")
arts_of_war_capability("Y10", "Agitators", "any")
arts_of_war_capability("Y11", "Yorkists Never Wait", "any")
arts_of_war_capability("Y12", "Soldiers of Fortune", "any")
arts_of_war_capability("Y13", "Scourers", "any",)
arts_of_war_capability("Y14", "Burgundians", ["York", "March"])
arts_of_war_capability("Y15", "Naval Blockade", ["Warwick Y"])
arts_of_war_capability("Y16", "Beloved Warwick",  ["Warwick Y"])
arts_of_war_capability("Y17", "Alice Montagu",  ["Salisbury"])
arts_of_war_capability("Y18", "Irishmen", ["York", "Rutland"])
arts_of_war_capability("Y19", "Welshmen",  ["York", "March"])
arts_of_war_capability("Y20", "York's favoured Son", ["March","Rutland"])
arts_of_war_capability("Y21", "Southerners", ["York", "March", "Rutland"])
arts_of_war_capability("Y22", "fair Arbiter", ["Salisbury"])
arts_of_war_capability("Y23", "Burgundians", ["Edward IV", "Gloucester 1", "Gloucester 2", "Richard III"])
arts_of_war_capability("Y24", "Hastings", ["Edward IV"])
arts_of_war_capability("Y25", "Pembroke", ["Pembroke"])
arts_of_war_capability("Y26", "Fallen Brother", ["Gloucester 1", "Gloucester 2", "Richard III"])
arts_of_war_capability("Y27", "Percy's North", ["Northumberland Y1","Northumberland Y2"])
arts_of_war_capability("Y28", "First Son", ["Edward IV"])
arts_of_war_capability("Y29", "Stafford Branch", ["Devon"])
arts_of_war_capability("Y30", "Captain", ["Northumberland Y1", "Northumberland Y2", "Pembroke"])
arts_of_war_capability("Y31", "Woodvilles", ["Edward IV", "Devon", "Gloucester 1", "Gloucester 2", "Richard III"])
arts_of_war_capability("Y32", "Final Charge", ["Richard III"])
arts_of_war_capability("Y33", "Bloody thou art, bloody will be thy end", ["Richard III"])
arts_of_war_capability("Y34", "So wise, so young", ["Gloucester 1", "Gloucester 2"] )
arts_of_war_capability("Y35", "Kingdom United", ["Gloucester 1", "Gloucester 2"] )
arts_of_war_capability("Y36", "Vanguard", ["Norfolk"])
arts_of_war_capability("Y37", "Percy's North", ["Northumberland Y1", "Northumberland Y2"])

arts_of_war_roses(1, "Y", 14, 22)
arts_of_war_roses(2, "Y", 23, 31)
arts_of_war_roses(3, "Y", 32, 37)

arts_of_war_event("L1", "Leeward Battle Line", "hold")
arts_of_war_event("L2", "Flank Attack", "hold")
arts_of_war_event("L3", "Escape Ship", "hold")
arts_of_war_event("L4", "Be sent for", "this_levy")
arts_of_war_event("L5", "Suspicion", "hold")
arts_of_war_event("L6", "Seamanship", "this_campaign")
arts_of_war_event("L7", "For trust not him", "hold")
arts_of_war_event("L8", "Forced Marches", "this_campaign")
arts_of_war_event("L9", "Rising Wages", "this_levy")
arts_of_war_event("L10", "New Act of Parliament", "this_campaign")
arts_of_war_event("L11", "Blocked Ford", "hold")
arts_of_war_event("L12", "Ravine", "hold")
arts_of_war_event("L13", "Aspielles", "hold")
arts_of_war_event("L14", "Scots", "now")
arts_of_war_event("L15", "Henry Pressures Parliament", "now")
arts_of_war_event("L16", "Warden of the Marches", "hold")
arts_of_war_event("L17", "My crown is in my heart", "this_levy")
arts_of_war_event("L18", "Parliament Votes", "this_levy")
arts_of_war_event("L19", "Henry's Proclamation", "now")
arts_of_war_event("L20", "Parliament Truce", "hold")
arts_of_war_event("L21", "French Fleet", "this_campaign")
arts_of_war_event("L22", "French Troops", "now")
arts_of_war_event("L23", "Warwick's Propaganda", "now")
arts_of_war_event("L24", "Warwick's Propaganda", "now")
arts_of_war_event("L25", "Welsh Rebellion", "now")
arts_of_war_event("L26", "Henry Released", "now")
arts_of_war_event("L27", "L'Universelle Aragne", "now")
arts_of_war_event("L28", "Rebel Supply Depot", "hold")
arts_of_war_event("L29", "To wilful disobedience", "now")
arts_of_war_event("L30", "French War Loans", "now")
arts_of_war_event("L31", "Robin's Rebellion", "now")
arts_of_war_event("L32", "Tudor Banners", "now")
arts_of_war_event("L33", "Surprise Landing", "hold")
arts_of_war_event("L34", "Buckingham's Plot", "this_levy")
arts_of_war_event("L35", "Margaret Beaufort", "this_levy")
arts_of_war_event("L36", "Talbot to the Rescue", "hold")
arts_of_war_event("L37", "The Earl of Richmond", "this_levy")

arts_of_war_capability("L1", "Culverins and Falconets", "any")
arts_of_war_capability("L2", "Culverins and Falconets", "any")
arts_of_war_capability("L3", "Muster'd my soldiers", "any")
arts_of_war_capability("L4", "Heralds", "any")
arts_of_war_capability("L5", "Church Blessing", "any")
arts_of_war_capability("L6", "Great Ships", "any")
arts_of_war_capability("L7", "Harbingers", "any")
arts_of_war_capability("L8", "Hay Wains", "any")
arts_of_war_capability("L9", "Quartermasters", "any")
arts_of_war_capability("L10", "Chamberlains", "any")
arts_of_war_capability("L11", "In the Name of the King", "any")
arts_of_war_capability("L12", "Commission of Array", "any")
arts_of_war_capability("L13", "Expert Counsellors", "any",)
arts_of_war_capability("L14", "Percy's Power", ["Northumberland L"])
arts_of_war_capability("L15", "King's Parley", ["Henry VI"])
arts_of_war_capability("L16", "Northmen",  ["Northumberland L"])
arts_of_war_capability("L17", "Margaret",  ["Henry VI"])
arts_of_war_capability("L18", "Council Member", ["Exeter 1", "Exeter 2", "Somerset 1", "Somerset 2", "Buckingham"])
arts_of_war_capability("L19", "Andrew Trollope",  ["Exeter 1", "Exeter 2", "Somerset 1", "Somerset 2", "Buckingham"])
arts_of_war_capability("L20", "Veteran of French Wars", ["Exeter 1", "Exeter 2", "Somerset 1", "Somerset 2"])
arts_of_war_capability("L21", "My Father's Blood", "any")
arts_of_war_capability("L22", "Stafford Estates", ["Buckingham"])
arts_of_war_capability("L23", "Montagu", ["Warwick L"])
arts_of_war_capability("L24", "Married to a Neville", ["Clarence"])
arts_of_war_capability("L25", "Welsh Lord", ["Jasper Tudor 1", "Jasper Tudor 2"])
arts_of_war_capability("L26", "Edward", ["Margaret"])
arts_of_war_capability("L27", "Barded Horse", ["Exeter 1", "Exeter 2", "Somerset 1", "Somerset 2", "Margaret"])
arts_of_war_capability("L28", "Loyal Somerset", ["Somerset 1", "Somerset 2"])
arts_of_war_capability("L29", "High Admiral", ["Exeter 1", "Exeter 2"])
arts_of_war_capability("L30", "Merchants", ["Warwick L"])
arts_of_war_capability("L31", "Yeomen of the Crown", ["Margaret"])
arts_of_war_capability("L32", "Two Roses", ["Henry Tudor"])
arts_of_war_capability("L33", "Philibert de Chandée", ["Oxford", "Henry Tudor"])
arts_of_war_capability("L34", "Piquiers", ["Oxford", "Henry Tudor"])
arts_of_war_capability("L35", "Thomas Stanley", ["Jasper Tudor 1", "Jasper Tudor 2", "Henry Tudor"] )
arts_of_war_capability("L36", "Chevaliers", ["Oxford", "Jasper Tudor 1", "Jasper Tudor 2", "Henry Tudor"])
arts_of_war_capability("L37", "Madame La Grande", ["Oxford", "Jasper Tudor 1", "Jasper Tudor 2", "Henry Tudor"])

arts_of_war_roses(1, "L", 14, 22)
arts_of_war_roses(2, "L", 23, 31)
arts_of_war_roses(3, "L", 32, 37)

let vassals = []
function vassal(service, name, seat, influence, capability) {
	let boxname = "vassal vassal_" + name.toLowerCase()
	let box = null
	if (boxname in boxes) {
		let [x, y, w, h] = boxes[boxname]
		x = Math.floor(x)
		y = Math.floor(y)
		w = Math.ceil(w)
		h = Math.ceil(h)
		box = { x, y, w, h }
	}
	vassals.push({service, name, seat, influence, capability, box })
}

lords.forEach(lord => {
	lord.id = "lord_" + clean_name(lord.name)
})

vassal(3, "Westmoreland", locmap["Appleby"], 0)
vassal(1, "Stanley", locmap["Derby"], 0)
vassal(1, "Dudley", locmap["Leicester"], 0)
vassal(2, "Shrewsbury", locmap["Shrewsbury"], -1)
vassal(3, "Worcester", locmap["Worcester"], 0)
vassal(2, "Oxford", locmap["Oxford"], 0)
vassal(1, "Essex", locmap["St Albans"], 0)
vassal(3, "Suffolk", locmap["Ipswich"], 1)
vassal(3, "Fauconberg", locmap["Dover"], 2)
vassal(1, "Norfolk", locmap["Arundel"], 0)
vassal(2, "Devon", locmap["Exeter"], -1)
vassal(1, "Bonville", locmap["Launceston"], 1)
vassal(1, "Beaumont", locmap["Lincoln"], -2)

vassal(0, "Trollope", -1, 0, "Andrew Trollope")
vassal(0, "Clifford", -1, 0, "My father's blood")
vassal(0, "Edward", -1, 0, "Edward")
vassal(0, "Thomas Stanley", -1, 0, "Thomas Stanley")
vassal(0, "Montagu", -1, 0, "Alice Montagu")
vassal(0, "Hastings", -1, 0, "Hastings")

function make_is_list(list) {
	let out = []
	for (let i = 0; i < locales.length + 35; ++i)
		out.push(list.includes(i) ? 1 : 0)
	return out
}

print("const data = {")

print("exile_1:" + JSON.stringify(exile_1) + ",")
print("exile_2:" + JSON.stringify(exile_2) + ",")
print("exile_3:" + JSON.stringify(exile_3) + ",")
print("exile_4:" + JSON.stringify(exile_4) + ",")
print("sea_1:" + JSON.stringify(sea_1) + ",")
print("sea_2:" + JSON.stringify(sea_2) + ",")
print("sea_3:" + JSON.stringify(sea_3) + ",")
print("port_1:" + JSON.stringify(port_1) + ",")
print("port_2:" + JSON.stringify(port_2) + ",")
print("port_3:" + JSON.stringify(port_3) + ",")
print("all_ports:" + JSON.stringify(all_ports) + ",")
print("sail_exile_1:" + JSON.stringify(sail_exile_1) + ",")
print("sail_exile_2:" + JSON.stringify(sail_exile_2) + ",")
print("sail_exile_3:" + JSON.stringify(sail_exile_3) + ",")
print("sail_exile_4:" + JSON.stringify(sail_exile_4) + ",")
print("sail_sea_1:" + JSON.stringify(sail_sea_1) + ",")
print("sail_sea_2:" + JSON.stringify(sail_sea_2) + ",")
print("sail_sea_3:" + JSON.stringify(sail_sea_3) + ",")
print("sail_port_1:" + JSON.stringify(sail_port_1) + ",")
print("sail_port_2:" + JSON.stringify(sail_port_2) + ",")
print("sail_port_3:" + JSON.stringify(sail_port_3) + ",")

dumplist("locales", locales)
dumplist("ways", ways)
dumplist("lords", lords)
dumplist("vassals", vassals)
dumplist("cards", cards)

print("}")

print("if (typeof module !== 'undefined') module.exports = data")

fs.writeFileSync("data.js", data.join("\n") + "\n")

function gen_test(name, set) {
	let ranges = []
	let start = -1
	for (let x = 0; x < locales.length; ++x) {
		if (set.includes(x)) {
			if (start < 0)
				start = x
		} else {
			if (start >= 0) {
				ranges.push([ start, x - 1 ])
				start = -1
			}
		}
	}
	if (start >= 0)
		ranges.push([ start, locales.length - 1 ])
	console.log("function " + name + "(x: Locale) { return " + ranges.map(([ a, b ]) => (a!==b) ?`(x >= ${a} && x <= ${b})` : `x === ${a}`).join(" || ") + " }")
}

gen_test("is_seaport", all_ports)
gen_test("is_port_1", port_1)
gen_test("is_port_2", port_2)
gen_test("is_port_3", port_3)
gen_test("is_adjacent_north_sea", port_1)
gen_test("is_adjacent_english_channel", port_2)
gen_test("is_adjacent_irish_sea", port_3)
for (let key in is)
	gen_test("is_" + key.toLowerCase(), is[key])
