import { apiUrl } from '@/assets/config'
import { composeQuery } from '@/assets/query.js'

export function buildMapQuery({ layer, ids, bbox, zoom, range, props, page }) {
  const queryParams = []

  if (layer) queryParams.push(`layer=${encodeURIComponent(layer)}`)
  if (ids) queryParams.push(`ids=${encodeURIComponent(ids)}`)
  if (bbox) queryParams.push(`bbox=${encodeURIComponent(bbox)}`)
  if (zoom) queryParams.push(`zoom=${encodeURIComponent(zoom)}`)
  if (range) queryParams.push(`range=${encodeURIComponent(range)}`)
  if (page) queryParams.push(`page=${encodeURIComponent(page)}`)

  if (props && typeof props === 'object') {
    for (const [key, value] of Object.entries(props)) {
      queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    }
  }

  return queryParams.join('&')
}

function buildQuery(data = {}) {
  return new URLSearchParams(data).toString()
}

async function request(url, options = {}) {
  const response = await fetch(url, options)

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`)
  }

  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

export function get(tb, params = {}) {
  const query = buildQuery(params)
  return request(`${apiUrl}/${tb}/?${query}`)
}

export function map(query) {
  return request(`${apiUrl}/map/?${query}`)
}

export function advancedMap(extent, zoom, range, query) {
  const params = new URLSearchParams()

  params.append('bbox', extent)
  params.append('zoom', zoom)

  if (range !== undefined && range !== null) {
    params.append('range', range)
  }

  if (query && typeof query === 'object') {
    Object.entries(query).forEach(([key, value]) => {
      params.append(key, value || '')
    })
  }

  return request(`${apiUrl}/advancedmap/?${params.toString()}`)
}

export function search(tb, saint) {
  return get(tb, saint)
}

export function miniSearch(tb, query) {
  return get('search', {
    tb,
    mini: '',
    ...query,
  })
}

export function quoteSearch(text, page = 1) {
  return get('source', {
    search: text,
    page,
  })
}

export function advancedSearch(query) {
  return get('advanced', query)
}

export function getFilterTypes(tb, type) {
  return request(`${apiUrl}/${tb}/${type}`)
}

export function advancedFilteringTypes(type, freetext) {
  return request(`${apiUrl}/${type}/?search=${encodeURIComponent(freetext)}`)
}

export function list(tb, page = 1, size = 500) {
  return get('list', { tb, page, size })
}

export function latest(tb, page = 1, size = null) {
  return get('latest', { tb, page, size })
}

export function show(name, id) {
  return request(`${apiUrl}/${name}/${id}`)
}

export function fetchIcon(name, id) {
  return request(`https://data.dh.gu.se/${name}/${id}`)
}

export function showMany(tb, ids, lang) {
  return get('edit', {
    tb,
    ids: ids.join(','),
    lang,
  })
}

export function autocomplete(tb, sstring, page = 1) {
  return get('autocomplete', {
    tb,
    sstring,
    page,
  })
}

export function byreference(tb, ref, id, params = {}) {
  const query = composeQuery([{ field: ref, sstring: id }])

  return search(tb, {
    query,
    page: params.page,
    size: params.size,
  })
}

export async function version(tb, id) {
  const data = await get('version', { tb, id })
  return data?.[0]?.version ? parseInt(data[0].version) : undefined
}


export async function fields(tb, lang) {
  const data = await get('edit', {
    tb,
    id: 0,
    lang,
  })

  const fields = data.fields

  return Object.keys(fields)
    .filter(fieldName => fields[fieldName].searchable)
    .map(fieldName => {
      return {
        col: fieldName,
        type: fields[fieldName].type,
        label: fields[fieldName].label,
        ftab: fields[fieldName].ftab,
        fcol: fields[fieldName].fcol,
        extra: fields[fieldName].extra,
      }
    })
}

export async function resolve(feature, path) {
  const step = path[0]

  if (!step) {
    return feature
  }

  const id = parseInt(feature[step].value)

  if (!id) return undefined

  return resolve(record, path.slice(1))
}

export function getDioceses() {
  return get("diocese", {
    search: "",
    mini: "",
    type: "Medival",
  })
}