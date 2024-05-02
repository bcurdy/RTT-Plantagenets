node tools/genseat.js

for F in images/seat_*.svg
do
	B=$(basename $F .svg)
	echo $B
	inkscape -d 192 -o images/$B.png $F
done
