"use strict"

function array_insert(array, index, item) {
	for (let i = array.length; i > index; --i)
		array[i] = array[i - 1]
	array[index] = item
}

function set_add(set, item) {
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
			return
	}
	array_insert(set, a, item)
}

const A1 = 0, A2 = 1, A3 = 2
const D1 = 3, D2 = 4, D3 = 5

const NAMES = [
	"A1", "A2", "A3",
	"D1", "D2", "D3",
]

function show_array(array) {
	for (let row = 0; row < 6; row += 3) {
		let s = []
		for (let col = 0; col < 3; ++col) {
			if (array[row+col])
				s.push(NAMES[row+col].padEnd(3, ' '))
			else
				s.push("-- ")
		}
		console.log(s.join(" "))
	}
	console.log("")
}

function verify(array, out) {
	for (let i = 0; i < 6; ++i) {
		if (array[i]) {
			let okay = false
			for (let eng of out)
				if (eng.includes(i))
					okay = true
			if (!okay)
				return false
		}
	}
	return true
}

function make_engagement(array, choice) {
	let out = []
	let a, b

	function engage(a, b) {
		for (let eng of out) {
			if (eng.includes(a)) {
				set_add(eng, b)
				return
			}
			if (eng.includes(b)) {
				set_add(eng, a)
				return
			}
		}
		out.push([a,b])
	}

	// A1 vs D1 etc
	if (array[A1] && array[D1]) engage(A1, D1)
	if (array[A2] && array[D2]) engage(A2, D2)
	if (array[A3] && array[D3]) engage(A3, D3)

	// A1 vs D2/D3 etc
	if (array[A1] && !array[D1] && array[D2]) engage(A1, D2)
	if (array[A1] && !array[D1] && !array[D2] && array[D3]) engage(A1, D3)

	if (array[A3] && !array[D3] && array[D2]) engage(A3, D2)
	if (array[A3] && !array[D3] && !array[D2] && array[D1]) engage(A3, D1)

	if (array[D1] && !array[A1] && array[A2]) engage(D1, A2)
	if (array[D1] && !array[A1] && !array[A2] && array[A3]) engage(D1, A3)

	if (array[D3] && !array[A3] && array[A2]) engage(D3, A2)
	if (array[D3] && !array[A3] && !array[A2] && array[A1]) engage(D3, A1)

	// A2 vs D1/D3
	if (array[A2] && !array[D2]) {
		if (array[D1] && !array[D3]) engage(A2, D1)
		if (!array[D1] && array[D3]) engage(A2, D3)
		if (choice)
			if (array[D1] && array[D3]) engage(A2, choice === 1 ? D1 : D3)
	}

	// D2 vs A1/D3
	if (array[D2] && !array[A2]) {
		if (array[A1] && !array[A3]) engage(D2, A1)
		if (!array[A1] && array[A3]) engage(D2, A3)
		if (choice)
			if (array[A1] && array[A3]) engage(D2, choice === 1 ? A1 : A3)
	}

	if (verify(array, out)) {
		console.log(out.map(eng => eng.map(x=>NAMES[x]).join("+")).join(" / "))
		return out
	}
	return null
}

const ENGAGEMENTS = []
const CHOICE = []

function run(bits, array) {
	console.log("<tr>")
	console.log("<td>")
	show_array(array)
	console.log("<td>")
	let eng = make_engagement(array, 0)
	ENGAGEMENTS[bits] = eng
	if (!eng) {
		let eng_a = make_engagement(array, 1)
		console.log("or")
		let eng_b = make_engagement(array, 2)
		CHOICE.push([ bits, eng_a, eng_b ])
	}
}

function runall() {
	for (let x = 0; x < 64; ++x) {
		if ((x & 7) && (x & 56))
			run(x, [ (x>>5)&1, (x>>4)&1, (x>>3)&1, (x>>2)&1, (x>>1)&1, (x>>0)&1 ])
	}
}

console.log("<!DOCTYPE html>")
console.log("<style>td{white-space:pre;font-family:monospace;padding:3em;border:1px solid black}</style>")
console.log("<table>")
runall()

//run([1,1,0, 1,0,1])

//run([1,1,1, 1,1,0])
//run([1,1,1, 0,1,0])
//run([1,0,1, 0,1,0])

//run([1,0,1, 0,1,0])
//run([0,1,1, 1,0,0])
//run([1,0,0, 0,1,1])
//run([1,1,0, 1,0,1])
//run([1,1,1, 1,0,1])

console.log("</table>")

console.log("<pre>")
console.log("const ENGAGEMENTS = " + JSON.stringify(ENGAGEMENTS))
for (let [bits,a,b] of CHOICE)
	console.log("const ENGAGEMENTS_" + bits + " = " + JSON.stringify([a,b]))
