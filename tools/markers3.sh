#!/bin/bash

function single {
	convert -colorspace RGB -resize 25% -colorspace sRGB HIRES/output/$1.png images/$1.png
}

function multi {
	BGND=$1
	SIZE=$2
	OUT=$3
	shift
	shift
	shift
	montage -background "$BGND" -mode concatenate -tile $SIZE $* HIRES/output/$OUT.png
	convert -colorspace RGB -resize 25% -colorspace sRGB HIRES/output/$OUT.png images/$OUT.png
}

single towns_lancaster
single towns_york
single cities_lancaster
single cities_york
single fortresses_lancaster
single fortresses_york
single ip_lancaster
single ip_york

single battle
single campaign
single cart_x1
single cart_x2
single cart_x3
single cart_x4
single coin_x1
single coin_x2
single coin_x3
single coin_x4
single depleted
single end
single exhausted
single exile
single exile_lancaster
single exile_york
single feed_x2
single feed_x3
single fled
single hits_lancaster
single hits_york
single levy
single vassal_clifford
single vassal_edward
single vassal_hastings
single vassal_thomas_stanley
single vassal_trollope
single moved_fought
single prov_x1
single prov_x2
single prov_x3
single prov_x4
single retinue
single rose_lancaster
single rose_york
single ship_x1
single ship_x2
single source
single valour
single victory_check

single seat_york_devon
single seat_york_edward_iv
single seat_york_gloucester
single seat_york_march
single seat_york_norfolk
single seat_york_northumberland
single seat_york_pembroke
single seat_york_rutland
single seat_york_salisbury
single seat_york_warwick
single seat_york_york

single seat_lancaster_buckingham
single seat_lancaster_clarence
single seat_lancaster_exeter
single seat_lancaster_henry_tudor
single seat_lancaster_henry_vi
single seat_lancaster_jasper_tudor
single seat_lancaster_margaret
single seat_lancaster_northumberland
single seat_lancaster_oxford
single seat_lancaster_somerset
single seat_lancaster_warwick

single vassal_beaumont
single vassal_bonville
single vassal_devon
single vassal_dudley
single vassal_essex
single vassal_fauconberg
single vassal_norfolk
single vassal_oxford
single vassal_shrewsbury
single vassal_stanley
single vassal_suffolk
single vassal_westmorld
single vassal_worcester

multi "#ffffff" 6x1 numbers_york \
	HIRES/output/number_1_york.png \
	HIRES/output/number_2_york.png \
	HIRES/output/number_3_york.png \
	HIRES/output/number_4_york.png \
	HIRES/output/number_5_york.png \
	HIRES/output/number_6_york.png \

multi "#ffffff" 6x1 numbers_lancaster \
	HIRES/output/number_1_lancaster.png \
	HIRES/output/number_2_lancaster.png \
	HIRES/output/number_3_lancaster.png \
	HIRES/output/number_4_lancaster.png \
	HIRES/output/number_5_lancaster.png \
	HIRES/output/number_6_lancaster.png \

exit

single vassal_clifford_b
single vassal_edward_b
single vassal_hastings_b
single vassal_thomas_stanley_b
single vassal_trollope_b

multi '#ffffff' 4x seats_york \
	HIRES/output/seat_york_devon.png \
	HIRES/output/seat_york_edward_iv.png \
	HIRES/output/seat_york_gloucester.png \
	HIRES/output/seat_york_march.png \
	HIRES/output/seat_york_norfolk.png \
	HIRES/output/seat_york_northumberland.png \
	HIRES/output/seat_york_pembroke.png \
	HIRES/output/seat_york_rutland.png \
	HIRES/output/seat_york_salisbury.png \
	HIRES/output/seat_york_warwick.png \
	HIRES/output/seat_york_york.png \

multi '#ffffff' 4x seats_york_b \
	HIRES/output/seat_york_devon_b.png \
	HIRES/output/seat_york_edward_iv_b.png \
	HIRES/output/seat_york_gloucester_b.png \
	HIRES/output/seat_york_march_b.png \
	HIRES/output/seat_york_norfolk_b.png \
	HIRES/output/seat_york_northumberland_b.png \
	HIRES/output/seat_york_pembroke_b.png \
	HIRES/output/seat_york_rutland_b.png \
	HIRES/output/seat_york_salisbury_b.png \
	HIRES/output/seat_york_warwick_b.png \
	HIRES/output/seat_york_york_b.png \

multi "#e02027" 4x seats_lancaster \
	HIRES/output/seat_lancaster_buckingham.png \
	HIRES/output/seat_lancaster_clarence.png \
	HIRES/output/seat_lancaster_exeter.png \
	HIRES/output/seat_lancaster_henry_tudor.png \
	HIRES/output/seat_lancaster_henry_vi.png \
	HIRES/output/seat_lancaster_jasper_tudor.png \
	HIRES/output/seat_lancaster_margaret.png \
	HIRES/output/seat_lancaster_northumberland.png \
	HIRES/output/seat_lancaster_oxford.png \
	HIRES/output/seat_lancaster_somerset.png \
	HIRES/output/seat_lancaster_warwick.png \

multi "#e02027" 4x seats_lancaster_b \
	HIRES/output/seat_lancaster_buckingham_b.png \
	HIRES/output/seat_lancaster_clarence_b.png \
	HIRES/output/seat_lancaster_exeter_b.png \
	HIRES/output/seat_lancaster_henry_tudor_b.png \
	HIRES/output/seat_lancaster_henry_vi_b.png \
	HIRES/output/seat_lancaster_jasper_tudor_b.png \
	HIRES/output/seat_lancaster_margaret_b.png \
	HIRES/output/seat_lancaster_northumberland_b.png \
	HIRES/output/seat_lancaster_oxford_b.png \
	HIRES/output/seat_lancaster_somerset_b.png \
	HIRES/output/seat_lancaster_warwick_b.png \

multi '#d1cfa1' 4x vassals \
	HIRES/output/vassal_beaumont.png \
	HIRES/output/vassal_bonville.png \
	HIRES/output/vassal_devon.png \
	HIRES/output/vassal_dudley.png \
	HIRES/output/vassal_essex.png \
	HIRES/output/vassal_fauconberg.png \
	HIRES/output/vassal_norfolk.png \
	HIRES/output/vassal_oxford.png \
	HIRES/output/vassal_shrewsbury.png \
	HIRES/output/vassal_stanley.png \
	HIRES/output/vassal_suffolk.png \
	HIRES/output/vassal_westmorld.png \
	HIRES/output/vassal_worcester.png \

multi '#ddda9f' 4x vassals_b \
	HIRES/output/vassal_beaumont_b.png \
	HIRES/output/vassal_bonville_b.png \
	HIRES/output/vassal_devon_b.png \
	HIRES/output/vassal_dudley_b.png \
	HIRES/output/vassal_essex_b.png \
	HIRES/output/vassal_fauconberg_b.png \
	HIRES/output/vassal_norfolk_b.png \
	HIRES/output/vassal_oxford_b.png \
	HIRES/output/vassal_shrewsbury_b.png \
	HIRES/output/vassal_stanley_b.png \
	HIRES/output/vassal_suffolk_b.png \
	HIRES/output/vassal_westmorld_b.png \
	HIRES/output/vassal_worcester_b.png \

