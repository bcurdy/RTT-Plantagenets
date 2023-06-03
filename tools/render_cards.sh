#!/bin/bash
#
# Render, crop, resize, and rename card assets.
#

mkdir -p HIRES/cards
mkdir -p HIRES/cards75
mkdir -p HIRES/cards150
mkdir -p cards.1x cards.2x

gs -dUseBleedBox -sDEVICE=png16m -r1200 -o HIRES/cards/aow_lancaster_%d.png "HIRES/Plantagenet-AoW-Lanc (11).pdf"
gs -dUseBleedBox -sDEVICE=png16m -r1200 -o HIRES/cards/aow_york_%d.png "HIRES/Plantagenet-AoW-York (15).pdf"
gs -dUseBleedBox -sDEVICE=png16m -r1200 -o HIRES/cards/cc_lancaster_%d.png "HIRES/PLNT_CC_Lancaster-Front-HiRes.pdf"
gs -dUseBleedBox -sDEVICE=png16m -r1200 -o HIRES/cards/cc_york_%d.png "HIRES/PLNT_CC_YORK-Front-HiRes.pdf"
gs -dUseBleedBox -sDEVICE=png16m -r1200 -o HIRES/cards/lord_lancaster_%d.png "HIRES/PLNT_LordCards_Lancaster-HiRes.pdf"
gs -dUseBleedBox -sDEVICE=png16m -r1200 -o HIRES/cards/lord_york_%d.png "HIRES/PLNT_LordCards_York-HiRes.pdf"

for F in HIRES/cards/*.png
do
	B=$(basename $F)
	echo $B
	# crop to 186x260 (actual size is 187.5 x 263 - we trim 0.75 to 1 pixel off each margin)
	convert -colorspace RGB +repage -gravity Center -crop 2976x4160+0+0 -resize 12.5% -colorspace sRGB $F HIRES/cards150/$B
	convert -colorspace RGB +repage -gravity Center -crop 2976x4160+0+0 -resize 6.25% -colorspace sRGB $F HIRES/cards75/$B
done

function mv_card {
	cp HIRES/cards150/$1.png cards.2x/$2.png
	cp HIRES/cards75/$1.png cards.1x/$2.png
}

cp HIRES/cards75/aow_* cards.1x
cp HIRES/cards150/aow_* cards.2x

cp HIRES/cards75/lord_* cards.1x
cp HIRES/cards150/lord_* cards.2x

mv_card lord_york_1 lord_york_york
mv_card lord_york_2 lord_york_march
mv_card lord_york_3 lord_york_salisbury
mv_card lord_york_4 lord_york_warwick_y
mv_card lord_york_5 lord_york_rutland
mv_card lord_york_6 lord_york_edward_iv
mv_card lord_york_7 lord_york_pembroke
mv_card lord_york_8 lord_york_devon
mv_card lord_york_9 lord_york_northumberland_y1
mv_card lord_york_10 lord_york_gloucester_1
mv_card lord_york_11 lord_york_richard_iii
mv_card lord_york_12 lord_york_norfolk
mv_card lord_york_13 lord_york_northumberland_y2
mv_card lord_york_14 lord_york_gloucester_2
mv_card lord_york_15 lord_york_back

mv_card lord_lancaster_1 lord_lancaster_henry_vi
mv_card lord_lancaster_2 lord_lancaster_somerset_1
mv_card lord_lancaster_3 lord_lancaster_exeter_1
mv_card lord_lancaster_4 lord_lancaster_buckingham
mv_card lord_lancaster_5 lord_lancaster_northumberland_l
mv_card lord_lancaster_6 lord_lancaster_warwick_l
mv_card lord_lancaster_7 lord_lancaster_jasper_tudor_1
mv_card lord_lancaster_8 lord_lancaster_clarence
mv_card lord_lancaster_9 lord_lancaster_margaret
mv_card lord_lancaster_10 lord_lancaster_somerset_2
mv_card lord_lancaster_11 lord_lancaster_oxford
mv_card lord_lancaster_12 lord_lancaster_exeter_2
mv_card lord_lancaster_13 lord_lancaster_henry_tudor
mv_card lord_lancaster_14 lord_lancaster_jasper_tudor_2
mv_card lord_lancaster_15 lord_lancaster_back

mv_card cc_york_1 cc_york_northumberland
mv_card cc_york_4 cc_york_warwick
mv_card cc_york_7 cc_york_rutland
mv_card cc_york_10 cc_york_edward_iv
mv_card cc_york_13 cc_york_york
mv_card cc_york_16 cc_york_march
mv_card cc_york_19 cc_york_salisbury
mv_card cc_york_22 cc_york_gloucester
mv_card cc_york_25 cc_york_richard_iii
mv_card cc_york_28 cc_york_norfolk
mv_card cc_york_31 cc_york_pembroke
mv_card cc_york_34 cc_york_devon
mv_card cc_york_37 cc_york_pass

mv_card cc_lancaster_1 cc_lancaster_jasper_tudor
mv_card cc_lancaster_4 cc_lancaster_margaret
mv_card cc_lancaster_7 cc_lancaster_clarence
mv_card cc_lancaster_10 cc_lancaster_henry_vi
mv_card cc_lancaster_13 cc_lancaster_somerset
mv_card cc_lancaster_16 cc_lancaster_exeter
mv_card cc_lancaster_19 cc_lancaster_oxford
mv_card cc_lancaster_22 cc_lancaster_henry_tudor
mv_card cc_lancaster_25 cc_lancaster_warwick
mv_card cc_lancaster_28 cc_lancaster_buckingham
mv_card cc_lancaster_31 cc_lancaster_northumberland
mv_card cc_lancaster_34 cc_lancaster_pass

