// Run this script inside the "tools" directory to generate data.js and build_counters3.sh

"use strict"

const fs = require('fs')

function cmpnum(a,b) { return a - b }
function cmpnum2(a,b) { return a[0] - b[0] }

// :r !python3 genboxes.py
const boxes = {
	"0": [60,1613,48,48],
	"1": [109,1613,47,48],
	"2": [156,1613,46,48],
	"3": [203,1613,46,48],
	"4": [249,1613,48,48],
	"5": [297,1613,47,48],
	"6": [344,1613,48,48],
	"7": [392,1613,47,48],
	"8": [439,1613,46,48],
	"9": [485,1613,47,48],
	"10": [532,1613,49,49],
	"11": [581,1613,47,49],
	"12": [628,1613,47,49],
	"13": [675,1613,48,49],
	"14": [723,1613,46,48],
	"15": [769,1613,48,48],
	"16": [817,1613,47,48],
	"17": [864,1613,48,48],
	"18": [911,1613,46,48],
	"19": [958,1613,48,48],
	"20": [1006,1613,46,49],
	"21": [1052,1613,48,49],
	"22": [1100,1613,47,49],
	"23": [1147,1613,48,49],
	"24": [1195,1613,46,49],
	"25": [1241,1615,49,47],
	"26": [1241,1568,49,47],
	"27": [1241,1520,49,47],
	"28": [1241,1472,49,47],
	"29": [1241,1426,49,46],
	"30": [1241,1378,49,48],
	"31": [1241,1330,49,48],
	"32": [1241,1282,49,48],
	"33": [1241,1236,49,46],
	"34": [1241,1189,49,47],
	"35": [1241,1142,49,47],
	"36": [1241,1095,49,46],
	"37": [1241,1048,49,47],
	"38": [1241,998,49,50],
	"39": [1241,952,47,46],
	"40": [1241,903,47,48],
	"41": [1241,857,47,46],
	"42": [1241,812,51,45],
	"43": [1241,762,51,50],
	"44": [1241,714,51,48],
	"45": [1241,668,47,46],
	"Scotland": [488,316,111,118],
	"France": [928,1468,109,114],
	"Calais": [1172,1456,67,79],
	"Ireland": [88,987,110,121],
	"Burgundy": [1034,726,110,121],
	"Bamburgh": [675,338,60,45],
	"Carlisle": [474,460,81,63],
	"Hexham": [599,433,53,47],
	"Appleby": [584,503,57,52],
	"Newcastle": [694,457,70,77],
	"Scarborough": [829,570,78,57],
	"York": [729,661,76,65],
	"Lancaster": [514,633,70,51],
	"Ravenspur": [873,759,72,45],
	"Lincoln": [805,798,78,64],
	"Chester": [471,835,78,64],
	"Derby": [694,883,62,49],
	"Nottingham": [756,883,73,40],
	"Lichfield": [651,944,74,61],
	"Truro": [180,1483,56,53],
	"Launceston": [239,1392,68,60],
	"Exeter": [381,1417,64,66],
	"Dorchester": [562,1406,58,49],
	"Southampton": [715,1409,60,48],
	"Arundel": [832,1372,56,48],
	"Hastings": [1021,1360,55,46],
	"Dover": [1079,1325,53,41],
	"Canterbury": [1097,1241,66,65],
	"Rochester": [1021,1223,65,68],
	"London": [912,1202,94,72],
	"Guildford": [879,1287,74,59],
	"Winchester": [760,1300,71,60],
	"Salisbury": [648,1306,73,66],
	"Wells": [542,1300,68,66],
	"Bristol": [536,1223,63,58],
	"Newbury": [703,1232,66,44],
	"Oxford": [745,1139,70,63],
	"St Albans": [939,1130,54,40],
	"Cambridge": [939,1059,54,45],
	"Bedford": [874,1082,65,48],
	"Northampton": [786,1051,64,54],
	"Gloucester": [602,1130,68,62],
	"Hereford": [514,1078,71,65],
	"Cardiff": [430,1202,65,65],
	"Pembroke": [223,1165,58,37],
	"Ipswich": [1138,1068,58,43],
	"Bury St Edmunds": [1035,1033,54,45],
	"Norwich": [1097,928,67,62],
	"Lynn": [1000,933,47,38],
	"Ely": [959,990,65,66],
	"Peterborough": [866,968,66,62],
	"Leicester": [796,944,49,46],
	"Coventry": [713,1005,67,63],
	"Worcester": [594,1030,72,64],
	"Ludlow": [514,1014,54,34],
	"Shrewsbury": [538,903,78,69],
	"Harlech": [316,950,67,61],
	"Plymouth": [291,1455,58,50],
	"Irish Sea": [271,705,160,93],
	"English Channel": [602,1499,173,69],
	"North Sea": [1144,787,97,117],
	"box16": [1285,296,65,155],
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
}


let data = []
function print(str) {
	data.push(str)
}

var locmap = {}

// 0=offmap, 1-N=map locales, 100-M=calendar boxes
var locales = []
var ways = []
var highways = []
var roads = []
var paths = []

const scale = 1


 let strongholds = []

function defloc(region, stronghold, type, name) {
	let [x, y, w, h] = boxes[name]
	x = Math.floor(x)
	y = Math.floor(y)
	w = Math.ceil(w)
	h = Math.ceil(h)
	locmap[name] = locales.length
	if (stronghold > 0)
		strongholds.push(locales.length)
	locales.push({ name, type, stronghold, region, ways: [], box: { x, y, w, h } })

}
function defway(type, list) {
	let ix = ways.length
	list = list.map(name=>locmap[name]).sort(cmpnum)
	ways.push({type, locales: list})
	for (let from of list) {
		for (let to of list) {
			if (from !== to) {
				let old = locales[from].ways.find(w => w[0] === to)
				if (old)
					old.push(ix)
				else
					locales[from].ways.push([to, ix])
			}
		}
	}
	return ways[ix]
}

function highway(locs) { return defway('highway', locs.split(", ")) }
function road(locs) { return defway('road', locs.split(", ")) }
function path(locs) { return defway('path', locs.split(", ")) }

defloc("North", 1, "fortress", "Bamburgh")
defloc("North", 1, "city", "Newcastle")
defloc("North", 1, "town", "Appleby")
defloc("North", 1, "town", "Hexham")
defloc("North", 1, "town", "Carlisle")


defloc("Wales", 1, "harlech", "Harlech")
defloc("Wales", 1, "fortress", "Pembroke")
defloc("Wales", 1, "city", "Cardiff")
defloc("Wales", 1, "city", "Hereford")
defloc("Wales", 1, "fortress", "Ludlow")
defloc("Wales", 1, "city", "Shrewsbury")

defloc("South", 1, "city", "Salisbury")
defloc("South", 1, "city", "Winchester")
defloc("South", 1, "city", "Guildford")
defloc("South", 1, "town", "Arundel")
defloc("South", 1, "town", "Southampton")
defloc("South", 1, "city", "Rochester")
defloc("South", 1, "town", "Dover")
defloc("South", 1, "city", "Canterbury")
defloc("South", 1, "town", "Hastings")

defloc("England", 1, "town", "Dorchester")
defloc("England", 1, "city", "Exeter")
defloc("England", 1, "town", "Plymouth")
defloc("England", 1, "city", "Launceston")
defloc("England", 1, "town", "Truro")
defloc("England", 1, "city", "Wells")
defloc("England", 1, "city", "Bristol")
defloc("England", 1, "city", "Gloucester")
defloc("England", 1, "city", "Oxford")
defloc("England", 1, "town", "Newbury")
defloc("England", 1, "london", "London")
defloc("England", 1, "town", "St Albans")
defloc("England", 1, "town", "Bedford")
defloc("England", 1, "town", "Cambridge")
defloc("England", 1, "town", "Bury St Edmunds")
defloc("England", 1, "town", "Ipswich")
defloc("England", 1, "city", "Norwich")
defloc("England", 1, "fortress", "Lynn")
defloc("England", 1, "city", "Ely")
defloc("England", 1, "city", "Peterborough")
defloc("England", 1, "town", "Northampton")
defloc("England", 1, "city", "Coventry")
defloc("England", 1, "town", "Leicester")
defloc("England", 1, "city", "Lichfield")
defloc("England", 1, "town", "Derby")
defloc("England", 1, "town", "Nottingham")
defloc("England", 1, "city", "Worcester")
defloc("England", 1, "city", "Chester")
defloc("England", 1, "town", "Lancaster")
defloc("England", 1, "city", "Lincoln")
defloc("England", 1, "city", "York")
defloc("England", 1, "calais", "Calais")
defloc("England", 1, "exile", "France")
defloc("England", 1, "exile", "Scotland")
defloc("England", 1, "exile", "Ireland")
defloc("England", 1, "exile", "Burgundy")
defloc("North", 1, "town", "Scarborough")
defloc("England", 1, "fortress", "Ravenspur")
defloc("England", 1, "sea", "English Channel")
defloc("England", 1, "sea", "Irish Sea")
defloc("England", 1, "sea", "North Sea")


highway("Bamburgh, Newcastle")
highway("Newcastle, York")
highway("York, Lincoln")
highway("Lincoln, Peterborough")
highway("Peterborough, Ely")
highway("Nottingham, Leicester")
highway("Leicester, Northampton")
highway("Bedford, St Albans")
highway("St Albans, Cambridge")
highway("St Albans, London")
highway("London, Oxford")
highway("Oxford, Gloucester")
highway("Gloucester, Hereford")
highway("Gloucester, Worcester")
highway("Hereford, Ludlow")
highway("Gloucester, Bristol")
highway("London, Guildford")
highway("Guildford, Winchester")
highway("Winchester, Salisbury")
highway("Salisbury, Wells")
highway("Cambridge, Ely")

road("Hexham, Carlisle")
road("Hexham, Newcastle")
road("Appleby, Carlisle")
road("Appleby, Newcastle")
road("Lincoln, Nottingham")
road("Nottingham, Derby")
road("Chester, Shrewsbury")
road("Shrewsbury, Lichfield")
road("Lichfield, Leicester")
road("Lichfield, Coventry")
road("Leicester, Peterborough")
road("Ely, Lynn")
road("Ely, Bury St Edmunds")
road("Bury St Edmunds, Norwich")
road("Norwich, Lynn")
road("Norwich, Ipswich")
road("Ipswich, Bury St Edmunds")
road("Ipswich, St Albans")
road("Bury St Edmunds, Cambridge")
road("Cambridge, Bedford")
road("Peterborough, Northampton")
road("Northampton, Coventry")
road("Northampton, Oxford")
road("Lichfield, Worcester")
road("Shrewsbury, Ludlow")
road("Ludlow, Worcester")
road("London, Rochester")
road("Rochester, Canterbury")
road("Canterbury, Dover")
road("Dover, Hastings")
road("Hastings, Arundel")
road("Arundel, Southampton")
road("Southampton, Winchester")
road("Southampton, Salisbury")
road("Salisbury, Newbury")
road("Salisbury, Dorchester")
road("Dorchester, Wells")
road("Dorchester, Exeter")
road("Wells, Bristol")
road("Exeter, Launceston")
road("Exeter, Plymouth")
road("Plymouth, Truro")
road("Truro, Launceston")
road("Derby, Lichfield")
path("Appleby, Lancaster")
path("Lancaster, Chester")
path("Chester, York")
path("Chester, Harlech")
path("Harlech, Pembroke")
path("Pembroke, Cardiff")

road("Newcastle, Scarborough")
road("Scarborough, York")
road("York, Ravenspur")
road("Ravenspur, Lincoln")

let seaports = [
	"Newcastle", "Scarborough", "Ravenspur", "Lynn", "Ipswich", "Dover", "Hastings", "Calais", "Southampton","Dorchester","Exeter","Plymouth","Truro","Bristol","Pembroke","Harlech"
].map(name => locmap[name]).sort(cmpnum)

function dumplist(name, list) {
	print(name + ":[")
	for (let item of list)
		print(JSON.stringify(item) + ",")
	print("],")
}

locales.forEach(loc => {
	loc.adjacent = []
	loc.adjacent_by_highway = []
	loc.adjacent_by_road = []
	loc.adjacent_by_path = []
	loc.highways = []
	loc.roads = []
	loc.paths = []
	for (let data of loc.ways) {
		let to = data[0]
		for (let i = 1; i < data.length; ++i) {
			let way = data[i]
			if (!loc.adjacent.includes(to))
				loc.adjacent.push(to)
			if (ways[way].type === "highway") {
				if (!loc.adjacent_by_highway.includes(to)) {
					loc.adjacent_by_highway.push(to)
					loc.highways.push([to,way])
				}
			}
			if (ways[way].type === "road") {
				if (!loc.adjacent_by_road.includes(to)) {
					loc.adjacent_by_road.push(to)
					loc.roads.push([to,way])
				}
			}
			if (ways[way].type === "path") {
				if (!loc.adjacent_by_path.includes(to)) {
					loc.adjacent_by_path.push(to)
					loc.paths.push([to,way])
				}
			}
		}
	}
	loc.adjacent.sort(cmpnum)
	loc.adjacent_by_highway.sort(cmpnum)
	loc.adjacent_by_road.sort(cmpnum)
	loc.adjacent_by_path.sort(cmpnum)
	loc.highways.sort(cmpnum2)
	loc.roads.sort(cmpnum2)
	loc.paths.sort(cmpnum2)
})

function seats(list) {
	return list.split(", ").map(name => locmap[name]).sort(cmpnum)
}

let lords = [

	{
		side: "York",
		name: "York",
		full_name: "Richard Plantagenet",
		title: "Duke of York",
		seats: seats("Ely"),
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
		name:"March",
		full_name:"Edward Plantagenet",
		title:"Earl of March",
		seats:seats("Ludlow"),
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
		full_name: "Edward Plantagenet",
		title: "King of England",
		seats: seats("London"),
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
		full_name: "Richard Neville",
		title: "Earl of Salisbury",
		seats: seats("York"),
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
		full_name: "Edmund Plantagenet",
		title: "Earl of Rutland",
		seats: seats("Canterbury"),
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
		full_name: "William Herbert",
		title: "Earl of Pembroke",
		seats: seats("Pembroke"),
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
		full_name: "Humpfrey Stafford",
		title: "Earl of Devon",
		seats: seats("Exeter"),
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
		name: "Northumberland",
		full_name: "Henry Percy",
		title: "Northumberland",
		seats: seats("Carlisle"),
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
		name: "Northumberland",
		full_name: "Henry Percy",
		title: "Northumberland",
		seats: seats("Carlisle"),
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
		name: "Gloucester",
		full_name: "Richard Plantagenet",
		title: "Duke of Gloucester",
		seats: seats("Gloucester"),
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
		name: "Gloucester",
		full_name: "Richard Plantagenet",
		title: "Duke of Gloucester",
		seats: seats("Gloucester"),
		marshal:1,
		influence:2,
		lordship:2,
		command:3,
		valour:2,
		forces:{
			retinue:1,
			men_at_arms:3,
			longbowmen:2,
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
		full_name: "Richard Plantagenet",
		title: "King of England",
		seats: seats("London"),
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
		full_name: "John Howard",
		title: "Duke of Norfolk",
		seats: seats("Arundel"),
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
		name: "Warwick",
		full_name: "Richard Neville",
		title: "Earl of Warwick",
		seats: seats("Calais"),
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
		full_name: "Henry VI",
		title: "King of England",
		seats: seats("London"),
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
		full_name: "Margaret d'Anjou",
		title: "Queen of England",
		seats: seats("London"),
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
		name: "Somerset",
		full_name: "Henry Beaufort",
		title: "Duke of Somerset",
		seats: seats("Wells"),
		marshal:2,
		influence:6,
		lordship:2,
		command:2,
		valour:3,
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
		name: "Somerset",
		full_name: "Edmund Beaufort",
		title: "Duke of Somerset",
		seats: seats("Wells"),
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
		name: "Exeter",
		full_name: "Henry Holland",
		title: "Duke of Exeter",
		seats: seats("Exeter"),
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
		name: "Exeter",
		full_name: "Henry Holland",
		title: "Duke of Exeter",
		seats: seats("Exeter"),
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
		full_name: "Humphrey Stafford",
		title: "Duke of Buckingham",
		seats: seats("Coventry"),
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
		name: "Northumberland",
		full_name: "Henry Percy",
		title: "Earl of Northumberland",
		seats: seats("Carlisle"),
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
		full_name: "George Plantagenet",
		title: "Duke of Clarence",
		seats: seats("York"),
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
		name: "Jasper Tudor",
		full_name: "Jasper Tudor",
		title: "Earl of Pembroke",
		seats: seats("Harlech"),
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
		name: "Jasper Tudor",
		full_name: "Jasper Tudor",
		title: "Earl of Pembroke",
		seats: seats("Pembroke"),
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
		full_name: "Henry Tudor",
		title: "",
		seats: seats("London"),
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
		full_name: "John de Vere",
		title: "Earl of Oxford",
		seats: seats("Oxford"),
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
		name: "Warwick",
		full_name: "Richard Neville",
		title: "Earl of Warwick",
		seats: seats("Calais"),
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
	let c = { name, event, when, capability: null, this_lord: false, lords: null }
	cards.push(c)
	AOW[name] = c
}

function arts_of_war_capability(name, capability, this_lord, lord_names) {
	AOW[name].capability = capability
	AOW[name].this_lord = this_lord
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

arts_of_war_event("Y1", "Leeward Battle Line", "hold")
arts_of_war_event("Y2", "Flank Attack", "hold")
arts_of_war_event("Y3", "Escape Ship", "hold")
arts_of_war_event("Y4", "Jack Cade", "this_levy")
arts_of_war_event("Y5", "Suspicion", "hold")
arts_of_war_event("Y6", "Seamanship", "this_campaign")
arts_of_war_event("Y7", "Yorkists Block Parliament", "this_levy")
arts_of_war_event("Y8", "Exile Pact", "this_levy")
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

arts_of_war_capability("Y1", "Culverins and falconets", true, "any")
arts_of_war_capability("Y2", "Culverins and falconets", true, "any")
arts_of_war_capability("Y3", "Muster'd my solders", true, "any")
arts_of_war_capability("Y4", "We done deeds of charity", true, "any")
arts_of_war_capability("Y5", "Thomas Bourchier", true, "any")
arts_of_war_capability("Y6", "Great Ships", true, "any")
arts_of_war_capability("Y7", "Harbingers", true, "any")
arts_of_war_capability("Y8", "England is my home", true, "any")
arts_of_war_capability("Y9", "Barricades", true, "any")
arts_of_war_capability("Y10", "Agitators", true, "any")
arts_of_war_capability("Y11", "Yorkists Never Wait", true, "any")
arts_of_war_capability("Y12", "Soldiers of fortune", true, "any")
arts_of_war_capability("Y13", "Scourers", true, "any",)
arts_of_war_capability("Y14", "Burgundians", true, ["York", "March"])
arts_of_war_capability("Y15", "Naval Blockade", true, ["Warwick"])
arts_of_war_capability("Y16", "Beloved Warwick", true,  ["Warwick"])
arts_of_war_capability("Y17", "Alice Montagu", true,  ["Salisbury"])
arts_of_war_capability("Y18", "Irishmen", true, ["York", "Rutland"])
arts_of_war_capability("Y19", "Welshmen", true,  ["York", "March"])
arts_of_war_capability("Y20", "York's favoured Son", true, ["March","Rutland"])
arts_of_war_capability("Y21", "Southerners", true, ["York", "March", "Rutland"])
arts_of_war_capability("Y22", "fair Arbiter", true, ["Salisbury"])
arts_of_war_capability("Y23", "Burgundians", true, ["Edward IV", "Gloucester", "Richard III"])
arts_of_war_capability("Y24", "Hastings", true, ["Edward IV"])
arts_of_war_capability("Y25", "Pembroke", true, ["Pembroke"])
arts_of_war_capability("Y26", "Fallen Brother", true, ["Gloucester", "Richard III"])
arts_of_war_capability("Y27", "Percy's North", true, ["Northumberland"])
arts_of_war_capability("Y28", "First Son", true, ["Edward IV"])
arts_of_war_capability("Y29", "Stafford Branch", true, ["Devon"])
arts_of_war_capability("Y30", "Captain", true, ["Devon", "Pembroke"])
arts_of_war_capability("Y31", "Woodvilles", true, ["Edward IV", "Devon", "Gloucester", "Richard III"])
arts_of_war_capability("Y32", "Final Charge", true, ["Richard III"])
arts_of_war_capability("Y33", "Bloody thou art, bloody will be thy end", true, ["Richard III"])
arts_of_war_capability("Y34", "So wise, so young", true, ["Gloucester"] )
arts_of_war_capability("Y35", "Kingdom United", true, ["Gloucester"] )
arts_of_war_capability("Y36", "Vanguard", true, ["Norfolk"])
arts_of_war_capability("Y37", "Percy's North", true, ["Northumberland"])


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
arts_of_war_event("L19", "Henry’s Proclamation", "now")
arts_of_war_event("L20", "Parliament Truce", "hold")
arts_of_war_event("L21", "French Fleet", "this_campaign")
arts_of_war_event("L22", "French Troops", "now")
arts_of_war_event("L23", "Warwick’s Propaganda", "now")
arts_of_war_event("L24", "Warwick’s Propaganda", "now")
arts_of_war_event("L25", "Welsh Rebellion", "now")
arts_of_war_event("L26", "Henry Released", "now")
arts_of_war_event("L27", "L’Universelle Aragne", "now")
arts_of_war_event("L28", "Rebel Supply Depot", "hold")
arts_of_war_event("L29", "To wilful disobedience", "now")
arts_of_war_event("L30", "French War Loans", "now")
arts_of_war_event("L31", "Robin’s Rebellion", "now")
arts_of_war_event("L32", "Tudor Banners", "now")
arts_of_war_event("L33", "Surprise Landing", "hold")
arts_of_war_event("L34", "Buckingham’s Plot", "this_levy")
arts_of_war_event("L35", "Margaret Beaufort", "this_levy")
arts_of_war_event("L36", "Talbot to the Rescue", "hold")
arts_of_war_event("L37", "The Earl of Richmond", "this_levy")

arts_of_war_capability("L1", "Culverins and falconets", true, "any")
arts_of_war_capability("L2", "Culverins and falconets", true, "any")
arts_of_war_capability("L3", "Muster’d my soldiers", true, "any")
arts_of_war_capability("L4", "Heralds", true, "any")
arts_of_war_capability("L5", "Church Blessing", true, "any")
arts_of_war_capability("L6", "Great Ships", true, "any")
arts_of_war_capability("L7", "Harbingers", true, "any")
arts_of_war_capability("L8", "Hay Wains", true, "any")
arts_of_war_capability("L9", "Quartermasters", true, "any")
arts_of_war_capability("L10", "Chamberlains", true, "any")
arts_of_war_capability("L11", "In the Name of the King", true, "any")
arts_of_war_capability("L12", "Commission of Array", true, "any")
arts_of_war_capability("L13", "Expert Counsellors", true, "any",)
arts_of_war_capability("L14", "Percy’s Power", true, ["Northumberland"])
arts_of_war_capability("L15", "King’s Parley", true, ["Henry VI"])
arts_of_war_capability("L16", "Northmen", true,  ["Northumberland"])
arts_of_war_capability("L17", "Margaret", true,  ["Henry VI"])
arts_of_war_capability("L18", "Council Member", true, ["Exeter", "Somerset", "Buckingham"])
arts_of_war_capability("L19", "Andrew Trollope", true,  ["Exeter", "Somerset", "Buckingham"])
arts_of_war_capability("L20", "Veteran of French Wars", true, ["Exeter", "Somerset"])
arts_of_war_capability("L21", "My Father’s Blood", true, "any")
arts_of_war_capability("L22", "Stafford Estates", true, ["Buckingham"])
arts_of_war_capability("L23", "Montagu", true, ["Warwick"])
arts_of_war_capability("L24", "Married to a Neville", true, ["Clarence"])
arts_of_war_capability("L25", "Welsh Lord", true, ["Jasper Tudor"])
arts_of_war_capability("L26", "Edward", true, ["Margaret"])
arts_of_war_capability("L27", "Barded Horse", true, ["Exeter", "Somerset", "Margaret"])
arts_of_war_capability("L28", "Loyal Somerset", true, ["Somerset"])
arts_of_war_capability("L29", "High Admiral", true, ["Exeter"])
arts_of_war_capability("L30", "Merchants", true, ["Warwick"])
arts_of_war_capability("L31", "Yeomen of the Crown", true, ["Margaret"])
arts_of_war_capability("L32", "Two Roses", true, "any",["Henry Tudor"])
arts_of_war_capability("L33", "Philibert de Chandée", true, ["Oxford", "Henry Tudor"])
arts_of_war_capability("L34", "Piquiers", true, ["Oxford", "Henry Tudor"])
arts_of_war_capability("L35", "Thomas Stanley", true, ["Jasper Tudor", "Henry Tudor"] )
arts_of_war_capability("L36", "Chevaliers", true, ["Oxford", "Jasper Tudor", "Henry Tudor"])
arts_of_war_capability("L37", "Madame La Grande", true, ["Oxford", "Jasper Tudor", "Henry Tudor"])

let vassals = []
function vassal(service, name, seat, influence, capability) {
	vassals.push({service, name, seat, influence, capability })
}

vassal(1, "Norfolk", "Arundel", 0)
vassal(1, "Stanley", "Derby", 0)
vassal(3, "Fauconberg", "Dover", 2)
vassal(2, "Devon", "Exeter", -1)
vassal(3, "Suffolk", "Ipswich", 1)
vassal(1, "Bonville", "Launceston", 1)
vassal(1, "Dudley", "Leicester", 0)
vassal(1, "Beaumont", "Arundel", -2)
vassal(2, "Oxford", "Oxford", 0)
vassal(2, "Shrewsbury", "Shrewsbury", -1)
vassal(1, "Essex", "St Albans", 0)
vassal(3, "Westmoreland", "Appleby", 0)
vassal(3, "Worcester", "Worcester", 0)

vassal(0, "Trollope", "none", 0, "Andrew Trollope")
vassal(0, "Clifford", "none", 0, "My father's blood")
vassal(0, "Edward", "none", 0, "Edward")
vassal(0, "Thomas Stanley", "none", 0, "Thomas Stanley")
vassal(0, "Montagu", "none", 0, "Alice Montagu")
vassal(0, "Hastings", "none", 0, "Hastings") 

print("const data = {")
print("seaports:" + JSON.stringify(seaports) + ",")
print("strongholds:" + JSON.stringify(strongholds) + ",")
dumplist("locales", locales)
dumplist("ways", ways)
dumplist("lords", lords)
dumplist("vassals", vassals)
dumplist("cards", cards)
print("}")
print("if (typeof module !== 'undefined') module.exports = data")

fs.writeFileSync("data.js", data.join("\n") + "\n")
