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
	# crop to 186x261 (actual size is 187.5 x 263 - we trim 0.75 to 1 pixel off each margin)
	convert -colorspace RGB +repage -gravity Center -crop 2976x4176+0+0 -resize 12.5% -colorspace sRGB $F HIRES/cards150/$B
	convert -colorspace RGB +repage -gravity Center -crop 2976x4176+0+0 -resize 6.25% -colorspace sRGB $F HIRES/cards75/$B
done

function mv_card {
	mv HIRES/cards150/$1.png cards.2x/$2.png
	mv HIRES/cards75/$1.png cards.1x/$2.png
}

mv HIRES/cards75/aow_* cards.1x
mv HIRES/cards150/aow_* cards.2x

mv HIRES/cards75/lord_* cards.1x
mv HIRES/cards150/lord_* cards.2x

mv_card cc_lancaster_1 cc_lancaster_1
mv_card cc_lancaster_4 cc_lancaster_2
mv_card cc_lancaster_7 cc_lancaster_3
mv_card cc_lancaster_10 cc_lancaster_4
mv_card cc_lancaster_13 cc_lancaster_5
mv_card cc_lancaster_16 cc_lancaster_6
mv_card cc_lancaster_19 cc_lancaster_7
mv_card cc_lancaster_22 cc_lancaster_8
mv_card cc_lancaster_25 cc_lancaster_9
mv_card cc_lancaster_28 cc_lancaster_10
mv_card cc_lancaster_31 cc_lancaster_11
mv_card cc_lancaster_34 cc_lancaster_12

mv_card cc_york_1 cc_york_1
mv_card cc_york_4 cc_york_2
mv_card cc_york_7 cc_york_3
mv_card cc_york_10 cc_york_4
mv_card cc_york_13 cc_york_5
mv_card cc_york_16 cc_york_6
mv_card cc_york_19 cc_york_7
mv_card cc_york_22 cc_york_8
mv_card cc_york_25 cc_york_9
mv_card cc_york_28 cc_york_10
mv_card cc_york_31 cc_york_11
mv_card cc_york_34 cc_york_12
mv_card cc_york_37 cc_york_13
