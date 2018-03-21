
import os
import math
import urllib
import geopy
import geopy.distance

GOOGLE_STREET_VIEW_KEY = 'AIzaSyCbz1HhLFdtBKwDmhd68sWmLa-38r9j6Mo'
GOOGLE_STREET_VIEW_SECRET = 'Fs_IFXlVeOi_bEzOh7Yp2g0FaC0'
GOOGLE_STREET_VIEW_URL = (
    'https://maps.googleapis.com/maps/api/streetview?' +
    'size=600x300&location={},{}&heading={}&pitch={}&fov={}&key={}'
)


def retrieve_images(center, max_distance, increments):
    """Retrieve images by forming a grid with a `center` and points which are in
    `increments` up to `max_distance`. Both `max_distance` and `increments` are
    specified in meters.
    """
    grid = generate_grid(center, max_distance, increments)
    total = len(grid) * len(grid[0])
    counter = 0
    for i, row in enumerate(grid):
        for j, coord in enumerate(row):
            counter += 1
            percent = round(counter / total * 100, 2)
            print('Row: {}, Column: {} ({} %)'.format(i + 1, j + 1, percent))
            google_street_view_image(i + 1, j + 1, coord)


def google_street_view_image(row, col, coord, heading=0, pitch=0, fov=120):
    url = GOOGLE_STREET_VIEW_URL.format(
        coord['lat'], coord['lng'], heading, pitch, fov,
        GOOGLE_STREET_VIEW_KEY
    )
    image_file = os.path.join("./results/", "{}_{}.jpg".format(row, col))
    urllib.request.urlretrieve(url, image_file)


def generate_grid(center, max_distance, increments):
    """Generate grid of coordinates by using the vertical and horizontal ranges
    created given the `center`, `max_distance`, and `increments`. The result is
    a list of lists, where the first element of the first list has the
    bottom-left coordinate of the grid, while the last coordinate of the last
    list has the top-right coordinate.
    """
    grid = []
    for v in coords_range(center, max_distance, increments, 'north'):
        row = []
        for h in coords_range(center, max_distance, increments, 'east'):
            row.append({'lat': v['lat'], 'lng': h['lng']})
        grid.append(row)
    return grid


def coords_range(center, max_distance, increments, direction):
    if direction == 'north':
        direction = 0
    elif direction == 'east':
        direction = 90
    else:
        raise ValueError('Direction must be `north` or `east`')
    n_points = int(math.ceil(max_distance / increments))
    extreme = int(increments * n_points / 2)
    distance_offsets = range(-extreme, extreme + increments, increments)
    return [offset(center, direction, meters) for meters in distance_offsets]


def offset(coords, direction, meters):
    """Calculate offset from coordinates given a direction and distance.

    The direction is specified as degrees between 0 and 360, where: 0 is north,
    90 is east, 180 is south, and 270 is west. The distance is specified in
    meters.
    """
    start = geopy.Point(coords['lat'], coords['lng'])
    dist = geopy.distance.VincentyDistance(meters=meters)
    point = dist.destination(point=start, bearing=direction)
    return {'lat': point[0], 'lng': point[1]}


if __name__ == '__main__':
    retrieve_images(
        center={'lat': 19.432468, 'lng': -99.133240},
        max_distance=1000,
        increments=10
    )
