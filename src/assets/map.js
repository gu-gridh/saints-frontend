import L from 'leaflet'

export function markerSizeFromCount(count) {
  if (!count) return 10
  if (count < 5) return 10
  if (count < 20) return 14
  if (count < 100) return 18
  return 24
}

export const markerColors = (opacity = 0.5) => [
  `rgba(255, 128, 0, ${opacity})`,
  `rgba(0, 0, 255, ${opacity})`,
  `rgba(255, 0, 0, ${opacity})`,
  `rgba(0, 128, 0, ${opacity})`,
]

function svgIcon(svg, size = 30) {
  return L.divIcon({
    html: svg,
    className: 'leaflet-shape-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function circle(color) {
  return svgIcon(`
    <svg width="30" height="30" viewBox="0 0 30 30">
      <circle cx="15" cy="15" r="11" fill="${color}" stroke="white" stroke-width="2"/>
    </svg>
  `)
}

function square(color) {
  return svgIcon(`
    <svg width="30" height="30" viewBox="0 0 30 30">
      <rect x="6" y="6" width="18" height="18" transform="rotate(45 15 15)" fill="${color}" stroke="white" stroke-width="2"/>
    </svg>
  `)
}

function triangle(color) {
  return svgIcon(`
    <svg width="30" height="30" viewBox="0 0 30 30">
      <polygon points="15,4 27,25 3,25" fill="${color}" stroke="white" stroke-width="2"/>
    </svg>
  `)
}

function triangleDown(color) {
  return svgIcon(`
    <svg width="30" height="30" viewBox="0 0 30 30">
      <polygon points="3,5 27,5 15,26" fill="${color}" stroke="white" stroke-width="2"/>
    </svg>
  `)
}

function star(color) {
  return svgIcon(`
    <svg width="30" height="30" viewBox="0 0 30 30">
      <polygon points="15,3 18,11 27,11 20,17 23,26 15,21 7,26 10,17 3,11 12,11" fill="${color}" stroke="white" stroke-width="2"/>
    </svg>
  `)
}


export function countIcon(feature) {
  const props = feature.properties || feature

  const count = props.ids
    ? Object.keys(props.ids).length
    : 1

  const radius = markerSizeFromCount(count)
  const size = radius * 2 + 2

  return svgIcon(`
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle
        cx="${size / 2}"
        cy="${size / 2}"
        r="${radius}"
        fill="${markerColors(0.5)[0]}"
        stroke="white"
        stroke-width="1"
      />
    </svg>
  `, size)
}

export function markerIcon(feature, mode, selectedIds = []) {
  if (mode === 'places') {
    return placeIcon(feature)
  }
  if (selectedIds.length > 1) {
    return pieIcon(feature, selectedIds)
  }
  return countIcon(feature)
}

export function placeIcon(feature) {
  const props = feature.properties || feature
  const placeType = props.place_type_parent

  const orange = 'rgba(255, 128, 0, .6)'
  const red = 'rgba(255, 0, 0, .5)'
  const purple = 'rgba(160, 39, 136, .8)'
  const blue = 'rgba(11, 56, 161, .7)'
  const brown = '#a0735f99'

  const iconMap = {
    1: square(blue),
    2: circle(blue),
    3: circle(red),
    4: triangle(red),
    5: triangle(red),
    6: star(blue),
    7: circle(orange),
    8: triangleDown(brown),
    9: triangleDown(orange),
    10: triangle(purple),
    11: square(purple),
    12: square(brown),
  }

  return iconMap[placeType] || circle(blue)
}

function polarToCartesian(cx, cy, r, angle) {
  const radians = (angle - 90) * Math.PI / 180

  return {
    x: cx + r * Math.cos(radians),
    y: cy + r * Math.sin(radians),
  }
}

function pieSlicePath(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1

  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ')
}

export function pieIcon(feature, selectedIds = []) {
  const props = feature.properties || feature
  const ids = props.ids || {}

  const values = selectedIds.map(id => ids[String(id)] || 0)
  const total = values.reduce((sum, value) => sum + value, 0)

  if (!total) {
    return countIcon(feature)
  }

  const radius = markerSizeFromCount(total)
  const size = radius * 2 + 4
  const cx = size / 2
  const cy = size / 2
  const colors = markerColors(0.7)

  let currentAngle = 0

  const slices = values.map((value, index) => {
    if (!value) return ''

    const angle = (value / total) * 360
    const path = pieSlicePath(cx, cy, radius, currentAngle, currentAngle + angle)
    currentAngle += angle

    return `<path d="${path}" fill="${colors[index % colors.length]}" />`
  }).join('')

  return svgIcon(`
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      ${slices}
      <circle
        cx="${cx}"
        cy="${cy}"
        r="${radius}"
        fill="none"
        stroke="white"
        stroke-width="1"
      />
    </svg>
  `, size)
}