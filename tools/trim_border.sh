#!/bin/bash
#
# Trim black-ish border from rounded rectangle/circular token.
# Fill corners with background color.
# Center and crop to center.
#
# Usage "trim_border.sh input.png output.png width height

w=$1
h=$2

convert -trim $3 /tmp/out1.png

iw=$(convert /tmp/out1.png -format "%w" info:)
cx=$(expr $iw / 2)
bd=$(convert /tmp/out1.png -format "#%[hex:u.p{$cx,2}]" info:)
bg=$(convert /tmp/out1.png -format "#%[hex:u.p{$cx,8}]" info:)

convert /tmp/out1.png -fuzz 10% -trim -fill white -floodfill +$cx+2 "$bd" -fill "$bg" -floodfill +0+0 white /tmp/out2.png
convert /tmp/out2.png +repage -gravity Center -crop ${w}x${h}+0+0! $4
