import type { ImportedListingPayload } from './productionWorkflow'

function canonicalHeader(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function parseRows(source: string) {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]
    if (quoted) {
      if (character === '"' && source[index + 1] === '"') { field += '"'; index += 1 }
      else if (character === '"') quoted = false
      else field += character
      continue
    }
    if (character === '"') { quoted = true; continue }
    if (character === ',') { row.push(field.trim()); field = ''; continue }
    if (character === '\n') { row.push(field.trim()); rows.push(row); row = []; field = ''; continue }
    if (character !== '\r') field += character
  }
  row.push(field.trim())
  if (row.some(Boolean)) rows.push(row)
  if (quoted) throw new Error('The CSV has an unclosed quoted field.')
  return rows
}

function first(values: Record<string, string>, aliases: string[]) {
  for (const alias of aliases) {
    const value = values[alias]
    if (value) return value
  }
  return ''
}

function numeric(value: string) {
  const result = Number(value.replace(/[^0-9.]/g, ''))
  return Number.isFinite(result) ? result : null
}

export function parseListingCsv(source: string): ImportedListingPayload[] {
  const rows = parseRows(source)
  if (rows.length < 2) throw new Error('The CSV needs a header row and at least one listing.')
  if (rows.length - 1 > 100) throw new Error('Import up to 100 listings at a time.')
  const headers = rows[0].map(canonicalHeader)
  if (!headers.some((header) => ['title', 'propertytitle', 'name', 'address', 'location'].includes(header))) throw new Error('The CSV needs a title or address column.')
  return rows.slice(1).map((row) => {
    const values = Object.fromEntries(headers.map((header, index) => [header, row[index] ?? '']))
    const imageValue = first(values, ['image', 'imageurl', 'photo', 'photourl', 'mediaurl'])
    const rooms = first(values, ['spaces', 'rooms', 'advertisedspaces']).split(/[|;,]/).map((room) => room.trim()).filter(Boolean)
    return {
      title: first(values, ['title', 'propertytitle', 'name']),
      address: first(values, ['address', 'location', 'fulladdress']),
      propertyType: first(values, ['propertytype', 'type', 'listingtype']),
      bedrooms: numeric(first(values, ['bedrooms', 'beds', 'bedroom'])),
      bathrooms: numeric(first(values, ['bathrooms', 'baths', 'bathroom'])),
      price: first(values, ['price', 'listprice', 'askingprice']),
      description: first(values, ['description', 'remarks', 'publicremarks']),
      sourceReference: first(values, ['mlsnumber', 'mlsid', 'listingid', 'reference', 'id']),
      sourceUrl: first(values, ['url', 'listingurl', 'sourceurl']),
      mediaUrls: imageValue ? imageValue.split(/[|;]/).map((url) => url.trim()).filter(Boolean) : [],
      spaces: rooms,
    }
  }).filter((listing) => listing.title || listing.address)
}

