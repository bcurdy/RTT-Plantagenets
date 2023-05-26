#include <stdio.h>
#include <string.h>
#include <ppm.h>

pixel **image;
int w, h;
pixval maxval;
int rtl = 0;

void save(int x1, int x2, int y1, int y2)
{
	int y;
	ppm_writeppminit(stdout, x2 - x1, y2 - y1, maxval, 0);
	for (y = y1; y < y2; ++y)
		ppm_writeppmrow(stdout, &image[y][x1], x2-x1, maxval, 0);
}

void dice_ltr(int y1, int y2)
{
	int x, y, x0 = 0;
	for (x = 0; x < w; ++x) {
		for (y = y1; y < y2; ++y) {
			pixel p = image[y][x];
			if (p.r < maxval || p.g < maxval || p.b < maxval)
				break;
		}
		if (y == y2) {
			if (x > x0)
				save(x0, x, y1, y2);
			x0 = x + 1;
		}
	}
	if (x > x0)
		save(x0, x, y1, y2);
}

void dice_rtl(int y1, int y2)
{
	int x, y, x0 = w-1;
	for (x = w-1; x >= 0; --x) {
		for (y = y1; y < y2; ++y) {
			pixel p = image[y][x];
			if (p.r < maxval || p.g < maxval || p.b < maxval)
				break;
		}
		if (y == y2) {
			if (x < x0)
				save(x+1, x0+1, y1, y2);
			x0 = x - 1;
		}
	}
	if (x < x0)
		save(x+1, x0+1, y1, y2);
}

void dice(int y1, int y2)
{
	if (rtl)
		dice_rtl(y1, y2);
	else
		dice_ltr(y1, y2);
}

void slice(void)
{
	int x, y, y0 = 0;
	for (y = 0; y < h; ++y) {
		for (x = 0; x < w; ++x) {
			pixel p = image[y][x];
			if (p.r < maxval || p.g < maxval || p.b < maxval)
				break;
		}
		if (x == w) {
			if (y > y0)
				dice(y0, y);
			y0 = y + 1;
		}
	}

	if (y > y0)
		dice(y0, y);
}

int main(int argc, char **argv)
{
	if (argc > 1 && !strcmp(argv[1], "-rtl"))
		rtl = 1;

	pm_init(argv[0], 0);

	image = ppm_readppm(stdin, &w, &h, &maxval);
	slice();
	ppm_freearray(image, h);

	return 0;
}
