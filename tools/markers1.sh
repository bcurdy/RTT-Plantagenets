pngtopnm HIRES/render/labels.png | ./tools/autodice | pnmsplit - HIRES/render/label_%d.ppm
pngtopnm HIRES/render/marker11.png | ./tools/autodice | pnmsplit - HIRES/render/marker_1a_%d.ppm
pngtopnm HIRES/render/marker12.png | ./tools/autodice -rtl | pnmsplit - HIRES/render/marker_1b_%d.ppm
pngtopnm HIRES/render/marker21.png | ./tools/autodice | pnmsplit - HIRES/render/marker_2a_%d.ppm
pngtopnm HIRES/render/marker22.png | ./tools/autodice -rtl | pnmsplit - HIRES/render/marker_2b_%d.ppm
